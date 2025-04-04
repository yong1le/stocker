import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import React from "react";
import NewStockAction from "./_component/new-stock";

const StocksPage = async () => {
  const getStocks = async () => {
    const res = await fetch("http://localhost:8080/stock/all", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) return [];

    return await res.json();
  };
  const stocks = await getStocks();

  return (
    <div className="p-4 flex flex-col gap-4">
      <NewStockAction stocks={stocks}/>
      <Table>
        <TableCaption>A List of your stocks</TableCaption>
        <TableHeader className="bg-stone-100">
          <TableRow>
            <TableHead className="w-[100px]">Symbol</TableHead>
            <TableHead className="text-right">Total Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks &&
            stocks.map((e) => (
              <TableRow key={e.symbol}>
                <TableCell className="font-medium">
                  <Link href={`/stock/${e.symbol}`}>{e.symbol}</Link>
                </TableCell>
                <TableCell className="text-right">${e.value}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StocksPage;
