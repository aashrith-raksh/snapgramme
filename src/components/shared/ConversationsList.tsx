import  {ConvoContext, IReceiverDetails, ILoadedConversations } from "@/contexts/ConvoContext";
import useDebounce from "@/hooks/useDebouce";
import { useFindUserByUsername } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import Loader from "@/components/shared/Loader";

import { useState, useContext } from "react";
import { Input } from "../ui/input";
import FriendItem from "./FriendItem";

const ConversationsListHeader = () => {
    return (
      <div className="pt-12 flex gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-9 my-auto"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
          />
        </svg>
  
        <h2 className="h3-bold md:h2-bold text-left w-full">Messages</h2>
      </div>
    );
  };
  
  const ConversationsList = () => {
    const [searchValue, setSearchValue] = useState("");
  
    const debouncedSearch = useDebounce(searchValue, 500);
  
    const {
      setActiveConvoDocId,
      setReceiverDetails,
      conversations,
      isLoadingConversations,
    } = useContext(ConvoContext);
  
    const { data: searchResults, isPending: isSearchingUser } =
      useFindUserByUsername(debouncedSearch);
  
    function handleSetConvoDetails(
      activeConvoDocId: any,
      receiverDoc: Models.Document
    ) {
      setActiveConvoDocId(activeConvoDocId);
  
      const receiverDetails: IReceiverDetails = {
        receiverName: receiverDoc.name,
        receiverImageURL: receiverDoc.imageUrl,
        receiverId: receiverDoc.$id,
      };
      setReceiverDetails(receiverDetails);
    }
  
    return (
      <section
        id="chats"
        className="hidden lg:block h-screen w-[465px] bg-dark-3  custom-scrollbar overflow-y-scroll"
      >
        <div className="flex flex-col h-full px-6 gap-12">
          {/* HEADER */}
          <ConversationsListHeader />
  
          {/*SEARCH BAR */}
          <div className="explore-inner_container">
            <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
              <img
                src="/assets/icons/search.svg"
                width={24}
                height={24}
                alt="search bar"
              />
              <Input
                type="text"
                placeholder="Search by username"
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
                    <li
                      key={user.$id}
                      onClick={() => {
                        setReceiverDetails({
                          receiverName: user.name,
                          receiverImageURL: user.imageUrl,
                          receiverId: user.$id,
                        });
  
                        setActiveConvoDocId("");
                      }}
                      className="cursor-pointer"
                    >
                      <FriendItem name={user.name} lastMessage={user.username} />
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-center text-off-white/70 mt-2">
                    No such user exists
                  </p>
                )}
              </ul>
            )
          ) : isLoadingConversations ? (
            <Loader />
          ) : (
            
            (conversations?.length === 0 ? (
              <div className="flex flex-col flex-1 h-full justify-center items-center">
              <div>
                <h2 className="h3-bold md:h2-bold text-center w-full">
                  No Chats Available
                </h2>
                <p className="text-sm text-center text-off-white/70 mt-2">
                  Start messaging users to initiate a conversation. You can search
                  for a user by their username
                </p>
              </div>
            </div>
            ) : (
              <ul className="flex flex-col flex-1">
                {conversations!.map((convo: ILoadedConversations) => {
                  return (
                    <li
                      key={convo.$id}
                      onClick={() =>
                        handleSetConvoDetails(convo.$id, convo.otherParticipant)
                      }
                    >
                      <FriendItem
                        name={convo.otherParticipant.name}
                        showCursorPointer={true}
                        lastMessage={convo.lastMessage}
                        lastUpdated={convo.lastUpdated}
                        showLastUpdated={true}
                      />
                    </li>
                  );
                })}
              </ul>
            ))
          )}
        </div>
      </section>
    );
  };

  export default ConversationsList