"use client";
import React from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FriendCard = ({ friendName, onRemove }) => {
  return (
    <Card className="p-2 flex flex-row justify-between">
      <CardTitle className="text-lg">{friendName}</CardTitle>
      <Button
        variant="destructive"
        size="sm"
        onClick={onRemove}
      >
        Remove
      </Button>
    </Card>
  );
};

export default FriendCard;