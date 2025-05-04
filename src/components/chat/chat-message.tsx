import { Account, ImageDefinition } from "jazz-tools";
import { Message } from "@/lib/db/schema";
import { ProgressiveImg } from "jazz-react";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import { Components } from "react-markdown";
import { useEffect, useRef, useState } from "react";
import { resolveImageUrl } from "@/lib/lens/resolve-image-url";

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
  const myUsername = props.me.profile?.name;
  const messageRef = useRef<HTMLDivElement>(null);
  const hasMention = !fromMe && myUsername && props.msg.text ? new RegExp(`@${myUsername}\\b`, 'i').test(props.msg.text) : false;

  if (!sender) {
    return <UnreadableMessage />;
  }
  if (!props.me.canRead(props.msg)) {
    return <UnreadableMessage />;
  }

  const { name: senderName, picture: senderPicture } = sender;
  const { text: messageText, image: messageImage } = props.msg;
  const senderAvatar = resolveImageUrl(senderPicture);
  console.log(senderAvatar);

  return (
    <div
      ref={messageRef}
      className={`${fromMe ? "items-end" : "items-start"} flex flex-col m-3`}
      role="row"
    >
      <div className={`flex gap-2 w-full flex-row ${fromMe ? "flex-row-reverse items-end" : "flex-row items-start"} `}>
        <SenderAvatar picture={senderAvatar} name={senderName} fromMe={fromMe} />

        <div
          className={clsx(
            "line-clamp-10 text-ellipsis",
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
                  className="h-auto max-h-[20rem] max-w-full rounded-xl mb-0"
                  src={src}
                />
              )}
            </ProgressiveImg>
          )}
          <div className={`px-2 leading-relaxed prose-sm max-w-none ${fromMe ? "prose-invert dark:prose" : "prose dark:prose-invert"} 
            prose-blockquote:my-1 prose-blockquote:h-fit prose-blockquote:border-l-2 
            `}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize, rehypeHighlight]}
            // components={markdownComponents}
            >
              {messageText}
            </ReactMarkdown>
          </div>
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