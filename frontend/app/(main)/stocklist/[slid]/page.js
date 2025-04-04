import React from "react";
import { getUserServer } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import StocklistAddAction from "./_components/add";
import ReviewList from "./_components/ReviewList";
import StockHoldingList from "@/components/StockHoldingList";
import CorrelationMatrix from "@/components/correlation";

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
  console.log(stocklist);

  return (
    <div className="m-5 flex flex-col gap-5">
      <Card className="p-4 flex-2">
        {stocklist !== null && (
          <div className="flex flex-col gap-3">
            <CardTitle className="text-4xl">
              <div className="flex justify-between">

                {stocklist.name}
                {/* - ${Number(stocklist.value).toFixed(2)} */}
                {user === stocklist.username ? (
                  <StocklistAddAction username={user} slid={slid} stocks={stocks} />
                ) : (<></>)
                }
              </div>
            </CardTitle>

            <CorrelationMatrix username={user} pid={slid} />

            <div className="flex flex-col gap-2">
              <StockHoldingList stocks={stocklist.stocks} />
            </div>
          </div>
        )}
      </Card>
      <ReviewList username={user} slid={slid} />
    </div>
  );
};

export default StocklistView;
