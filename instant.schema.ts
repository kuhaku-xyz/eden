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
    servers: i.entity({
      address: i.string().unique().indexed(),
      name: i.string().indexed(),
      icon: i.string().optional(), // URL or identifier for the server icon
      createdAt: i.number().indexed(),
      owner: i.string().indexed(),
    }),
    channels: i.entity({
      name: i.string().unique().indexed(),
      serverId: i.string().indexed(),
      createdAt: i.number().indexed(),
    }),
    messages: i.entity({
      channelId: i.string().indexed(),
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
    serverChannels: {
      forward: { on: "channels", has: "one", label: "server" },
      reverse: { on: "servers", has: "many", label: "channels" },
    },
    channelMessages: {
      forward: { on: "messages", has: "one", label: "channel" },
      reverse: { on: "channels", has: "many", label: "messages" },
    },
  },
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof schema;
interface AppSchema extends _AppSchema { }
const appSchema: AppSchema = schema;

export type { AppSchema };
export default appSchema;
