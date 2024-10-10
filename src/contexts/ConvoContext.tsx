import { appwriteConfig, client } from "@/lib/appwrite/config";
import {
  useGetConversationMessages,
  useGetRecentConversations,
} from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import React, { ReactNode, createContext, useEffect, useState } from "react";
import { useUserContext } from "./AuthContext";
import { multiFormatDateString } from "@/lib/utils";

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
  conversations?: any[];
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
  const [conversations, setConversations] = useState<any[]>([]);
  const { data: convoMessages, isPending: isLoadingMsgs } =
    useGetConversationMessages(activeConvoDocId);

  const {
    data: conversationsObj,
    isPending: isLoadingConversations,
  } = useGetRecentConversations(user.id);

  let { receiverName, receiverImageURL, receiverId } = receiverDetails;

  // To set msgDocs when convoMessages are loaded
  useEffect(() => {
    if (convoMessages?.documents) {
      // const modifiedMsgDocs = [
      //   ...convoMessages.documents.map((doc) => {
      //     return {
      //       $id: doc.$id,
      //       senderName: doc.senderId.name,
      //       body: doc.body,
      //     };
      //   }),
      // ];

      const modifiedMsgDocs: any = [];

      convoMessages.documents.forEach((doc) => {
        modifiedMsgDocs.unshift({
          $id: doc.$id,
          senderName: doc.senderId.name,
          body: doc.body,
        });
      });
      setMsgDocs(modifiedMsgDocs);
    }
  }, [convoMessages]);

  // To subscribe to existing conversations and listen to realtime events
  useEffect(() => {
    if (!conversationsObj?.documents || !activeConvoDocId) return;

    // Subscribe to each conversation's document
    const unsubscribeFunctions = conversationsObj.documents.map((convo) => {
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
              // console.log("RESPSONSE: ", response);
              // console.log("Conversation updated: ", updatedConversation);

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
  }, [conversationsObj, activeConvoDocId]);

  // To set convoDoc when they are available
  useEffect(() => {
    if (!conversationsObj?.documents) return;

    const conversations = conversationsObj?.documents
      ? [
          ...conversationsObj?.documents.map((convo) => {
            const otherParticipant =
              convo.participant1.$id === user.id
                ? convo.participant2
                : convo.participant1;

            return {
              otherParticipant,
              $id: convo.$id,
              lastMessage: convo.lastMsgBody,
              lastUpdated: multiFormatDateString(convo.lastUpdated),
            };
          }),
        ]
      : [];

    setConversations(conversations);
  }, [conversationsObj]);

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
