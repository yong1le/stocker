"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {  handleFriendAction } from "../server-actions";

const FriendRequest = ({ username, refetchFriendList, request }) => {
  const [requests, setRequests] = useState([]);
  const getRequests = async () => {
    const data = await request(username);
    if (data) setRequests(data);
  };

  useEffect(() => {

    getRequests();
  }, [username]);

  const handleAction = async (friend, action) => {
    await handleFriendAction(username, friend, action);
    refetchFriendList();
    getRequests();
  };

  console.log("requests", requests);

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Friend Request</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Friend Requests</DialogTitle>
          <DialogDescription>Accept or Reject</DialogDescription>
          <div>
            {requests.length > 0 ? (
              requests.map((request, index) => (
                <div key={index} className="flex justify-around gap-2 p-2 border ">
                  <span>{request}</span>
                  <div className="flex justify-around gap-2 ">
                    <DialogClose asChild>
                      <Button
                        onClick={() =>
                          handleAction( request, "accept")
                        }
                      >
                        Accept
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          handleAction( request, "reject")
                        }
                      >
                        Reject
                      </Button>
                    </DialogClose>
                  </div>
                </div>
              ))
            ) : (
              <p>No friend requests.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FriendRequest;
