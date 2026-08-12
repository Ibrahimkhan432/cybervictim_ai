import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, ArrowRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getAPIEndpoint } from "@/lib/api-config";

interface ContentTypeBreakdown {
  content_type: string;
  count: number;
  percentage: number;
}

interface PublicAnalyticsOverview {
  total_users: number;
  total_conversations: number;
  total_messages: number;
  unique_content_types: number;
  content_types: ContentTypeBreakdown[];
}

const BAR_COLORS = [
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#22c55e",
];

export default function AnalyticsSection() {
  const [data, setData] = useState<PublicAnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          getAPIEndpoint("/api/v1/public/analytics/overview")
        );
        if (res.ok) setData(await res.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !data) return null;

  const top = data.content_types.slice(0, 6);

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-3">
              <BarChart3 className="h-4 w-4" />
              Platform Analytics
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              What the community is reporting
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Anonymous, aggregate view of the cybercrime categories people
              bring to CyberShield.
            </p>
          </div>
          <Link
            to="/analytics"
            className="inline-flex items-center gap-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            See full analytics <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Kpi label="Users" value={data.total_users} />
          <Kpi label="Conversations" value={data.total_conversations} />
          <Kpi label="Messages" value={data.total_messages} />
          <Kpi label="Content Types" value={data.unique_content_types} />
        </div>

        <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur p-6">
          <h3 className="text-lg font-semibold mb-4">Top content types</h3>
          {top.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No conversations recorded yet.
            </p>
          ) : (
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={300} minWidth={420}>
                <BarChart
                  data={top.map((c) => ({ name: c.content_type, count: c.count }))}
                  margin={{ top: 8, right: 16, left: 0, bottom: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: 12 }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    allowDecimals={false}
                    style={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {top.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
