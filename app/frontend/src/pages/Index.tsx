import { Link } from "react-router-dom";
import {
  Shield,
  MessageSquare,
  Baby,
  FileCheck,
  Heart,
  Phone,
  ArrowRight,
  Scale,
  Clock,
  Lock,
  Sparkles,
  CheckCircle2,
  Zap,
  Languages,
  BookOpenCheck,
  Users,
  ChevronRight,
  Fingerprint,
  Eye,
  Bug,
  KeyRound,
  ScanLine,
  Wifi,
  ShieldAlert,
  Radar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CRIME_TYPES, QUICK_TOPICS } from "@/lib/knowledge-base";
import Header from "@/components/Header";
import AnalyticsSection from "@/components/AnalyticsSection";

/**
 * Landing page (redesigned).
 *
 * Goals:
 *  - Calm, professional, trust-first — matches a cybercrime victim-support tool.
 *  - Modern layout: glass nav, subtle grid background, bento-grid feature area,
 *    3-step "how it works", framed crime-type cards.
 *  - Zero new runtime dependencies — animations are pure CSS/Tailwind so this
 *    ships with the existing bundle. (If we later want physics-based motion,
 *    swap the utility classes for framer-motion equivalents.)
 */

const features = [
  {
    icon: Clock,
    title: "24/7 Instant Guidance",
    description:
      "Get help anytime, day or night. The AI responds immediately with clear step by step instructions for your exact situation.",
    accent: "from-cyan-500/20 to-cyan-500/5",
    iconAccent: "text-cyan-400",
    ring: "ring-cyan-500/20",
  },
  {
    icon: Shield,
    title: "Automatic Classification",
    description:
      "Describe what happened in plain words  the AI identifies the type of cybercrime and the relevant PECA sections.",
    accent: "from-blue-500/20 to-blue-500/5",
    iconAccent: "text-blue-400",
    ring: "ring-blue-500/20",
  },
  {
    icon: FileCheck,
    title: "Evidence Checklists",
    description:
      "A clear checklist of exactly what to screenshot, save, and preserve  before you file a complaint.",
    accent: "from-emerald-500/20 to-emerald-500/5",
    iconAccent: "text-emerald-400",
    ring: "ring-emerald-500/20",
  },
  {
    icon: Heart,
    title: "Emotional First-Response",
    description:
      "Detects distress and leads with empathy. Practical steps come after you're steady  because your well-being matters first.",
    accent: "from-pink-500/20 to-pink-500/5",
    iconAccent: "text-pink-400",
    ring: "ring-pink-500/20",
  },
  {
    icon: Baby,
    title: "Child-Safety Mode",
    description:
      "A dedicated flow for parents and minors dealing with grooming, cyberbullying, or exposure to harmful content.",
    accent: "from-amber-500/20 to-amber-500/5",
    iconAccent: "text-amber-400",
    ring: "ring-amber-500/20",
  },
  {
    icon: Phone,
    title: "Direct to Authorities",
    description:
      "One-tap links to FIA, NCCIA, Digital Rights Foundation, and child protection helplines  with the numbers you need.",
    accent: "from-indigo-500/20 to-indigo-500/5",
    iconAccent: "text-indigo-400",
    ring: "ring-indigo-500/20",
  },
];

const stats = [
  { value: "70%", label: "Rise in cybercrime complaints (2022 – 2024)" },
  { value: "88%", label: "Victims who never report their case" },
  { value: "65%", label: "Pakistanis unaware of PECA 2016" },
  { value: "500K+", label: "Cyberattacks in Pakistan per year" },
];

const steps = [
  {
    n: "01",
    title: "Describe what happened",
    body: "Type in English or Urdu. No forms, no legal jargon  just tell the story in your own words.",
    icon: MessageSquare,
  },
  {
    n: "02",
    title: "Get a tailored plan",
    body: "The AI identifies the crime type, references PECA 2016, and returns clear next steps.",
    icon: Sparkles,
  },
  {
    n: "03",
    title: "Preserve evidence & report",
    body: "Follow the evidence checklist, then use direct links to FIA / NCCIA to file your complaint.",
    icon: CheckCircle2,
  },
];

const authorities = [
  { name: "PECA 2016", detail: "Grounded in law" },
  { name: "FIA Cyber Wing", detail: "Reporting guidance" },
  { name: "NCCIA", detail: "Investigation agency" },
  { name: "DRF Helpline", detail: "0800-39393" },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-cyan-500/30 selection:text-white">
      <Header />

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden">
        {/* Cyber-motion keyframes — scoped to this page. */}
        <style>{`
          @keyframes cs-float { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-14px) rotate(4deg)} }
          @keyframes cs-float-slow { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-22px) rotate(-6deg)} }
          @keyframes cs-drift { 0%,100%{transform:translate(0,0)} 50%{transform:translate(12px,-10px)} }
          @keyframes cs-glow { 0%,100%{opacity:.35;filter:drop-shadow(0 0 6px currentColor)} 50%{opacity:.75;filter:drop-shadow(0 0 14px currentColor)} }
          @keyframes cs-scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(1200%)} }
          @keyframes cs-orbit { from{transform:rotate(0deg) translateX(180px) rotate(0deg)} to{transform:rotate(360deg) translateX(180px) rotate(-360deg)} }
        `}</style>

        {/* Ambient background: soft grid + colour wash */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.cyan.500/0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
          <div className="absolute top-32 -left-20 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute top-40 right-0 h-[380px] w-[380px] rounded-full bg-indigo-500/10 blur-3xl" />

          {/* Horizontal "scan" line sweeping down — subtle cyber vibe */}
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
            style={{ animation: "cs-scan 9s linear infinite" }}
          />

          {/* Floating cyber icons — decorative, hidden on small screens to keep hero clean */}
          <div className="absolute inset-0 hidden md:block">
            {/* Top-left cluster */}
            <Fingerprint
              className="absolute left-[6%] top-[18%] h-10 w-10 text-cyan-400/50"
              style={{ animation: "cs-float 7s ease-in-out infinite" }}
            />
            <Lock
              className="absolute left-[14%] top-[46%] h-8 w-8 text-emerald-400/45"
              style={{ animation: "cs-float-slow 9s ease-in-out infinite", animationDelay: "1.2s" }}
            />
            <KeyRound
              className="absolute left-[3%] top-[62%] h-7 w-7 text-indigo-400/50"
              style={{ animation: "cs-drift 8s ease-in-out infinite", animationDelay: "0.6s" }}
            />
            <Bug
              className="absolute left-[22%] top-[78%] h-6 w-6 text-rose-400/50"
              style={{ animation: "cs-float 6s ease-in-out infinite", animationDelay: "0.8s" }}
            />

            {/* Top-right cluster */}
            <ShieldAlert
              className="absolute right-[7%] top-[14%] h-10 w-10 text-cyan-400/50"
              style={{ animation: "cs-float-slow 8s ease-in-out infinite" }}
            />
            <Wifi
              className="absolute right-[16%] top-[40%] h-8 w-8 text-sky-400/50"
              style={{ animation: "cs-float 7.5s ease-in-out infinite", animationDelay: "1.5s" }}
            />
            <ScanLine
              className="absolute right-[4%] top-[58%] h-8 w-8 text-purple-400/50"
              style={{ animation: "cs-drift 9s ease-in-out infinite", animationDelay: "1s" }}
            />
            <Eye
              className="absolute right-[20%] top-[74%] h-7 w-7 text-amber-400/45"
              style={{ animation: "cs-float 6.5s ease-in-out infinite", animationDelay: "0.4s" }}
            />
            <Radar
              className="absolute right-[10%] top-[86%] h-8 w-8 text-cyan-400/40"
              style={{ animation: "cs-glow 3.5s ease-in-out infinite" }}
            />
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-24 pb-20 sm:pt-20 sm:pb-28">
          <div className="flex flex-col items-center text-center">
            {/* Announcement pill */}
            <div className="group inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/[0.06] px-4 py-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-300 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
              </span>
              AI-guided help • Grounded in PECA 2016
            </div>

            {/* Headline */}
            <h1 className="mt-8 max-w-4xl text-balance text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                When cybercrime happens,
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                you don't face it alone.
              </span>
            </h1>

            {/* Subhead */}
            <p className="mt-6 max-w-2xl text-pretty text-base sm:text-lg text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              An AI assistant for Pakistanis dealing with online harassment, blackmail, hacking, fraud, or
              threats to their children. Available 24/7 in English and Urdu with legal steps grounded in
              PECA 2016.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <Link to="/chat">
                <Button
                  size="lg"
                  className="h-12 px-7 text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_10px_40px_-10px_rgba(6,182,212,0.5)] hover:shadow-[0_10px_50px_-8px_rgba(6,182,212,0.7)] transition-all"
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Get Help Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link to="/child-safety">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-7 text-base border-border/60 bg-background/40 backdrop-blur-sm hover:bg-muted/40 hover:border-cyan-500/30"
                >
                  <Baby className="mr-2 h-5 w-5 text-cyan-500" />
                  Child Safety
                </Button>
              </Link>
            </div>

            {/* Trust bar */}
            <div className="mt-14 grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4 animate-in fade-in duration-1000 delay-300">
              {authorities.map((a) => (
                <div
                  key={a.name}
                  className="flex flex-col items-center rounded-xl border border-border/40 bg-card/40 px-3 py-3 backdrop-blur-sm transition-colors hover:border-cyan-500/30"
                >
                  <span className="text-xs font-semibold text-foreground">{a.name}</span>
                  <span className="mt-0.5 text-[11px] text-muted-foreground">{a.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick topics: "pick your situation" — each card gets its own cyber-neon accent
              so the grid feels alive and colour-codes the risk category at a glance. */}
          <div className="mx-auto mt-16 max-w-4xl">
            <p className="mb-4 text-center text-xs uppercase tracking-widest text-muted-foreground">
              Or pick your situation
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {QUICK_TOPICS.map((topic, i) => {
                // Per-topic cyber palette. Keyed by crime type so it stays consistent
                // with the CRIME_TYPES colour system in knowledge-base.
                const palettes: Record<string, { border: string; glow: string; text: string; bg: string; ring: string }> = {
                  hacking: {
                    border: "border-orange-500/30 hover:border-orange-400/70",
                    glow: "hover:shadow-orange-500/25",
                    text: "text-orange-300",
                    bg: "from-orange-500/15 via-red-500/5 to-transparent",
                    ring: "ring-orange-500/30",
                  },
                  harassment: {
                    border: "border-red-500/30 hover:border-red-400/70",
                    glow: "hover:shadow-red-500/25",
                    text: "text-red-300",
                    bg: "from-red-500/15 via-rose-500/5 to-transparent",
                    ring: "ring-red-500/30",
                  },
                  blackmailing: {
                    border: "border-purple-500/30 hover:border-purple-400/70",
                    glow: "hover:shadow-purple-500/25",
                    text: "text-purple-300",
                    bg: "from-purple-500/15 via-fuchsia-500/5 to-transparent",
                    ring: "ring-purple-500/30",
                  },
                  financial_fraud: {
                    border: "border-amber-500/30 hover:border-amber-400/70",
                    glow: "hover:shadow-amber-500/25",
                    text: "text-amber-300",
                    bg: "from-amber-500/15 via-yellow-500/5 to-transparent",
                    ring: "ring-amber-500/30",
                  },
                  child_safety: {
                    border: "border-pink-500/30 hover:border-pink-400/70",
                    glow: "hover:shadow-pink-500/25",
                    text: "text-pink-300",
                    bg: "from-pink-500/15 via-rose-500/5 to-transparent",
                    ring: "ring-pink-500/30",
                  },
                };
                const p = palettes[topic.crimeType] ?? palettes.hacking;
                return (
                  <Link key={topic.id} to={`/chat?type=${topic.crimeType}`}>
                    <div
                      className={`group relative flex h-full flex-col items-start gap-2 overflow-hidden rounded-2xl border ${p.border} bg-card/50 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${p.glow}`}
                      style={{ animation: `cs-float ${6 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }}
                    >
                      {/* neon wash */}
                      <div
                        className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${p.bg} opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
                      />

                      {/* corner "cyber" tick — small L-brackets, decorative */}
                      <span className={`absolute right-2 top-2 h-2 w-2 rounded-full ${p.text.replace("text-", "bg-")} opacity-60 group-hover:opacity-100`} />

                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-background/60 text-xl ring-1 ${p.ring} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                        {topic.icon}
                      </div>

                      <span className={`text-sm font-medium leading-snug text-foreground/90 transition-colors group-hover:${p.text}`}>
                        {topic.label}
                      </span>

                      <div className={`mt-auto flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider ${p.text}`}>
                        Get help
                        <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          STATS
      ========================================================= */}
      <section className="border-y border-border/40 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="group text-center">
                <div className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
                  {stat.value}
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS — 3 steps
      ========================================================= */}
      <section className="relative py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Zap className="h-3 w-3" />
              How it works
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              From confusion to action, in three steps
            </h2>
            <p className="mt-3 text-muted-foreground">
              No forms. No jargon. No lawyer required to get started.
            </p>
          </div>

          <div className="relative mt-14 grid gap-6 md:grid-cols-3">
            {/* Connecting line */}
            <div className="pointer-events-none absolute inset-x-0 top-14 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.n}
                  className="group relative rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/5"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 ring-1 ring-cyan-500/20">
                    <Icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div className="text-[11px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
                    Step {s.n}
                  </div>
                  <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          FEATURES — bento grid
      ========================================================= */}
      <section className="relative border-y border-border/40 bg-muted/10 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              Capabilities
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything a first-time victim needs in one place
            </h2>
            <p className="mt-3 text-muted-foreground">
              Purpose-built for the Pakistani legal context, not a general chatbot.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 transition-all hover:-translate-y-0.5 hover:border-border"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${f.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  />
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-background ring-1 ${f.ring}`}>
                    <Icon className={`h-5 w-5 ${f.iconAccent}`} />
                  </div>
                  <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bilingual + accessible highlight strip */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-4 rounded-2xl border border-border/50 bg-card/50 p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 ring-1 ring-emerald-500/20">
                <Languages className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Bilingual by default</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Type in English or Urdu replies mirror the language you used, so nothing gets lost in
                  translation.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-border/50 bg-card/50 p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 ring-1 ring-indigo-500/20">
                <BookOpenCheck className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Every answer references PECA</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  You'll see the exact PECA 2016 section that applies, along with the penalty so you know
                  your rights, not just your options.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CRIME TYPES
      ========================================================= */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Shield className="h-3 w-3" />
              Cybercrime coverage
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Every major cybercrime under PECA 2016
            </h2>
            <p className="mt-3 text-muted-foreground">
              Click any category to jump straight to a guided conversation.
            </p>
          </div>

          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(CRIME_TYPES).map(([key, crime]) => (
              <Link key={key} to={`/chat?type=${key}`}>
                <Card className="group h-full overflow-hidden border-border/50 bg-card/50 transition-all hover:-translate-y-0.5 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${crime.borderColor} bg-background text-2xl transition-transform group-hover:scale-110`}
                    >
                      {crime.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold transition-colors group-hover:${crime.textColor}`}>
                        {crime.label}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {crime.description}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          LEGAL / PECA
      ========================================================= */}
      <section className="relative border-y border-border/40 bg-gradient-to-b from-indigo-500/[0.03] to-transparent py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/[0.06] px-3 py-1 text-xs font-medium text-indigo-500 dark:text-indigo-300">
                <Scale className="h-3 w-3" />
                Grounded in Pakistani law
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Legal guidance that actually applies to you
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground leading-relaxed">
                All guidance is grounded in the <span className="font-medium text-foreground">Prevention
                of Electronic Crimes Act (PECA) 2016</span> Pakistan's primary cybercrime legislation. Every
                response references the sections that apply to your case, the penalties involved, and the
                rights you have as a victim.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {[
                  { icon: Lock, label: "PECA 2016 Compliant", cls: "text-indigo-400 border-indigo-500/25 bg-indigo-500/[0.06]" },
                  { icon: Shield, label: "FIA Reporting Ready", cls: "text-cyan-400 border-cyan-500/25 bg-cyan-500/[0.06]" },
                  { icon: Heart, label: "Victim-First", cls: "text-pink-400 border-pink-500/25 bg-pink-500/[0.06]" },
                  { icon: Users, label: "Bilingual (EN / UR)", cls: "text-emerald-400 border-emerald-500/25 bg-emerald-500/[0.06]" },
                ].map(({ icon: Icon, label, cls }) => (
                  <div
                    key={label}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${cls}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: fake "case card" — feels product-y without needing hero art */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 blur-2xl" />
              <div className="relative rounded-2xl border border-border/60 bg-card/70 p-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                  <span className="ml-2 text-xs text-muted-foreground">CyberShield • conversation</span>
                </div>

                <div className="space-y-4 py-5">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-border/50 bg-muted/40 px-4 py-2.5 text-sm">
                    Someone is threatening to share my private photos unless I pay them.
                  </div>
                  <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-cyan-500/15 to-blue-500/10 px-4 py-3 text-sm">
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-purple-500/25 bg-purple-500/[0.08] px-2 py-0.5 text-[11px] text-purple-400">
                      <Lock className="h-3 w-3" /> Crime Type: Blackmailing
                    </div>
                    <p className="leading-relaxed text-foreground/90">
                      I'm here with you. First <span className="font-medium">do not pay</span>. Let's
                      preserve evidence, then file with the FIA Cyber Wing under{" "}
                      <span className="font-medium text-cyan-500">PECA 21</span>.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                    Generating your evidence checklist…
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}
      <section className="relative overflow-hidden py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,theme(colors.cyan.500/0.12),transparent_60%)]" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Ready when you are.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            The sooner you act, the more evidence you preserve. Start a private conversation now
            no signup required to try.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/chat">
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_10px_40px_-10px_rgba(6,182,212,0.5)] hover:shadow-[0_10px_50px_-8px_rgba(6,182,212,0.7)] transition-all"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Start a conversation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a
              href="tel:15"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              In immediate danger? Call 15 (Police) or 1122 (Emergency)
            </a>
          </div>
        </div>
      </section>

      {/* Analytics */}
      <AnalyticsSection />

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-border/40 bg-muted/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text font-semibold text-transparent dark:from-cyan-400 dark:to-blue-400">
                CyberShield AI
              </span>
            </div>
            <p className="text-center text-xs text-muted-foreground sm:text-right">
              Cybercrime guidance grounded in PECA 2016 • Built for victims in Pakistan • ©️ {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}