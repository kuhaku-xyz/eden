"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, Send, Smile } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { id } from "@instantdb/react";
import { EmojiPicker } from "@ferrucc-io/emoji-picker";
import { Message } from "@/lib/db/schema";
import { createImage, useCoState } from "jazz-react";
import { Chat } from "@/lib/db/schema";
import { Account, ID } from "jazz-tools";
import { defaultValueCtx, Editor, editorViewCtx, rootCtx } from "@milkdown/kit/core";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { nord } from "@milkdown/theme-nord";
import "@milkdown/theme-nord/style.css";
import { getMarkdown, replaceAll } from "@milkdown/utils";
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";

const MilkdownStyles = () => (
  <style jsx global>{`
    .milkdown-editor-wrapper .milkdown {
      border: none;
      background: transparent;
      min-height: 2.5rem;
      padding: 0;
      font-family: inherit;
    }
    .milkdown-editor-wrapper .milkdown .editor {
      padding: 0;
      min-height: 2.5rem;
    }
    .milkdown-editor-wrapper .milkdown .ProseMirror {
      min-height: 2.5rem;
      padding: 0;
    }
    .milkdown-editor-wrapper .milkdown .ProseMirror:focus {
      outline: none;
      box-shadow: none;
    }
    /* Remove margins on heading elements */
    .milkdown-editor-wrapper .milkdown h1,
    .milkdown-editor-wrapper .milkdown h2,
    .milkdown-editor-wrapper .milkdown h3,
    .milkdown-editor-wrapper .milkdown h4,
    .milkdown-editor-wrapper .milkdown h5,
    .milkdown-editor-wrapper .milkdown h6 {
      margin: 0;
    }
    /* Remove additional padding on elements */
    .milkdown-editor-wrapper .milkdown p,
    .milkdown-editor-wrapper .milkdown ul,
    .milkdown-editor-wrapper .milkdown ol,
    .milkdown-editor-wrapper .milkdown blockquote {
      margin: 0;
      padding: 0;
    }
  `}</style>
);

type EditorRef = {
  getMarkdown: () => string;
  setMarkdown: (value: string) => void;
  focus: () => void;
};

const MilkdownEditor = React.forwardRef<
  EditorRef,
  {
    defaultValue?: string;
    onFocus?: () => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    onChange?: (markdown: string) => void;
  }
>((props, ref) => {
  const editorInfo = useEditor((root) => {
    return Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, props.defaultValue || "");
        ctx.get(listenerCtx).markdownUpdated((ctx, markdown, prevMarkdown) => {
          if (props.onChange) {
            props.onChange(markdown);
          }
        });
      })
      .config(nord)
      .use(commonmark)
      .use(listener);
  });

  const { get } = editorInfo;

  const handleLocalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
      return;
    }
  };

  React.useImperativeHandle(ref, () => ({
    getMarkdown: () => {
      const editor = get();
      if (editor) {
        try {
          const markdown = editor.action(getMarkdown());
          return String(markdown);
        } catch (error) {
          console.error("Error getting markdown:", error);
          return "";
        }
      }
      return "";
    },
    setMarkdown: (markdown: string) => {
      const editor = get();
      if (editor) {
        try {
          editor.action(replaceAll(markdown));
        } catch (error) {
          console.error("Error setting markdown:", error);
        }
      }
    },
    focus: () => {
      const view = get()?.ctx.get(editorViewCtx);
      if (view) {
        view.focus();
      }
    }
  }));

  return (
    <div
      className="w-full min-h-[2.5rem] px-1 py-1 rounded-lg milkdown-editor-wrapper"
      onClick={props.onFocus}
      onKeyDown={handleLocalKeyDown}
    >
      <Milkdown />
    </div>
  );
});

MilkdownEditor.displayName = "MilkdownEditor";

export function MessageInput(props: { chatID: ID<Chat> }) {
  const chat = useCoState(Chat, props.chatID, { resolve: { $each: true } });
  const [messageInput, setMessageInput] = useState("");
  const [currentMarkdown, setCurrentMarkdown] = useState(messageInput || "");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const editorRef = useRef<EditorRef>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEmojiSelect = (emoji: string) => {
    if (editorRef.current) {
      const currentMarkdownContent = editorRef.current.getMarkdown();
      const newMarkdownContent = currentMarkdownContent + emoji;
      editorRef.current.setMarkdown(newMarkdownContent);
    }
    setShowEmojiPicker(false);
    focusInput();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chat || !editorRef.current) return;

    const messageText = editorRef.current.getMarkdown().trim();
    if (!messageText) return;

    chat.push(Message.create({ text: messageText }, { owner: chat._owner }));

    setMessageInput("");
    editorRef.current.setMarkdown("");
    setTimeout(() => {
      editorRef.current?.focus();
    }, 0);
  };

  const sendImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];

    if (!file || !chat) return;

    if (file.size > 5000000) {
      alert("Please upload an image less than 5MB.");
      return;
    }

    createImage(file, { owner: chat._owner }).then((image) => {
      chat.push(Message.create({ text: file.name, image: image }, chat._owner));
    });
  };

  const focusInput = () => {
    editorRef.current?.focus();
    setIsFocused(true);
  };

  // Auto-focus the input on component mount
  useEffect(() => {
    setTimeout(() => {
      editorRef.current?.focus();
    }, 100);
    setIsFocused(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkdownChange = (markdown: string) => {
    setCurrentMarkdown(markdown);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (!e.shiftKey || e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSendMessage(e as any);
    } else if (e.key === "Escape") {
      setShowEmojiPicker(false);
    }
  };

  const formKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowEmojiPicker(false);
      e.preventDefault();
    }
  };

  if (!chat) {
    return (
      <div className="flex-1 flex justify-center items-center">Loading...</div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <MilkdownStyles />

      <form onSubmit={handleSendMessage} className="flex w-full items-center">
        <div
          className="relative w-full gap-2 shadow-lg rounded-2xl bg-background/80 backdrop-blur-lg flex flex-row"
          onKeyDown={formKeyDown}
        >
          <div className="flex-1 relative">
            <div className="relative w-full rounded-lg overflow-hidden ring-offset-background border border-border focus-within:border-transparent focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2 pr-16">
              <MilkdownProvider>
                <MilkdownEditor
                  ref={editorRef}
                  defaultValue={messageInput}
                  onFocus={focusInput}
                  onKeyDown={handleKeyDown}
                  onChange={handleMarkdownChange}
                />
              </MilkdownProvider>

              {/* Button container for both buttons */}
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {/* Emoji button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  ref={emojiButtonRef}
                  className="h-8 w-8 rounded-full p-0 hover:bg-accent"
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    if (!showEmojiPicker) {
                      focusInput();
                    }
                  }}
                >
                  <Smile className="h-4 w-4" />
                  <span className="sr-only">Insert emoji</span>
                </Button>

                {/* Send button */}
                <Button
                  type="submit"
                  disabled={!currentMarkdown.trim()}
                  title="Send Message"
                  className="h-9 w-9 rounded-lg p-0 aspect-square"
                  variant="default"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send Message</span>
                </Button>
              </div>
            </div>

            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute right-10 bottom-full mb-2 z-52 bg-popover rounded-md shadow-md"
              >
                <div className="w-80">
                  <EmojiPicker
                    className="border border-border rounded-lg"
                    emojisPerRow={12}
                    emojiSize={28}
                    onEmojiSelect={handleEmojiSelect}
                  >
                    <EmojiPicker.Header className="p-2 pb-0">
                      <EmojiPicker.Input
                        autoFocus={true}
                        className="focus:ring-0 ring-0 ring-transparent"
                      />
                    </EmojiPicker.Header>
                    <EmojiPicker.Group>
                      <EmojiPicker.List hideStickyHeader={true} containerHeight={400} />
                    </EmojiPicker.Group>
                  </EmojiPicker>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export function ImageInput({
  onImageChange,
}: { onImageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onUploadClick = () => {
    inputRef.current?.click();
  };

  return (
    <>
      <button
        type="button"
        aria-label="Send image"
        title="Send image"
        onClick={onUploadClick}
        className="text-stone-500 p-1.5 rounded-full hover:bg-stone-100 hover:text-stone-800 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition-colors"
      >
        <ImageIcon size={24} strokeWidth={1.5} />
      </button>

      <label className="sr-only">
        Image
        <input
          ref={inputRef}
          type="file"
          accept="image/png, image/jpeg, image/gif"
          onChange={onImageChange}
        />
      </label>
    </>
  );
}
