import { useState, useRef } from "react";
import { streamGenTxt } from "@/lib/aihub";
import {
  Shield,
  Baby,
  Heart,
  Phone,
  AlertTriangle,
  FileCheck,
  MessageSquare,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Send,
  Bot,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { detectLanguage, formatResponseByLanguage } from "@/lib/language-utils";
import {
  SAFETY_TIPS_FOR_CHILDREN,
  SAFETY_TIPS_FOR_PARENTS,
  AUTHORITY_REFERRALS,
  EVIDENCE_CHECKLISTS,
  PECA_SECTIONS,
  CHILD_SAFETY_PROMPT,
  OFF_TOPIC_REFUSAL_MESSAGE,
  isOffTopicRequest,
} from "@/lib/knowledge-base";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  language?: "urdu" | "english";
}

// Cap how much prior conversation gets sent back to the model each turn —
// otherwise the payload (and provider processing time) grows unbounded as
// the conversation gets longer, for little benefit beyond recent context.
const MAX_HISTORY_MESSAGES = 12;

export default function ChildSafety() {
  const [activeTab, setActiveTab] = useState<"parents" | "children">("parents");
  const contentRef = useRef<HTMLDivElement>(null);

  // Inline chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTabSwitch = (tab: "parents" | "children") => {
    setActiveTab(tab);
    // Reset chat when switching tabs
    setChatOpen(false);
    setMessages([]);
    setInput("");
    setIsLoading(false);
    setIsSlowConnection(false);
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const openChat = () => {
    setChatOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Detect language of user input
    const inputLanguage = detectLanguage(text);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
      language: inputLanguage,
    };

    if (isOffTopicRequest(text)) {
      const assistantReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: OFF_TOPIC_REFUSAL_MESSAGE,
        timestamp: new Date(),
        language: inputLanguage,
      };

      setMessages((prev) => [...prev, userMessage, assistantReply]);
      setInput("");
      setIsLoading(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return;
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const aiMessages = [
      { role: "system" as const, content: CHILD_SAFETY_PROMPT },
      ...messages
        .slice(-MAX_HISTORY_MESSAGES)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: text.trim() },
    ];

    const assistantId = (Date.now() + 1).toString();
    let fullContent = "";
    setIsSlowConnection(false);

    try {
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
          chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        },
        onComplete: () => {
          setIsLoading(false);
          setIsSlowConnection(false);
          // Format response based on detected language
          const formattedContent = formatResponseByLanguage(fullContent, inputLanguage);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: formattedContent, language: inputLanguage } : m
            )
          );
        },
        onError: (error) => {
          setIsLoading(false);
          setIsSlowConnection(false);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: error.message.includes("timed out")
                      ? error.message
                      : "I apologize, but I'm having trouble connecting right now. Please try again. If you're in immediate danger, please call 15 (Police) or 1121 (Child Protection).",
                    language: inputLanguage,
                  }
                : m
            )
          );
        },
      });
    } catch {
      setIsLoading(false);
      setIsSlowConnection(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const childQuickTopics = [
    "Someone is hurting me",
    "I saw something scary online",
    "I need to talk to someone",
    "what should i do if someone is asking for my personal info",
    "how to block someone online",
    "how to report cyberbullying",
    "what to do if someone is threatening me online",
    "how to stay safe on social media",
  ];

  const parentQuickTopics = [
    "My child is being cyberbullied",
    "Someone is grooming my child online",
    "My child received inappropriate messages",
    "How to report online predators",
  ];

  const quickTopics = activeTab === "children" ? childQuickTopics : parentQuickTopics;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 via-amber-500/5 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-pink-500/10 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-amber-500 shadow-lg shadow-pink-500/20 mb-6">
                <Baby className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-pink-400 to-amber-400 bg-clip-text text-transparent">
                  Child Safety
                </span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Dedicated guidance for parents and children dealing with online threats, cyberbullying,
                grooming, and exploitation. Your child's safety comes first.
              </p>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-pink-500/20 rounded-3xl blur-2xl" />
              <img
                src="https://mgx-backend-cdn.metadl.com/generate/images/872104/2026-06-29/rpjto3qcaika/child-safety-parental-guidance.png"
                alt="Parent and child online safety guidance"
                className="relative rounded-2xl shadow-2xl shadow-pink-500/10 w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-8">
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-400 text-sm">
                If a child is in immediate danger
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Call <span className="font-mono text-foreground font-bold">1121</span> (Child
                Protection Helpline) or{" "}
                <span className="font-mono text-foreground font-bold">15</span> (Police Emergency)
                immediately. Do NOT confront a suspected predator directly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Switcher */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-8">
        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit mx-auto">
          <button
            onClick={() => handleTabSwitch("parents")}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "parents"
                ? "bg-gradient-to-r from-pink-500 to-amber-500 text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            👨‍👩‍👧 For Parents
          </button>
          <button
            onClick={() => handleTabSwitch("children")}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "children"
                ? "bg-gradient-to-r from-pink-500 to-amber-500 text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            👧 For Children
          </button>
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        {activeTab === "parents" ? (
          <div className="space-y-8">
            {/* Safety Tips for Parents */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Shield className="h-6 w-6 text-pink-400" />
                Safety Tips for Parents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SAFETY_TIPS_FOR_PARENTS.map((tip, i) => (
                  <Card key={i} className="border-border/50 bg-card/50">
                    <CardContent className="p-4 flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-muted-foreground">{tip}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Evidence Collection */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FileCheck className="h-6 w-6 text-amber-400" />
                Evidence to Collect
              </h2>
              <Card className="border-border/50">
                <CardContent className="p-5">
                  <ul className="space-y-3">
                    {EVIDENCE_CHECKLISTS.child_safety.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Legal Rights */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-indigo-400" />
                Legal Protection Under PECA 2016
              </h2>
              <Card className="border-indigo-500/20 bg-indigo-500/5">
                <CardContent className="p-5 space-y-3">
                  {PECA_SECTIONS.child_safety.sections.map((section, i) => (
                    <div key={i}>
                      <Badge variant="outline" className="border-indigo-500/30 text-indigo-400">
                        {section}
                      </Badge>
                    </div>
                  ))}
                  <p className="text-sm text-muted-foreground mt-3">
                    <span className="font-medium text-foreground">Penalty:</span>{" "}
                    {PECA_SECTIONS.child_safety.penalty}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {PECA_SECTIONS.child_safety.description}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Reporting Channels */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Phone className="h-6 w-6 text-cyan-400" />
                Where to Report
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-cyan-500/20 bg-cyan-500/5">
                  <CardContent className="p-5">
                    <p className="font-semibold text-cyan-400 mb-2">
                      {AUTHORITY_REFERRALS.fia.name}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Helpline:{" "}
                      <span className="font-mono text-foreground font-bold">
                        {AUTHORITY_REFERRALS.fia.helpline}
                      </span>
                    </p>
                    <a
                      href={AUTHORITY_REFERRALS.fia.onlinePortal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300"
                    >
                      File Online <ExternalLink className="h-3 w-3" />
                    </a>
                  </CardContent>
                </Card>

                <Card className="border-indigo-500/20 bg-indigo-500/5">
                  <CardContent className="p-5">
                    <p className="font-semibold text-indigo-400 mb-2">
                      {AUTHORITY_REFERRALS.nccia.name}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      National Cyber Crime Investigation Agency
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Helpline:{" "}
                      <span className="font-mono text-foreground font-bold">
                        {AUTHORITY_REFERRALS.nccia.helpline}
                      </span>
                    </p>
                    <a
                      href={AUTHORITY_REFERRALS.nccia.onlinePortal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      NCCIA Complaint Portal <ExternalLink className="h-3 w-3" />
                    </a>
                  </CardContent>
                </Card>

                <Card className="border-pink-500/20 bg-pink-500/5">
                  <CardContent className="p-5">
                    <p className="font-semibold text-pink-400 mb-2">
                      {AUTHORITY_REFERRALS.childProtection.name}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Helpline:{" "}
                      <span className="font-mono text-foreground font-bold">
                        {AUTHORITY_REFERRALS.childProtection.helpline}
                      </span>
                    </p>
                    <a
                      href={AUTHORITY_REFERRALS.childProtection.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-pink-400 hover:text-pink-300"
                    >
                      Visit Website <ExternalLink className="h-3 w-3" />
                    </a>
                  </CardContent>
                </Card>

                <Card className="border-emerald-500/20 bg-emerald-500/5">
                  <CardContent className="p-5">
                    <p className="font-semibold text-emerald-400 mb-2">
                      {AUTHORITY_REFERRALS.drf.name}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Helpline:{" "}
                      <span className="font-mono text-foreground font-bold">
                        {AUTHORITY_REFERRALS.drf.helpline}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {AUTHORITY_REFERRALS.drf.hours}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Inline Chat CTA / Chat Area */}
            <div className="pt-4">
              {!chatOpen ? (
                <div className="text-center">
                  <Button
                    size="lg"
                    onClick={openChat}
                    className="bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all px-8"
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Talk to AI About Your Child's Safety
                  </Button>
                </div>
              ) : (
                <InlineChat
                  messages={messages}
                  input={input}
                  setInput={setInput}
                  isLoading={isLoading}
                  isSlowConnection={isSlowConnection}
                  handleSubmit={handleSubmit}
                  sendMessage={sendMessage}
                  quickTopics={quickTopics}
                  chatEndRef={chatEndRef}
                  inputRef={inputRef}
                />
              )}
            </div>
          </div>
        ) : (
          /* Children Tab */
          <div className="space-y-8">
            <div className="max-w-2xl mx-auto">
              {/* Friendly intro for children */}
              <Card className="border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-amber-500/5 mb-8">
                <CardContent className="p-6 text-center">
                  <span className="text-5xl mb-4 block">🛡️</span>
                  <h2 className="text-2xl font-bold mb-3">
                    Hi there! 👋
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    This page is just for you. Here are some important tips to stay safe online.
                    Remember: if anything makes you feel scared or uncomfortable online, tell a
                    trusted adult right away. <strong>It's never your fault.</strong>
                  </p>
                </CardContent>
              </Card>

              {/* Safety Tips for Children */}
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-400" />
                Tips to Stay Safe Online
              </h2>
              <div className="space-y-3 mb-8">
                {SAFETY_TIPS_FOR_CHILDREN.map((tip, i) => (
                  <Card key={i} className="border-border/50 bg-card/50">
                    <CardContent className="p-4 flex items-start gap-3">
                      <span className="text-lg">⭐</span>
                      <p className="text-sm text-muted-foreground">{tip}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* What to do if something bad happens */}
              <Card className="border-amber-500/20 bg-amber-500/5 mb-8">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-amber-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    If something bad happens online:
                  </h3>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-amber-400">1.</span>
                      Don't panic — you're going to be okay
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-amber-400">2.</span>
                      Tell a parent, teacher, or trusted adult right away
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-amber-400">3.</span>
                      Don't delete any messages — they might be important evidence
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-amber-400">4.</span>
                      Block the person who is bothering you
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-amber-400">5.</span>
                      Remember: it's NOT your fault, no matter what they say
                    </li>
                  </ol>
                </CardContent>
              </Card>

              {/* Emergency contacts for children */}
              <Card className="border-red-500/20 bg-red-500/5 mb-8">
                <CardContent className="p-5 text-center">
                  <h3 className="font-semibold text-red-400 mb-3">
                    🚨 Need Help Right Now?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    If you're scared or in danger, call these numbers:
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <div className="px-4 py-2 rounded-lg bg-background/50 border border-border/50">
                      <p className="text-xs text-muted-foreground">Police</p>
                      <p className="font-mono font-bold text-lg text-foreground">15</p>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-background/50 border border-border/50">
                      <p className="text-xs text-muted-foreground">Child Protection</p>
                      <p className="font-mono font-bold text-lg text-foreground">1121</p>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-background/50 border border-border/50">
                      <p className="text-xs text-muted-foreground">FIA Cyber Crime</p>
                      <p className="font-mono font-bold text-lg text-foreground">1991</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inline Chat CTA / Chat Area for Children */}
              <div className="pt-4">
                {!chatOpen ? (
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Want to talk to our AI assistant? It's safe and private.
                    </p>
                    <Button
                      size="lg"
                      onClick={openChat}
                      className="bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-white shadow-lg px-8"
                    >
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Talk to CyberShield AI
                    </Button>
                  </div>
                ) : (
                  <InlineChat
                    messages={messages}
                    input={input}
                    setInput={setInput}
                    isLoading={isLoading}
                    handleSubmit={handleSubmit}
                    sendMessage={sendMessage}
                    quickTopics={quickTopics}
                    chatEndRef={chatEndRef}
                    inputRef={inputRef}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Inline Chat Component */
function InlineChat({
  messages,
  input,
  setInput,
  isLoading,
  isSlowConnection,
  handleSubmit,
  sendMessage,
  quickTopics,
  chatEndRef,
  inputRef,
}: {
  messages: ChatMessage[];
  input: string;
  setInput: (v: string) => void;
  isLoading: boolean;
  isSlowConnection: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  sendMessage: (text: string) => void;
  quickTopics: string[];
  chatEndRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <Card className="border-pink-500/20 bg-card/50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-500 to-amber-500 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold text-sm">CyberShield AI — Child Safety</h3>
        </div>

        {/* Messages Area */}
        <div className="max-h-[400px] overflow-y-auto space-y-3 mb-4 rounded-lg bg-background/50 p-3 border border-border/30">
          {messages.length === 0 && (
            <div className="text-center py-6">
              <Bot className="h-8 w-8 text-pink-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                Ask me anything about child safety online. I'm here to help.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {quickTopics.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(topic)}
                    className="text-xs px-3 py-1.5 rounded-full border border-pink-500/30 text-pink-400 hover:bg-pink-500/10 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-pink-500 to-amber-500 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-3 w-3 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-pink-500 to-amber-500 text-white"
                    : "bg-muted/50 text-foreground"
                }`}
              >
                {msg.role === "assistant" ? (
                  <MarkdownRenderer content={msg.content} language={msg.language || "english"} />
                ) : (
                  <p className={msg.language === "urdu" ? "text-right" : "text-left"}>{msg.content}</p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-2 items-start">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-pink-500 to-amber-500 flex items-center justify-center shrink-0">
                <Bot className="h-3 w-3 text-white" />
              </div>
              <div className="bg-muted/50 rounded-xl px-3 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                {isSlowConnection && (
                  <p className="text-xs text-muted-foreground mt-2">
                     Please wait a moment  since this is your first visit, we’re getting the platform ready for you.

                  </p>
                )}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here..."
            disabled={isLoading}
            className="flex-1 border-border/50 bg-background/50 focus-visible:ring-pink-500/30"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-white px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}