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
import {
  fetchIncomingFriendRequests,
  fetchOutgoingFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../server-actions";
import { cancelFriendReq } from "../server-actions";
const FriendRequestList = ({
  username,
  refreshFriends,
  requestType,
  title,
}) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRequests = async () => {
    if (!username) return;

    setIsLoading(true);
    try {
      const requestFn =
        requestType === "incoming"
          ? fetchIncomingFriendRequests
          : fetchOutgoingFriendRequests;

      const data = await requestFn(username);
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      loadRequests();
    }
  }, [username]);

  const handleAction = async (friend, action) => {
    const actionFn =
      action === "accept" ? acceptFriendRequest : rejectFriendRequest;

    const success = await actionFn(username, friend);
    if (success) {
      refreshFriends();
      loadRequests();
    }
  };

  const handleCancel = async (friend) => {
    const success = await cancelFriendReq(username, friend);
    console.log("cancel");
    if (success) {
      refreshFriends();
      loadRequests();
    }
  };
  const buttonLabel =
    requestType === "incoming" ? "Incoming Requests" : "Outgoing Requests";

  return (
    <Dialog onOpenChange={(open) => open && loadRequests()}>
      <DialogTrigger asChild>
        <Button
          className="w-full"
          variant={requestType === "incoming" ? "default" : "outline"}
        >
          {buttonLabel}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {requestType === "incoming"
              ? "Accept or reject friend requests"
              : "View your outgoing requests"}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading requests...</p>
          ) : requests.length > 0 ? (
            <div className="space-y-2">
              {requests.map((request, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <span className="font-medium">{request}</span>
                  <div className="flex gap-2">
                    {requestType === "incoming" ? (
                      <>
                        <DialogClose asChild>
                          <Button
                            size="sm"
                            onClick={() => handleAction(request, "accept")}
                          >
                            Accept
                          </Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(request, "reject")}
                          >
                            Reject
                          </Button>
                        </DialogClose>
                      </>
                    ) : (
                      <DialogClose asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancel(request)}
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No {requestType} friend requests.
            </p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FriendRequestList;
