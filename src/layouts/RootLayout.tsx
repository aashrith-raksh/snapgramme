import React from "react";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div>
        <h1>ROOT</h1>
      <Outlet />
    </div>
  );
};

export default RootLayout;
