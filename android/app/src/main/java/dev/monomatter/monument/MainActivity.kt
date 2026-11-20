package dev.monomatter.monument

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import org.json.JSONObject
import android.net.Uri
import android.os.Bundle
import android.view.Gravity
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import android.opengl.GLSurfaceView
import android.app.AlertDialog
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.ar.core.ArCoreApk
import com.google.ar.core.Config
import com.google.ar.core.Session

/**
 * Native camera runtime and temporary capability diagnostic shell.
 * This is not the final Monument interface; the product UI is composed later
 * over the camera after native pose/localization has been validated.
 */
class MainActivity : Activity() {
    private lateinit var glView: GLSurfaceView
    private lateinit var webView: WebView
    private lateinit var renderer: CameraBackgroundRenderer
    private lateinit var status: TextView
    private lateinit var startButton: Button
    private lateinit var vpsCheckButton: Button
    private var session: Session? = null
    private var pendingStart = false
    private var cameraRequested = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        renderer = CameraBackgroundRenderer { message ->
            runOnUiThread {
                status.text = message
                if (::webView.isInitialized) {
                    val quoted = JSONObject.quote(message)
                    webView.evaluateJavascript("window.dispatchEvent(new CustomEvent('monument:arcore',{detail:{type:'state',message:$quoted}}));", null)
                }
            }
        }
        renderer.setDisplayRotation(windowManager.defaultDisplay.rotation)

        glView = GLSurfaceView(this).apply {
            setEGLContextClientVersion(2)
            setEGLConfigChooser(8, 8, 8, 8, 16, 0)
            holder.setFormat(android.graphics.PixelFormat.TRANSLUCENT)
            setZOrderMediaOverlay(true)
            preserveEGLContextOnPause = false
            setRenderer(renderer)
            renderMode = GLSurfaceView.RENDERMODE_CONTINUOUSLY
        }

        status = TextView(this).apply {
            text = "MONUMENT / RUNTIME\nCamera idle"
            textSize = 13f
            setTextColor(0xFFFFFFFF.toInt())
            setBackgroundColor(0xB8000000.toInt())
            setPadding(18, 14, 18, 14)
        }

        startButton = Button(this).apply {
            text = "OPEN CAMERA"
            setOnClickListener { requestAndStartCamera() }
        }

        val stopButton = Button(this).apply {
            text = "STOP"
            setOnClickListener { stopCamera() }
        }

        val editorButton = Button(this).apply {
            text = "OPEN EDITOR"
            setOnClickListener {
                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(EDITOR_URL)))
            }
        }

        vpsCheckButton = Button(this).apply {
            text = "RECHECK VPS AT CURRENT LOCATION"
            setOnClickListener {
                isEnabled = false
                glView.queueEvent { renderer.recheckVpsAtCurrentPose() }
                postDelayed({ isEnabled = true }, 30_000L)
            }
        }

        val actionRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            addView(startButton, LinearLayout.LayoutParams(0, -2, 1f))
            addView(stopButton, LinearLayout.LayoutParams(0, -2, 0.55f))
            addView(editorButton, LinearLayout.LayoutParams(0, -2, 1f))
        }
        val controls = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(8, 8, 8, 18)
            addView(vpsCheckButton, LinearLayout.LayoutParams(-1, -2))
            addView(actionRow, LinearLayout.LayoutParams(-1, -2))
        }

        webView = WebView(this).apply {
            setBackgroundColor(Color.TRANSPARENT)
            setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null)
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.mediaPlaybackRequiresUserGesture = true
            webChromeClient = WebChromeClient()
            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    val js = "document.documentElement.style.background='transparent';document.body.style.background='transparent';const s=document.querySelector('.shell');if(s)s.style.background='transparent';const st=document.querySelector('.stage');if(st)st.style.background='transparent';const c=document.querySelector('.camera');if(c)c.style.background='transparent';window.addEventListener('monument:arcore',e=>{const d=e&&e.detail?e.detail:{};const s=document.getElementById('geoStatus');if(s&&d.message)s.textContent=d.message.replace(/\\n/g,' · ');});"
                    evaluateJavascript(js, null)
                }
            }
            addJavascriptInterface(MonumentJavascriptBridge(), "MonumentAR")
            loadUrl(EDITOR_URL)
        }

        val root = FrameLayout(this)
        root.addView(glView, FrameLayout.LayoutParams(-1, -1))
        root.addView(webView, FrameLayout.LayoutParams(-1, -1))
        val statusParams = FrameLayout.LayoutParams(-1, -2, Gravity.TOP)
        statusParams.setMargins(12, 36, 12, 0)
        // The transparent web shell owns visible controls; native diagnostics are bridged into the page.
        setContentView(root)
    }

    private inner class MonumentJavascriptBridge {
        @JavascriptInterface
        fun startGeospatial() { runOnUiThread { requestAndStartCamera() } }

        @JavascriptInterface
        fun stopGeospatial() { runOnUiThread { stopCamera() } }

        @JavascriptInterface
        fun recheckVps() {
            runOnUiThread {
                if (::glView.isInitialized) glView.queueEvent { renderer.recheckVpsAtCurrentPose() }
            }
        }

        @JavascriptInterface
        fun getRuntimeInfo(): String {
            val active = cameraRequested
            return "{\"bridgeVersion\":1,\"platform\":\"android\",\"cameraActive\":$active}"
        }
    }

    private fun requestAndStartCamera() {
        if (cameraRequested) return
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            pendingStart = true
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), REQUEST_CAMERA_PERMISSION)
            return
        }
        requestGeospatialConsentOrStart()
    }

    private fun requestGeospatialConsentOrStart() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            startCameraSession(enableGeospatial = true)
            return
        }

        val preferences = getSharedPreferences(PREFERENCES, MODE_PRIVATE)
        if (preferences.getBoolean(GEOSPATIAL_CONSENT_ACCEPTED, false)) {
            requestLocationPermission()
            return
        }

        AlertDialog.Builder(this)
            .setTitle("Monument location experience")
            .setMessage("If you continue, Monument can use precise device location and Google's Geospatial services to estimate your position and orientation in the real world. Camera frames are processed by ARCore for spatial tracking. You can continue with camera-only mode if you decline.")
            .setNegativeButton("CAMERA ONLY") { _, _ -> startCameraSession(enableGeospatial = false) }
            .setPositiveButton("CONTINUE") { _, _ ->
                preferences.edit().putBoolean(GEOSPATIAL_CONSENT_ACCEPTED, true).apply()
                requestLocationPermission()
            }
            .setOnCancelListener { startCameraSession(enableGeospatial = false) }
            .show()
    }

    private fun requestLocationPermission() {
        ActivityCompat.requestPermissions(
            this,
            arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION),
            REQUEST_LOCATION_PERMISSION
        )
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        when (requestCode) {
            REQUEST_CAMERA_PERMISSION -> {
                val granted = ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
                if (granted && pendingStart) {
                    pendingStart = false
                    requestGeospatialConsentOrStart()
                } else {
                    pendingStart = false
                    status.text = "Camera permission was not granted."
                }
            }
            REQUEST_LOCATION_PERMISSION -> {
                val hasPreciseLocation = ContextCompat.checkSelfPermission(
                    this, Manifest.permission.ACCESS_FINE_LOCATION
                ) == PackageManager.PERMISSION_GRANTED
                startCameraSession(enableGeospatial = hasPreciseLocation)
            }
        }
    }

    private fun startCameraSession(enableGeospatial: Boolean) {
        if (cameraRequested) return
        try {
            val installStatus = ArCoreApk.getInstance().requestInstall(this, true)
            if (installStatus == ArCoreApk.InstallStatus.INSTALL_REQUESTED) {
                status.text = "Google Play Services for AR is updating. Return and tap OPEN CAMERA again."
                return
            }

            val active = session ?: Session(this).also { session = it }
            var geospatialConfigured = false
            val config = Config(active)
            if (enableGeospatial) {
                val supported = active.isGeospatialModeSupported(Config.GeospatialMode.ENABLED)
                if (supported) {
                    config.geospatialMode = Config.GeospatialMode.ENABLED
                    try {
                        active.configure(config)
                        geospatialConfigured = true
                    } catch (geoError: Exception) {
                        status.text = "Geospatial setup unavailable: ${geoError.javaClass.simpleName}. Starting camera-only."
                        active.configure(Config(active))
                    }
                } else {
                    active.configure(config)
                    status.text = "This ARCore camera configuration does not support Geospatial. Starting camera-only."
                }
            } else {
                active.configure(config)
            }

            active.resume()
            cameraRequested = true
            glView.queueEvent {
                renderer.setGeospatialEnabled(geospatialConfigured)
                renderer.setSession(active)
            }
            startButton.text = "CAMERA ACTIVE"
            status.text = if (geospatialConfigured) {
                "MONUMENT / RUNTIME\nCamera starting · Geospatial enabled · waiting for localization"
            } else {
                "MONUMENT / RUNTIME\nCamera starting · Geospatial unavailable or not enabled"
            }
        } catch (e: Exception) {
            cameraRequested = false
            status.text = "Could not start camera: ${e.javaClass.simpleName}: ${e.message ?: "unknown error"}"
        }
    }

    private fun stopCamera() {
        cameraRequested = false
        glView.queueEvent {
            renderer.setSession(null)
            runOnUiThread {
                try { session?.pause() } catch (_: Exception) {}
                startButton.text = "OPEN CAMERA"
                status.text = "MONUMENT / RUNTIME\nCamera stopped"
            }
        }
    }

    override fun onResume() {
        super.onResume()
        if (::glView.isInitialized) {
            renderer.setDisplayRotation(windowManager.defaultDisplay.rotation)
            if (cameraRequested && session != null) {
                try {
                    session?.resume()
                } catch (e: Exception) {
                    cameraRequested = false
                    status.text = "Could not resume camera: ${e.javaClass.simpleName}: ${e.message ?: "unknown"}"
                }
            }
            glView.onResume()
            if (::webView.isInitialized) webView.onResume()
        }
    }

    override fun onPause() {
        if (::webView.isInitialized) webView.onPause()
        if (::glView.isInitialized) glView.onPause()
        try { session?.pause() } catch (_: Exception) {}
        super.onPause()
    }

    override fun onDestroy() {
        cameraRequested = false
        try { session?.pause() } catch (_: Exception) {}
        try { session?.close() } catch (_: Exception) {}
        session = null
        if (::webView.isInitialized) { webView.removeJavascriptInterface("MonumentAR"); webView.destroy() }
        super.onDestroy()
    }

    companion object {
        private const val REQUEST_CAMERA_PERMISSION = 702
        private const val REQUEST_LOCATION_PERMISSION = 703
        private const val PREFERENCES = "monument_runtime"
        private const val GEOSPATIAL_CONSENT_ACCEPTED = "geospatial_consent_accepted"
        private const val EDITOR_URL = "https://monument-field-test-git-feature-an-7c1055-mos-projects-efbc27a5.vercel.app/"
    }
}
