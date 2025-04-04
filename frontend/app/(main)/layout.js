import React from "react";
import Link from "next/link";
import { getUserServer, logoutUser } from "@/lib/auth-server";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";


const MainLayout = async ({ children }) => {
    const user = await getUserServer();
    if (!user) {
      redirect("/login");
    }

  const linkStyle = "font-semibold hover:underline"
  return (
    <div className="w-full">
      <div className="p-4 border-b flex flex-row items-center justify-between">
        <div className="flex flex-row items-end gap-4">
          <h1 className="text-3xl font-bold">Stocker</h1>
          <Link href="/portfolio" className={linkStyle}>
            Portfolios
          </Link>
          <Link href="/stocklist" className={linkStyle}>
            Stock Lists
          </Link>
          <Link href="/friend" className={linkStyle}>
            Friends
          </Link>
          <Link href="/stock" className={linkStyle}>
            Stocks
          </Link>
        </div>
        <div className="flex flex-row gap-4 items-center">
          {user}
          <Button className="hover:cursor-pointer" onClick={logoutUser}>
            Logout
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
};

export default MainLayout;
