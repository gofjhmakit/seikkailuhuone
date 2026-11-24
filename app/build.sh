#!/bin/bash
# Build + sign the "Seikkailuhuone" APK using the installed Android command-line
# tools (aapt2, d8, zipalign, apksigner) and a JDK. Targets Android 4.1 (SDK 16).
# Run from anywhere: bash app/build.sh
set -e
cd "$(cd "$(dirname "$0")" && pwd)"

SDK=/opt/homebrew/share/android-commandlinetools
BT="$SDK/build-tools/36.0.0"
ANDJAR="$SDK/platforms/android-36/android.jar"
AAPT2="$BT/aapt2"
ZIPALIGN="$BT/zipalign"
APKSIGNER="$BT/apksigner"

# locate a JDK that supports -source/-target 8
JBIN=""
for c in /opt/homebrew/opt/openjdk@11 /opt/homebrew/opt/openjdk@21 /opt/homebrew/opt/openjdk; do
  [ -x "$c/bin/javac" ] && { JBIN="$c/bin"; break; }
done
JAVAC="${JBIN:+$JBIN/}javac"
KEYTOOL="${JBIN:+$JBIN/}keytool"
echo "JAVAC=$JAVAC"

rm -rf build gen obj
mkdir -p build gen obj

echo "== icons =="
python3 tools/make_icons.py

echo "== aapt2 compile =="
"$AAPT2" compile --dir res -o build/res.zip

echo "== aapt2 link =="
"$AAPT2" link -o build/base.apk -I "$ANDJAR" \
  --manifest AndroidManifest.xml --java gen \
  --min-sdk-version 16 --target-sdk-version 16 \
  build/res.zip

echo "== javac =="
"$JAVAC" -classpath "$ANDJAR" -source 8 -target 8 -d obj $(find src gen -name '*.java')

echo "== d8 =="
d8 --min-api 16 --lib "$ANDJAR" --output build $(find obj -name '*.class')

echo "== add classes.dex =="
cp build/base.apk build/app-unsigned.apk
(cd build && zip -j -q app-unsigned.apk classes.dex)

echo "== zipalign =="
"$ZIPALIGN" -f 4 build/app-unsigned.apk build/app-aligned.apk

echo "== keystore =="
[ -f debug.keystore ] || "$KEYTOOL" -genkeypair -keystore debug.keystore \
  -storepass android -keypass android -alias kidskey \
  -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Seikkailuhuone"

echo "== sign =="
"$APKSIGNER" sign --ks debug.keystore --ks-pass pass:android --key-pass pass:android \
  --min-sdk-version 16 --v1-signing-enabled true --v2-signing-enabled true \
  --out build/seikkailuhuone.apk build/app-aligned.apk

echo "BUILD_OK"
ls -l build/seikkailuhuone.apk
