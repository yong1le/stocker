"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { createPortfolio } from "../server-actions";

const NewPortfolio = ({ username }) => {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSendRequest = async () => {
    try {
      const success = await createPortfolio(username, name);
      if (success) {
        setName("");
        router.refresh();
      }
    } catch (error) {
      console.log("An error occurred");
    }
  };
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button>New Portfolio</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Portfolio</DialogTitle>
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

export default NewPortfolio;
