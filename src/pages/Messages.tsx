import ConversationsList from "@/components/shared/ConversationsList";
import MessagePanel from "@/components/shared/MessagesPanel";

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

export default MessagesPage;
