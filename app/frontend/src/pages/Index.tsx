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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CRIME_TYPES, QUICK_TOPICS } from "@/lib/knowledge-base";
import Header from "@/components/Header";
import AnalyticsSection from "@/components/AnalyticsSection";

const features = [
  {
    icon: Clock,
    title: "24/7 Instant Guidance",
    description:
      "Get help anytime, day or night. Our AI responds immediately with clear step-by-step instructions for your situation.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Shield,
    title: "Crime Classification",
    description:
      "Automatically identifies the type of cybercrime from your description — no need to figure it out yourself.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: FileCheck,
    title: "Evidence Collection",
    description:
      "Get a clear checklist of exactly what evidence to preserve before filing your complaint with authorities.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Heart,
    title: "Psychological Support",
    description:
      "Detects emotional distress and provides empathetic support first, because your well-being matters before anything else.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Baby,
    title: "Child Safety",
    description:
      "Dedicated guidance for parents and children dealing with online threats, grooming, and cyberbullying.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Phone,
    title: "Direct Authority Referral",
    description:
      "Get direct links and contact details for FIA, Digital Rights Foundation, and child protection services.",
    color: "from-emerald-500 to-teal-500",
  },
];

const stats = [
  { value: "70%", label: "Rise in cybercrime complaints (2022-2024)" },
  { value: "88%", label: "Victims who never report their case" },
  { value: "65%", label: "Pakistanis unaware of PECA 2016" },
  { value: "500K+", label: "Cyberattacks in Pakistan per year" },
];

const HERO_IMAGE = "https://mgx-backend-cdn.metadl.com/generate/images/872104/2026-06-29/rpjrpiicaijq/hero-cybershield-protection.png";
const LEGAL_IMAGE = "https://mgx-backend-cdn.metadl.com/generate/images/872104/2026-06-29/rpjrqsycailq/legal-guidance-peca-law.png";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-blue-500/5 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-sm font-medium mb-8">
                <Shield className="h-4 w-4" />
                Powered by AI • Grounded in PECA 2016
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Your Guide Through
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Cybercrime in Pakistan
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                An intelligent AI assistant that helps you understand your situation, collect evidence,
                and take the right steps — available 24/7, in English and Urdu.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/chat">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all px-8 h-12 text-base"
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Get Help Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/child-safety">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-500 dark:hover:text-cyan-300 px-8 h-12 text-base"
                  >
                    <Baby className="mr-2 h-5 w-5" />
                    Child Safety
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-cyan-500/20 rounded-3xl blur-2xl" />
              <img
                src={HERO_IMAGE}
                alt="CyberShield AI - Digital protection shield"
                className="relative rounded-2xl shadow-2xl shadow-cyan-500/10 w-full object-cover"
              />
            </div>
          </div>

          {/* Quick Topic Cards */}
          <div className="mt-16 max-w-2xl mx-auto">
            <p className="text-center text-sm text-muted-foreground mb-4">
              Or select your situation to get started:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {QUICK_TOPICS.map((topic) => (
                <Link key={topic.id} to={`/chat?type=${topic.crimeType}`}>
                  <Card className="group cursor-pointer border-border/50 bg-card/50 hover:bg-cyan-500/5 hover:border-cyan-500/30 transition-all">
                    <CardContent className="flex items-center gap-3 p-4">
                      <span className="text-2xl">{topic.icon}</span>
                      <span className="text-sm font-medium text-foreground group-hover:text-cyan-400 transition-colors">
                        {topic.label}
                      </span>
                      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                CyberShield AI
              </span>{" "}
              Helps You
            </h2>
            <p className="text-muted-foreground text-lg">
              From understanding your situation to filing a proper complaint — we guide you through
              every step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={i}
                  className="group border-border/50 bg-card/50 hover:border-cyan-500/30 transition-all"
                >
                  <CardContent className="p-6">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg mb-4`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Crime Types Section */}
      <section className="py-20 bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Cybercrime Types We Cover
            </h2>
            <p className="text-muted-foreground text-lg">
              All major cybercrimes under PECA 2016, with specific guidance for each.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(CRIME_TYPES).map(([key, crime]) => (
              <Link key={key} to={`/chat?type=${key}`}>
                <Card className="group cursor-pointer border-border/50 bg-card/50 hover:border-cyan-500/30 transition-all h-full">
                  <CardContent className="p-5 flex items-start gap-4">
                    <span className="text-3xl">{crime.icon}</span>
                    <div>
                      <h3 className="font-semibold mb-1 group-hover:text-cyan-400 transition-colors">
                        {crime.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">{crime.description}</p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all mt-1 shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-2xl" />
              <img
                src={LEGAL_IMAGE}
                alt="Legal guidance with PECA 2016 law"
                className="relative rounded-2xl shadow-2xl shadow-indigo-500/10 w-full object-cover"
              />
            </div>
            <div>
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-6">
                <Scale className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Grounded in{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Pakistani Law
                </span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                All guidance is based on the Prevention of Electronic Crimes Act (PECA) 2016 —
                Pakistan's primary cybercrime legislation. Every response references relevant legal
                sections, penalties, and your rights as a victim.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm">
                  <Lock className="h-4 w-4" />
                  PECA 2016 Compliant
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-sm">
                  <Shield className="h-4 w-4" />
                  FIA Reporting Guidance
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
                  <Heart className="h-4 w-4" />
                  Victim-First Approach
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-cyan-500/5 via-blue-500/5 to-transparent border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Get Help?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Don't wait. The sooner you take action, the better protected you'll be. Our AI is ready
            to guide you right now.
          </p>
          <Link to="/chat">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all px-10 h-13 text-base"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Start Chatting Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Analytics Section */}
      <AnalyticsSection />

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <span className="font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                CyberShield AI
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Cybercrime Guidance Generative AI • Grounded in PECA 2016 • For victims in Pakistan
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}