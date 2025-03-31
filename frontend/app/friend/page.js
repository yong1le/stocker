"use client";
import { redirect } from "next/navigation";
import { getUserServer } from "@/lib/auth-server";
import React, { useState, useEffect, use } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import AddFriend from "./_components/addFriend";
import FriendRequest from "./_components/friendRequest";
import { fetchIncomingFriendReq, fetchOutgoingFriendReq, removeFriend} from "./server-actions";
import { Button } from "@/components/ui/button";

const FriendView = () => {
  const [user, setUser] = useState("");
  const [friends, setFriends] = useState([]);

  // Fetch the current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getUserServer();
      if (!currentUser) redirect("/login");
      setUser(currentUser);
    };

    fetchUser();
  }, []);

  const fetchFriendList = async () => {
    try {
      const res = await fetch(`http://localhost:8080/friend/view/all/${user}`);
      if (!res.ok) throw new Error("Failed to fetch friends");
      setFriends(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch the friends and friend requests
  useEffect(() => {
    if (!user) return;

    fetchFriendList();
  }, [user]);

  return (
    <div className="m-5 flex flex-row gap-5">
      <Card className="p-4 flex-2">
        <h1>Current user, {user}</h1>
        <CardTitle className="text-4xl">Friends</CardTitle>
          {friends.length > 0 &&
            friends.map((e, i) => (
              <Card key={i} className="p-2">
                <CardTitle className="text-3xl">
                  {e}
                  <Button
                        variant="destructive"
                        onClick={() => removeFriend(user, e)}
                      >
                        remove
                      </Button>
                </CardTitle>
              </Card>
            ))}
      </Card>
      <Card className="p-4 ">
        <AddFriend username={user} refetchFriendList={fetchFriendList} />
        <FriendRequest username={user} refetchFriendList={fetchFriendList} request={fetchIncomingFriendReq}/>
        <FriendRequest username={user} refetchFriendList={fetchFriendList} request={fetchOutgoingFriendReq}/>
      </Card>

    </div>
  );
};

export default FriendView;
