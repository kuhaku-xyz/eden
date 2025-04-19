import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";

// Simplified Message interface for static display
interface Message {
  text: string;
  sender: string; // Can be username or 'System'
  timestamp?: Date | string; // Optional for static data
  isCurrentUser?: boolean; // Explicitly mark current user messages
}

// Removed currentUserSocketId and currentUserUsername props
interface MessagesProps {
  messages: Message[];
}

export function Messages({ messages }: MessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Keep formatTimestamp utility, but handle undefined timestamp
  const formatTimestamp = (timestamp?: Date | string) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Keep auto-scrolling effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Removed isCurrentUser function, rely on message.isCurrentUser

  // Static example messages if needed (or pass from parent)
  const exampleMessages: Message[] = [
    { sender: 'Alice', text: 'Hi everyone!', timestamp: new Date(Date.now() - 60000 * 5), isCurrentUser: false },
    { sender: 'Bob', text: 'Hey Alice! 👋', timestamp: new Date(Date.now() - 60000 * 4), isCurrentUser: true },
    { sender: 'Alice', text: 'Working on the new design.', timestamp: new Date(Date.now() - 60000 * 3), isCurrentUser: false },
    { sender: 'System', text: 'Charlie joined the room.', isCurrentUser: false }, // Timestamp might be omitted for system messages
    { sender: 'Charlie', text: 'Hello!', timestamp: new Date(Date.now() - 60000 * 1), isCurrentUser: false },
    { sender: 'Bob', text: 'Welcome Charlie!', timestamp: new Date(Date.now() - 60000 * 0.5), isCurrentUser: true },
  ];

  // Use exampleMessages if messages prop is empty, or always use exampleMessages for purely static view
  const displayMessages = messages.length > 0 ? messages : exampleMessages;

  return (
    <ScrollArea className="h-full w-full" type="auto">
      <div className="flex flex-col gap-2 p-4 pt-2 pb-2">
        {displayMessages.map((msg, index) => {
          const fromCurrentUser = !!msg.isCurrentUser; // Use the explicit flag
          const prevMessage = displayMessages[index - 1];
          // Show sender name if it's the first message, or if the sender is different from the previous one
          const showSender =
            msg.sender !== 'System' &&
            (index === 0 || prevMessage?.sender !== msg.sender || prevMessage?.sender === 'System');

          return (
            <div
              key={index} // Use index as key for static/example data
              className={`flex flex-col ${fromCurrentUser ? "items-end" : "items-start"}`}
            >
              {showSender && (
                <p className={`text-xs text-muted-foreground mb-0.5 ${fromCurrentUser ? 'mr-2' : 'ml-2'}`}>
                  {msg.sender}
                </p>
              )}
              <div
                className={`flex items-end gap-2 ${fromCurrentUser ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`p-2 px-3 rounded-lg max-w-[75%] ${fromCurrentUser
                    ? "bg-primary text-primary-foreground"
                    : msg.sender === 'System'
                      ? "bg-transparent text-muted-foreground italic text-center w-full max-w-full text-xs"
                      : "bg-muted"
                    }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
                {msg.sender !== 'System' && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
} 