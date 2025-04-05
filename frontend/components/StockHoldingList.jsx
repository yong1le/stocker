import React from "react";
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

const StockHoldingList = ({ stocks }) => {
  return (
    <Table>
      <TableCaption>A List of stocks</TableCaption>
      <TableHeader className="bg-stone-100">
        <TableRow>
          <TableHead className="w-[100px]">Symbol</TableHead>
          <TableHead>Shares</TableHead>
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
              <TableCell>{e.share}</TableCell>
              <TableCell className="text-right">{Number(e.value).toFixed(2)}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

export default StockHoldingList;
