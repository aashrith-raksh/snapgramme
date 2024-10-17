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
  setMsgDocs: React.Dispatch<React.SetStateAction<IMessageDoc[]>>;

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

export interface IMessageDoc {
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
  setMsgDocs: () => {},
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

  const { user, isAnonymous } = useUserContext();

  const { data: convoMessages, isPending: isLoadingMsgs, isSuccess:msgsLoadingSuccess } =
    useGetConversationMessages(activeConvoDocId);

  const {
    data: conversationsObj,
    isPending: isLoadingConversations,
    isSuccess:conversationLoadingSuccess,
    refetch: refetchConverstions,
  } = useGetRecentConversations(user.id);

  const [msgDocs, setMsgDocs] = useState<IMessageDoc[]>([]);
  const [conversations, setConversations] = useState<ILoadedConversations[]>(
    []
  );

  let { receiverName, receiverImageURL, receiverId } = receiverDetails;

  // SET MsgDocs
  useEffect(() => {
    // console.log("\n======== msgDocs EFFECT =========");

    if (isLoadingMsgs) {
      // console.log("\tConvoMessages still loading... returning early.");
      return;
    }

    if(msgsLoadingSuccess && !convoMessages?.documents){
      // console.log("\tDone loading msgs, no msgs found. Returning early")
      return;
    }

    // console.log(
    //   "\tconvoMessages is available with documents:",
    //   convoMessages?.documents
    // );

    if (convoMessages?.documents) {
      const modifiedMsgDocs: any = [];

      convoMessages.documents.forEach((doc) => {
        modifiedMsgDocs.unshift({
          $id: doc.$id,
          senderName: isAnonymous ? "Anonymous" : doc.senderId.name,
          body: doc.body,
        });
      });
      // console.log("\tMapped msgDocs:", modifiedMsgDocs);

      setMsgDocs(modifiedMsgDocs);

      // console.log("\tmsgDocs state updated");
    }
  }, [convoMessages, activeConvoDocId]);

  /* SET EXISTING CONVERSATIONS OF CURRENT USER
    To set conversations when conversationObj is available
    Runs only once when mounted because, the user.id doesn't 
    change until the next login
  */
  useEffect(() => {
    // console.log("\n============ conversationsObj EFFECT ===========");

    if (isLoadingConversations) {
      // console.log("\tConversationsObj still loading, returning early.");
      return;
    }

    if(conversationLoadingSuccess && !conversationsObj?.documents){
      // console.log("\tDone loading conversatins, no existing conversations found. Returning early")
      return;
    }

    // console.log(
    //   "\tconversationsObj is available with documents:",
    //   conversationsObj?.documents
    // );

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

    // console.log("\tMapped conversations:", conversations);

    setConversations(conversations);

    // console.log("\tConversations state updated.");
  }, [conversationsObj]);

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
            ) ||
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            console.log("============== REALTIME CONVO UPDATED:", response);
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

  /* SET REALTIME SUBSCRIPTION FOR FETCHING NEW CONVERSATIONS
      To subscribe to conversations collection and listen to 
      any new conversations that are added, so that conversations can 
      be refetched again
  */
  useEffect(() => {
    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.conversationsCollectionId}.documents`,
      (response) => {
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.create"
          )
        ) {
          console.log("\t> Refetching existing conversations...\n");
          refetchConverstions();
        }
      }
    );

    // Cleanup function to unsubscribe
    return () => {
      unsubscribe();
    };
  }, []); // Include any dependencies here if needed

  const value = {
    receiverName,
    receiverImageURL,
    receiverId,
    activeConvoDocId,
    setActiveConvoDocId,
    setReceiverDetails,
    setMsgDocs,
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
