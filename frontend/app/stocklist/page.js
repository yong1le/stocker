import React from "react";

import { getUserServer } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import StocklistCard from "./_components/StocklistCards";
import { fetchStocklists } from "./server-actions";
import NewStocklist from "./_components/NewStocklist";

const StockListPage = async () => {
  const user = await getUserServer();
  if (!user) redirect("/login");

  const stocklists = await fetchStocklists(user);
  return (
    <div className="flex flex-col gap-2 m-2  ">
      <h1>StockLists</h1>
      <NewStocklist username={user}/>
      {stocklists &&
        stocklists.map((stocklist, i) => (
        <StocklistCard key={i} user={user} folder={stocklist}/>
        ))}
    </div>
  );
};

export default StockListPage;
