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

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { withdrawalPortfolio } from "../server-actions";

const PortfolioWithdrawalAction = ({ username, pid }) => {
  const router = useRouter();

  const withdrawAction = async (data) => {
    const amount = data.get("amount");
    const success = await withdrawalPortfolio(amount, username, pid);

    if (!success) window.alert("Failed to withdraw");
    else router.refresh();
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Wtihdrawal</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form action={withdrawAction}>
            <DialogHeader>
              <DialogTitle>Withdrawal Money</DialogTitle>
              <DialogDescription>
                Choose account to wtihdraw to
              </DialogDescription>
            </DialogHeader>

            <div className="grid g ap-2 my-2">
              <div className="flex items-center">
                <Label htmlFor="amount">Amount</Label>
              </div>
              <Input id="amount" type="number" name="amount" required />
            </div>

            <DialogFooter>
              <Button type="submit">Withdraw</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortfolioWithdrawalAction;
