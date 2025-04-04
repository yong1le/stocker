import { getUserServer } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check if the user is logged in
  const user = await getUserServer();
  if (!user) {
    redirect("/login");
  }
  else {
    redirect("/portfolio")
  }

  return <></>;
}
