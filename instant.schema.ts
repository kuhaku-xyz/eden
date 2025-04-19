// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const schema = i.schema({
  entities: {
    // $files: i.entity({
    //   path: i.string().unique().indexed(),
    //   url: i.any(),
    // }),
    // $users: i.entity({
    //   email: i.string().unique().indexed(),
    // }),
    rooms: i.entity({
      name: i.string().unique().indexed(),
      createdAt: i.number().indexed(),
    }),
    messages: i.entity({
      roomId: i.string().indexed(),
      text: i.string(),
      sender: i.string(),
      senderId: i.string().indexed(),
      createdAt: i.number().indexed(),
    }),
    users: i.entity({
      address: i.string().unique().indexed(),
      owner: i.string().indexed(),
      username: i.string().indexed(),
    }),
  },
  links: {
    roomMessages: {
      forward: { on: "messages", has: "one", label: "room" },
      reverse: { on: "rooms", has: "many", label: "messages" },
    },
  },
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof schema;
interface AppSchema extends _AppSchema { }
const appSchema: AppSchema = schema;

export type { AppSchema };
export default appSchema;
