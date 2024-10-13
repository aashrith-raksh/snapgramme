import {
  ConvoContext,
  IReceiverDetails,
  ILoadedConversations,
} from "@/contexts/ConvoContext";
import useDebounce from "@/hooks/useDebouce";
import {
  useFetchDummyUsers,
  useFindUserByUsername,
} from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import Loader from "@/components/shared/Loader";

import { useState, useContext } from "react";
import { Input } from "../ui/input";
import FriendItem from "./FriendItem";
import { useUserContext } from "@/contexts/AuthContext";

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
  const [isChatOpen, setIsChatOpen] = useState(false);

  const debouncedSearch = useDebounce(searchValue, 500);

  const {
    setActiveConvoDocId,
    setReceiverDetails,
    conversations,
    isLoadingConversations,
  } = useContext(ConvoContext);

  const { isAnonymous } = useUserContext();

  const { data: searchResults, isPending: isSearchingUser } =
    useFindUserByUsername(debouncedSearch);

  const { data: dummyUsers, isPending: isLoadingDummyUsers } =
    useFetchDummyUsers();

  function handleSetConvoDetails(
    activeConvoDocId: string,
    receiverDoc: Models.Document | IReceiverDetails
  ) {
    setActiveConvoDocId(activeConvoDocId);

    let receiverDetails: IReceiverDetails;

    if ("$id" in receiverDoc) {
      receiverDetails = {
        receiverName: receiverDoc.name,
        receiverImageURL: receiverDoc.imageUrl,
        receiverId: receiverDoc.$id,
      };
    } else {
      receiverDetails = receiverDoc;
    }

    setReceiverDetails(receiverDetails);
  }

  return (
    <>
      <button
        className={`lg:hidden absolute z-200 top-[15%] transition-transform duration-300 ${
          isChatOpen ? "right-[63%]" : "left-[96%]"
        } bg-primary-500 p-1 text-white rounded-md rounded-tr-none rounded-br-none`}
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        <img
          src="/assets/icons/bars.svg"
          alt="toggle chats"
          className="w-6 h-6"
        />
      </button>

      <section
        id="chats"
        // className="hidden lg:block h-screen w-[465px] bg-dark-3  custom-scrollbar overflow-y-scroll"
        // className={`h-[85vh] top-[7.5vh] bottom-[7.5vh] md:top-0 right-0  md:h-full lg:block w-[465px] bg-dark-3 custom-scrollbar overflow-y-scroll transition-transform duration-300 lg:block ${
        //   isChatOpen ? "translate-x-0" : "translate-x-full"
        // } lg:translate-x-0`}
        className={`${
          isChatOpen ? "fixed" : ""
        } lg:block h-screen w-[465px] bg-dark-3 custom-scrollbar overflow-y-scroll transition-transform duration-300 ${
          isChatOpen ? "right-[0%] top-0" : "top-[15%] right-[96%] hidden"
        }`}
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

          {isAnonymous ? (
            isLoadingDummyUsers ? (
              <Loader />
            ) : (
              <ul className="flex flex-col flex-1">
                {dummyUsers!.map((user) => (
                  <li
                    key={user.$id}
                    onClick={() => {
                      handleSetConvoDetails("", {
                        receiverName: user.name,
                        receiverImageURL: user.imageUrl,
                        receiverId: user.$id,
                      });
                    }}
                    className="cursor-pointer"
                  >
                    <FriendItem name={user.name} lastMessage={user.username} />
                  </li>
                ))}
              </ul>
            )
          ) : searchValue ? (
            isSearchingUser ? (
              <Loader />
            ) : (
              <ul className="flex flex-col flex-1">
                {searchResults && searchResults.documents.length > 0 ? (
                  searchResults.documents.map((user) => (
                    <li
                      key={user.$id}
                      onClick={() => {
                        handleSetConvoDetails("", {
                          receiverName: user.name,
                          receiverImageURL: user.imageUrl,
                          receiverId: user.$id,
                        });
                      }}
                      className="cursor-pointer"
                    >
                      <FriendItem
                        name={user.name}
                        lastMessage={user.username}
                      />
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
          ) : conversations?.length === 0 ? (
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
            <ul className="flex flex-col flex-1 overflow-y-scroll custom-scrollbar">
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
          )}
        </div>
      </section>
    </>
  );
};

export default ConversationsList;
