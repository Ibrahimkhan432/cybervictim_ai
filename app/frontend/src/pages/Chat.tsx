import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { createClient } from "@metagptx/web-sdk";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import MarkdownRenderer from "@/components/MarkdownRenderer";
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

const client = createClient();

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  crimeType?: CrimeType;
  timestamp: Date;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [detectedCrime, setDetectedCrime] = useState<CrimeType | undefined>(
    (searchParams.get("type") as CrimeType) || undefined
  );
  const [showEvidence, setShowEvidence] = useState(false);
  const [showAuthority, setShowAuthority] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      crimeType: detectedCrime,
      timestamp: new Date(),
    };

    if (isOffTopicRequest(text)) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: OFF_TOPIC_REFUSAL_MESSAGE,
        timestamp: new Date(),
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

    const isChildSafety = detectedCrime === "child_safety" || detected === "child_safety";
    const systemPrompt = isChildSafety ? CHILD_SAFETY_PROMPT : SYSTEM_PROMPT;

    const aiMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: text.trim() },
    ];

    const assistantId = (Date.now() + 1).toString();
    let fullContent = "";

    try {
      await client.ai.gentxt({
        messages: aiMessages,
        model: "gemini-2.5-pro",
        stream: true,
        onChunk: (chunk: any) => {
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
              },
            ];
          });
        },
        onComplete: () => {
          setIsLoading(false);
          const extracted = extractCrimeTypeFromResponse(fullContent);
          if (extracted && !detectedCrime) {
            setDetectedCrime(extracted);
          }
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: fullContent, crimeType: extracted } : m
            )
          );
        },
        onError: () => {
          setIsLoading(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content:
                      "I apologize, but I'm having trouble connecting right now. Please try again. If you're in immediate danger, please call 15 (Police) or 1122 (Emergency).",
                  }
                : m
            )
          );
        },
      });
    } catch {
      setIsLoading(false);
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
    setDetectedCrime(undefined);
    setShowEvidence(false);
    setShowAuthority(false);
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
      <Header />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Header Bar */}
          {activeCrime && (
            <div className="border-b border-border/40 bg-muted/30 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{activeCrime.icon}</span>
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {detectedCrime === "child_safety" ? "Child Safety Support" : "How can I help you?"}
                </h2>
                <p className="text-muted-foreground max-w-md mb-8">
                  {detectedCrime === "child_safety"
                    ? "Tell me what's happening with your child online. I'll guide you through the next steps to keep them safe."
                    : "Describe your situation and I'll guide you through the next steps. I can help in English and Urdu."}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                  {(detectedCrime === "child_safety"
                    ? [
                        { id: "child_bully", icon: "😢", label: "My child is being cyberbullied", crimeType: "child_safety" as CrimeType },
                        { id: "child_groom", icon: "⚠️", label: "Someone is grooming my child", crimeType: "child_safety" as CrimeType },
                        { id: "child_explicit", icon: "🚫", label: "My child received explicit content", crimeType: "child_safety" as CrimeType },
                        { id: "child_predator", icon: "🛡️", label: "A stranger is contacting my child", crimeType: "child_safety" as CrimeType },
                      ]
                    : QUICK_TOPICS
                  ).map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleQuickTopic(topic)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-cyan-500/5 hover:border-cyan-500/30 transition-all text-left"
                    >
                      <span className="text-xl">{topic.icon}</span>
                      <span className="text-sm font-medium">{topic.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-cyan-500/10 border border-cyan-500/20 text-foreground"
                      : "bg-card border border-border/50 text-foreground"
                  }`}
                >
                  <div className="text-sm leading-relaxed prose-sm">
                    {msg.role === "assistant" ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    )}
                  </div>
                  {msg.role === "assistant" && msg.crimeType && (
                    <div className="mt-2 pt-2 border-t border-border/30">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          CRIME_TYPES[msg.crimeType]?.borderColor
                        } ${CRIME_TYPES[msg.crimeType]?.textColor}`}
                      >
                        {CRIME_TYPES[msg.crimeType]?.icon}{" "}
                        {CRIME_TYPES[msg.crimeType]?.label}
                      </Badge>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
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
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border/40 bg-background/80 backdrop-blur-xl p-4">
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-3xl mx-auto">
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
              If you are in immediate danger, call 15 (Police) or 1122 (Emergency)
            </p>
          </div>
        </div>

        {/* Sidebar - Evidence & Authority Info */}
        {detectedCrime && (
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border/40 bg-muted/20 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Crime Type Card */}
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
                      <span className="text-xl">{activeCrime.icon}</span>
                      <span className={`font-semibold ${activeCrime.textColor}`}>
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
                  {(showEvidence || !detectedCrime) && (
                    <CardContent className="px-4 pb-4">
                      <ul className="space-y-2">
                        {activeEvidence.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* PECA Legal Info */}
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
                        <span className="font-medium text-indigo-400">{section}</span>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground mt-2">
                      <span className="font-medium">Penalty:</span> {activePeca.penalty}
                    </p>
                    <p className="text-xs text-muted-foreground">{activePeca.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Authority Referral */}
              <Card className="border-border/50">
                <CardHeader className="pb-2 pt-4 px-4">
                  <button
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
                {(showAuthority || detectedCrime) && (
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
                        File Online Complaint <ExternalLink className="h-3 w-3" />
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

                    {/* Child Protection - show for child safety or always */}
                    {(detectedCrime === "child_safety" || showAuthority) && (
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

              {/* Psychological Support Notice */}
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
                          If you're feeling distressed, our AI will provide emotional support before
                          practical guidance. You're not alone.
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