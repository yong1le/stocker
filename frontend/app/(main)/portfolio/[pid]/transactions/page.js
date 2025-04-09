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
import { getUserServer } from "@/lib/auth-server";
import Link from "next/link";
import React from "react";

const TransactionsPage = async ({ params }) => {
  const pid = (await params).pid;
  const user = await getUserServer();
  if (!user) redirect("/login");

  const getTransactions = async (username, pid) => {
    const res = await fetch(
      `http://localhost:8080/portfolio/transactions/${username}/${pid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      window.alert(`Failed to get transactions for ${pid}`);
      return [];
    }

    const json = await res.json();
    return json;
  };

  const transactions = await getTransactions(user, pid);
  return (
    <div>
      <Table>
        <TableCaption className="flex">
          <Link href={`/portfolio/${pid}`}>
            <Button className="hover:cursor-pointer  ">Back</Button>
          </Link>
        </TableCaption>
        <TableHeader className="bg-stone-100">
          <TableRow>
            <TableHead className="w-[100px]">Transaction Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>From/to</TableHead>
            <TableHead>Stock Symbol</TableHead>
            <TableHead>Stock Shares</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions &&
            transactions.map((e, i) => (
              <TableRow key={i}>
                <TableCell>{e.transaction_type.toUpperCase()}</TableCell>
                <TableCell>{Number(e.amount).toFixed(2)}</TableCell>
                <TableCell>
                  {e.transaction_type === "bank" ? (
                    <p>
                      <b>{e.amount > 0 ? "From" : "To"}</b> Bank
                    </p>
                  ) : e.transaction_type === "transfer" ? (
                    <p>
                      <b>{e.amount > 0 ? "From " : "To "}</b>
                      <Link
                        href={`/portfolio/${e.other_pid}`}
                        className="underline"
                      >
                        {e.other_portfolio}
                      </Link>
                    </p>
                  ) : (
                    <p>N/A</p>
                  )}
                </TableCell>
                <TableCell>
                  {e.transaction_type === "stock" ? (
                    <Link
                      href={`/stock/${e.stock_symbol}`}
                      className="underline"
                    >
                      {e.stock_symbol}
                    </Link>
                  ) : (
                    <p>N/A</p>
                  )}
                </TableCell>
                <TableCell>
                  {e.transaction_type === "stock" ? (
                    <p>
                      {e.amount > 0 && "-"}
                      {e.stock_shares}
                    </p>
                  ) : (
                    <p>N/A</p>
                  )}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionsPage;
