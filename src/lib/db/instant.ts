import { id, init, InstaQLEntity } from "@instantdb/react";
import schema from "../../../instant.schema";

const APP_ID = process.env.NEXT_PUBLIC_INSTANTDB_APP_ID || "";

export type Server = InstaQLEntity<typeof schema, "servers">;
export type Channel = InstaQLEntity<typeof schema, "channels">;
export type Message = InstaQLEntity<typeof schema, "messages">;

export const db = init({ appId: APP_ID, schema });
export { id }; 