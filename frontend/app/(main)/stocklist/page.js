import React from "react";

import { getUserServer } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { fetchStocklists } from "./server-actions";
import NewStocklist from "./_components/NewStocklist";
import RemoveButton from "./_components/RemoveButton";
import ShareList from "./_components/ShareList";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const StockListPage = async () => {
  const user = await getUserServer();
  if (!user) redirect("/login");

  const stocklists = await fetchStocklists(user);
  return (
    <div className="flex flex-col gap-2 m-2  ">
      <Table>
        <TableCaption>
          <NewStocklist username={user} />
        </TableCaption>
        <TableHeader className="bg-stone-100">
          <TableRow>
            <TableHead className="w-full">Stock Lists</TableHead>
            <TableHead className="text-center">Visibility</TableHead>
            <TableHead className="text-center">Share</TableHead>
            <TableHead className="text-center">Remove</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocklists &&
            stocklists.map((e, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">
                  <Link href={`/stocklist/${e.slid}`}>{e.name}</Link>
                </TableCell>
                <TableCell className="font-medium text-center">
                  {e.visibility}
                </TableCell>
                <TableCell >
                  <ShareList username={user} slid={e.slid} owner={e.username}/>
                </TableCell>
                <TableCell>
                  <RemoveButton username={user} slid={e.slid} owner={e.username}/>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StockListPage;
