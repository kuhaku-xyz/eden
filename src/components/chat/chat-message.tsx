import { Account, ImageDefinition } from "jazz-tools";
import { Message } from "@/lib/db/schema";
import { ProgressiveImg } from "jazz-react";
import clsx from "clsx";

export function ChatMessage(props: { me: Account; msg: Message }) {
  if (!props.me.canRead(props.msg)) {
    return (
      <BubbleContainer fromMe={false}>
        <BubbleBody fromMe={false}>
          <BubbleText
            text="Message not readable"
            className="text-gray-500 italic"
          />
        </BubbleBody>
      </BubbleContainer>
    );
  }

  const lastEdit = props.msg._edits.text;
  const fromMe = lastEdit.by?.isMe;
  const { text, image } = props.msg;

  return (
    <BubbleContainer fromMe={fromMe}>
      <BubbleBody fromMe={fromMe}>
        {image && <BubbleImage image={image} />}
        <BubbleText text={text} />
      </BubbleBody>
      <BubbleInfo by={lastEdit.by?.profile?.name} madeAt={lastEdit.madeAt} />
    </BubbleContainer>
  );
}

export function BubbleContainer(props: {
  children: React.ReactNode;
  fromMe: boolean | undefined;
}) {
  const align = props.fromMe ? "items-end" : "items-start";
  return (
    <div className={`${align} flex flex-col m-3`} role="row">
      {props.children}
    </div>
  );
}

export function BubbleBody(props: {
  children: React.ReactNode;
  fromMe: boolean | undefined;
}) {
  return (
    <div
      className={clsx(
        "line-clamp-10 text-ellipsis whitespace-pre-wrap",
        "rounded-2xl overflow-hidden max-w-[calc(100%-5rem)] shadow-sm p-1",
        props.fromMe
          ? "bg-primary/90 text-primary-foreground"
          : "bg-secondary/80 text-secondary-foreground",
      )}
    >
      {props.children}
    </div>
  );
}

export function BubbleText(props: { text: string; className?: string }) {
  return (
    <p className={clsx("px-2 leading-relaxed", props.className)}>
      {props.text}
    </p>
  );
}

export function BubbleImage(props: { image: ImageDefinition }) {
  return (
    <ProgressiveImg image={props.image}>
      {({ src }) => (
        <img
          className="h-auto max-h-[20rem] max-w-full rounded-t-xl mb-1"
          src={src}
        />
      )}
    </ProgressiveImg>
  );
}

export function BubbleInfo(props: { by: string | undefined; madeAt: Date }) {
  return (
    <div className="text-xs text-neutral-500 mt-1.5">
      {props.by} · {props.madeAt.toLocaleTimeString()}
    </div>
  );
}