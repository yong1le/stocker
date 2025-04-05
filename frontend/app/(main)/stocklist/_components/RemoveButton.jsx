"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { removeStocklist } from "../server-actions";
import { useRouter } from "next/navigation";

const RemoveButton = ({ username, slid, owner }) => {
  const router = useRouter();

  const handleAction = async () => {
    const success = await removeStocklist(slid, username);
    if (success) {
      router.refresh();
    }
  };

  return (
    <>
      {username === owner && (
        <div className="flex">
          <Button variant="destructive" onClick={handleAction}>
            Remove
          </Button>
        </div>
      )}
    </>
  );
};

export default RemoveButton;
