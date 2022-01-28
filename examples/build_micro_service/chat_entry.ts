import { MessageDescriptor, PrimitiveType } from '@selfage/message/descriptor';

export interface ChatEntry {
  content?: string,
/* in seconds */
  timestamp?: number,
}

export let CHAT_ENTRY: MessageDescriptor<ChatEntry> = {
  name: 'ChatEntry',
  factoryFn: () => {
    return new Object();
  },
  fields: [
    {
      name: 'content',
      primitiveType: PrimitiveType.STRING,
    },
    {
      name: 'timestamp',
      primitiveType: PrimitiveType.NUMBER,
    },
  ]
};
