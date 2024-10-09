import { Models } from "appwrite";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateString(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", options);

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formattedDate} at ${time}`;
}

export const multiFormatDateString = (timestamp: string = ""): string => {
  const timestampNum = Math.round(new Date(timestamp).getTime() / 1000);
  const date: Date = new Date(timestampNum * 1000);
  const now: Date = new Date();

  const diff: number = now.getTime() - date.getTime();
  const diffInSeconds: number = diff / 1000;
  const diffInMinutes: number = diffInSeconds / 60;
  const diffInHours: number = diffInMinutes / 60;
  const diffInDays: number = diffInHours / 24;

  switch (true) {
    case Math.floor(diffInDays) >= 30:
      return formatDateString(timestamp);
    case Math.floor(diffInDays) === 1:
      return `${Math.floor(diffInDays)} day ago`;
    case Math.floor(diffInDays) > 1 && diffInDays < 30:
      return `${Math.floor(diffInDays)} days ago`;
    case Math.floor(diffInHours) >= 1:
      return `${Math.floor(diffInHours)} hours ago`;
    case Math.floor(diffInMinutes) >= 1:
      return `${Math.floor(diffInMinutes)} minutes ago`;
    default:
      return "Just now";
  }
};

export const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    if (e instanceof Error) {
      // console.log(e.message);
    }
    return false;
  }
};

export const checkIsLiked = (likeList: string[], userId: string) => {
  return likeList.includes(userId);
};

export const createGuestUser = () => {
  localStorage.setItem("isGuest", "true");
};

export const deleteGuestUser = () => {
  localStorage.removeItem("isGuest");
};

export const checkIsGuestUser = () => {
  return localStorage.getItem("isGuest") === "true";
};

export const separateMessagesByUsername = (
  msgsDocs: Models.Document[],
  currentUserId: string
) => {
  let selfMsgs: Models.Document[] = [];
  let receiverMsgs: Models.Document[] = [];

  msgsDocs.forEach((msg) => {
    if (msg.senderId.$id === currentUserId) {
      selfMsgs.push(msg);
    } else {
      receiverMsgs.push(msg);
      receiverMsgs.push(msg);
    }
  });

  return { selfMsgs, receiverMsgs };
};

// export async function handleLogout(): Promise<void> {
//   const { mutate: signOut, isSuccess } = useSignOutAccount();
//   const navigate = useNavigate();
//   const { setIsAnonymous } = useUserContext();
//   const { toast } = useToast();

//   try {
//     const deletedSession = await signOut("current");
//     console.log("LOGOUT");
//     console.log("============ DELETED SESSION:", deletedSession);

//     if (checkIsGuestUser()) {
//       deleteGuestUser();
//       setIsAnonymous(false);
//     }

//     if (isSuccess) {
//       navigate("/signin");
//       return;
//     }

//     toast({
//       variant: "destructive",
//       title: "Sign Out failed. Please try again.",
//     });
//   } catch (error) {
//     if (error instanceof Error) console.log(error.message);
//   }
// }

// export async function createGuestAccount(
//   event: React.MouseEvent<HTMLButtonElement>
// ): Promise<void> {
//   const navigate = useNavigate();
//   const { setIsAnonymous } = useUserContext();

//   event.preventDefault();
//   const anonymousSession = await account.createAnonymousSession();
//   console.log("============== ANONYMOUS SESSION:", anonymousSession);

//   createGuestUser();
//   setIsAnonymous(true);

//   navigate("/");
// }
