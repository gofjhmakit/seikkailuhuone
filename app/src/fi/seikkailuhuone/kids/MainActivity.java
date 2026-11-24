package fi.seikkailuhuone.kids;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.webkit.WebViewClient;

/**
 * "Seikkailuhuone" — a tiny fullscreen WebView wrapper that shows the offline
 * adventure-room hub from the SD card. No address bar, no tabs. Fully offline.
 */
public class MainActivity extends Activity {

    private WebView web;
    private static final String HUB_URL =
            "file:///storage/sdcard1/seikkailuhuone/index.html";
    private static final String HUB_DIR = "/storage/sdcard1/seikkailuhuone";

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        maybeCreateShortcut();
        // keep the screen awake while a child is using it
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // for localStorage (collections, mute)
        s.setAllowFileAccess(true);
        s.setBuiltInZoomControls(false);
        s.setSupportZoom(false);
        try { s.setDatabasePath(getFilesDir().getPath()); } catch (Throwable t) {}

        // keep every link inside this WebView (never spawn the browser)
        web.setWebViewClient(new WebViewClient());

        // surface JS console messages + uncaught errors to logcat (tag SeikWeb)
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage cm) {
                Log.i("SeikWeb", cm.messageLevel() + ": " + cm.message()
                        + " @" + cm.sourceId() + ":" + cm.lineNumber());
                return true;
            }
        });

        // Default to the hub; honor an incoming file:// link only if it points
        // into our own seikkailuhuone folder.
        String url = HUB_URL;
        try {
            Intent in = getIntent();
            if (in != null && in.getData() != null) {
                String d = in.getData().toString();
                if (d.indexOf(HUB_DIR) >= 0) url = d;
            }
        } catch (Throwable t) {}
        web.loadUrl(url);
        setContentView(web);
    }

    /** Add a labeled home-screen icon once (standard pre-Oreo mechanism). */
    private void maybeCreateShortcut() {
        SharedPreferences p = getSharedPreferences("app", MODE_PRIVATE);
        if (p.getBoolean("shortcut_made", false)) return;
        try {
            Intent launch = new Intent(this, MainActivity.class);
            launch.setAction(Intent.ACTION_MAIN);
            launch.addCategory(Intent.CATEGORY_LAUNCHER);

            Intent sc = new Intent();
            sc.putExtra(Intent.EXTRA_SHORTCUT_INTENT, launch);
            sc.putExtra(Intent.EXTRA_SHORTCUT_NAME, "Seikkailuhuone");
            sc.putExtra(Intent.EXTRA_SHORTCUT_ICON_RESOURCE,
                    Intent.ShortcutIconResource.fromContext(this, R.drawable.ic_launcher));
            sc.putExtra("duplicate", false);
            sc.setAction("com.android.launcher.action.INSTALL_SHORTCUT");
            sendBroadcast(sc);

            p.edit().putBoolean("shortcut_made", true).commit();
        } catch (Throwable t) {
            // ignore: app still works from the app drawer
        }
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) {
            web.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
