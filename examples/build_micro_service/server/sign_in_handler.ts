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
