import { useEffect, useState } from "react";
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
import Header from "@/components/Header";
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
  "#eab308",
  "#ef4444",
];

export default function Analytics() {
  const [data, setData] = useState<PublicAnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(getAPIEndpoint("/api/v1/public/analytics/overview"));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setData(await res.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
            Platform Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Aggregate, anonymous insights from the CyberShield community.
          </p>
        </div>

        {loading && (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Loading analytics…
          </div>
        )}

        {error && !loading && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-600 dark:text-red-400">
           <h5 className="font-semibold">Empty Conversation History</h5>
          </div>
        )}

        {data && !loading && !error && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <KpiTile label="Total Users" value={data.total_users} />
              <KpiTile label="Total Conversations" value={data.total_conversations} />
              <KpiTile label="Total Messages" value={data.total_messages} />
              <KpiTile label="Content Types" value={data.unique_content_types} />
            </div>

            <section className="rounded-xl border border-border/60 bg-card/50 backdrop-blur p-6">
              <h2 className="text-xl font-semibold mb-1">Content Types Detected</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Distribution of conversations across cybercrime categories.
              </p>

              {data.content_types.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-muted-foreground">
                  No conversations recorded yet.
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={360} minWidth={480}>
                    <BarChart
                      data={data.content_types.map((c) => ({
                        name: c.content_type,
                        count: c.count,
                      }))}
                      margin={{ top: 8, right: 16, left: 0, bottom: 24 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={60}
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
                        {data.content_types.map((_, i) => (
                          <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {data.content_types.length > 0 && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.content_types.map((c, i) => (
                    <div
                      key={c.content_type}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-background/40 px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
                        />
                        <span className="truncate text-sm">{c.content_type}</span>
                      </div>
                      <span className="text-sm text-muted-foreground shrink-0">
                        {c.count} · {c.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function KpiTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums">{value.toLocaleString()}</p>
    </div>
  );
}
