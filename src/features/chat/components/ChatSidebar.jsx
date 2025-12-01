import { memo, useMemo, useState } from "react";
import { Ellipsis, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const ChatSidebar = memo(
  ({
    conversations = [],
    activeChatId,
    onSelectChat,
    onCreateConversation,
    onRenameConversation,
    onToggleFavorite,
    onDeleteConversation,
    searchQuery,
    onSearchChange,
  }) => {
    const [editingId, setEditingId] = useState(null);
    const [editingValue, setEditingValue] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [menuOpenId, setMenuOpenId] = useState(null);

    const filteredConversations = useMemo(() => {
      if (!searchQuery) return conversations;
      const lowered = searchQuery.toLowerCase();
      return conversations.filter(
        (conversation) =>
          conversation.title.toLowerCase().includes(lowered) ||
          conversation.preview?.toLowerCase().includes(lowered)
      );
    }, [conversations, searchQuery]);

    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-border px-6 pb-4 pt-6">
          <Button
            size="sm"
            onClick={onCreateConversation}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            New Chat
          </Button>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search sessions"
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-2 py-4">
          <div className="space-y-1.5">
            {filteredConversations.map((conversation, index) => {
              const isActive = conversation.id === activeChatId;
              const isEditing = editingId === conversation.id;
              const isFavorite = Boolean(conversation.isFavorite);

              const handleEditStart = (event) => {
                event.stopPropagation();
                setEditingId(conversation.id);
                setEditingValue(conversation.title || `Session ${index + 1}`);
                setMenuOpenId(null);
              };

              const handleEditSubmit = () => {
                if (editingId && editingValue.trim()) {
                  onRenameConversation(editingId, editingValue.trim());
                }
                setEditingId(null);
                setEditingValue("");
              };

              const handleEditKeyDown = (event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleEditSubmit();
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  setEditingId(null);
                  setEditingValue("");
                }
              };

              return (
                <div
                  key={conversation.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectChat(conversation.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectChat(conversation.id);
                    }
                  }}
                  className={cn(
                    "group w-full rounded-2xl px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <Input
                          value={editingValue}
                          autoFocus
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => setEditingValue(event.target.value)}
                          onBlur={handleEditSubmit}
                          onKeyDown={handleEditKeyDown}
                          className="h-8 text-sm"
                        />
                      ) : (
                        <p className="font-semibold text-sm text-foreground truncate">
                          {conversation.title || `Session ${index + 1}`}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {conversation.preview || "No messages yet"}
                      </p>
                    </div>
                    <DropdownMenu
                      open={menuOpenId === conversation.id}
                      onOpenChange={(open) => setMenuOpenId(open ? conversation.id : null)}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(event) => event.stopPropagation()}
                          className={cn(
                            "h-8 w-8 flex-shrink-0 text-muted-foreground",
                            "md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100",
                            "md:pointer-events-none md:group-hover:pointer-events-auto md:group-focus-visible:pointer-events-auto"
                          )}
                          aria-label="Conversation options"
                        >
                          <Ellipsis className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-48"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            handleEditStart(event);
                          }}
                        >
                          Edit title
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            onToggleFavorite(conversation.id);
                            setMenuOpenId(null);
                          }}
                        >
                          {isFavorite ? "Remove favorite" : "Add favorite"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeleteTarget(conversation);
                            setMenuOpenId(null);
                          }}
                        >
                          Delete conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}

            {!filteredConversations.length && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No conversations matched your search.
              </div>
            )}
          </div>
        </ScrollArea>
        <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove &quot;{deleteTarget?.title || "Untitled session"}&quot; and its chat history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteTarget) {
                    onDeleteConversation(deleteTarget.id);
                  }
                  setDeleteTarget(null);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
);

ChatSidebar.displayName = "ChatSidebar";

