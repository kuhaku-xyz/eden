import { CoMap, co, CoFeed, Account, CoList, ImageDefinition, Profile } from "jazz-tools";
import { getLensClient } from "../lens/client";
import { fetchAccount } from "@lens-protocol/client/actions";

/** Per-user private `CoMap` */
export class AccountRoot extends CoMap {
  username = co.string;
  address = co.string;
  picture = co.optional.string;
  name = co.optional.string;
}

export class BoxAccount extends Account {
  profile = co.ref(Profile);
  root = co.ref(AccountRoot);

  /**
   *  The account migration is run on account creation and on every log-in.
   *  You can use it to set up the account root and any other initial CoValues you need.
   */
  async migrate() {
    if (this.root === undefined) {
      const username = this.profile?.name;
      if (!username) {
        return;
      }

      const client = await getLensClient();
      const account = await fetchAccount(client, {
        username: {
          localName: username,
        }
      }).unwrapOr(null);

      if (!account?.username?.localName) {
        return;
      }

      const root = AccountRoot.create({
        username: username,
        address: account.address,
        name: account.metadata?.name,
        picture: account.metadata?.picture,
      });
      console.log("root", root);

      this.root = root;
    }
  }
}

export class Message extends CoMap {
  text = co.string;
  image = co.optional.ref(ImageDefinition);
}

export class Chat extends CoList.Of(co.ref(Message)) { }