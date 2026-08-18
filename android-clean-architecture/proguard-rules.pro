# Kotlin
-keep class kotlin.** { *; }
-keep interface kotlin.** { *; }
-dontwarn kotlin.**

# Coroutines
-keep class kotlinx.coroutines.** { *; }
-keep interface kotlinx.coroutines.** { *; }
-dontwarn kotlinx.coroutines.**

# Room
-keep class androidx.room.** { *; }
-keep interface androidx.room.** { *; }
-dontwarn androidx.room.**

# Hilt
-keep class com.google.dagger.hilt.** { *; }
-keep interface com.google.dagger.hilt.** { *; }
-dontwarn com.google.dagger.hilt.**

# Gemini SDK
-keep class com.google.ai.** { *; }
-keep interface com.google.ai.** { *; }
-dontwarn com.google.ai.**

# TensorFlow Lite
-keep class org.tensorflow.** { *; }
-keep interface org.tensorflow.** { *; }
-dontwarn org.tensorflow.**

# Bouncy Castle
-keep class org.bouncycastle.** { *; }
-keep interface org.bouncycastle.** { *; }
-dontwarn org.bouncycastle.**

# App classes
-keep class com.uru.** { *; }
-keep interface com.uru.** { *; }
-dontwarn com.uru.**

# Keep all native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep custom applications classes that extend Context
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider
