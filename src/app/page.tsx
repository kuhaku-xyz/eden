import Chat from "@/components/chat";
import WelcomeScreen from "@/components/welcome-screen";
import { getLensClient } from "@/lib/lens/client";
import { Account } from "@lens-protocol/client";
import { fetchAccount } from "@lens-protocol/client/actions";

export default async function Home() {
  const client = await getLensClient();
  const authenticatedUser = client.isSessionClient() ? client.getAuthenticatedUser().unwrapOr(null) : null;
  const account = authenticatedUser ? await fetchAccount(client, {
    address: authenticatedUser.address,
  }).unwrapOr(null) : null;

  if (!account) {
    return (
      <WelcomeScreen />
    );
  }

  return (
    <Chat account={account} />
  );
}
