import React from "react";
import { getUserServer } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import stocklistBuyAction from "./_components/buy";
import stocklistDepositAction from "./_components/deposit";
import stocklistWithdrawalAction from "./_components/withdrawal";

const StocklistView = async ({ params }) => {
  const slid = (await params).slid;
  const user = await getUserServer();
  if (!user) redirect("/login");

  const getStocklistInfo = async (username, slid) => {
    const res = await fetch(
      `http://localhost:8080/stocklist/view/one/${username}/${slid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      window.alert(`Failed to get stocklist ${slid}`);
      return null;
    }

    const json = await res.json();
    if (Object.keys(json).length === 0) return null;
    return json;
  };

  const getStocklists = async (username) => {
    const res = await fetch(
      `http://localhost:8080/stocklist/view/all/${username}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      window.alert("Failed to get stocklists");
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

  const stocklist = await getStocklistInfo(user, slid);
  const stocks = await getStocks();
  const stocklists = await getStocklists(user);

  return (
    <div className="m-5 flex flex-row gap-5">
      <Card className="p-4 flex-2">
        {stocklist !== null && (
          <div className="flex flex-col gap-3">
            <CardTitle className="text-4xl">
              {stocklist.name} - ${Number(stocklist.value).toFixed(2)}
            </CardTitle>
            <div>
              <p>Cash: ${Number(stocklist.amount).toFixed(2)}</p>
            </div>

            <div className="flex flex-col gap-2">
              {stocklist.stocks &&
                stocklist.stocks.map((e, i) => (
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
        {/* <stocklistBuyAction username={user} slid={slid} stocks={stocks} />
        <stocklistDepositAction
          username={user}
          slid={slid}
          stocklists={stocklists}
        />
        <stocklistWithdrawalAction
          username={user}
          slid={slid}
          stocklists={stocklists}
        /> */}
      </Card>
    </div>
  );
};

export default StocklistView;
