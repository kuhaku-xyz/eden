import WelcomeScreen from "@/components/welcome-screen";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount } from "@lens-protocol/client/actions";
import { redirect } from "next/navigation";

export default async function Home() {
  const client = await getLensClient();
  const authenticatedUser = client.isSessionClient() ? client.getAuthenticatedUser().unwrapOr(null) : null;
  const account = authenticatedUser ? await fetchAccount(client, {
    address: authenticatedUser.address,
  }).unwrapOr(null) : null;

    return (
      <WelcomeScreen />
    );

}
