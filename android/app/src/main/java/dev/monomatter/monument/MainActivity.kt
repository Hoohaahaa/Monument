package dev.monomatter.monument

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.os.Bundle
import android.graphics.Color
import android.view.Gravity
import android.widget.Button
import android.widget.FrameLayout
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.ar.core.ArCoreApk
import com.google.ar.core.Config
import com.google.ar.core.Session
import com.google.ar.core.TrackingState
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit

/** Isolated native capability/pose bridge probe. Camera compositing is a separate milestone. */
class MainActivity : Activity() {
    private lateinit var webView: WebView
    private var session: Session? = null
    private val worker = Executors.newSingleThreadScheduledExecutor()
    private var pollTask: ScheduledFuture<*>? = null
    private var pendingStart = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            webChromeClient = WebChromeClient()
            webViewClient = WebViewClient()
            addJavascriptInterface(MonumentBridge(), "MonumentAR")
            loadUrl("https://monument-field-test-m8cu2wxxp-mos-projects-efbc27a5.vercel.app/")
        }
        val root = FrameLayout(this)
        root.addView(webView, FrameLayout.LayoutParams(-1, -1))
        val probeButton = Button(this).apply {
            text = "START GEOSPATIAL DEVICE CHECK"
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.rgb(20, 35, 29))
            setOnClickListener { startSession() }
        }
        val buttonParams = FrameLayout.LayoutParams(-1, FrameLayout.LayoutParams.WRAP_CONTENT, Gravity.TOP)
        buttonParams.setMargins(20, 48, 20, 0)
        root.addView(probeButton, buttonParams)
        setContentView(root)
    }

    inner class MonumentBridge {
        @JavascriptInterface fun getRuntimeInfo(): String = JSONObject()
            .put("runtime", "android-native-arcore-probe")
            .put("bridgeVersion", 1)
            .put("cameraCompositor", false)
            .put("status", "probe-ready").toString()

        @JavascriptInterface fun startGeospatial() {
            runOnUiThread {
                if (!hasPermissions()) {
                    pendingStart = true
                    ActivityCompat.requestPermissions(this@MainActivity,
                        arrayOf(Manifest.permission.CAMERA),
                        REQUEST_PERMISSIONS)
                } else startSession()
            }
        }

        @JavascriptInterface fun stopGeospatial() {
            stopPolling()
            try { session?.pause() } catch (_: Exception) {}
            emit(JSONObject().put("type", "state").put("state", "stopped"))
        }
    }

    private fun hasPermissions() =
        ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED &&
        ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_PERMISSIONS && grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
            if (pendingStart) startSession()
        } else emit(JSONObject().put("type", "state").put("state", "permission-denied"))
        pendingStart = false
    }

    private fun startSession() {
        if (!hasPermissions()) {
            pendingStart = true
            ActivityCompat.requestPermissions(this,
                arrayOf(Manifest.permission.CAMERA, Manifest.permission.ACCESS_FINE_LOCATION),
                REQUEST_PERMISSIONS)
            return
        }
        try {
            val installStatus = ArCoreApk.getInstance().requestInstall(this, true)
            if (installStatus == ArCoreApk.InstallStatus.INSTALL_REQUESTED) {
                emit(JSONObject().put("type", "state").put("state", "arcore-install-requested"))
                return
            }
            val active = session ?: Session(this).also { session = it }
            val geoSupported = active.isGeospatialModeSupported(Config.GeospatialMode.ENABLED)
            val depthSupported = active.isDepthModeSupported(Config.DepthMode.AUTOMATIC)
            if (!geoSupported) {
                emit(JSONObject().put("type", "capabilities").put("arcore", true)
                    .put("geospatial", false).put("depth", depthSupported).put("state", "geospatial-unsupported"))
                return
            }
            val config = active.config
            config.geospatialMode = Config.GeospatialMode.ENABLED
            if (depthSupported) config.depthMode = Config.DepthMode.AUTOMATIC
            active.configure(config)
            active.resume()
            emit(JSONObject().put("type", "capabilities").put("arcore", true)
                .put("geospatial", true).put("depth", depthSupported).put("state", "localizing"))
            startPolling(active)
        } catch (e: Exception) {
            emit(JSONObject().put("type", "error").put("message", e.javaClass.simpleName + ": " + (e.message ?: "unknown")))
        }
    }

    private fun startPolling(active: Session) {
        stopPolling()
        pollTask = worker.scheduleAtFixedRate({
            try {
                val frame = active.update()
                val earth = active.earth
                if (earth == null || earth.trackingState != TrackingState.TRACKING) {
                    emit(JSONObject().put("type", "pose").put("tracking", false)
                        .put("earthState", earth?.earthState?.name ?: "UNAVAILABLE"))
                    return@scheduleAtFixedRate
                }
                val pose = earth.cameraGeospatialPose
                emit(JSONObject().put("type", "pose").put("tracking", true)
                    .put("latitude", pose.latitude).put("longitude", pose.longitude)
                    .put("altitude", pose.altitude).put("heading", pose.heading)
                    .put("horizontalAccuracy", pose.horizontalAccuracy)
                    .put("verticalAccuracy", pose.verticalAccuracy)
                    .put("headingAccuracy", pose.headingAccuracy)
                    .put("frameTimestampNs", frame.timestamp))
            } catch (e: Exception) {
                emit(JSONObject().put("type", "error").put("message", e.javaClass.simpleName + ": " + (e.message ?: "unknown")))
            }
        }, 0, 250, TimeUnit.MILLISECONDS)
    }

    private fun emit(payload: JSONObject) {
        runOnUiThread {
            val js = "window.dispatchEvent(new CustomEvent('monument:arcore', {detail: " + payload.toString() + "}));"
            webView.evaluateJavascript(js, null)
        }
    }

    private fun stopPolling() { pollTask?.cancel(true); pollTask = null }

    override fun onPause() {
        stopPolling()
        try { session?.pause() } catch (_: Exception) {}
        super.onPause()
    }

    override fun onDestroy() {
        stopPolling()
        try { session?.close() } catch (_: Exception) {}
        session = null
        worker.shutdownNow()
        webView.removeJavascriptInterface("MonumentAR")
        super.onDestroy()
    }

    companion object { private const val REQUEST_PERMISSIONS = 701 }
}
