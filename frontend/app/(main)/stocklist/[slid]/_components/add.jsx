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
import { addStock } from "../../server-actions";
import { useRouter } from "next/navigation";

const StocklistAddAction = ({ username, slid, stocks }) => {

  const router = useRouter();
  const [selectedStock, setSelectedStock] = useState(null);

  const addStockAction = async (data) => {
    const shares = data.get("shares");

    const success = await addStock(username, slid, selectedStock, shares);

    if (!success) window.alert("Failed to add stocks");
    else router.refresh();
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form action={addStockAction}>
            <DialogHeader>
              <DialogTitle>Add Stocks</DialogTitle>
              <DialogDescription>Choose a stock to add</DialogDescription>
            </DialogHeader>

            <Select onValueChange={setSelectedStock}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select stock" />
              </SelectTrigger>
              <SelectContent>
                  {stocks.map((e) => (
                    <SelectItem key={e.symbol} value={e.symbol}>
                      {e.symbol} - {e.value}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <div className="grid gap-2 my-2">
              <div className="flex items-center">
                <Label htmlFor="shares">Shares</Label>
              </div>
              <Input id="shares" type="number" name="shares" required />
            </div>

            <DialogFooter>
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StocklistAddAction;
