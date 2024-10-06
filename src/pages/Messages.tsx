import Loader from "@/components/shared/Loader";
import { Input } from "@/components/ui/input";
import { useUserContext } from "@/contexts/AuthContext";
import useDebounce from "@/hooks/useDebouce";
import {
  useFindUserByUsername,
  useGetRecentConversations,
} from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import { useState } from "react";

const Messages = () => {
  const [searchValue, setSearchValue] = useState("");
  const { user } = useUserContext();

  const { data: conversations, isPending: isLoadingConversations } =
    useGetRecentConversations(user.id);
  const debouncedSearch = useDebounce(searchValue, 500);

  // Check if conversations should be shown:
  // - Ensure conversations are not still loading and loading is either fail/success
  // - Confirm that the conversations object is available
  // - Check if there are documents in the conversations object
  // - Ensure the search value is empty (i.e., no active search)
  const showConversations =
    !isLoadingConversations &&
    conversations &&
    conversations.documents.length > 0 &&
    searchValue === "";

  // Check if the empty state should be displayed:
  // - Ensure conversations are not still loading and loading is either fail/success
  // - Confirm that the conversations object is available
  // - Check that there are NO documents in the conversations object
  // - Ensure the search value is empty (i.e., the user has not typed anything to search)
  const showEmptyBox =
    !isLoadingConversations &&
    conversations &&
    conversations.documents.length === 0 &&
    searchValue === "";

  const { data: searchResults, isPending: isSearchingUser } =
    useFindUserByUsername(debouncedSearch);

  return (
    <div className="flex flex-1">
      <div className="flex flex-col flex-1 items-center gap-10 overflow-scroll sm:p-2 md:px-8 md:p-4 custom-scrollbar">
        <div className="min-w-full min-h-full bg-dark-3 rounded-xl"></div>
      </div>

      {/* LEFT-SIDE CHATS COMP. */}
      <section
        id="chats"
        className="lg:block h-screen w-[465px] bg-dark-3  custom-scrollbar overflow-y-scroll"
      >
        <div className="flex flex-col h-full px-6 gap-12">
          {/* HEADER */}
          <Header />

          {/* SEARCH BOX */}
          <div className="explore-inner_container">
            <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
              <img
                src="/assets/icons/search.svg"
                width={24}
                height={24}
                alt="search by username"
              />
              <Input
                type="text"
                placeholder="Search"
                className="explore-search"
                value={searchValue}
                onChange={(e) => {
                  const { value } = e.target;
                  setSearchValue(value);
                }}
              />
            </div>
          </div>

          {searchValue ? (
            isSearchingUser ? (
              <Loader />
            ) : (
              <ul className="flex flex-col flex-1">
                {searchResults && searchResults.documents.length > 0 ? (
                  searchResults.documents.map((user) => (
                    <li key={user.username}>
                      <FriendItem name={user.name} username={user.username} />
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-center text-off-white/70 mt-2">
                    No such user exists
                  </p>
                )}
              </ul>
            )
          ) : showEmptyBox ? (
            <div className="flex flex-col flex-1 h-full justify-center items-center">
              <div>
                <h2 className="h3-bold md:h2-bold text-center w-full">
                  No Chats Available
                </h2>
                <p className="text-sm text-center text-off-white/70 mt-2">
                  Start messaging users to initiate a conversation. You can
                  search for a user by their username
                </p>
              </div>
            </div>
          ) : (
            showConversations &&
            (isLoadingConversations ? (
              <Loader />
            ) : (
              <ul className="flex flex-col flex-1">
                {conversations!.documents.map((convo: Models.Document) => {
                  const otherParticipant =
                    convo.participant1.$id === user.id
                      ? convo.participant2
                      : convo.participant1;

                  return (
                    <li key={convo.id}>
                      <FriendItem
                        name={otherParticipant.name}
                        username={otherParticipant.username}
                      />
                    </li>
                  );
                })}
              </ul>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Messages;

const FriendItem = ({
  name,
  username,
}: {
  name?: string;
  username?: string;
}) => {
  return (
    <div className="flex gap-4 items-center px-2 pb-4 mt-4">
      <img
        src={"/assets/icons/profile-placeholder.svg"}
        alt="profile"
        className="h-12 w-12 rounded-full"
      />
      <div className="flex flex-col self-start" id="details">
        <p className="body-bold">{name ? name : "Guest"}</p>
        <p className="text-xs text-[14px] mt-[5px] text-light-3">
          {/* {`@${username ? username : "guest"}`} */}
          {`Last updated message comes here`}
        </p>
      </div>

      <div className="self-start mx-auto mt-[6px]" id="last-updated-time">
        <p className="text-xs text-[14px] text-light-3">1d ago</p>
      </div>
    </div>
  );
};

const Header = () => {
  return (
    <div className="pt-12 flex gap-2">
      <img
        src="/assets/icons/save.svg"
        width={36}
        height={36}
        alt="edit"
        className="invert-white"
      />
      <h2 className="h3-bold md:h2-bold text-left w-full">Messages</h2>
    </div>
  );
};

// --replace: remove these comments
{
  /* <ul className="flex flex-col flex-1">
<li className="border-b-[0.5px] border-off-white/60">
  <FriendItem />
</li>
<li className="border-b-[0.5px] border-off-white/60">
  <FriendItem />
</li>
<li className="border-b-[0.5px] border-off-white/60">
  <FriendItem />
</li>
<li className="border-b-[0.5px] border-off-white/60">
  <FriendItem />
</li>
<li className="border-b-[0.5px] border-off-white/60">
  <FriendItem />
</li>
</ul> */
}
