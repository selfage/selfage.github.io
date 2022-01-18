import express = require("express");
import expressStaticGzip = require("express-static-gzip");
import "@selfage/web_app_base_dir";

let app = express();
app.use(
  "/",
  expressStaticGzip(globalThis.WEB_APP_BASE_DIR, {
    serveStatic: {
      extensions: ["html"],
      fallthrough: false,
    },
  })
);
