"use client";
import React, {useState} from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { sendrequest } from "../server-actions";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const addFriend = ({ username, refetchFriendList }) => {
  const router = useRouter();

  const [friendUsername, setFriendUsername] = useState("");

  const handleSendRequest = async () => {
    if (!friendUsername) return;
    await sendrequest(username, friendUsername);
    setFriendUsername(""); 
    refetchFriendList();
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add Friend</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle> Add new friend</DialogTitle>
          <DialogDescription>Enter username to add</DialogDescription>
          <Input
            placeholder="Username"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
          />
          <DialogClose asChild>
            <Button type="button" onClick={() => handleSendRequest(username )}>
              Add
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default addFriend;
