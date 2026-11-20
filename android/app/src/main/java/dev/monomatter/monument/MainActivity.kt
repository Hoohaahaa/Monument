package dev.monomatter.monument

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.view.Gravity
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import android.opengl.GLSurfaceView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.ar.core.ArCoreApk
import com.google.ar.core.Config
import com.google.ar.core.Session

/**
 * Native-first camera entry point.
 * This milestone proves camera passthrough only; Geospatial anchors and web compositing
 * remain separate gates and are not represented as implemented here.
 */
class MainActivity : Activity() {
    private lateinit var glView: GLSurfaceView
    private lateinit var renderer: CameraBackgroundRenderer
    private lateinit var status: TextView
    private lateinit var startButton: Button
    private var session: Session? = null
    private var pendingStart = false
    private var cameraRequested = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        renderer = CameraBackgroundRenderer { message ->
            runOnUiThread { status.text = message }
        }
        renderer.setDisplayRotation(windowManager.defaultDisplay.rotation)

        glView = GLSurfaceView(this).apply {
            setEGLContextClientVersion(2)
            preserveEGLContextOnPause = false
            setRenderer(renderer)
            renderMode = GLSurfaceView.RENDERMODE_CONTINUOUSLY
        }

        status = TextView(this).apply {
            text = "MONUMENT / CAMERA\nCamera is idle"
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

        val controls = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(8, 8, 8, 18)
            addView(startButton, LinearLayout.LayoutParams(0, -2, 1f))
            addView(stopButton, LinearLayout.LayoutParams(0, -2, 0.55f))
            addView(editorButton, LinearLayout.LayoutParams(0, -2, 1f))
        }

        val root = FrameLayout(this)
        root.addView(glView, FrameLayout.LayoutParams(-1, -1))
        val statusParams = FrameLayout.LayoutParams(-1, -2, Gravity.TOP)
        statusParams.setMargins(12, 36, 12, 0)
        root.addView(status, statusParams)
        root.addView(controls, FrameLayout.LayoutParams(-1, -2, Gravity.BOTTOM))
        setContentView(root)
    }

    private fun requestAndStartCamera() {
        if (cameraRequested) return
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            pendingStart = true
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.CAMERA),
                REQUEST_CAMERA_PERMISSION
            )
            return
        }
        startCameraSession()
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode != REQUEST_CAMERA_PERMISSION) return
        val granted = ContextCompat.checkSelfPermission(
            this, Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED
        if (granted && pendingStart) {
            pendingStart = false
            startCameraSession()
        } else {
            pendingStart = false
            status.text = "Camera permission was not granted. Allow Camera permission and try again."
        }
    }

    private fun startCameraSession() {
        if (cameraRequested) return
        try {
            val installStatus = ArCoreApk.getInstance().requestInstall(this, true)
            if (installStatus == ArCoreApk.InstallStatus.INSTALL_REQUESTED) {
                status.text = "Google Play Services for AR is updating. Return and tap OPEN CAMERA again."
                return
            }

            val active = session ?: Session(this).also { session = it }
            // Keep camera startup independent from Geospatial/VPS and Depth capability.
            active.configure(Config(active))
            active.resume()
            cameraRequested = true
            glView.queueEvent { renderer.setSession(active) }
            startButton.text = "CAMERA ACTIVE"
            status.text = "MONUMENT / CAMERA\nStarting ARCore camera feed…"
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
                status.text = "MONUMENT / CAMERA\nCamera stopped"
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
        }
    }

    override fun onPause() {
        if (::glView.isInitialized) glView.onPause()
        try { session?.pause() } catch (_: Exception) {}
        super.onPause()
    }

    override fun onDestroy() {
        cameraRequested = false
        try { session?.pause() } catch (_: Exception) {}
        try { session?.close() } catch (_: Exception) {}
        session = null
        super.onDestroy()
    }

    companion object {
        private const val REQUEST_CAMERA_PERMISSION = 702
        private const val EDITOR_URL = "https://monument-field-test-m8cu2wxxp-mos-projects-efbc27a5.vercel.app/"
    }
}
