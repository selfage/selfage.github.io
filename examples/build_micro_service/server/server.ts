import express = require("express");
import http = require("http");
import { GetChatHistoryHandler } from "./get_chat_history_handler";
import { SignInHandler } from "./sign_in_handler";
import { registerCorsAllowedPreflightHandler } from "@selfage/service_handler/preflight_handler";
import {
  registerAuthed,
  registerUnauthed,
} from "@selfage/service_handler/register";
import { SessionSigner } from "@selfage/service_handler/session_signer";

SessionSigner.SECRET_KEY = "your secret key";

let app = express();
registerCorsAllowedPreflightHandler(app);
registerUnauthed(app, new SignInHandler());
registerAuthed(app, new GetChatHistoryHandler());

let httpServer = http.createServer(app);
httpServer.listen(80, () => {
  console.log("Http server started at 80.");
});
