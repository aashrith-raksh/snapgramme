import { sidebarLinks } from "@/constants";
import { INavLink } from "@/lib/types";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useUserContext } from "@/contexts/AuthContext";
import Loader from "./Loader";
import { checkIsGuestUser, deleteGuestUser } from "@/lib/utils";
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations";
import { useToast } from "@/hooks/use-toast";

const LeftSideBar = () => {
  const navigate = useNavigate();

  const { pathname } = useLocation();
  const { user, isAnonymous, setIsAnonymous, isLoading } = useUserContext();
  const { mutateAsync: signOut } = useSignOutAccount();
  const { toast } = useToast();


  async function handleLogout(): Promise<void> {
    try {
      const deletedSession = await signOut("current");
      console.log("LOGOUT");
      console.log("============ DELETED SESSION:", deletedSession);

      if (checkIsGuestUser()) {
        deleteGuestUser();
        setIsAnonymous(false);
      }

      if (deletedSession) {
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
    <nav className="leftsidebar">
      <div className="flex flex-col gap-11">
        <Link to="/" className="flex gap-3 items-center">
          <img
            src="/assets/images/logo.svg"
            alt="logo"
            width={170}
            height={36}
          />
        </Link>

        {isLoading || (!isAnonymous && !user.email) ? (
          <div className="h-14">
            <Loader />
          </div>
        ) : (
          <Link to={`/update-profile`} className="flex gap-3 items-center">
            <img
              src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="h-14 w-14 rounded-full"
            />
            <div className="flex flex-col">
              <p className="body-bold">{isAnonymous ? "Guest" : user.name}</p>
              <p className="small-regular text-light-3">
                @{isAnonymous ? "guest" : user.username}
              </p>
            </div>
          </Link>
        )}

        <ul className="flex flex-col gap-6">
          {sidebarLinks.map((link: INavLink) => {
            const isActive = pathname === link.route;

            return (
              <li
                key={link.label}
                className={`leftsidebar-link group ${
                  isActive && "bg-primary-500"
                }`}
              >
                <NavLink
                  to={link.route}
                  className="flex gap-4 items-center p-4"
                >
                  <img
                    src={link.imgURL}
                    alt={link.label}
                    className={`group-hover:invert-white ${
                      isActive && "invert-white"
                    }`}
                  />
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      <Button
        variant="ghost"
        className="shad-button_ghost"
        onClick={handleLogout}
      >
        <img src="/assets/icons/logout.svg" alt="logout" />
        <p className="small-medium lg:base-medium">
          {isAnonymous ? "Exit guest mode" : "Logout"}
        </p>
      </Button>
    </nav>
  );
};

export default LeftSideBar;
