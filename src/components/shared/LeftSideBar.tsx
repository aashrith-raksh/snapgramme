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
  const { user, isAnonymous, setIsAnonymous, isLoading, setIsAuthenticated } = useUserContext();
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
    <nav className="leftsidebar overflow-scroll custom-scrollbar">
      <div className="flex flex-col gap-11">
        <Link to="/" className="flex gap-3 items-center">
          <img
            src="/assets/images/logo.svg"
            alt="logo"
            width={170}
            height={36}
          />
        </Link>

        {isLoading || (!isAnonymous && !user) ? (
          <div className="h-14">
            <Loader />
          </div>
        ) : (
          <Link to={`/update-profile`} className="flex gap-3 items-center">
            <img
              src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="h-14 w-14 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <p className="body-bold">{isAnonymous ? "Guest" : user.name}</p>
              <p className="small-regular text-light-3">
                @{isAnonymous ? "guest" : user.username}
              </p>
            </div>
          </Link>
        )}

        <ul className="flex flex-col gap-5 ">
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
                  {link.label === "Messages" ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={`group-hover:invert-white size-6 my-auto ${
                        isActive && "invert-white"
                      }`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                      />
                    </svg>
                  ) : (
                    <img
                      src={link.imgURL}
                      alt={link.label}
                      className={`group-hover:invert-white ${
                        isActive && "invert-white"
                      }`}
                    />
                  )}
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      <Button
        variant="ghost"
        id='logoutButton'
        className="shad-button_ghost mt-12"
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
