# This is a configuration file for ProGuard.
# http://proguard.sourceforge.net/index.html#manual/usage.html

-dontusemixedcaseclassnames
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Keep AndroidX
-keep class androidx.** { *; }
-keep interface androidx.** { *; }

# Keep WebView
-keep public class android.webkit.WebView { *; }
-keepclassmembers class * extends android.webkit.WebViewClient { *; }
-keepclassmembers class * extends android.webkit.WebChromeClient { *; }
