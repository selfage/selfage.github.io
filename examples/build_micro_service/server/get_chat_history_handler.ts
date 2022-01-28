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
