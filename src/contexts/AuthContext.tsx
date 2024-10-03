import { createContext, useContext, useEffect, useState } from "react";

import { IUser } from "@/lib/types";
import { getCurrentUser } from "@/lib/appwrite/api";
import { useNavigate } from "react-router-dom";
import { checkIsGuestUser } from "@/lib/utils";

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
  isAnonymous: false,
  setIsAnonymous: () => {},
};

type IContextType = {
  user: IUser;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
  isAnonymous: boolean;
  setIsAnonymous: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AuthContext = createContext<IContextType>(INITIAL_STATE);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(checkIsGuestUser());
  const navigate = useNavigate();

  useEffect(() => {
    console.log(">>>>>> 1. AUTH PROVIDER MOUNTED")
  }, [])


  useEffect(() => {
    // console.log("\nEFFECT RUNNING(AuthContext)...");
    console.log(">>>>>> 2. CHECKING FOR COOKIE FALLBACK")

    const cookieFallback = localStorage.getItem("cookieFallback");
    if (
      cookieFallback === "[]" ||
      cookieFallback === null ||
      cookieFallback === undefined
    ) {
      console.log("\tNot Authenticated");
      navigate("/signin");
      return;
    }

    checkAuthUser();
  }, []);

  useEffect(() => {
    console.log("\n>>>>>> 3. SETTING isAnonymous")
    console.log("\tisAnonymous: ", isAnonymous)
    console.log("\n")
  },[isAnonymous])

  
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
    isAnonymous,
    setIsAnonymous,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useUserContext = () => useContext(AuthContext);
