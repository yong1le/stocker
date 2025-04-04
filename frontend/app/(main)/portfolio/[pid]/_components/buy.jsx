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
import { buyStock } from "../server-actions";
import { useRouter } from "next/navigation";
import { DialogClose } from "@radix-ui/react-dialog";

const PortfolioBuyAction = ({ username, pid, stocks }) => {
  const router = useRouter();
  const [selectedStock, setSelectedStock] = useState(null);

  const buyStockAction = async (data) => {
    const shares = data.get("shares");

    const success = await buyStock(selectedStock, shares, username, pid);

    if (!success) window.alert("Failed to buy stocks");
    else router.refresh();
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Buy</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form action={buyStockAction}>
            <DialogHeader>
              <DialogTitle>Buy Stocks</DialogTitle>
              <DialogDescription>Choose a stock to buy</DialogDescription>
            </DialogHeader>

            <Select onValueChange={setSelectedStock}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select stock" />
              </SelectTrigger>
              <SelectContent>
                {stocks.map((e) => (
                  <SelectItem key={e.symbol} value={e.symbol}>
                    {e.symbol} - ${e.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid gap-2 my-2">
              <div className="flex items-center">
                <Label htmlFor="shares">Shares</Label>
              </div>
              <Input id="shares" type="number" name="shares" required min={1} />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="submit">Buy</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortfolioBuyAction;
