import { createContext, useContext, useEffect, useState } from "react";

import { IUser } from "@/lib/types";
import { getCurrentUser, getCurrentUserWithLogs } from "@/lib/appwrite/api";
import { useNavigate } from "react-router-dom";


export const INITIAL_USER = {
  id: "",
  name: "",
  username: "",
  email: "",
  imageUrl: "",
  bio: "",
};

const INITIAL_STATE = {
  user: INITIAL_USER,
  isLoading: false,
  isAuthenticated: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false as boolean,
};

type IContextType = {
  user: IUser;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
};

const AuthContext = createContext<IContextType>(INITIAL_STATE);

export function AuthProvider({ children }: { children: React.ReactNode}) {
  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    // console.log("\nEFFECT RUNNING(AuthContext)...");
    const cookieFallback = localStorage.getItem("cookieFallback");
    if (
      cookieFallback === "[]" ||
      cookieFallback === null ||
      cookieFallback === undefined
    ) {
      console.log("Not authenticated....back to signup")
      navigate("/signin")
      return;
    }

    checkAuthUser();
  }, []);

  const checkAuthUser = async () => {
    // console.log("\n\t--------- checkAuthUser ---------");

    setIsLoading(true);
    try {
      const currentAccount = await getCurrentUser();
      if (currentAccount) {
        // console.log("\tcurrentAccount:", currentAccount);
        setUser({
          id: currentAccount.$id, //--note: might be wrong. $id would reference documentId and not accountId
          name: currentAccount.name,
          username: currentAccount.username,
          email: currentAccount.email,
          imageUrl: currentAccount.imageUrl,
          bio: currentAccount.bio,
        });

        setIsAuthenticated(true);

        return true;
      }

      return false;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      // console.log("\t----------------------------------");
      setIsLoading(false);
    }
  };

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    checkAuthUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useUserContext = () => useContext(AuthContext);

