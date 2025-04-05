"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { friendList, shareStocklist, sharedAlready } from "../server-actions";
import { useRouter } from "next/navigation";

const ShareList = ({ username, slid, owner }) => {
  const router = useRouter();

  const [friends, setFriends] = useState([]);
  const [already, setAlready] = useState([]);
  const loadFriends = async () => {
    if (!username) return;

    try {
      const friends = await friendList(username);
      const already = await sharedAlready(username, slid);
      setFriends(friends);
      setAlready(already);
    } catch (error) {
      console.error("Failed to load friends:", error);
    }
  };

  useEffect(() => {
    if (username) {
      loadFriends();
    }
  }, [username]);

  const handleAction = async (username, friend, slid) => {
    const success = await shareStocklist(username, friend, slid);
    if (success) {
      router.refresh();
    }
  };

  return (
    <>
    {username === owner && (
      <Dialog onOpenChange={(open) => open}>
        <DialogTrigger asChild>
          <Button>share</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share List</DialogTitle>
            <DialogDescription>Pick Friend to share with</DialogDescription>
          </DialogHeader>

          <div className="max-h-[300px] overflow-y-auto">
            {friends && friends.length > 0 ? (
              <div className="space-y-2">
                {friends.map((friend, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <span className="font-medium">{friend}</span>
                    <div className="flex gap-2">
                      {already && !already.includes(friend) ? (
                        <DialogClose asChild>
                          <Button
                            onClick={() => handleAction(username, friend, slid)}
                          >
                            Share
                          </Button>
                        </DialogClose>
                      ) : (
                        <p>Already Shared!</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No friend </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
};

export default ShareList;
