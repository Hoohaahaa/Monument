# ARCore Cloud authorization — Monument

## Current app identity
- Android application ID: dev.monomatter.monument
- Authorization mode: Keyless (Google preferred)
- Required dependency: com.google.android.gms:play-services-auth

## Required Google Cloud setup
1. Open or create the Google Cloud project intended for Monument.
2. Enable ARCore API in that project.
3. Create an OAuth 2.0 Client ID of type Android.
4. Set package name exactly to dev.monomatter.monument.
5. Add the SHA-1 fingerprint of the certificate that signs the APK installed on the phone.
6. Wait for Google credential propagation, then install a build signed by that matching certificate and retest.

## Important
- SHA-1 must match the actual APK signer, not an assumed local debug key. CI debug signing may be regenerated between ephemeral runners; inspect the exact artifact before registering it.
- Do not commit API keys or signing secrets to the repository.
- An API key is an alternative authorization method, not automatically required. If using one, enable ARCore API in the same Cloud project and configure key restrictions correctly.
- ERROR_NOT_AUTHORIZED is an authorization failure; it is not a VPS coverage result.
- Expected healthy state: Earth.EarthState.ENABLED, then Earth.trackingState == TRACKING. Only then is cameraGeospatialPose valid.
