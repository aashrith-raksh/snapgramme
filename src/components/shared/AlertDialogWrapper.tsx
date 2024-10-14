import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUserContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations";
import { checkIsGuestUser, deleteGuestUser } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface AlertDialogWrapperProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export default function AlertDialogWrapper({
  children,
  title,
  description,
}: AlertDialogWrapperProps) {


    
  const navigate = useNavigate();
  const {toast} = useToast();
  const {setIsAnonymous, setIsAuthenticated} = useUserContext();

  const { mutateAsync: signOut } = useSignOutAccount();

  async function handleClick(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    event.preventDefault();

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
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="bg-dark-4 border-0">
        <AlertDialogHeader className="mb-8">
          <AlertDialogTitle className="text-2xl font-bold text-primary-500">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-off-white/70">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-[.5px] border-off-white/70">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="shad-button_primary"
            onClick={handleClick}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
