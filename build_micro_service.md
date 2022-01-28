# Build a micro service

You will learn how to use [@selfage/cli](https://www.npmjs.com/package/@selfage/cli), [@selfage/service_descriptor](https://www.npmjs.com/package/@selfage/service_descriptor), [@selfage/service_handler](https://www.npmjs.com/package/@selfage/service_handler) (based on [express](https://www.npmjs.com/package/express)) and [@selfage/service_client](https://www.npmjs.com/package/@selfage/service_descriptor), to build a simple micro service and a simple client that invokes the service.

Sample code for this guide can be found under [examples/build_micro_service](https://github.com/selfage/selfage.github.io/tree/main/examples/build_micro_service) directory.

## Service definitions

Let's define two simple services, `SignIn` and `GetChatHistory`, in a file `service.json`.

```JSON
[{
  "message": {
    "name": "SignInRequest",
    "fields": [{
      "name": "email",
      "type": "string"
    }, {
      "name": "password",
      "type": "string"
    }]
  }
}, {
  "message": {
    "name": "SignInResponse",
    "fields": [{
      "name": "signedSession",
      "type": "string"
    }]
  }
}, {
  "service": {
    "name": "SignIn",
    "path": "/SignIn",
    "request": "SignInRequest",
    "response": "SignInResponse"
  }
}, {
  "message": {
    "name": "GetChatHistoryRequest",
    "fields": [{
      "name": "signedSession",
      "type": "string"
    }, {
      "name": "channelId",
      "type": "string"
    }, {
      "name": "cursor",
      "type": "string"
    }]
  }
}, {
  "message": {
    "name": "GetChatHistoryResponse",
    "fields": [{
      "name": "chatEntries",
      "type": "ChatEntry",
      "isArray": true,
      "import": "./chat_entry"
    }]
  }
}, {
  "service": {
    "name": "GetChatHistory",
    "path": "/GetChatHistory",
    "request": "GetChatHistoryRequest",
    "response": "GetChatHistoryResponse"
  }
}]
```

It's defined in JSON format whose schema is [in @selfage/cli](https://github.com/selfage/cli/blob/52934e89a2c3e4d21fcd12aa88c2ba7f9db3d022/generate/definition.ts#L82). Then you can run `npx selfage gen service`, which generates a `service.ts` file. You'd want to commit both files to your codebase, and `service.ts` is what your code really depends on. Therefore you need to read it and understand what's available to be imported. Also it depends on `@selfage/service_descriptor`.

`path` is the URL path you want the request to be served on.

## Unauthed service handler

When a user signs in, the user is not authenticated yet, so this request is an unauthed request.

Let's create a file `sign_in_handler.ts` under a new directory `server`. You will need to implement `UnauthedServiceHandler` from [@selfage/service_handler](https://www.npmjs.com/package/@selfage/service_handler).

```TypeScript
import { SIGN_IN, SignInRequest, SignInResponse } from "../service";
import { UserSession } from "../session";
import { UnauthedServiceHandler } from "@selfage/service_handler";
import { SessionBuilder } from "@selfage/service_handler/session_signer";

export class SignInHandler
  implements UnauthedServiceHandler<SignInRequest, SignInResponse>
{
  public serviceDescriptor = SIGN_IN;
  private sessionBuilder = SessionBuilder.create();

  public async handle(
    logContext: string,
    request: SignInRequest
  ): Promise<SignInResponse> {
    console.log(`${logContext}Signing in with email ${request.email}.`);
    if (request.password !== "correct password") {
      return {};
    }

    let signedSession = this.sessionBuilder.build(
      JSON.stringify({ userId: "a random id" } as UserSession)
    );
    return {
      signedSession: signedSession,
    };
  }
}
```

`serviceDescriptor` and `handle()` are required to be implemented.

Once you have confirmed a user's credential, you can generate and return a `signedSession` which will be used later for authenticated requests.

`@selfage/service_handler` provides `SessionBuilder` class to help sign a session string, based on Nodejs's `crypto` library. There is a counter class `SessionExtractor` to verify the signed session as you will see later.

`UserSession` is a TypeScript interface that you define to contain whatever info you want to be used in an authenticated request. At least, you'd want the user id to be stored in the session. A session id is also commonly stored.

Ideally, `SessionBuilder` should be injected to follow dependency injection pattern, but let's keep it simple in the example here.

`logContext` is a string can be prefixed to any log during processing a request, which contains a randomly generated number when the request is received and is not guaranteed to be universally unique. It only helps search your logs regarding one request.

## Send requests

Before jumping into implementing `GetChatHistory`, let's see how to send a `SignInRequest` and use its response for the `GetChatHistoryRequest`. You will need [@selfage/service_client](https://www.npmjs.com/package/@selfage/service_descriptor).

Let's create a file `client.ts` under a new directory `client`.

```TypeScript
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
```

TypeScript will check if you have passed correct `SignInRequest`, which is inferred from `SIGN_IN`. Same for `GetChatHistoryRequest` inferred from `GET_CHAT_HISTORY`.

You need to store `signedSession`, if sign in succeeded, to `LocalSessionStorage`, which is a simple class that reads from and writes to `window.localStorage`, with a constant key `session`. (Hopefully you won't find a key conflict.)

Once it's saved, any furture call of `client.fetchAuthed()` will read the signed session string from `LocalSessionStorage`, and auto-populate `signedSession` field in an authed request, e.g., `GetChatHistoryRequest`.

An authed service/request is defined simply as a request containing a `signedSession` field, which is the case for `GetChatHistoryRequest`. If you look at `service.ts`, you can see `GET_CHAT_HISTORY` is an `AuthedServiceDescriptor` whereas `SIGN_IN` is an `UnauthedServiceDescriptor`.

## Authed service handler

Let's start implementing `AuthedServiceHandler` from [@selfage/service_handler](https://www.npmjs.com/package/@selfage/service_handler).

Create a file `get_chat_history_handler.ts` under the directory `server`.

```TypeScript
import {
  GET_CHAT_HISTORY,
  GetChatHistoryRequest,
  GetChatHistoryResponse,
} from "../service";
import { USER_SESSION, UserSession } from "../session";
import { AuthedServiceHandler } from "@selfage/service_handler";

export class GetChatHistoryHandler
  implements
    AuthedServiceHandler<
      GetChatHistoryRequest,
      GetChatHistoryResponse,
      UserSession
    >
{
  public sessionDescriptor = USER_SESSION;
  public serviceDescriptor = GET_CHAT_HISTORY;

  public async handle(
    logContext: string,
    request: GetChatHistoryRequest,
    session: UserSession
  ): Promise<GetChatHistoryResponse> {
    console.log(
      `${logContext}Handling GetChatHistory for the user ${session.userId} and the channel ${request.channelId}`
    );
    return {
      chatEntries: [
        {
          content: "something",
          timestamp: 1234567,
        },
      ],
    };
  }
}
```

`sessionDescriptor` is now required in addition to `serviceDescriptor` and `handle()`.

Note that `handle()` has a third argument `session`. It's critical for your sign in request to share the same session definition with authenticated requests. `session` now contains the user id you have stored in the signed session returned in `SignInResponse`.
