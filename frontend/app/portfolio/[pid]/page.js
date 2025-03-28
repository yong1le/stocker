import React from "react";
import { getUserServer } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import PortfolioBuyAction from "./_components/buy";

const PortfolioView = async ({ params }) => {
  const pid = (await params).pid;
  const user = await getUserServer();
  if (!user) redirect("/login");

  const getPortfolioInfo = async (username, pid) => {
    const res = await fetch(
      `http://localhost:8080/portfolio/view/one/${username}/${pid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      window.alert(`Failed to get portfolio ${pid}`);
      return null;
    }

    const json = await res.json();
    if (Object.keys(json).length === 0) return null;
    return json;
  };

  const getStocks = async () => {
    const res = await fetch("http://localhost:8080/stock/all", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) return [];

    return await res.json();
  };

  const portfolio = await getPortfolioInfo(user, pid);
  const stocks = await getStocks();

  return (
    <div className="m-5 flex flex-row gap-5">
      <Card className="p-4 flex-2">
        {portfolio !== null && (
          <div className="flex flex-col gap-3">
            <CardTitle className="text-4xl">
              {portfolio.name} - ${Number(portfolio.value).toFixed(2)}
            </CardTitle>
            <div>
              <p>Cash: ${Number(portfolio.amount).toFixed(2)}</p>
            </div>

            <div className="flex flex-col gap-2">
              {portfolio.stocks &&
                portfolio.stocks.map((e, i) => (
                  <Card
                    className="flex flex-row gap-2 items-start justify-between p-4"
                    key={i}
                  >
                    <CardTitle>{e.symbol}</CardTitle>
                    <div className="flex flex-col gap-2">
                      <p>Shares: {e.share}</p>
                      <p>Total value: {Number(e.value).toFixed(2)}</p>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </Card>
      <Card className="p-4">
        <PortfolioBuyAction username={user} pid={pid} stocks={stocks}/>
      </Card>
    </div>
  );
};

export default PortfolioView;
