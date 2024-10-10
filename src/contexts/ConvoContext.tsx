import { appwriteConfig, client } from "@/lib/appwrite/config";
import {
  useGetConversationMessages,
  useGetRecentConversations,
} from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import React, { ReactNode, createContext, useEffect, useState } from "react";
import { useUserContext } from "./AuthContext";

function showReceiverDetails(
  receiverName: any,
  receiverImageURL: any,
  activeConvoDocId: any
) {
  console.log(
    `Receiver Details:\n- Name: ${receiverName}\n- Image URL: ${receiverImageURL}\n- Active Conversation ID: ${activeConvoDocId}`
  );
}

const INITIAL_CONVO_CONTEXT: IConversationType = {
  activeConvoDocId: "",
  receiverName: "",
  receiverId: "",
  receiverImageURL: "",
  setActiveConvoDocId: () => {},
  setReceiverDetails: () => {},
  msgDocs: [], //message documents related to currently active conversation
  isLoadingMsgs: true,
  conversations: undefined,
  isLoadingConversations: true,
};

type IConversationType = {
  activeConvoDocId: string;
  receiverName: string;
  receiverImageURL: string;
  receiverId: string;
  setActiveConvoDocId: React.Dispatch<React.SetStateAction<string>>;
  setReceiverDetails: React.Dispatch<
    React.SetStateAction<{
      receiverName: string;
      receiverImageURL: string;
      receiverId: string;
    }>
  >;

  msgDocs: Models.Document[];
  isLoadingMsgs: boolean;
  conversations?: Models.DocumentList<Models.Document> | undefined;
  isLoadingConversations: boolean;
};

export const ConvoContext = createContext<IConversationType>(
  INITIAL_CONVO_CONTEXT
);

const ConvoProvider = ({ children }: { children: ReactNode }) => {
  const [activeConvoDocId, setActiveConvoDocId] = useState<string>("");
  const [receiverDetails, setReceiverDetails] = useState<{
    receiverName: string;
    receiverImageURL: string;
    receiverId: string;
  }>({ receiverName: "", receiverImageURL: "", receiverId: "" });

  const { user } = useUserContext();

  const [msgDocs, setMsgDocs] = useState<any[]>([]);
  const {
    data: convoMessages,
    isPending: isLoadingMsgs,
  } = useGetConversationMessages(activeConvoDocId);

  const { data: conversations, isPending: isLoadingConversations } =
    useGetRecentConversations(user.id);

  let { receiverName, receiverImageURL, receiverId } = receiverDetails;

  // To set msgDocs when convoMessages are loaded
  useEffect(() => {
    if (convoMessages?.documents) {
      const modifiedMsgDocs = [
        ...convoMessages.documents.map((doc) => {
          return {
            $id: doc.$id,
            senderName: doc.senderId.name,
            body: doc.body,
          };
        }),
      ];
      setMsgDocs(modifiedMsgDocs);
    }
  }, [convoMessages]);

  // To subscribe to existing conversations and listen to realtime events
  useEffect(() => {
    if (!conversations || !activeConvoDocId) return;

    // Subscribe to each conversation's document
    const unsubscribeFunctions = conversations.documents.map((convo) => {
      return client.subscribe(
        `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.conversationsCollectionId}.documents.${convo.$id}`,
        (response) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.update"
            )
          ) {
            // console.log("============== REALTIME CONVO UPDATED:",response)
            // @ts-ignore
            const updatedConversation: Models.Document = response.payload;

            if (updatedConversation.$id === activeConvoDocId) {
              // setMsgDocs(prev => prev.push(updatedConversation.lastMessageId))
              console.log("RESPSONSE: ", response);
              console.log("Conversation updated: ", updatedConversation);

              setMsgDocs((prev) => [
                ...prev,
                {
                  $id: updatedConversation.lastMsgIdString,
                  senderName: updatedConversation.lastMsgSenderName,
                  body: updatedConversation.lastMsgBody,
                },
              ]);
            }
          }
        }
      );
    });

    // Cleanup function to unsubscribe
    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  }, [conversations, activeConvoDocId]);

  const value = {
    receiverName,
    receiverImageURL,
    receiverId,
    activeConvoDocId,
    setActiveConvoDocId,
    setReceiverDetails,
    msgDocs,
    isLoadingMsgs,
    conversations,
    isLoadingConversations,
  };

  return (
    <ConvoContext.Provider value={value}>{children}</ConvoContext.Provider>
  );
};

export default ConvoProvider;

// export const useConvoContext = () => useContext<>(ConvoContext)
