"use client";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DialogFooter,
  DialogHeader,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sellStock } from "../server-actions";
import { useRouter } from "next/navigation";
import { DialogClose } from "@radix-ui/react-dialog";

const PortfolioSellAction = ({ username, pid, stocks }) => {
  const router = useRouter();
  const [selectedStock, setSelectedStock] = useState(null);

  const sellStockAction = async (data) => {
    const shares = data.get("shares");

    const success = await sellStock(selectedStock, shares, username, pid);

    if (!success) window.alert("Failed to sell stocks");
    else router.refresh();
  };


  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">Sell</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form action={sellStockAction}>
            <DialogHeader>
              <DialogTitle>Sell Stocks</DialogTitle>
              <DialogDescription>Choose a stock to sell</DialogDescription>
            </DialogHeader>

            <Select onValueChange={setSelectedStock}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select stock" />
              </SelectTrigger>
              <SelectContent>
                {stocks.map((e) => (
                  <SelectItem key={e.symbol} value={e.symbol}>
                    {e.symbol} - ${e.close} - {e.share} shares
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid gap-2 my-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="shares">Shares</Label>
              </div>
              <Input id="shares" type="number" name="shares" required min={1} />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="submit">Sell</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortfolioSellAction;
