import { CoMap, co, CoFeed, Account, CoList, ImageDefinition, Profile, Group } from "jazz-tools";
import { getLensClient } from "../lens/lens-client";
import { fetchAccount } from "@lens-protocol/client/actions";

export class BoxProfile extends Profile {
  name = co.string;
  address = co.string;
  picture = co.optional.string;
}

/** Per-user private `CoMap` */
export class AccountRoot extends CoMap {
}

export class BoxAccount extends Account {
  profile = co.ref(BoxProfile);
  root = co.ref(AccountRoot);

  /**
   *  The account migration is run on account creation and on every log-in.
   *  You can use it to set up the account root and any other initial CoValues you need.
   */
  async migrate() {
    const username = this.profile?.name;
    if (!username) {
      console.error("No username found for account", this.id);
      return;
    }

    const client = await getLensClient();
    const account = await fetchAccount(client, {
      username: {
        localName: username,
      }
    }).unwrapOr(null);

    if (!account?.username?.localName) {
      console.error("No account found for username", username);
      return;
    }

    const group = Group.create();
    group.addMember("everyone", "reader");

    const profile = BoxProfile.create({
      name: username,
      address: account.address,
      picture: account.metadata?.picture,
    }, group);

    this.profile = profile;
  }
}

export class Message extends CoMap {
  text = co.string;
  image = co.optional.ref(ImageDefinition);
}

export class Chat extends CoList.Of(co.ref(Message)) { }

declare module "jazz-react" {
  interface Register {
    Account: BoxAccount;
  }
}