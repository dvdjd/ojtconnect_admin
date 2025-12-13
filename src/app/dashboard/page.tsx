"use client";
import UserList from "@/components/modules/UserList";
import React from "react";

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-4 min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <div className="text-black">
        <h1 className="font-semibold text-2xl">UserList</h1>
      </div>
      <UserList />
    </div>
  );
};

export default Dashboard;
