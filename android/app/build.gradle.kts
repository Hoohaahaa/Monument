plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}
android {
    namespace = "dev.monomatter.monument"
    compileSdk = 35
    defaultConfig {
        applicationId = "dev.monomatter.monument"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"
    }
}
dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("com.google.ar:core:1.57.0")
    implementation("com.google.android.gms:play-services-location:21.3.0")
    implementation("androidx.webkit:webkit:1.12.1")
}
