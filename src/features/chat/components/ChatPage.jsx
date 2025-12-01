import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/useResponsive";
import { ROUTES } from "@/app/constants";
import { Home, ChevronRight } from "lucide-react";
import {
  CHAT_STORAGE_KEY,
  createConversation,
  loadChatHistory,
  sendPrompt,
  sendMessage,
  setActiveChat,
  deleteConversation,
  renameConversation,
  toggleFavorite,
} from "../slices/chatSlice.js";
import { ChatSidebar } from "./ChatSidebar";
import { ChatWindow } from "./ChatWindow";

export const ChatPage = () => {
  const dispatch = useDispatch();
  const { conversations, activeChatId, messagesByChat, status, typingStatus } = useSelector((state) => state.chat);
  const [searchQuery, setSearchQuery] = useState("");
  const { isMobile } = useResponsive();
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true);

  useEffect(() => {
    if (status === "idle") {
      dispatch(loadChatHistory());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (!isMobile) {
      setShowSidebarOnMobile(true);
    }
  }, [isMobile]);

  const activeChat = useMemo(
    () => conversations.find((conversation) => conversation.id === activeChatId) || null,
    [activeChatId, conversations]
  );

  const messages = useMemo(
    () => (activeChatId ? messagesByChat[activeChatId] || [] : []),
    [activeChatId, messagesByChat]
  );

  useEffect(() => {
    if (status === "success") {
      try {
        if (typeof window !== "undefined") {
          const payload = {
            conversations,
            messagesByChat,
            activeChatId,
          };
          window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(payload));
        }
      } catch {
        // ignore storage failures
      }
    }
  }, [status, conversations, messagesByChat, activeChatId]);

  const handleSelectChat = useCallback(
    (chatId) => {
      dispatch(setActiveChat(chatId));
      if (isMobile) {
        setShowSidebarOnMobile(false);
      }
    },
    [dispatch, isMobile]
  );

  const handleCreateConversation = useCallback(() => {
    const action = dispatch(createConversation());
    if (isMobile) {
      setShowSidebarOnMobile(false);
    }
    return action.payload.id;
  }, [dispatch, isMobile]);

  const ensureActiveChatId = useCallback(() => {
    if (activeChatId) return activeChatId;
    return handleCreateConversation();
  }, [activeChatId, handleCreateConversation]);

  const handleSendMessage = useCallback(
    (content, files = []) => {
      const targetChatId = ensureActiveChatId();
      dispatch(sendMessage({ chatId: targetChatId, content, attachments: files }));
      dispatch(sendPrompt({ chatId: targetChatId, prompt: content, attachments: files }));
    },
    [dispatch, ensureActiveChatId]
  );

  const handleRenameConversation = useCallback(
    (chatId, title) => {
      dispatch(renameConversation({ id: chatId, title }));
    },
    [dispatch]
  );

  const handleToggleFavorite = useCallback(
    (chatId) => {
      dispatch(toggleFavorite(chatId));
    },
    [dispatch]
  );

  const handleDeleteConversation = useCallback(
    (chatId) => {
      dispatch(deleteConversation(chatId));
    },
    [dispatch]
  );

  const handleBackToSidebar = useCallback(() => {
    if (isMobile) {
      setShowSidebarOnMobile(true);
    }
  }, [isMobile]);

  const isSidebarHiddenOnMobile = isMobile && !showSidebarOnMobile;
  const isWindowHiddenOnMobile = isMobile && showSidebarOnMobile;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h5 className="text-2xl font-semibold text-foreground">Chat</h5>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            to={ROUTES.DASHBOARD}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Chat</span>
        </div>
      </div>

      <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-border/70">
        <div className="flex h-[680px] flex-col lg:h-[calc(100vh-220px)] lg:flex-row">
          <div
            className={cn(
              "lg:w-[340px] border-b border-border/80 lg:border-b-0 lg:border-r bg-muted/30",
              isSidebarHiddenOnMobile && "hidden"
            )}
          >
            {status === "loading" ? (
              <div className="flex h-full flex-col gap-4 p-6">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-10 w-full" />
                <div className="flex-1 space-y-3">
                  {[1, 2, 3, 4].map((item) => (
                    <Skeleton key={item} className="h-20 w-full rounded-2xl" />
                  ))}
                </div>
              </div>
            ) : (
              <ChatSidebar
                conversations={conversations}
                activeChatId={activeChatId}
                onSelectChat={handleSelectChat}
                onCreateConversation={handleCreateConversation}
                onRenameConversation={handleRenameConversation}
                onToggleFavorite={handleToggleFavorite}
                onDeleteConversation={handleDeleteConversation}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            )}
          </div>

          <div className={cn("flex-1", isWindowHiddenOnMobile && "hidden")}>
            <ChatWindow
              chat={activeChat}
              messages={messages}
              status={status}
              isTyping={Boolean(activeChatId && typingStatus[activeChatId])}
              isMobile={isMobile}
              onBack={handleBackToSidebar}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

