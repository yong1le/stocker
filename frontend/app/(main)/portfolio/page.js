import React from "react";

import { getUserServer } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import NewPortfolio from "./_components/new-portfolio";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PortfolioListPage = async () => {
  const user = await getUserServer();
  if (!user) redirect("/login");

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

  const portfolios = await getPortfolios(user);

  return (
    <div className="flex flex-col gap-2 m-2 items-start">
      <Table>
        <TableCaption>
          <NewPortfolio username={user} />
        </TableCaption>
        <TableHeader className="bg-stone-100">
          <TableRow>
            <TableHead className="w-[100px]">Portfolio</TableHead>
            <TableHead className="text-right">Cash</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {portfolios &&
            portfolios.map((e) => (
              <TableRow key={e.name}>
                <TableCell className="font-medium">
                  <Link href={`/portfolio/${e.pid}`}>{e.name}</Link>
                </TableCell>
                <TableCell className="text-right">{e.amount}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PortfolioListPage;
