"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateVisibility } from "../../server-actions";

const Visibility = ({ username, slid, visibility }) => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visibility === "public") {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [visibility]);

  const updateStatus = async () => {
    let success;
    if (!visible){
        success = await updateVisibility(slid, username, "public");
    } else {
        success = await updateVisibility(slid, username, "private");
    }
    if(success){
        router.refresh();
    }
  };

  const handleSwitchChange = () => {
    setVisible((prev) => !prev);
    updateStatus();

  };

  return (
    <div className="mr-4">
      <Switch checked={visible} onCheckedChange={handleSwitchChange} />
      <Label>{visibility}</Label>
    </div>
  );
};

export default Visibility;
