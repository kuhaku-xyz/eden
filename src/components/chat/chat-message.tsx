import { Account, ImageDefinition } from "jazz-tools";
import { Message } from "@/lib/db/schema";
import { ProgressiveImg } from "jazz-react";
import clsx from "clsx";

interface SenderAvatarProps {
  picture?: string;
  name?: string;
  fromMe: boolean;
}

function SenderAvatar({ picture, name, fromMe }: SenderAvatarProps) {
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
      {picture ? (
        <img src={picture} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <div className={`w-full h-full ${fromMe ? "bg-primary" : "bg-secondary"} flex items-center justify-center ${fromMe ? "text-primary-foreground" : "text-secondary-foreground"}`}>
          {name?.[0]?.toUpperCase() || '?'}
        </div>
      )}
    </div>
  );
}

export function ChatMessage(props: { me: Account; msg: Message }) {
  const lastEdit = props.msg._edits.text;
  const fromMe = lastEdit.by?.isMe ?? false;
  const sender = lastEdit.by?.profile

  if (!sender) {
    return <UnreadableMessage />;
  }
  if (!props.me.canRead(props.msg)) {
    return <UnreadableMessage />;
  }

  const { name: senderName, picture: senderPicture } = sender;
  const { text: messageText, image: messageImage } = props.msg;

  return (
    <div className={`${fromMe ? "items-end" : "items-start"} flex flex-col m-3`} role="row">
      <div className={`flex gap-2 w-full flex-row ${fromMe ? "flex-row-reverse items-end" : "flex-row items-start"} `}>
        <SenderAvatar picture={senderPicture} name={senderName} fromMe={fromMe} />

        <div
          className={clsx(
            "line-clamp-10 text-ellipsis whitespace-pre-wrap",
            "rounded-2xl overflow-hidden max-w-[calc(100%-5rem)] shadow-sm p-0.5",
            fromMe
              ? "bg-primary/90 text-primary-foreground"
              : "bg-secondary/80 text-secondary-foreground",
          )}
        >
          {messageImage && (
            <ProgressiveImg image={messageImage}>
              {({ src }) => (
                <img
                  className="h-auto max-h-[20rem] max-w-full rounded-t-xl mb-1"
                  src={src}
                />
              )}
            </ProgressiveImg>
          )}
          <p className="px-2 leading-relaxed">
            {messageText}
          </p>
        </div>
      </div>

      <div className="text-xs text-neutral-500 mt-1.5">
        {senderName} · {lastEdit.madeAt.toLocaleTimeString()}
      </div>
    </div>
  );
}

export function UnreadableMessage() {
  return (
    <div className={`items-start flex flex-col m-3`} role="row">
      <div
        className={clsx(
          "line-clamp-10 text-ellipsis whitespace-pre-wrap",
          "rounded-2xl overflow-hidden max-w-[calc(100%-5rem)] shadow-sm p-1",
          "bg-secondary/80 text-secondary-foreground",
        )}
      >
        <p className="px-2 leading-relaxed text-gray-500 italic">
          Message not readable
        </p>
      </div>
    </div>
  );
}