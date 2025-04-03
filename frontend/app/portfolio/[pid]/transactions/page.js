import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <Link href={`/portfolio/${pid}`}>
        <Button>Back</Button>
      </Link>
      <div className="p-5 flex flex-col gap-4">
        {transactions &&
          transactions.map((e, i) => (
            <Card className="p-2" key={i}>
              <CardTitle>{e.transaction_type.toUpperCase()}</CardTitle>
              <CardContent>
                <p>Amount: {e.amount}</p>
                {e.transaction_type === "bank" && (
                  <p>Transfer {e.amount > 0 ? "from" : "to"} bank</p>
                )}
                {e.transaction_type === "transfer" && (
                  <p>
                    Transfer {e.amount > 0 ? "from " : "to "}
                    <Link
                      href={`/portfolio/${e.other_pid}`}
                      className="underline"
                    >
                      {e.other_portfolio}
                    </Link>
                  </p>
                )}
                {e.transaction_type === "stock" && (
                  <div>
                    <p>
                      Stock:{" "}
                      <Link
                        href={`/stock/${e.stock_symbol}`}
                        className="underline"
                      >
                        {e.stock_symbol}
                      </Link>
                    </p>
                    <p>
                      Shares {e.amount > 0 ? "Sold" : "Bought"}:{" "}
                      {e.stock_shares}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>{new Date(e.time_stamp).toString()}</CardFooter>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default TransactionsPage;
