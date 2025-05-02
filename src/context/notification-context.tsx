"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type NotificationContextType = {
  mentions: string[];
  hasMentions: boolean;
  addMention: (messageId: string) => void;
  markMentionAsSeen: (messageId: string) => void;
  clearAllMentions: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [mentions, setMentions] = useState<string[]>([]);
  const [originalTitle, setOriginalTitle] = useState<string>('');

  // Save original document title on mount
  useEffect(() => {
    setOriginalTitle(document.title);
  }, []);

  // Update title when mentions change
  useEffect(() => {
    if (mentions.length > 0) {
      document.title = `• ${originalTitle}`;
    } else {
      if (originalTitle) {
        document.title = originalTitle;
      }
    }
  }, [mentions, originalTitle]);

  const addMention = (messageId: string) => {
    setMentions(prev => {
      if (!prev.includes(messageId)) {
        return [...prev, messageId];
      }
      return prev;
    });
  };

  const markMentionAsSeen = (messageId: string) => {
    setMentions(prev => prev.filter(id => id !== messageId));
  };

  const clearAllMentions = () => {
    setMentions([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        mentions,
        hasMentions: mentions.length > 0,
        addMention,
        markMentionAsSeen,
        clearAllMentions
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
} 