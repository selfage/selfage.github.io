import { GET_CHAT_HISTORY, SIGN_IN } from "../service";
import { ServiceClient } from "@selfage/service_client";
import { LocalSessionStorage } from "@selfage/service_client/local_session_storage";

let sessionStorage = new LocalSessionStorage();
let client = new ServiceClient(sessionStorage, window.fetch.bind(window));
client.origin = "http://localhost:80";

async function main() {
  let response = await client.fetchUnauthed(
    { email: "me@email.com", password: "12345" },
    SIGN_IN
  );
  sessionStorage.save(response.signedSession);

  let chatHistoryResponse = await client.fetchAuthed(
    { channelId: "my channel" },
    GET_CHAT_HISTORY
  );
  console.log(JSON.stringify(chatHistoryResponse));
}

main();
