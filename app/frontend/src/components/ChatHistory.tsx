import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAPIEndpoint } from "@/lib/api-config";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Star,
  Loader,
  AlertCircle,
} from "lucide-react";

interface Conversation {
  id: string;
  title: string | null;
  crime_type: string | null;
  is_favorited: boolean;
  created_at: string;
  updated_at: string;
}

interface ChatHistoryProps {
  onSelectConversation: (conversationId: string) => void;
  onCreateNew: () => void;
  currentConversationId?: string;
}

export default function ChatHistory({
  onSelectConversation,
  onCreateNew,
  currentConversationId,
}: ChatHistoryProps) {
  const { token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedConv, setExpandedConv] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, [token]);

  const loadConversations = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");
      const response = await fetch(getAPIEndpoint("/api/v1/entities/conversations"), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(" empty conversations history");

      const data = await response.json();
      // Backend returns { items, total, skip, limit }
      setConversations(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading conversations");
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (
    e: React.MouseEvent,
    conversationId: string
  ) => {
    e.stopPropagation();
    if (!token) return;

    if (!confirm("Delete this conversation? This action cannot be undone.")) return;

    try {
      const response = await fetch(getAPIEndpoint(`/api/v1/entities/conversations/${conversationId}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete conversation");

      setConversations((prev) =>
        prev.filter((conv) => conv.id !== conversationId)
      );
    } catch (err) {
      console.error("Error deleting conversation:", err);
    }
  };

  const toggleFavorite = async (
    e: React.MouseEvent,
    conversationId: string
  ) => {
    e.stopPropagation();
    if (!token) return;

    try {
      // Note: This would need a favorite endpoint in the backend
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? { ...conv, is_favorited: !conv.is_favorited }
            : conv
        )
      );
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      (conv.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (conv.crime_type?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const favorited = filteredConversations.filter((c) => c.is_favorited);
  const others = filteredConversations.filter((c) => !c.is_favorited);

  return (
    <div className="h-full bg-muted/30 border-r border-border/40 flex flex-col p-4">
      {/* Header */}
      <div className="mb-4">
        <Button
          onClick={onCreateNew}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white h-10"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-9 bg-background border-border/50"
        />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-5 w-5 animate-spin text-cyan-400" />
          </div>
        ) : error ? (
          <div className="flex gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 px-2">
            <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Start a new chat to begin
            </p>
          </div>
        ) : (
          <>
            {/* Favorited */}
            {favorited.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground px-2 mb-2">
                  FAVORITED
                </p>
                <div className="space-y-2">
                  {favorited.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={conv.id === currentConversationId}
                      onSelect={() => onSelectConversation(conv.id)}
                      onDelete={(e) => deleteConversation(e, conv.id)}
                      onToggleFavorite={(e) => toggleFavorite(e, conv.id)}
                      isExpanded={expandedConv === conv.id}
                      onToggleExpand={() =>
                        setExpandedConv(expandedConv === conv.id ? null : conv.id)
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Others */}
            {others.length > 0 && (
              <div>
                {favorited.length > 0 && (
                  <p className="text-xs font-semibold text-muted-foreground px-2 my-3">
                    ALL CHATS
                  </p>
                )}
                <div className="space-y-2">
                  {others.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={conv.id === currentConversationId}
                      onSelect={() => onSelectConversation(conv.id)}
                      onDelete={(e) => deleteConversation(e, conv.id)}
                      onToggleFavorite={(e) => toggleFavorite(e, conv.id)}
                      isExpanded={expandedConv === conv.id}
                      onToggleExpand={() =>
                        setExpandedConv(expandedConv === conv.id ? null : conv.id)
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onToggleFavorite,
  isExpanded,
  onToggleExpand,
}: ConversationItemProps) {
  const createdDate = new Date(conversation.created_at);
  const isToday =
    new Date().toDateString() === createdDate.toDateString();
  const formattedDate = isToday
    ? createdDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : createdDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg cursor-pointer transition-all ${
        isActive
          ? "bg-cyan-500/20 border border-cyan-500/30"
          : "bg-background/50 border border-border/20 hover:bg-background/80"
      }`}
    >
      <div className="flex items-start gap-2">
        <MessageSquare className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {conversation.title || "Untitled conversation"}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {conversation.crime_type && (
              <span className="text-xs bg-muted/50 text-muted-foreground px-2 py-0.5 rounded">
                {conversation.crime_type}
              </span>
            )}
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleFavorite}
            className="p-1.5 hover:bg-muted/50 rounded transition-colors"
          >
            <Star
              className={`h-4 w-4 ${
                conversation.is_favorited
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-500/10 rounded transition-colors"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
