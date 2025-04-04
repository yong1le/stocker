"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { newStocklist } from "../server-actions";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const NewStocklist = ({ username }) => {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSendRequest = async () => {
    try {
      const success = await newStocklist(username, name);
      if (success) {
        setName("");
        router.refresh();
      }
    } catch (error) {
      console.log("An error occurred");
    }
  };
  return (
    <div className="flex flex-row justify-end">
      <Dialog>
        <DialogTrigger asChild>
          <Button>New Stocklist</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Stocklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Stocklist Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>

              <DialogClose asChild>
                <Button
                  type="button"
                  onClick={handleSendRequest}
                  disabled={!name}
                >
                  Create
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewStocklist;
