import { useUserContext } from "@/contexts/AuthContext";
import { account } from "@/lib/appwrite/config";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const RootLayout = () => {
  const navigate = useNavigate();

  const { checkAuthUser, user } = useUserContext();

  useEffect(() => {
    console.log("Effect running...");
    console.log("\tcurrenUser:", user);

    const cookieFallback = localStorage.getItem("cookieFallback");
    if (
      cookieFallback === "[]" ||
      cookieFallback === null
    ) {
      console.log("No cookie found...redirecting to sign-up page");
      navigate("/signup");
      return;
    }

    checkAuthUser();
  }, []);

  return (
    <div>
      <h1>ROOT</h1>
      <button
        onClick={() => {
          console.log("------------ Deleteing Sessions -----------");
          const res = account.deleteSessions();
          console.log("\tres:", res);
        }}
      >
        Logout
      </button>
      <Outlet />
    </div>
  );
};

export default RootLayout;
