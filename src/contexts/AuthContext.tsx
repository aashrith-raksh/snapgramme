import { createContext, useContext, useEffect, useState } from "react";

import { IUser } from "@/lib/types";
import { getCurrentUser } from "@/lib/appwrite/api";
import { useNavigate } from "react-router-dom";
import { checkIsGuestUser } from "@/lib/utils";
import { useGetUsers } from "@/lib/react-query/queriesAndMutations";

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
  const { refetch: fetchTopCreators } = useGetUsers();

  useEffect(() => {
    // console.log(">>>>>> 1. AUTH PROVIDER MOUNTED");
    // console.log(">>>>>> 2. CHECKING FOR COOKIE FALLBACK");

    const cookieFallback = localStorage.getItem("cookieFallback");
    if (
      cookieFallback === "[]" ||
      cookieFallback === null ||
      cookieFallback === undefined
    ) {
      // console.log("\tNot Authenticated");
      navigate("/signup");
      return;
    }

    // console.log("\tAuthenticated...checkAuthUser()");

    checkAuthUser();
  }, []);

  useEffect(() => {
    fetchTopCreators();
  }, []);

  const checkAuthUser = async () => {
    // console.log("\n\t--------- checkAuthUser ---------");

    setIsLoading(true);
    // console.log("isLoading:", isLoading);
    try {
      const currentAccount = await getCurrentUser();
      if (currentAccount) {
        // console.log("\tcurrentAccount:", currentAccount);
        setUser({
          id: currentAccount.$id,
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
      // console.log("isLoading:", isLoading);
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
