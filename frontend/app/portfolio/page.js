import React from "react";

import { getUserServer } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";

const PortfolioListPage = async () => {
  const user = await getUserServer();
  if (!user) redirect("/login");

  const getPortfolios = async (username) => {
    const res = await fetch(
      `http://localhost:8080/portfolio/view/all/${username}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      window.alert("Failed to get portfolios");
      return [];
    }

    return await res.json();
  };

  const portfolios = await getPortfolios(user);

  return (
    <div className="flex flex-col gap-2">
      {portfolios && portfolios.map((e) => (
        <Link key={e.name} href={`/portfolio/${e.pid}`}>
          {e.name}
        </Link>
      ))}
    </div>
  );
};

export default PortfolioListPage;
