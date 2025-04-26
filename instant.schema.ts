// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const schema = i.schema({
  entities: {
    servers: i.entity({
      address: i.string().unique().indexed(),
      name: i.string().indexed(),
      icon: i.string().optional(),
      createdAt: i.number().indexed(),
      owner: i.string().indexed(),
    }),
    channels: i.entity({
      name: i.string().indexed(),
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
    serverMembers: i.entity({
      userId: i.string().indexed(),
      serverId: i.string().indexed(),
      joinedAt: i.number().indexed(),
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
    userServers: {
      forward: { on: "serverMembers", has: "one", label: "user" },
      reverse: { on: "users", has: "many", label: "serverMemberships" },
    },
    serverMembers: {
      forward: { on: "serverMembers", has: "one", label: "server" },
      reverse: { on: "servers", has: "many", label: "members" },
    },
  },
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof schema;
interface AppSchema extends _AppSchema { }
const appSchema: AppSchema = schema;

export type { AppSchema };
export default appSchema;
