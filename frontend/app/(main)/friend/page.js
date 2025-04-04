"use client";
import { redirect } from "next/navigation";
import { getUserServer } from "@/lib/auth-server";
import React, { useState, useEffect } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { fetchFriendList, removeFriend } from "./server-actions";
import AddFriend from "./_components/addFriend";
import FriendRequestList from "./_components/friendRequest";
import FriendCard from "./_components/FriendCard";

const FriendView = () => {
  const [user, setUser] = useState("");
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getUserServer();
        if (!currentUser) return redirect("/login");
        setUser(currentUser);
      } catch (error) {
        redirect("/login");
      }
    };

    fetchUser();
  }, []);

  const loadFriendList = async () => {
    if (!user) return;

    try {
      const friendList = await fetchFriendList(user);
      setFriends(friendList || []);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } 
  };

  useEffect(() => {
    if (user) {
      loadFriendList();
    }
  }, [user]);

  const handleRemoveFriend = async (friendName) => {
    const success = await removeFriend(user, friendName);
    if (success) {
      loadFriendList();
    }
  };

  return (
    <div className="m-5 flex flex-row gap-5">
      <Card className="p-4 flex-grow">
        <CardTitle className="text-2xl mb-4 items-center">Friends, {user}</CardTitle>
        {friends.length > 0 ? (
          <div className="space-y-3">
            {friends.map((friend, i) => (
              <FriendCard
                key={i}
                friendName={friend}
                onRemove={() => handleRemoveFriend(friend)}
              />
            ))}
          </div>
        ) : (
          <p>No friends yet!</p>
        )}
      </Card>

      <Card className="p-4 ">
        <div className="space-y-3">
          <AddFriend username={user} refreshFriends={loadFriendList} />

          <FriendRequestList
            username={user}
            refreshFriends={loadFriendList}
            requestType="incoming"
            title="Incoming Requests"
          />

          <FriendRequestList
            username={user}
            refreshFriends={loadFriendList}
            requestType="outgoing"
            title="Outgoing Requests"
          />
        </div>
      </Card>
    </div>
  );
};

export default FriendView;