#!/bin/bash
# One-command deploy to the Acer Iconia B1 (Android 4.1) over USB:
#   1. build + sign the APK,
#   2. copy the offline web app onto the SD card ($DST),
#   3. install the APK and launch it.
#
# Requires: adb (device connected, USB debugging on) and the build toolchain
# that app/build.sh uses. Run from anywhere: bash app/deploy.sh
set -e
cd "$(cd "$(dirname "$0")/.." && pwd)"   # repo root

DST=/storage/sdcard1/seikkailuhuone      # SD card on this device; see MainActivity.java

echo "== build APK =="
bash app/build.sh >/dev/null
echo "   app/build/seikkailuhuone.apk"

echo "== push web app to $DST =="
adb shell "mkdir -p $DST/games"
adb push index.html seikkailu.css manifest.webmanifest "$DST/" >/dev/null
for d in engine content assets icons; do adb push "$d" "$DST/" >/dev/null; done
# only the built game pages — never the *.template.html sources or the stub
for f in games/*.html; do
  case "$f" in *.template.html|games/_stub.html) continue ;; esac
  adb push "$f" "$DST/games/" >/dev/null
done

echo "== install + launch =="
adb install -r app/build/seikkailuhuone.apk
adb shell am start -n fi.seikkailuhuone.kids/.MainActivity >/dev/null
echo "DEPLOY_OK"
