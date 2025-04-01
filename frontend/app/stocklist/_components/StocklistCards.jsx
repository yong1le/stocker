"use client";
import React from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const StocklistCard = ({ folder, onRemove }) => {
  const name = folder.name;
  const slid = folder.slid;
  return (
    <Card className="p-2 flex flex-row justify-between">
      <CardTitle className="text-3xl">
        <Link href={`/stocklist/${slid}`}>{name}</Link>
      </CardTitle>
      <div className="space-x-2">
        <Button>Share</Button>
        <Button>Review</Button>
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
