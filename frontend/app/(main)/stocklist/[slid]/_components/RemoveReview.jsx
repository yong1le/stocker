"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { removeReview } from "../../server-actions";

const RemoveReview = ({ username, slid, reviewer, owner }) => {
  const router = useRouter();

  const handleAction = async () => {
    const success = await removeReview(slid, owner, reviewer);
    if (success) {
      router.refresh();
    }
  };

  return (
    <div className="flex">
      {(username === owner || username === reviewer) && (
        <Button variant="destructive" onClick={handleAction}>
          Remove
        </Button>
      )}
    </div>
  );
};

export default RemoveReview;
