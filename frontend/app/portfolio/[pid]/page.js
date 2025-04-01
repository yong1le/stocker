import React from "react";
import { getUserServer } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import PortfolioBuyAction from "./_components/buy";
import PortfolioDepositAction from "./_components/deposit";
import PortfolioWithdrawalAction from "./_components/withdrawal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import StockHolding from "@/components/stockholding";
import PortfolioSellAction from "./_components/sell";
import CorrelationMatrix from "./_components/correlation";

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
    <div className="m-5 flex flex-row gap-5">
      <Card className="p-4 flex-2">
        {portfolio && (
          <div className="flex flex-col gap-3">
            <CardTitle className="text-4xl">
              {portfolio.name} - ${Number(portfolio.value).toFixed(2)}
            </CardTitle>
            <div>
              <p>Cash: ${Number(portfolio.amount).toFixed(2)}</p>
            </div>

            <CorrelationMatrix username={user} pid={pid}/>

            <div className="flex flex-col gap-2">
              {portfolio.stocks &&
                portfolio.stocks.map((e, i) => (
                  <StockHolding
                    key={i}
                    symbol={e.symbol}
                    shares={e.share}
                    value={e.value}
                  />
                ))}
            </div>
          </div>
        )}
      </Card>
      <Card className="p-4">
        <Link href={`/portfolio/${pid}/transactions`}>
          <Button>Transactions</Button>
        </Link>
        <PortfolioBuyAction username={user} pid={pid} stocks={stocks} />
        <PortfolioSellAction
          username={user}
          pid={pid}
          stocks={portfolio.stocks}
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
      </Card>
    </div>
  );
};

export default PortfolioView;
