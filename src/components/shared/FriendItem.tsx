import { isValidUrl } from "@/lib/utils";

type FriendItemProps = {
    name?: string;
    lastMessage?: string;
    lastUpdated?: string;
    showLastMessage?: boolean;
    showLastUpdated?: boolean;
    showCursorPointer?: boolean;
    profileImageUrl?: string;
  };
  
  const FriendItem = ({
    name,
    lastMessage,
    lastUpdated,
    profileImageUrl,
    showLastUpdated = true,
    showLastMessage=true,
    showCursorPointer = false,
  }: FriendItemProps) => {
    const defaultProfileImage = "/assets/icons/profile-placeholder.svg";
    return (
      <div
        className={`flex gap-4 items-center px-2 pb-4 mt-4  border-off-white/10 border-b-[0.1px] ${
          showCursorPointer && "cursor-pointer"
        }`}
      >
        <img
          src={
            isValidUrl(profileImageUrl || "")
              ? profileImageUrl
              : defaultProfileImage
          }
          alt="profile"
          className="h-12 w-12 rounded-full"
        />
        <div className="flex flex-col self-start" id="details">
          <p className="body-bold">{name ? name : "Guest"}</p>
          <p className="text-xs text-[14px] mt-[5px] text-light-3">
            {(showLastMessage && lastMessage) ? lastMessage : name}
          </p>
        </div>
  
        <div className="self-start ml-auto  mt-[6px]" id="last-updated-time">
          <p className="text-xs text-[14px] text-light-3">
            {showLastUpdated && (lastUpdated ? lastUpdated : "1d ago")}
          </p>
        </div>
      </div>
    );
  };

  export default FriendItem;