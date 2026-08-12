/**
 * Conversation API utilities for managing chat history and messages
 */

import { useAuth } from "@/contexts/AuthContext";
import { getAPIEndpoint } from "./api-config";

export interface ConversationData {
  id: string;
  title: string | null;
  crime_type: string | null;
  is_favorited: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  language?: string;
  crime_type?: string;
  created_at: string;
}

export interface ConversationWithMessages {
  id: string;
  title: string | null;
  crime_type: string | null;
  created_at: string;
  updated_at: string;
  messages: MessageData[];
}

class ConversationAPI {
  private getBaseURL() {
    return getAPIEndpoint("/api/v1/entities");
  }

  private getAuthHeader(token: string | null): HeadersInit {
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * List all user conversations
   */
  async listConversations(
    token: string | null,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ conversations: ConversationData[]; total_count: number }> {
    const response = await fetch(
      `${this.getBaseURL()}/conversations?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: this.getAuthHeader(token),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to list conversations: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      conversations: data.conversations || [],
      total_count: data.total_count || 0,
    };
  }

  /**
   * Create a new conversation
   */
  async createConversation(
    token: string | null,
    title: string | null = null,
    crime_type: string | null = null
  ): Promise<{ id: string; title: string | null; crime_type: string | null }> {
    const response = await fetch(`${this.getBaseURL()}/conversations`, {
      method: "POST",
      headers: this.getAuthHeader(token),
      body: JSON.stringify({ title, crime_type }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.statusText}`);
    }

    const data = await response.json();
    return data.conversation;
  }

  /**
   * Get a conversation with all its messages
   */
  async getConversation(
    token: string | null,
    conversationId: string
  ): Promise<ConversationWithMessages> {
    const response = await fetch(
      `${this.getBaseURL()}/conversations/${conversationId}`,
      {
        method: "GET",
        headers: this.getAuthHeader(token),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get conversation: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.conversation;
  }

  /**
   * Save a message to a conversation
   */
  async saveMessage(
    token: string | null,
    conversationId: string,
    role: "user" | "assistant",
    content: string,
    language?: string,
    crime_type?: string
  ): Promise<{ id: string; role: string; content: string }> {
    const response = await fetch(
      `${this.getBaseURL()}/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: this.getAuthHeader(token),
        body: JSON.stringify({
          role,
          content,
          language,
          crime_type,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to save message: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message;
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(
    token: string | null,
    conversationId: string
  ): Promise<void> {
    const response = await fetch(
      `${this.getBaseURL()}/conversations/${conversationId}`,
      {
        method: "DELETE",
        headers: this.getAuthHeader(token),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.statusText}`);
    }
  }
}

export const conversationAPI = new ConversationAPI();

/**
 * Hook to use conversation API with auth context
 */
export function useConversationAPI() {
  const { token } = useAuth();

  return {
    listConversations: (limit?: number, offset?: number) =>
      conversationAPI.listConversations(token, limit, offset),
    createConversation: (title?: string | null, crime_type?: string | null) =>
      conversationAPI.createConversation(token, title, crime_type),
    getConversation: (conversationId: string) =>
      conversationAPI.getConversation(token, conversationId),
    saveMessage: (
      conversationId: string,
      role: "user" | "assistant",
      content: string,
      language?: string,
      crime_type?: string
    ) =>
      conversationAPI.saveMessage(
        token,
        conversationId,
        role,
        content,
        language,
        crime_type
      ),
    deleteConversation: (conversationId: string) =>
      conversationAPI.deleteConversation(token, conversationId),
  };
}
