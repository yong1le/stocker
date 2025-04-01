import React from "react";

import { getUserServer } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import StocklistCard from "./_components/StocklistCards";
import { fetchStocklists } from "./server-action";

const StockListPage = async () => {
  const user = await getUserServer();
  if (!user) redirect("/login");

  const getStockList = async (username) => {
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

  const stocklists = await getStockList(user);

  return (
    <div className="flex flex-col gap-2 m-2  ">
      <h1>StockLists</h1>
      {stocklists &&
        stocklists.map((e, i) => (
        <StocklistCard key={i}  folder={e}/>

          // <Card key={i} className="p-2">
          //   <CardTitle className="text-3xl">
          //     <Link href={`/stocklist/${e.slid}`}>
          //       {e.name} - {user}
          //     </Link>
          //   </CardTitle>
          // </Card>
        ))}
    </div>
  );
};

export default StockListPage;
