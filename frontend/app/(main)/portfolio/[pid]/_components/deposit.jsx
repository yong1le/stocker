"use client";

import React, { useState } from "react";
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
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { depositPortfolio } from "../server-actions";
import { DialogClose } from "@radix-ui/react-dialog";

const PortfolioDepositAction = ({ username, pid, portfolios }) => {
  const router = useRouter();
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);

  const depositAction = async (data) => {
    const amount = data.get("amount");
    const success = await depositPortfolio(amount, username, pid, selectedPortfolio);

    if (!success) window.alert("Failed to deposit");
    else router.refresh();
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">Deposit</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form action={depositAction}>
            <DialogHeader>
              <DialogTitle>Deposit Money</DialogTitle>
              <DialogDescription>
                Choose account to deposit from
              </DialogDescription>
            </DialogHeader>

            <Select onValueChange={setSelectedPortfolio}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key={`portfolio-bank`} value={"bank"}>
                  Bank Account
                </SelectItem>
                {portfolios
                  .filter((e) => e.pid != pid)
                  .map((e) => (
                    <SelectItem
                      key={`portfolio-${e.pid}`}
                      value={e.pid.toString()}
                    >
                      {e.name} - {e.amount}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <div className="grid gap-2 my-2">
              <div className="flex items-center">
                <Label htmlFor="amount">Amount</Label>
              </div>
              <Input id="amount" type="number" name="amount" required min={1} />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="submit">Deposit</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortfolioDepositAction;
