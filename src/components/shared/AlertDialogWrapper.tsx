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
  function handleClick(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    event.preventDefault();
    navigate("/signin");
    return;
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
