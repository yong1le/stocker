import { Button } from "@/components/ui/button";
import { getUserServer, logoutUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check if the user is logged in
  const user = await getUserServer();
  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      Hello, {user.name}
      <Button onClick={logoutUser}>Logout</Button>
    </div>
  );
}
