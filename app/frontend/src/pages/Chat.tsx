import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { streamGenTxt } from "@/lib/aihub";
import { useAuth } from "@/contexts/AuthContext";
import { useConversationAPI } from "@/lib/conversation-api";
import {
  Send,
  Shield,
  AlertTriangle,
  FileCheck,
  Phone,
  Heart,
  Baby,
  RotateCcw,
  ChevronDown,
  ExternalLink,
  Bot,
  User,
  Zap,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { detectLanguage, formatResponseByLanguage } from "@/lib/language-utils";
import ChatHistory from "@/components/ChatHistory";
import UserMenu from "@/components/UserMenu";
import {
  SYSTEM_PROMPT,
  CHILD_SAFETY_PROMPT,
  CRIME_TYPES,
  EVIDENCE_CHECKLISTS,
  AUTHORITY_REFERRALS,
  PECA_SECTIONS,
  QUICK_TOPICS,
  OFF_TOPIC_REFUSAL_MESSAGE,
  isOffTopicRequest,
  type CrimeType,
} from "@/lib/knowledge-base";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  crimeType?: CrimeType;
  timestamp: Date;
  language?: "urdu" | "english";
}

function detectCrimeType(text: string): CrimeType | undefined {
  const lower = text.toLowerCase();
  if (
    lower.includes("child") ||
    lower.includes("بچ") ||
    lower.includes("بچے") ||
    lower.includes("grooming") ||
    lower.includes("cyberbully") ||
    lower.includes("minor")
  )
    return "child_safety";
  if (
    lower.includes("blackmail") ||
    lower.includes("بلیک میل") ||
    lower.includes("extort") ||
    lower.includes("revenge") ||
    lower.includes("threaten to share")
  )
    return "blackmailing";
  if (
    lower.includes("hack") ||
    lower.includes("ہیک") ||
    lower.includes("unauthorized access") ||
    lower.includes("stolen account") ||
    lower.includes("account taken")
  )
    return "hacking";
  if (
    lower.includes("scam") ||
    lower.includes("fraud") ||
    lower.includes("دھوکہ") ||
    lower.includes("phishing") ||
    lower.includes("fake investment") ||
    lower.includes("money") ||
    lower.includes("پیس")
  )
    return "financial_fraud";
  if (
    lower.includes("harass") ||
    lower.includes("ہراسانی") ||
    lower.includes("stalk") ||
    lower.includes("threat") ||
    lower.includes("abuse") ||
    lower.includes("بلیک میل")
  )
    return "harassment";
  return undefined;
}

// Cap how much prior conversation gets sent back to the model each turn.
// Without this the payload (and provider processing time) grows unbounded
// as a conversation gets longer, for little quality benefit beyond the
// last several exchanges — the system prompt already carries the fixed
// context the model needs.
const MAX_HISTORY_MESSAGES = 12;

function extractCrimeTypeFromResponse(text: string): CrimeType | undefined {
  const crimeMatch = text.match(/\*\*Crime Type:\*\*\s*(\w[\w\s]*?)(?:\n|$)/i);
  if (crimeMatch) {
    const matched = crimeMatch[1].toLowerCase().trim();
    if (matched.includes("harassment")) return "harassment";
    if (matched.includes("blackmail")) return "blackmailing";
    if (matched.includes("hack")) return "hacking";
    if (matched.includes("financial") || matched.includes("fraud") || matched.includes("scam"))
      return "financial_fraud";
    if (matched.includes("child")) return "child_safety";
    if (matched.includes("other")) return "other";
  }
  return undefined;
}

export default function Chat() {
  const [searchParams] = useSearchParams();
  const { user, token } = useAuth();
  const conversationAPI = useConversationAPI();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [detectedCrime, setDetectedCrime] = useState<CrimeType | undefined>(
    (searchParams.get("type") as CrimeType) || undefined
  );
  const [showEvidence, setShowEvidence] = useState(false);
  const [showAuthority, setShowAuthority] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isSavingMessage, setIsSavingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Create a new conversation in the backend
   */
  const createNewConversation = useCallback(
    async (title: string | null = null, crime_type: string | null = null) => {
      try {
        const conv = await conversationAPI.createConversation(title, crime_type);
        return conv.id;
      } catch (error) {
        console.error("Error creating conversation:", error);
        return null;
      }
    },
    [conversationAPI]
  );

  /**
   * Save a message to the current conversation
   */
  const saveMessage = useCallback(
    async (
      conversationId: string,
      role: "user" | "assistant",
      content: string,
      language?: string,
      crime_type?: string
    ) => {
      try {
        setIsSavingMessage(true);
        await conversationAPI.saveMessage(
          conversationId,
          role,
          content,
          language,
          crime_type
        );
      } catch (error) {
        console.error("Error saving message:", error);
      } finally {
        setIsSavingMessage(false);
      }
    },
    [conversationAPI]
  );

  /**
   * Load a conversation from the backend
   */
  const loadConversation = useCallback(
    async (conversationId: string) => {
      try {
        setIsLoadingConversation(true);
        const conversation = await conversationAPI.getConversation(
          conversationId
        );

        // Convert API messages to Message format
        const loadedMessages: Message[] = conversation.messages.map(
          (msg: any) => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: msg.content,
            timestamp: new Date(msg.created_at),
            crimeType: msg.crime_type as CrimeType | undefined,
            language: msg.language as "urdu" | "english" | undefined,
          })
        );

        setMessages(loadedMessages);
        if (conversation.crime_type) {
          setDetectedCrime(
            conversation.crime_type as CrimeType | undefined
          );
        }
        setCurrentConversationId(conversationId);
      } catch (error) {
        console.error("Error loading conversation:", error);
      } finally {
        setIsLoadingConversation(false);
      }
    },
    [conversationAPI]
  );

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Detect language of user input
    const inputLanguage = detectLanguage(text);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      crimeType: detectedCrime,
      timestamp: new Date(),
      language: inputLanguage,
    };

    if (isOffTopicRequest(text)) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: OFF_TOPIC_REFUSAL_MESSAGE,
        timestamp: new Date(),
        language: inputLanguage,
      };
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setInput("");
      return;
    }

    const detected = detectCrimeType(text);
    if (detected && !detectedCrime) {
      setDetectedCrime(detected);
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Create or use existing conversation
    let conversationId = currentConversationId;
    if (!conversationId) {
      const title = text.substring(0, 50); // Use first 50 chars as title
      const crimeType = detected || detectedCrime;
      conversationId = await createNewConversation(title, crimeType || null);
      if (conversationId) {
        setCurrentConversationId(conversationId);
      } else {
        console.error("Failed to create conversation");
        setIsLoading(false);
        return;
      }
    }

    // Save user message to backend
    if (conversationId) {
      await saveMessage(
        conversationId,
        "user",
        text.trim(),
        inputLanguage,
        detected || detectedCrime
      );
    }

    const isChildSafety = detectedCrime === "child_safety" || detected === "child_safety";
    const systemPrompt = isChildSafety ? CHILD_SAFETY_PROMPT : SYSTEM_PROMPT;

    const aiMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages
        .slice(-MAX_HISTORY_MESSAGES)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: text.trim() },
    ];

    const assistantId = (Date.now() + 1).toString();
    let fullContent = "";
    setIsSlowConnection(false);

    try {
      abortControllerRef.current = new AbortController();

      await streamGenTxt({
        messages: aiMessages,
        onSlowConnection: () => setIsSlowConnection(true),
        onChunk: (chunk) => {
          setIsSlowConnection(false);
          fullContent += chunk.content || "";
          setMessages((prev) => {
            const existing = prev.find((m) => m.id === assistantId);
            if (existing) {
              return prev.map((m) =>
                m.id === assistantId ? { ...m, content: fullContent } : m
              );
            }
            return [
              ...prev,
              {
                id: assistantId,
                role: "assistant" as const,
                content: fullContent,
                timestamp: new Date(),
                language: inputLanguage,
              },
            ];
          });
        },
        onComplete: async () => {
          setIsLoading(false);
          setIsSlowConnection(false);
          const extracted = extractCrimeTypeFromResponse(fullContent);
          if (extracted && !detectedCrime) {
            setDetectedCrime(extracted);
          }
          // Format response based on detected language
          const formattedContent = formatResponseByLanguage(fullContent, inputLanguage);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: formattedContent, crimeType: extracted, language: inputLanguage } : m
            )
          );

          // Save AI response to backend
          if (conversationId) {
            await saveMessage(
              conversationId,
              "assistant",
              formattedContent,
              inputLanguage,
              extracted
            );
          }
        },
        onError: (error) => {
          setIsLoading(false);
          setIsSlowConnection(false);
          const errorMessage = error.message.includes("timed out")
            ? error.message
            : "I apologize, but I'm having trouble connecting right now. Please try again. If you're in immediate danger, please call 15 (Police) or 1122 (Emergency).";

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: errorMessage,
                    language: inputLanguage,
                  }
                : m
            )
          );
        },
      });
    } catch (error) {
      setIsLoading(false);
      setIsSlowConnection(false);
      console.error("Error in sendMessage:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickTopic = (topic: (typeof QUICK_TOPICS)[0]) => {
    setDetectedCrime(topic.crimeType);
    sendMessage(topic.label);
  };

  const resetChat = () => {
    setMessages([]);
    setInput("");
    setDetectedCrime(undefined);
    setShowEvidence(false);
    setShowAuthority(false);
    setCurrentConversationId(undefined);
    inputRef.current?.focus();
  };

  const activeCrime = detectedCrime
    ? CRIME_TYPES[detectedCrime]
    : undefined;
  const activeEvidence = detectedCrime
    ? EVIDENCE_CHECKLISTS[detectedCrime]
    : undefined;
  const activePeca = detectedCrime ? PECA_SECTIONS[detectedCrime] : undefined;

    return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          <Header />
        </div>

        <UserMenu />
      </div>

      {/* Main Application Area */}
      <div className="flex-1 min-h-0 flex flex-row max-w-full mx-auto w-full">

        {/* =========================
            LEFT SIDEBAR - CHAT HISTORY
        ========================== */}
        {sidebarOpen && (
          <div className="w-64 flex-shrink-0 hidden sm:block bg-muted/20 border-r border-border/40 overflow-hidden">
            <ChatHistory
              onSelectConversation={(id) => {
                loadConversation(id);
              }}
              onCreateNew={() => {
                setCurrentConversationId(undefined);
                setMessages([]);
                setInput("");
                setDetectedCrime(undefined);
                setShowEvidence(false);
                setShowAuthority(false);
                inputRef.current?.focus();
              }}
              currentConversationId={currentConversationId}
            />
          </div>
        )}

        {/* =========================
            CENTER CHAT AREA
        ========================== */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col">

          {/* Chat Header */}
          {activeCrime && (
            <div className="shrink-0 border-b border-border/40 bg-muted/30 px-4 py-3">
              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {activeCrime.icon}
                  </span>

                  <div>
                    <Badge
                      variant="outline"
                      className={`${activeCrime.borderColor} ${activeCrime.textColor}`}
                    >
                      {activeCrime.label}
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetChat}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  New Chat
                </Button>

              </div>
            </div>
          )}

          {/* =========================
              MESSAGES AREA
              ONLY THIS AREA SCROLLS
          ========================== */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-4">

            {/* Loading Conversation */}
            {isLoadingConversation ? (
              <div className="flex flex-col items-center justify-center h-full text-center">

                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4">
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-white animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-white animate-bounce [animation-delay:150ms]" />
                    <div className="h-2 w-2 rounded-full bg-white animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>

                <p className="text-muted-foreground">
                  Loading conversation...
                </p>

              </div>
            ) : messages.length === 0 ? (

              /* =========================
                 EMPTY CHAT / QUICK TOPICS
              ========================== */
              <div className="flex flex-col items-center justify-center min-h-full text-center py-12">

                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>

                <h2 className="text-2xl font-bold mb-2">
                  {detectedCrime === "child_safety"
                    ? "Child Safety Support"
                    : "How can I help you?"}
                </h2>

                <p className="text-muted-foreground max-w-md mb-8">
                  {detectedCrime === "child_safety"
                    ? "Tell me what's happening with your child online. I'll guide you through the next steps to keep them safe."
                    : "Describe your situation and I'll guide you through the next steps. I can help in English and Urdu."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">

                  {(detectedCrime === "child_safety"
                    ? [
                        {
                          id: "child_bully",
                          icon: "😢",
                          label: "My child is being cyberbullied",
                          crimeType: "child_safety" as CrimeType,
                        },
                        {
                          id: "child_groom",
                          icon: "⚠️",
                          label: "Someone is grooming my child",
                          crimeType: "child_safety" as CrimeType,
                        },
                        {
                          id: "child_explicit",
                          icon: "🚫",
                          label: "My child received explicit content",
                          crimeType: "child_safety" as CrimeType,
                        },
                        {
                          id: "child_predator",
                          icon: "🛡️",
                          label: "A stranger is contacting my child",
                          crimeType: "child_safety" as CrimeType,
                        },
                      ]
                    : QUICK_TOPICS
                  ).map((topic) => (

                    <button
                      key={topic.id}
                      onClick={() => handleQuickTopic(topic)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-cyan-500/5 hover:border-cyan-500/30 transition-all text-left"
                    >
                      <span className="text-xl">
                        {topic.icon}
                      </span>

                      <span className="text-sm font-medium">
                        {topic.label}
                      </span>
                    </button>

                  ))}

                </div>
              </div>

            ) : (

              /* =========================
                 CHAT MESSAGES
              ========================== */
              messages.map((msg) => (

                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  {/* AI ICON */}
                  {msg.role === "assistant" && (
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}

                  {/* MESSAGE */}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-cyan-500/10 border border-cyan-500/20 text-foreground"
                        : "bg-card border border-border/50 text-foreground"
                    }`}
                  >

                    <div className="text-sm leading-relaxed prose-sm">

                      {msg.role === "assistant" ? (
                        <MarkdownRenderer
                          content={msg.content}
                          language={msg.language || "english"}
                        />
                      ) : (
                        <span
                          className={`whitespace-pre-wrap block ${
                            msg.language === "urdu"
                              ? "text-right"
                              : "text-left"
                          }`}
                        >
                          {msg.content}
                        </span>
                      )}

                    </div>

                    {/* Crime Type */}
                    {msg.role === "assistant" && msg.crimeType && (
                      <div className="mt-2 pt-2 border-t border-border/30">

                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            CRIME_TYPES[msg.crimeType]?.borderColor
                          } ${
                            CRIME_TYPES[msg.crimeType]?.textColor
                          }`}
                        >
                          {CRIME_TYPES[msg.crimeType]?.icon}{" "}
                          {CRIME_TYPES[msg.crimeType]?.label}
                        </Badge>

                      </div>
                    )}

                  </div>

                  {/* USER ICON */}
                  {msg.role === "user" && (
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}

                </div>

              ))
            )}

            {/* =========================
                AI LOADING INDICATOR
            ========================== */}
            {isLoading &&
              messages[messages.length - 1]?.role === "user" && (

                <div className="flex gap-3 justify-start">

                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>

                  <div className="bg-card border border-border/50 rounded-2xl px-4 py-3">

                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0ms]" />
                      <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms]" />
                      <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
                    </div>

                    {isSlowConnection && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Please wait a moment — since this is your first visit,
                        we’re getting the platform ready for you.
                      </p>
                    )}

                  </div>

                </div>
              )}

            {/* Auto Scroll Target */}
            <div ref={messagesEndRef} />

          </div>

          {/* =========================
              INPUT AREA
              ALWAYS AT BOTTOM
          ========================== */}
          <div className="shrink-0 border-t border-border/40 bg-background/95 backdrop-blur-xl p-4">

            <form
              onSubmit={handleSubmit}
              className="flex gap-3 max-w-3xl mx-auto"
            >

              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your situation... (English or Urdu)"
                disabled={isLoading}
                className="flex-1 h-11 bg-muted/50 border-border/50 focus:border-cyan-500/50 focus:ring-cyan-500/20"
              />

              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 h-11 px-5"
              >
                <Send className="h-4 w-4" />
              </Button>

            </form>

            <p className="text-xs text-muted-foreground text-center mt-2">
              If you are in immediate danger, call 15 (Police) or 1122
              (Emergency)
            </p>

          </div>

        </div>

        {/* =========================
            RIGHT SIDEBAR
        ========================== */}
        {detectedCrime && (
          <div className="w-full lg:w-80 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-border/40 bg-muted/20 overflow-y-auto">

            <div className="p-4 space-y-4">

              {/* Crime Type */}
              {activeCrime && (
                <Card className="border-border/50">

                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      Detected Crime Type
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-4 pb-4">

                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {activeCrime.icon}
                      </span>

                      <span
                        className={`font-semibold ${activeCrime.textColor}`}
                      >
                        {activeCrime.label}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      {activeCrime.description}
                    </p>

                  </CardContent>

                </Card>
              )}

              {/* Evidence Checklist */}
              {activeEvidence && (
                <Card className="border-border/50">

                  <CardHeader className="pb-2 pt-4 px-4">

                    <button
                      type="button"
                      className="w-full flex items-center justify-between"
                      onClick={() => setShowEvidence(!showEvidence)}
                    >

                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-emerald-400" />
                        Evidence Checklist
                      </CardTitle>

                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          showEvidence ? "rotate-180" : ""
                        }`}
                      />

                    </button>

                  </CardHeader>

                  {showEvidence && (
                    <CardContent className="px-4 pb-4">

                      <ul className="space-y-2">

                        {activeEvidence.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-xs"
                          >
                            <span className="text-emerald-400 mt-0.5">
                              ✓
                            </span>

                            <span className="text-muted-foreground">
                              {item}
                            </span>
                          </li>
                        ))}

                      </ul>

                    </CardContent>
                  )}

                </Card>
              )}

              {/* PECA Legal Information */}
              {activePeca && (
                <Card className="border-border/50">

                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4 text-indigo-400" />
                      Your Legal Rights (PECA 2016)
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="px-4 pb-4 space-y-2">

                    {activePeca.sections.map((section, i) => (
                      <div key={i} className="text-xs">
                        <span className="font-medium text-indigo-400">
                          {section}
                        </span>
                      </div>
                    ))}

                    <p className="text-xs text-muted-foreground mt-2">
                      <span className="font-medium">
                        Penalty:
                      </span>{" "}
                      {activePeca.penalty}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {activePeca.description}
                    </p>

                  </CardContent>

                </Card>
              )}

              {/* Where To Report */}
              <Card className="border-border/50">

                <CardHeader className="pb-2 pt-4 px-4">

                  <button
                    type="button"
                    className="w-full flex items-center justify-between"
                    onClick={() => setShowAuthority(!showAuthority)}
                  >

                    <CardTitle className="text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4 text-cyan-400" />
                      Where to Report
                    </CardTitle>

                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        showAuthority ? "rotate-180" : ""
                      }`}
                    />

                  </button>

                </CardHeader>

                {showAuthority && (
                  <CardContent className="px-4 pb-4 space-y-3">

                    {/* FIA */}
                    <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">

                      <p className="text-sm font-medium text-cyan-400">
                        {AUTHORITY_REFERRALS.fia.name}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        Helpline:{" "}
                        <span className="font-mono text-foreground">
                          {AUTHORITY_REFERRALS.fia.helpline}
                        </span>
                      </p>

                      <a
                        href={AUTHORITY_REFERRALS.fia.onlinePortal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mt-1"
                      >
                        File Online Complaint
                        <ExternalLink className="h-3 w-3" />
                      </a>

                    </div>

                    {/* NCCIA */}
                    <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20">

                      <p className="text-sm font-medium text-indigo-400">
                        {AUTHORITY_REFERRALS.nccia.name}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        National Cyber Crime Investigation Agency
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        Helpline:{" "}
                        <span className="font-mono text-foreground">
                          {AUTHORITY_REFERRALS.nccia.helpline}
                        </span>
                      </p>

                      <a
                        href={AUTHORITY_REFERRALS.nccia.onlinePortal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-1"
                      >
                        NCCIA Complaint Portal
                        <ExternalLink className="h-3 w-3" />
                      </a>

                    </div>

                    {/* DRF */}
                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">

                      <p className="text-sm font-medium text-emerald-400">
                        {AUTHORITY_REFERRALS.drf.name}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        Helpline:{" "}
                        <span className="font-mono text-foreground">
                          {AUTHORITY_REFERRALS.drf.helpline}
                        </span>
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {AUTHORITY_REFERRALS.drf.hours}
                      </p>

                    </div>

                    {/* Child Protection */}
                    {(detectedCrime === "child_safety" ||
                      showAuthority) && (

                      <div className="p-3 rounded-lg bg-pink-500/5 border border-pink-500/20">

                        <p className="text-sm font-medium text-pink-400">
                          {AUTHORITY_REFERRALS.childProtection.name}
                        </p>

                        <p className="text-xs text-muted-foreground mt-1">
                          Helpline:{" "}
                          <span className="font-mono text-foreground">
                            {AUTHORITY_REFERRALS.childProtection.helpline}
                          </span>
                        </p>

                      </div>

                    )}

                  </CardContent>
                )}

              </Card>

              {/* Emotional Support */}
              {(detectedCrime === "blackmailing" ||
                detectedCrime === "harassment" ||
                detectedCrime === "child_safety") && (

                <Card className="border-pink-500/20 bg-pink-500/5">

                  <CardContent className="p-4">

                    <div className="flex items-start gap-2">

                      <Heart className="h-4 w-4 text-pink-400 mt-0.5 shrink-0" />

                      <div>

                        <p className="text-sm font-medium text-pink-400">
                          Emotional Support Available
                        </p>

                        <p className="text-xs text-muted-foreground mt-1">
                          If you're feeling distressed, our AI will provide
                          emotional support before practical guidance.
                          You're not alone.
                        </p>

                      </div>

                    </div>

                  </CardContent>

                </Card>

              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}