"use client";
import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { sendFriendRequest } from "../server-actions";

const AddFriend = ({ username, refreshFriends }) => {
  const [friendUsername, setFriendUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSendRequest = async () => {
    if (!friendUsername) {
      setError("Please enter a username");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      const success = await sendFriendRequest(username, friendUsername);
      if (success) {
        setFriendUsername("");
        refreshFriends();
      } else {
        setError("Failed to send friend request");
      }
    } catch (error) {
      setError("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Add Friend</Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new friend</DialogTitle>
          <DialogDescription>Enter a username to send a friend request</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Username"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
          />
          
          {error && <p className="text-sm text-red-500">{error}</p>}
          
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            
            <div >
              <Button 
                type="button" 
                onClick={handleSendRequest} 
                disabled={isSubmitting || !friendUsername}
              >
                {isSubmitting ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriend;