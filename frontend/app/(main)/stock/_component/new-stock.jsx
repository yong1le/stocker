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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { DialogClose } from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { createStockRecord } from "../server-actions";
const shortFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "short",
});

const NewStockAction = ({ stocks }) => {
  const router = useRouter();
  const [selectedStock, setSelectedStock] = useState(null);
  const [date, setDate] = useState();

  const newStockAction = async (data) => {
    const open = data.get("open");
    const high = data.get("high");
    const low = data.get("low");
    const close = data.get("close");
    const volume = data.get("volume");

    const success = await createStockRecord(
      date,
      selectedStock,
      open,
      high,
      low,
      close,
      volume
    );

    if (!success) window.alert("Failed to create stock record");
    else router.refresh();
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">Enter New Stock</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form action={newStockAction}>
            <DialogHeader>
              <DialogTitle>Enter New Stock</DialogTitle>
              <DialogDescription>
                Enter information for new stock record
              </DialogDescription>
            </DialogHeader>

            <div className="my-4">
              <Select onValueChange={setSelectedStock}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select stock" />
                </SelectTrigger>
                <SelectContent>
                  {stocks.map((e) => (
                    <SelectItem key={e.symbol} value={e.symbol}>
                      {e.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon />
                  {date ? shortFormat.format(date) : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="grid gap-2 my-2">
              <div className="grid gap-2 my-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="open">Open</Label>
                </div>
                <Input id="open" type="number" name="open" required min={0} />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="high">High</Label>
              </div>
              <Input id="high" type="number" name="high" required min={0} />
            </div>
            <div className="grid gap-2 my-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="low">Low</Label>
              </div>
              <Input id="low" type="number" name="low" required min={0} />
            </div>
            <div className="grid gap-2 my-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="close">Close</Label>
              </div>
              <Input id="close" type="number" name="close" required min={0} />
            </div>
            <div className="grid gap-2 my-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="volume">Volume</Label>
              </div>
              <Input id="volume" type="number" name="volume" required min={0} />
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

export default NewStockAction;
