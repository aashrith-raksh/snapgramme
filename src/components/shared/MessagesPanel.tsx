import FriendItem from "@/components/shared/FriendItem";
import Loader from "@/components/shared/Loader";
import { Input } from "@/components/ui/input";
import { useUserContext } from "@/contexts/AuthContext";
import { ConvoContext } from "@/contexts/ConvoContext";
import { createNewConversation } from "@/lib/appwrite/api";
import { useSendMessageMutation } from "@/lib/react-query/queriesAndMutations";
import {
  INewConversation,
  INewMessage,
  IUpdateConversation,
} from "@/lib/types";
import { ID } from "appwrite";
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
            <MessagesPanelDisplay />

            {/* MESSAGE INPUT */}
            <MessagesPanelInput />
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

const MessagesPanelInput = () => {
  const [message, setMessage] = useState("");
  const {
    activeConvoDocId,
    setActiveConvoDocId,
    receiverId,
    receiverName,
    setMsgDocs,
  } = useContext(ConvoContext);
  const { user, isAnonymous } = useUserContext();

  const { mutateAsync: sendMsg, isPending: isSendingMsg } =
    useSendMessageMutation();

  async function handleSendMessage() {
    // console.log("\n--------- handleSendMessage() ------------");
    if (message === "") return;

    setMessage("");

    let conversationId: string = activeConvoDocId;
    let newConversation = activeConvoDocId === "";

    if (newConversation) {
      const createConversation = async () => {
        const newConvoDetails: INewConversation = {
          conversationId: ID.unique(),
          participant1: user.id,
          participant2: receiverId,
          lastUpdated: new Date(),
        };
        const newConversation = await createNewConversation(newConvoDetails);
        return newConversation!.$id;
      };

      if (!isAnonymous) {
        conversationId = await createConversation();
        setActiveConvoDocId(conversationId);
      }
    }

    try {
      const msgData: INewMessage = {
        messageId: ID.unique(),
        body: message,
        createdAt: new Date(),
        senderId: user.id,
        conversationId,
      };

      const convoDataToUpdate: IUpdateConversation = {
        conversationId,
        lastMsgSenderName: isAnonymous ? "Anonymous" : user.name,
        lastMsgReceiverName: receiverName,
      };

      const newMessage = await sendMsg({
        msgData,
        convoDataToUpdate,
        isAnonymous,
      });

      if (newConversation) {
        setMsgDocs((prev) => [
          ...prev,
          {
            $id: newMessage!.$id,
            senderName: user.name,
            body: newMessage!.body,
          },
        ]);
      }

      if (isAnonymous) {
        setMsgDocs((prev) => [
          ...prev,
          {
            $id: newMessage!.$id,
            senderName: "Anonymous",
            body: newMessage!.body,
          },
        ]);
      }
    } catch (error) {
      if (error instanceof Error) {
        // console.log(error.message);
      }
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
          // onClick={() => isAnonymous ? handleSendMessageAnonymous() : handleSendMessage()}
          onClick={() => handleSendMessage()}
        >
          <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
        </svg>
      )}
    </div>
  );
};

const MessagesPanelDisplay = () => {
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

export default MessagePanel;
