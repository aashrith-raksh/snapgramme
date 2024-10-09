import FriendItem from "@/components/shared/FriendItem";
import Loader from "@/components/shared/Loader";
import { Input } from "@/components/ui/input";
import { useUserContext } from "@/contexts/AuthContext";
import { ConvoContext } from "@/contexts/ConvoContext";
import useDebounce from "@/hooks/useDebouce";
import { createNewConversation } from "@/lib/appwrite/api";
import {
  useFindUserByUsername,
  useSendMessageMutation,
} from "@/lib/react-query/queriesAndMutations";
import { INewConversation, INewMessage } from "@/lib/types";
import { multiFormatDateString } from "@/lib/utils";
import { ID, Models } from "appwrite";
import { useContext, useEffect, useRef, useState } from "react";

const MessagePanel = () => {
  const { receiverImageURL, receiverName } = useContext(ConvoContext);

  return (
    <div
      id="chat-box_background"
      className="flex flex-col flex-1 items-center gap-10 overflow-scroll sm:p-2 md:px-8 md:p-4 custom-scrollbar"
    >
      {receiverName === "" ? (
        <div className="my-auto">
          <div>
            <h2 className="h3-bold md:h2-bold text-center w-full">
              No chats opened
            </h2>
            <p className="text-sm text-center text-off-white/70 mt-2">
              Open a chat to view messages
            </p>
          </div>
        </div>
      ) : (
        <div
          id="MESSAGE-PANEL"
          className="min-w-full min-h-full bg-dark-3 rounded-xl flex flex-col gap-8 px-8"
        >
          {/* MESSAGE-PANEL-HEADER */}
          <MessagePanelHeader
            receiverImageURL={receiverImageURL}
            receiverName={receiverName}
          />

          {/*MESSAGE-BOX */}
          <div
            id="MESSAGE-PANEL_MESSAGE-BOX"
            className="flex flex-col flex-1 pb-4  min-w-full overflow-hidden "
          >
            {/* MESSAGES DISPLAY SOOON.......... */}
            <MessagesDisplay />

            {/* MESSAGE INPUT */}
            <MessagesInput />
          </div>
        </div>
      )}
    </div>
  );
};

const MessagePanelHeader = ({
  receiverName,
  receiverImageURL,
}: {
  receiverName: string;
  receiverImageURL: string;
}) => {
  return (
    <FriendItem
      name={receiverName}
      showLastMessage={false}
      showLastUpdated={false}
      profileImageUrl={receiverImageURL}
    />
  );
};

const MessagesInput = () => {
  const [message, setMessage] = useState("");
  const { activeConvoDocId, setActiveConvoDocId, receiverId } =
    useContext(ConvoContext);
  const { user } = useUserContext();

  const { mutateAsync: sendMsg, isPending: isSendingMsg } =
    useSendMessageMutation();

  async function handleSendMessage() {
    if (message === "") return;

    setMessage("");

    let conversationId: string = activeConvoDocId;

    if (activeConvoDocId === "") {
      const createConversation = async () => {
        const newConvoDetails: INewConversation = {
          conversationId: ID.unique(),
          participant1: user.id,
          participant2: receiverId,
          lastUpdated: new Date(),
        };
        const newConversation = await createNewConversation(newConvoDetails);
        conversationId = newConversation!.$id;
        setActiveConvoDocId(conversationId);
      };

      await createConversation();
    }

    try {
      const msgData: INewMessage = {
        messageId: ID.unique(),
        body: message,
        createdAt: new Date(),
        senderId: user.id,
        conversationId,
      };

      const newMessage = await sendMsg({ msgData, senderName: user.name });
      console.log("=========== NEW MESSAGE:", newMessage);
    } catch (error) {
      if (error instanceof Error) console.log(error.message);
    }
  }

  return (
    <div
      id="MESSAGE-BOX_MESSAGE-INPUT"
      className="flex gap-1 px-4 w-f rounded-lg bg-dark-4"
    >
      <Input
        type="text"
        placeholder="Search by username"
        className="explore-search"
        value={message}
        onChange={(e) => {
          const { value } = e.target;
          setMessage(value);
        }}
      />

      {isSendingMsg ? (
        <Loader />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`size-5 my-auto text-off-white/70 mr-4 cursor-pointer hover:text-off-white/50 ${
            message === "" && "text-off-white/20"
          }`}
          onClick={handleSendMessage}
        >
          <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
        </svg>
      )}
    </div>
  );
};

const MessagesDisplay = () => {
  const { msgDocs, receiverName, isLoadingMsgs, activeConvoDocId } =
    useContext(ConvoContext);

  // Create a ref to the last message
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the last message when the component renders or the message list updates
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgDocs]);

  return (
    <div className="flex-grow flex flex-col gap-3 overflow-y-scroll hide-scrollbar">
      <p className="text-xs text-[14px] self-center text-off-white pb-[1px] border-b-[1px] cursor-pointer border-off-white">
        load older messages
      </p>
      {isLoadingMsgs && activeConvoDocId != "" ? (
        <div className="my-auto">
          <Loader />
        </div>
      ) : (
        msgDocs.map((msgDoc, index) => {
          const isReceiver = msgDoc.senderName === receiverName;

          return (
            <div
              key={msgDoc.$id}
              className={`relative p-3 rounded-lg my-2 text-sm break-words whitespace-pre-wrap overflow-auto max-w-[40%] flex-shrink-0 ${
                isReceiver
                  ? "self-start bg-off-white/90 text-dark-2"
                  : "self-end bg-primary-500 text-white/90"
              }`}
              style={{ width: "fit-content" }}
            >
              <p>{msgDoc.body}</p>
              {index === msgDocs.length - 1 && <div ref={lastMessageRef} />}
            </div>
          );
        })
      )}
    </div>
  );
};

const MessagesPage = () => {
  return (
    <div className="flex flex-1">
      {/* CHAT-BOX */}
      <MessagePanel />

      {/* RIGHT-SIDE CONVERSATIONS COMP. */}
      <ConversationsList />
    </div>
  );
};

const MessagesPageHeader = () => {
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
  // const { data: conversations, isPending: isLoadingConversations } =
  //   useGetRecentConversations(user.id);

  const { user } = useUserContext();

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

  /* Check if conversations should be shown:
      - Ensure conversations are not still loading and loading is either fail/success
      - Confirm that the conversations object is available
      - Check if there are documents in the conversations object
      - Ensure the search value is empty (i.e., no active search)
   */
  const showConversations =
    !isLoadingConversations &&
    conversations &&
    conversations.documents.length > 0 &&
    searchValue === "";

  /* Check if the empty state should be displayed:
      - Ensure conversations are not still loading and loading is either fail/success
      - Confirm that the conversations object is available
      - Check that there are NO documents in the conversations object
      - Ensure the search value is empty (i.e., the user has not typed anything to search)
  */
  const showEmptyBox =
    !isLoadingConversations &&
    conversations &&
    conversations.documents.length === 0 &&
    searchValue === "";

  function handleSetConvoDetails(
    activeConvoDocId: any,
    receiverDoc: Models.Document
  ) {
    setActiveConvoDocId(activeConvoDocId);

    const receiverDetails = {
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
        <MessagesPageHeader />

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
        ) : showEmptyBox ? (
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
                  <li
                    key={convo.$id}
                    onClick={() =>
                      handleSetConvoDetails(convo.$id, otherParticipant)
                    }
                  >
                    <FriendItem
                      name={otherParticipant.name}
                      showCursorPointer={true}
                      lastMessage={convo.lastMsgBody}
                      lastUpdated={multiFormatDateString(convo.lastUpdated)}
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

export default MessagesPage;
