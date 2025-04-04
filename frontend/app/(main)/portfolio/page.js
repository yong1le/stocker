import React from "react";

import { getUserServer } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import NewPortfolio from "./_components/new-portfolio";

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
    <div className="flex flex-col gap-2 m-2 items-start">
      <h1>Portfolios</h1>
      <NewPortfolio username={user} />
      {portfolios &&
        portfolios.map((e) => (
          <Card key={e.name} className="p-2">
            <CardTitle className="text-3xl">
              <Link href={`/portfolio/${e.pid}`}>
                {e.name} - ${Number(e.amount).toFixed(2)}
              </Link>
            </CardTitle>
          </Card>
        ))}
    </div>
  );
};

export default PortfolioListPage;
