package dev.monomatter.monument

import android.opengl.GLES11Ext
import android.opengl.GLES20
import android.opengl.GLSurfaceView
import android.view.Surface
import com.google.ar.core.Coordinates2d
import com.google.ar.core.Earth
import com.google.ar.core.Frame
import com.google.ar.core.Session
import com.google.ar.core.TrackingState
import com.google.ar.core.exceptions.CameraNotAvailableException
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import java.util.Locale
import kotlin.math.*
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10

/**
 * ARCore camera passthrough plus runtime Geospatial diagnostics.
 * No product UI, terrain, or world-anchored surfaces are drawn in this milestone.
 */
class CameraBackgroundRenderer(
    private val onStatus: (String) -> Unit
) : GLSurfaceView.Renderer {
    @Volatile private var session: Session? = null
    @Volatile private var displayRotation: Int = Surface.ROTATION_0
    @Volatile private var displayGeometryDirty = true
    @Volatile private var geospatialEnabled = false

    private var textureId = -1
    private var program = 0
    private var positionHandle = -1
    private var texCoordHandle = -1
    private var textureHandle = -1
    private var textureBound = false
    private var surfaceWidth = 1
    private var surfaceHeight = 1
    private var lastStatusAt = 0L
    private var lastGeoStatusAt = 0L
    @Volatile private var vpsCheckInFlight = false
    @Volatile private var vpsLastCheckAt = 0L
    @Volatile private var vpsLastLatitude = Double.NaN
    @Volatile private var vpsLastLongitude = Double.NaN
    @Volatile private var vpsRequestId = 0L
    @Volatile private var vpsAvailability = "NOT CHECKED"

    private val quadVertices = directBuffer(floatArrayOf(
        -1f, -1f, 1f, -1f,
        -1f, 1f, 1f, 1f
    ))
    private val quadTexCoords = directBuffer(floatArrayOf(
        0f, 1f, 1f, 1f,
        0f, 0f, 0f, 0f
    ))
    private val transformedTexCoords = FloatArray(8)

    /** Call on the GL thread (MainActivity uses GLSurfaceView.queueEvent). */
    fun setSession(value: Session?) {
        session = value
        textureBound = false
        vpsRequestId += 1
        vpsCheckInFlight = false
        vpsLastCheckAt = 0L
        vpsLastLatitude = Double.NaN
        vpsLastLongitude = Double.NaN
        vpsAvailability = "NOT CHECKED"
        lastGeoStatusAt = 0L
    }

    fun setGeospatialEnabled(value: Boolean) {
        geospatialEnabled = value
        vpsRequestId += 1
        vpsCheckInFlight = false
        vpsLastCheckAt = 0L
        vpsLastLatitude = Double.NaN
        vpsLastLongitude = Double.NaN
        vpsAvailability = "NOT CHECKED"
        lastGeoStatusAt = 0L
    }

    fun setDisplayRotation(rotation: Int) {
        displayRotation = rotation
        displayGeometryDirty = true
    }

    override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
        GLES20.glClearColor(0f, 0f, 0f, 1f)
        createCameraTexture()
        program = createProgram(VERTEX_SHADER, FRAGMENT_SHADER)
        positionHandle = GLES20.glGetAttribLocation(program, "a_Position")
        texCoordHandle = GLES20.glGetAttribLocation(program, "a_TexCoord")
        textureHandle = GLES20.glGetUniformLocation(program, "sTexture")
        textureBound = false
    }

    override fun onSurfaceChanged(gl: GL10?, width: Int, height: Int) {
        surfaceWidth = width.coerceAtLeast(1)
        surfaceHeight = height.coerceAtLeast(1)
        displayGeometryDirty = true
        GLES20.glViewport(0, 0, surfaceWidth, surfaceHeight)
    }

    override fun onDrawFrame(gl: GL10?) {
        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT or GLES20.GL_DEPTH_BUFFER_BIT)
        val active = session ?: return

        try {
            if (!textureBound) {
                active.setCameraTextureName(textureId)
                textureBound = true
            }

            active.setDisplayGeometry(displayRotation, surfaceWidth, surfaceHeight)
            val frame: Frame = active.update()

            if (frame.hasDisplayGeometryChanged() || displayGeometryDirty) {
                frame.transformCoordinates2d(
                    Coordinates2d.OPENGL_NORMALIZED_DEVICE_COORDINATES,
                    QUAD_COORDS,
                    Coordinates2d.TEXTURE_NORMALIZED,
                    transformedTexCoords
                )
                quadTexCoords.position(0)
                quadTexCoords.put(transformedTexCoords)
                quadTexCoords.position(0)
                displayGeometryDirty = false
            }

            if (frame.timestamp != 0L) {
                drawCameraBackground()
                if (geospatialEnabled) {
                    publishGeospatialStatus(active)
                } else {
                    publishCameraStatus(frame)
                }
            } else {
                publishWaitingStatus()
            }
        } catch (e: CameraNotAvailableException) {
            onStatus("Camera unavailable. Close other camera apps, then tap OPEN CAMERA again.")
            session = null
        } catch (e: Exception) {
            onStatus("ARCore frame error: ${e.javaClass.simpleName}: ${e.message ?: "unknown"}")
        }
    }

    private fun publishGeospatialStatus(active: Session) {
        val now = System.currentTimeMillis()
        if (now - lastGeoStatusAt < 1500L) return
        lastGeoStatusAt = now

        val earth: Earth = active.earth ?: run {
            onStatus("MONUMENT / GEOLOCALIZATION\nEarth: NOT AVAILABLE · waiting for Geospatial session…")
            return
        }
        val earthTracking = earth.trackingState
        val earthState = earth.earthState
        if (earthTracking != TrackingState.TRACKING) {
            onStatus("MONUMENT / GEOLOCALIZATION\nEarth: ${earthTracking.name} · State: ${earthState.name}\nVPS: ${vpsAvailability}\nWaiting for a valid global pose…")
            return
        }

        val pose = earth.cameraGeospatialPose
        val lat = pose.latitude
        val lon = pose.longitude
        val altitude = pose.altitude
        val horizontal = pose.horizontalAccuracy
        val vertical = pose.verticalAccuracy
        val yawAccuracy = pose.orientationYawAccuracy

        onStatus(
            String.format(
                Locale.US,
                "MONUMENT / GEOLOCALIZATION\nEarth: TRACKING · WGS84/EUS\n%.6f°, %.6f° · %.1f m ellipsoid\nH ±%.1f m · V ±%.1f m · yaw accuracy ±%.1f°\nVPS: %s",
                lat, lon, altitude, horizontal, vertical, yawAccuracy, vpsAvailability
            )
        )

        maybeCheckVpsAvailability(active, lat, lon, now)
    }

    /**
     * VPS availability is a location query, not a live tracking state.
     * Re-query after moving at least 100 m, or every 5 minutes while stationary,
     * so a result from the first fix cannot remain on screen forever.
     */
    private fun maybeCheckVpsAvailability(active: Session, latitude: Double, longitude: Double, now: Long) {
        if (vpsCheckInFlight) return

        val hasPreviousLocation = !vpsLastLatitude.isNaN() && !vpsLastLongitude.isNaN()
        val movedMeters = if (hasPreviousLocation) {
            distanceMeters(vpsLastLatitude, vpsLastLongitude, latitude, longitude)
        } else {
            Double.POSITIVE_INFINITY
        }
        val locationChanged = movedMeters >= VPS_RECHECK_DISTANCE_METERS
        val retryDue = vpsLastCheckAt == 0L || now - vpsLastCheckAt >= VPS_RECHECK_INTERVAL_MS
        if (!locationChanged && !retryDue) return

        vpsCheckInFlight = true
        vpsLastCheckAt = now
        vpsLastLatitude = latitude
        vpsLastLongitude = longitude
        vpsAvailability = "CHECKING"
        val requestId = ++vpsRequestId

        try {
            active.checkVpsAvailabilityAsync(latitude, longitude) { result ->
                if (requestId == vpsRequestId) {
                    vpsAvailability = result.name
                    vpsCheckInFlight = false
                }
            }
        } catch (error: Exception) {
            if (requestId == vpsRequestId) {
                vpsAvailability = "CHECK FAILED (${error.javaClass.simpleName})"
                vpsCheckInFlight = false
            }
        }
    }

    private fun distanceMeters(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val earthRadiusMeters = 6_371_000.0
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = sin(dLat / 2).pow(2.0) +
            cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) * sin(dLon / 2).pow(2.0)
        return 2.0 * earthRadiusMeters * asin(sqrt(a.coerceIn(0.0, 1.0)))
    }

    private fun publishWaitingStatus() {
        val now = System.currentTimeMillis()
        if (now - lastStatusAt < 1200L) return
        lastStatusAt = now
        onStatus("MONUMENT / RUNTIME\nWaiting for first camera frame…")
    }

    private fun publishCameraStatus(frame: Frame) {
        val now = System.currentTimeMillis()
        if (now - lastStatusAt < 1200L) return
        lastStatusAt = now
        onStatus("MONUMENT / RUNTIME\nCamera: LIVE · AR tracking: ${frame.camera.trackingState.name}")
    }

    private fun directBuffer(values: FloatArray): FloatBuffer =
        ByteBuffer.allocateDirect(values.size * 4)
            .order(ByteOrder.nativeOrder())
            .asFloatBuffer()
            .apply { put(values); position(0) }

    private fun createCameraTexture() {
        val textures = IntArray(1)
        GLES20.glGenTextures(1, textures, 0)
        textureId = textures[0]
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, textureId)
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE)
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE)
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR)
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR)
    }

    private fun drawCameraBackground() {
        GLES20.glDisable(GLES20.GL_DEPTH_TEST)
        GLES20.glDepthMask(false)
        GLES20.glUseProgram(program)
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, textureId)
        GLES20.glUniform1i(textureHandle, 0)

        quadVertices.position(0)
        quadTexCoords.position(0)
        GLES20.glEnableVertexAttribArray(positionHandle)
        GLES20.glEnableVertexAttribArray(texCoordHandle)
        GLES20.glVertexAttribPointer(positionHandle, 2, GLES20.GL_FLOAT, false, 0, quadVertices)
        GLES20.glVertexAttribPointer(texCoordHandle, 2, GLES20.GL_FLOAT, false, 0, quadTexCoords)
        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
        GLES20.glDisableVertexAttribArray(positionHandle)
        GLES20.glDisableVertexAttribArray(texCoordHandle)
        GLES20.glDepthMask(true)
        GLES20.glEnable(GLES20.GL_DEPTH_TEST)
    }

    private fun createProgram(vertexSource: String, fragmentSource: String): Int {
        val vertex = compileShader(GLES20.GL_VERTEX_SHADER, vertexSource)
        val fragment = compileShader(GLES20.GL_FRAGMENT_SHADER, fragmentSource)
        val result = GLES20.glCreateProgram()
        GLES20.glAttachShader(result, vertex)
        GLES20.glAttachShader(result, fragment)
        GLES20.glLinkProgram(result)
        val linked = IntArray(1)
        GLES20.glGetProgramiv(result, GLES20.GL_LINK_STATUS, linked, 0)
        if (linked[0] == 0) {
            val log = GLES20.glGetProgramInfoLog(result)
            GLES20.glDeleteProgram(result)
            throw IllegalStateException("Camera shader link failed: $log")
        }
        GLES20.glDeleteShader(vertex)
        GLES20.glDeleteShader(fragment)
        return result
    }

    private fun compileShader(type: Int, source: String): Int {
        val shader = GLES20.glCreateShader(type)
        GLES20.glShaderSource(shader, source)
        GLES20.glCompileShader(shader)
        val compiled = IntArray(1)
        GLES20.glGetShaderiv(shader, GLES20.GL_COMPILE_STATUS, compiled, 0)
        if (compiled[0] == 0) {
            val log = GLES20.glGetShaderInfoLog(shader)
            GLES20.glDeleteShader(shader)
            throw IllegalStateException("Camera shader compile failed: $log")
        }
        return shader
    }

    companion object {
        private val QUAD_COORDS = floatArrayOf(
            -1f, -1f, 1f, -1f,
            -1f, 1f, 1f, 1f
        )
        private const val VPS_RECHECK_DISTANCE_METERS = 100.0
        private const val VPS_RECHECK_INTERVAL_MS = 5 * 60 * 1000L
        private const val VERTEX_SHADER = """
            attribute vec4 a_Position;
            attribute vec2 a_TexCoord;
            varying vec2 v_TexCoord;
            void main() {
                gl_Position = a_Position;
                v_TexCoord = a_TexCoord;
            }
        """
        private const val FRAGMENT_SHADER = """
            #extension GL_OES_EGL_image_external : require
            precision mediump float;
            uniform samplerExternalOES sTexture;
            varying vec2 v_TexCoord;
            void main() {
                gl_FragColor = texture2D(sTexture, v_TexCoord);
            }
        """
    }
}
