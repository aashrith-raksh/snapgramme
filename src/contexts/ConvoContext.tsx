import { appwriteConfig, client } from "@/lib/appwrite/config";
import {
  useGetConversationMessages,
  useGetRecentConversations,
} from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import React, { ReactNode, createContext, useEffect, useState } from "react";
import { useUserContext } from "./AuthContext";
import { multiFormatDateString } from "@/lib/utils";

// @ts-ignore
function showReceiverDetails(
  receiverName: any,
  receiverImageURL: any,
  activeConvoDocId: any
) {
  console.log(
    `Receiver Details:\n- Name: ${receiverName}\n- Image URL: ${receiverImageURL}\n- Active Conversation ID: ${activeConvoDocId}`
  );
}

// =============== TYPES ================
type IConvoContextType = {
  activeConvoDocId: string;
  receiverName: string;
  receiverImageURL: string;
  receiverId: string;
  setActiveConvoDocId: React.Dispatch<React.SetStateAction<string>>;
  setReceiverDetails: React.Dispatch<React.SetStateAction<IReceiverDetails>>;

  msgDocs: IMessageDoc[];
  isLoadingMsgs: boolean;
  conversations?: ILoadedConversations[];
  isLoadingConversations: boolean;
};

export interface IReceiverDetails {
  receiverName: string;
  receiverImageURL: string;
  receiverId: string;
}

export interface ILoadedConversations {
  otherParticipant: Models.Document;
  $id: string;
  lastMessage: string;
  lastUpdated: string;
}

interface IMessageDoc {
  $id: string;
  senderName: string;
  body: string;
}
// ======================================

const INITIAL_CONVO_CONTEXT: IConvoContextType = {
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

export const ConvoContext = createContext<IConvoContextType>(
  INITIAL_CONVO_CONTEXT
);

const ConvoProvider = ({ children }: { children: ReactNode }) => {
  const [activeConvoDocId, setActiveConvoDocId] = useState<string>("");
  const [receiverDetails, setReceiverDetails] = useState<IReceiverDetails>({
    receiverName: "",
    receiverImageURL: "",
    receiverId: "",
  });

  const { user } = useUserContext();

  const { data: convoMessages, isPending: isLoadingMsgs } =
    useGetConversationMessages(activeConvoDocId);

  const { data: conversationsObj, isPending: isLoadingConversations } =
    useGetRecentConversations(user.id);

  const [msgDocs, setMsgDocs] = useState<IMessageDoc[]>([]);
  const [conversations, setConversations] = useState<ILoadedConversations[]>(
    []
  );

  let { receiverName, receiverImageURL, receiverId } = receiverDetails;

  // SET MsgDocs
  useEffect(() => {
    console.log("useEffect ran for msgDocs");

    if (!convoMessages?.documents) {
      console.log("No convoMessages found, returning early.");
      return;
    }

    console.log(
      "convoMessages is available with documents:",
      convoMessages?.documents
    );

    if (convoMessages?.documents) {
      const modifiedMsgDocs: any = [];

      convoMessages.documents.forEach((doc) => {
        modifiedMsgDocs.unshift({
          $id: doc.$id,
          senderName: doc.senderId.name,
          body: doc.body,
        });
      });
      console.log("Mapped msgDocs:", modifiedMsgDocs);

      setMsgDocs(modifiedMsgDocs);

      console.log("msgDocs state updated");
    }
  }, [convoMessages]);

  /* SET REALTIME SUBSCRIPTION
      To subscribe to existing conversations and listen to realtime events
  */
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

  /* SET CONVERSATIONS
    To set conversations when conversationObj is available
  */
  useEffect(() => {
    console.log("useEffect ran for conversationsObj");

    if (!conversationsObj?.documents) {
      console.log("No conversationsObj or documents found, returning early.");
      return;
    }

    console.log(
      "conversationsObj is available with documents:",
      conversationsObj?.documents
    );

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

    console.log("Mapped conversations:", conversations);

    setConversations(conversations);

    console.log("Conversations state updated.");
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
