import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useUserContext } from "@/contexts/AuthContext";
import { checkIsGuestUser, deleteGuestUser } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations";

const TopBar = () => {
  const { user, setIsAnonymous, setIsAuthenticated } = useUserContext();
  const navigate = useNavigate();
  const { mutateAsync: signOut } = useSignOutAccount();
  const { toast } = useToast();


  async function handleLogout(): Promise<void> {
    try {
      const deletedSession = await signOut("current");
      // console.log("LOGOUT");
      // console.log("============ DELETED SESSION:", deletedSession);

      if (checkIsGuestUser()) {
        deleteGuestUser();
        setIsAnonymous(false);
      }

      if (deletedSession) {
        setIsAuthenticated(false);
        navigate("/signin");
        return;
      }
  
      toast({
        variant: "destructive",
        title: "Sign out failed. Please try again.",
      });
    } catch (error) {
      if (error instanceof Error) console.log(error.message);
    }
  }

  return (
    <section className="topbar">
      <div className="flex-between py-4 px-5">
        <Link to="/" className="flex gap-3 items-center">
          <img
            src="/assets/images/logo.svg"
            alt="logo"
            width={130}
            height={325}
            
          />
        </Link>

        <div className="flex gap-4">
          <Button
            variant="ghost"
            className="shad-button_ghost"
            onClick={handleLogout}
          >
            <img src="/assets/icons/logout.svg" alt="logout" />
          </Button>
          {/* --link replacement */}

          <Link to={""} className="flex-center gap-3">
            <img
              src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="h-8 w-8 rounded-full object-cover"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopBar;
