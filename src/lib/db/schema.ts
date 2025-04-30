import { CoMap, co, CoFeed, Account, CoList, ImageDefinition } from "jazz-tools";

export class User extends Account {
  name = co.string;
  username = co.string;
  picture = co.optional.string;
}

export class Message extends CoMap {
  text = co.string;
  image = co.optional.ref(ImageDefinition);
}

export class Chat extends CoList.Of(co.ref(Message)) {}