"use client";
import React from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ShareList from "./ShareList";

const StocklistCard = ({ user, folder, onRemove }) => {
  const name = folder.name;
  const slid = folder.slid;
  const visibility = folder.visibility;
  const username = folder.username;
  return (
    <Card className="p-2 flex flex-row justify-between">
      <CardTitle className="text-3xl">
        <Link href={`/stocklist/${slid}`}>
          {name}
          <p> status {visibility}</p>
        </Link>
      </CardTitle>
      <div className="space-x-2">
        {username === user && visibility !== "public" ? (
          <ShareList username={user} slid={slid} />
        ) : (
          <> </>
        )}
        <Button
          variant="destructive"
          size="sm"
          // onClick={onRemove}
        >
          Remove
        </Button>
      </div>
    </Card>
  );
};

export default StocklistCard;
