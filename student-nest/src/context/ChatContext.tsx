'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth, UserProfile } from './AuthContext';
import {
  apiGetConversations,
  apiGetMessages,
  apiSendMessage,
  apiInitiateChat,
  ApiConversation,
  ApiChatMessage,
} from '../lib/api';
import {
  subscribeToMessages,
  sendRealtimeMessage,
  isFirebaseActive,
} from '../lib/firebase';

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'owner' | 'admin';
  text: string;
  timestamp: string;
  isRead?: boolean;
}

export interface ChatThread {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerRole: 'student' | 'owner' | 'admin';
  partnerAvatar: string;
  propertyTitle?: string;
  propertyPrice?: number;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
}

interface ChatContextType {
  threads: ChatThread[];
  activeThread: ChatThread | null;
  activeMessages: ChatMessage[];
  isChatOpen: boolean;
  totalUnread: number;
  isFirebaseConnected: boolean;
  openChat: (
    threadId?: string,
    listingContext?: { id: string; title: string; price: number; hostName: string; hostAvatar: string; hostId?: string },
    partnerContext?: { partnerId: string; partnerName: string; partnerRole: 'student' | 'owner'; partnerAvatar?: string; initialMessage?: string },
  ) => void;
  closeChat: () => void;
  selectThread: (threadId: string) => void;
  sendMessage: (text: string) => void;
  refreshMessages: () => void;
}

export function getDefaultThreadsForUser(currentUser: UserProfile | null): ChatThread[] {
  if (currentUser?.role === 'owner') {
    return [
      {
        id: 'thread-eleanor-vance',
        partnerId: 'usr-student-demo',
        partnerName: 'Julian Chen',
        partnerRole: 'student',
        partnerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        propertyTitle: 'The Harvard Loft — Sunlit Designer Studio',
        propertyPrice: 18500,
        lastMessage: 'Hi Eleanor, I am starting my fellowship in September. Is the loft quiet during finals week?',
        lastTimestamp: '10:35 AM',
        unreadCount: 1,
      },
    ];
  }

  return [
    {
      id: 'thread-eleanor-vance',
      partnerId: 'usr-owner-demo',
      partnerName: 'Eleanor Vance',
      partnerRole: 'owner',
      partnerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      propertyTitle: 'The Harvard Loft — Sunlit Designer Studio',
      propertyPrice: 18500,
      lastMessage: 'Yes, 1Gbps fiber and standing desk are all set up for Fall scholars!',
      lastTimestamp: '10:42 AM',
      unreadCount: 1,
    },
    {
      id: 'thread-rajesh-mehta',
      partnerId: 'owner-rajesh-02',
      partnerName: 'Rajesh Mehta',
      partnerRole: 'owner',
      partnerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      propertyTitle: 'Modern Student Studio near Metro & Campus',
      propertyPrice: 12000,
      lastMessage: 'Electricity and high-speed Wi-Fi are fully included in the monthly rent.',
      lastTimestamp: 'Yesterday',
      unreadCount: 0,
    },
  ];
}

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'thread-eleanor-vance': [
    {
      id: 'm1',
      threadId: 'thread-eleanor-vance',
      senderId: 'usr-student-demo',
      senderName: 'Julian Chen',
      senderRole: 'student',
      text: 'Hi Eleanor, I am starting my fellowship in September. Is the loft quiet during finals week?',
      timestamp: '10:35 AM',
    },
    {
      id: 'm2',
      threadId: 'thread-eleanor-vance',
      senderId: 'usr-owner-demo',
      senderName: 'Eleanor Vance',
      senderRole: 'owner',
      text: 'Hello Julian! Absolutely. The windows are acoustic double-glazed sash windows, and we enforce quiet hours from 10 PM.',
      timestamp: '10:38 AM',
    },
    {
      id: 'm3',
      threadId: 'thread-eleanor-vance',
      senderId: 'usr-owner-demo',
      senderName: 'Eleanor Vance',
      senderRole: 'owner',
      text: 'Yes, 1Gbps fiber and standing desk are all set up for Fall scholars!',
      timestamp: '10:42 AM',
    },
  ],
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, tokens } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>(() => getDefaultThreadsForUser(null));
  const [activeThreadId, setActiveThreadId] = useState<string>('thread-eleanor-vance');
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Helper to update and persist messages to localStorage
  const saveMessages = useCallback((updater: (prev: Record<string, ChatMessage[]>) => Record<string, ChatMessage[]>) => {
    setMessagesMap((prev) => {
      const next = updater(prev);
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('studentnest_chat_messages', JSON.stringify(next));
        }
      } catch {}
      return next;
    });
  }, []);

  // Helper to update and persist threads to localStorage keyed per user
  const saveThreads = useCallback((updater: (prev: ChatThread[]) => ChatThread[]) => {
    setThreads((prev) => {
      const next = updater(prev);
      try {
        if (typeof window !== 'undefined') {
          const userStorageKey = `studentnest_chat_threads_${user?.id || 'guest'}`;
          localStorage.setItem(userStorageKey, JSON.stringify(next));
          localStorage.setItem('studentnest_chat_threads', JSON.stringify(next));
        }
      } catch {}
      return next;
    });
  }, [user?.id]);

  // Restore persisted chat state and adapt threads on user change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedMsgs = localStorage.getItem('studentnest_chat_messages');
        if (savedMsgs) {
          const parsed = JSON.parse(savedMsgs);
          setMessagesMap((prev) => ({ ...prev, ...parsed }));
        }

        const userStorageKey = `studentnest_chat_threads_${user?.id || 'guest'}`;
        const savedUserThreads = localStorage.getItem(userStorageKey);
        if (savedUserThreads) {
          const parsed = JSON.parse(savedUserThreads);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setThreads(parsed);
            if (!parsed.some(t => t.id === activeThreadId)) {
              setActiveThreadId(parsed[0].id);
            }
            return;
          }
        }

        // Initialize default threads for this user role
        const defaults = getDefaultThreadsForUser(user);
        setThreads(defaults);
        setActiveThreadId(defaults[0].id);
        localStorage.setItem(userStorageKey, JSON.stringify(defaults));
      }
    } catch (e) {
      console.error('Error syncing chat for user:', e);
    }
  }, [user?.id, user?.role]);

  // Fetch threads from backend
  const fetchConversations = useCallback(async () => {
    if (!tokens?.accessToken) return;
    try {
      const serverConvs = await apiGetConversations(tokens.accessToken);
      if (serverConvs.length > 0) {
        const mappedThreads: ChatThread[] = serverConvs.map((c: ApiConversation) => ({
          id: c.id,
          partnerId: c.partnerId,
          partnerName: c.partnerName,
          partnerRole: c.partnerRole,
          partnerAvatar: c.partnerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          propertyTitle: c.propertyTitle,
          propertyPrice: c.propertyPrice,
          lastMessage: c.lastMessage,
          lastTimestamp: new Date(c.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unreadCount: c.unreadCount || 0,
        }));
        saveThreads(() => mappedThreads);
        if (!activeThreadId || !mappedThreads.some(t => t.id === activeThreadId)) {
          setActiveThreadId(mappedThreads[0].id);
        }
      }
    } catch {
      // Keep existing demo threads
    }
  }, [tokens?.accessToken, activeThreadId, saveThreads]);

  // Fetch messages for active thread
  const fetchActiveMessages = useCallback(async (threadId: string) => {
    if (!tokens?.accessToken || !threadId) return;
    try {
      const msgs = await apiGetMessages(tokens.accessToken, threadId);
      if (msgs.length > 0) {
        saveMessages((prev) => ({
          ...prev,
          [threadId]: msgs.map((m: ApiChatMessage) => ({
            id: m.id,
            threadId: m.threadId,
            senderId: m.senderId,
            senderName: m.senderName,
            senderRole: m.senderRole,
            text: m.text,
            timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: m.isRead,
          })),
        }));
      }
    } catch {
      // Retain in-memory messages
    }
  }, [tokens?.accessToken, saveMessages]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load messages when active thread changes
  useEffect(() => {
    if (activeThreadId) {
      fetchActiveMessages(activeThreadId);
    }
  }, [activeThreadId, fetchActiveMessages]);

  // Real-Time Firebase Cloud Firestore subscription on active thread
  useEffect(() => {
    if (!activeThreadId) return;

    const unsubscribe = subscribeToMessages(activeThreadId, (newMsg) => {
      saveMessages((prev) => {
        const existing = prev[activeThreadId] || [];

        // Exact ID deduplication
        if (existing.some((m) => m.id === newMsg.id)) {
          return prev;
        }

        // Optimistic message deduplication (same sender, same text, within 6 seconds)
        const optIndex = existing.findIndex(
          (m) =>
            m.senderId === newMsg.senderId &&
            m.text === newMsg.text &&
            Math.abs(new Date(m.timestamp).getTime() - new Date(newMsg.timestamp).getTime()) < 6000,
        );

        if (optIndex !== -1) {
          const updated = [...existing];
          updated[optIndex] = newMsg;
          return {
            ...prev,
            [activeThreadId]: updated,
          };
        }

        return {
          ...prev,
          [activeThreadId]: [...existing, newMsg],
        };
      });

      saveThreads((prev) => {
        const exists = prev.some((t) => t.id === activeThreadId);
        if (exists) {
          return prev.map((t) =>
            t.id === activeThreadId
              ? {
                  ...t,
                  lastMessage: newMsg.text,
                  lastTimestamp: newMsg.timestamp,
                  unreadCount: isChatOpen ? 0 : t.unreadCount + 1,
                }
              : t,
          );
        }

        // Dynamically synthesize thread if new conversation arrives
        const partnerRole = newMsg.senderRole === 'student' ? 'student' : 'owner';
        const synthThread: ChatThread = {
          id: activeThreadId,
          partnerId: newMsg.senderId,
          partnerName: newMsg.senderName,
          partnerRole: partnerRole,
          partnerAvatar: partnerRole === 'owner'
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          propertyTitle: 'Scholar Inquiry',
          lastMessage: newMsg.text,
          lastTimestamp: newMsg.timestamp,
          unreadCount: isChatOpen ? 0 : 1,
        };
        return [synthThread, ...prev];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [activeThreadId, isChatOpen, saveMessages, saveThreads]);

  const openChat = async (
    threadId?: string,
    listingContext?: { id: string; title: string; price: number; hostName: string; hostAvatar: string; hostId?: string },
    partnerContext?: { partnerId: string; partnerName: string; partnerRole: 'student' | 'owner'; partnerAvatar?: string; initialMessage?: string },
  ) => {
    if (listingContext) {
      const hostId = listingContext.hostId || (listingContext.hostName?.includes('Eleanor') ? 'usr-owner-demo' : `owner-${Date.now()}`);
      const existingThread = threads.find((t) => t.partnerId === hostId || t.partnerName === listingContext.hostName);
      if (existingThread) {
        setActiveThreadId(existingThread.id);
      } else {
        const newThreadId = `thread-${hostId}-${Date.now()}`;
        const newThread: ChatThread = {
          id: newThreadId,
          partnerId: hostId,
          partnerName: listingContext.hostName,
          partnerRole: 'owner',
          partnerAvatar: listingContext.hostAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          propertyTitle: listingContext.title,
          propertyPrice: listingContext.price,
          lastMessage: 'Conversation started',
          lastTimestamp: 'Just now',
          unreadCount: 0,
        };
        saveThreads((prev) => [newThread, ...prev]);
        setActiveThreadId(newThreadId);

        // Initiate on backend if logged in
        if (tokens?.accessToken) {
          apiInitiateChat(tokens.accessToken, {
            recipientId: hostId,
            listingId: listingContext.id,
            initialMessage: `Hi ${listingContext.hostName}, I am inquiring about "${listingContext.title}".`,
          });
        }
      }
    } else if (partnerContext) {
      const existingThread = threads.find((t) => t.partnerId === partnerContext.partnerId || t.partnerName === partnerContext.partnerName);
      if (existingThread) {
        setActiveThreadId(existingThread.id);
      } else {
        const newThreadId = `thread-partner-${Date.now()}`;
        const newThread: ChatThread = {
          id: newThreadId,
          partnerId: partnerContext.partnerId,
          partnerName: partnerContext.partnerName,
          partnerRole: partnerContext.partnerRole,
          partnerAvatar: partnerContext.partnerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          lastMessage: partnerContext.initialMessage || 'Connected via Roommate Finder',
          lastTimestamp: 'Just now',
          unreadCount: 0,
        };
        saveThreads((prev) => [newThread, ...prev]);
        setActiveThreadId(newThreadId);

        if (tokens?.accessToken) {
          apiInitiateChat(tokens.accessToken, {
            recipientId: partnerContext.partnerId,
            initialMessage: partnerContext.initialMessage || `Hi ${partnerContext.partnerName}! We matched on StudentNest.`,
          });
        }
      }
    } else if (threadId) {
      setActiveThreadId(threadId);
    }
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const selectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    saveThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t)),
    );
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || !activeThreadId) return;

    const currentSender = user || {
      id: 'usr-student-demo',
      name: 'Julian Chen',
      role: 'student' as const,
    };

    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newMsg: ChatMessage = {
      id: msgId,
      threadId: activeThreadId,
      senderId: currentSender.id,
      senderName: currentSender.name,
      senderRole: currentSender.role,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Optimistic local update with localStorage persistence
    saveMessages((prev) => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), newMsg],
    }));

    saveThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? { ...t, lastMessage: newMsg.text, lastTimestamp: newMsg.timestamp, unreadCount: 0 }
          : t,
      ),
    );

    // Call backend API if authenticated
    if (tokens?.accessToken) {
      const activeT = threads.find((t) => t.id === activeThreadId);
      apiSendMessage(tokens.accessToken, {
        conversationId: activeThreadId.startsWith('thread-') ? undefined : activeThreadId,
        receiverId: activeT?.partnerId,
        content: text.trim(),
      }).catch((err) => {
        console.warn('Background message send failed:', err.message);
      });
    }

    // Dispatch message via Firebase Realtime Firestore with matching ID
    sendRealtimeMessage(activeThreadId, {
      id: msgId,
      threadId: activeThreadId,
      senderId: currentSender.id,
      senderName: currentSender.name,
      senderRole: currentSender.role,
      text: text.trim(),
      isRead: false,
    }).catch((err) => {
      console.warn('[Firebase] sendRealtimeMessage notice:', err.message);
    });

    // Only run automated bot reply for unauthenticated preview students
    if (!user && currentSender.role === 'student' && activeThreadId === 'thread-eleanor-vance') {
      const activeT = threads.find((t) => t.id === activeThreadId);
      const partnerId = activeT?.partnerId || 'usr-owner-demo';
      const partnerName = activeT?.partnerName || 'Eleanor Vance';
      const partnerRole = activeT?.partnerRole || 'owner';

      setTimeout(() => {
        const replyId = `msg_reply_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const autoReply: ChatMessage = {
          id: replyId,
          threadId: activeThreadId,
          senderId: partnerId,
          senderName: partnerName,
          senderRole: partnerRole,
          text: 'Thanks for reaching out! The high-speed fiber and study setup are all set. You can reserve your semester dates directly on the listing page.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        saveMessages((prev) => ({
          ...prev,
          [activeThreadId]: [...(prev[activeThreadId] || []), autoReply],
        }));

        saveThreads((prev) =>
          prev.map((t) =>
            t.id === activeThreadId
              ? { ...t, lastMessage: autoReply.text, lastTimestamp: autoReply.timestamp }
              : t,
          ),
        );

        sendRealtimeMessage(activeThreadId, {
          id: replyId,
          threadId: activeThreadId,
          senderId: partnerId,
          senderName: partnerName,
          senderRole: partnerRole,
          text: autoReply.text,
          isRead: false,
        }).catch(() => {});
      }, 1000);
    }
  };

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0] || null;
  const activeMessages = (activeThread ? messagesMap[activeThread.id] : []) || [];
  const totalUnread = threads.reduce((acc, t) => acc + t.unreadCount, 0);

  return (
    <ChatContext.Provider
      value={{
        threads,
        activeThread,
        activeMessages,
        isChatOpen,
        totalUnread,
        isFirebaseConnected: true,
        openChat,
        closeChat,
        selectThread,
        sendMessage,
        refreshMessages: () => activeThreadId && fetchActiveMessages(activeThreadId),
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
