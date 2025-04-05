import React from "react";
import { getUserServer } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import PortfolioBuyAction from "./_components/buy";
import PortfolioDepositAction from "./_components/deposit";
import PortfolioWithdrawalAction from "./_components/withdrawal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PortfolioSellAction from "./_components/sell";
import CorrelationMatrix from "@/components/correlation";
import StockHoldingList from "@/components/StockHoldingList";

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
  const portfolios = await getPortfolios(user);

  return (
    <div className="m-5">
      <Card className="p-4 flex flex-row gap-5 justify-between">
        <div className="w-7/8">
          {portfolio && (
            <div className="flex flex-col gap-3">
              <CardTitle className="text-4xl">
                {portfolio.name} - ${Number(portfolio.value).toFixed(2)}
              </CardTitle>
              <div>
                <p>Cash: ${Number(portfolio.amount).toFixed(2)}</p>
              </div>

              <CorrelationMatrix username={user} pid={pid} type={"Portfolio"}/>

              <div className="flex flex-col gap-2">
                <StockHoldingList stocks={portfolio.stocks}/>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 ">
          <Link href={`/portfolio/${pid}/transactions`}>
            <Button className="w-full">Transactions</Button>
          </Link>
          <PortfolioBuyAction username={user} pid={pid} stocks={stocks} />
          <PortfolioSellAction
            username={user}
            pid={pid}
            stocks={portfolio ? portfolio.stocks : [] || []}
          />
          <PortfolioDepositAction
            username={user}
            pid={pid}
            portfolios={portfolios}
          />
          <PortfolioWithdrawalAction
            username={user}
            pid={pid}
            portfolios={portfolios}
          />
        </div>
      </Card>
    </div>
  );
};

export default PortfolioView;
