// src/pages/CompanyProgress.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const { projectsApi } = api as any;

interface KpiPoint {
  date: string;      // ISO date: "2024-11-26"
  userId: string;
  userName: string;
  points: number;    // KPI points (daily or cumulative)
}

interface KpiProgressResponse {
  projectId?: string;
  projectName?: string;
  startDate: string;
  endDate: string;
  data?: KpiPoint[]; // optional to be defensive
}

interface EmployeeSeries {
  userId: string;
  userName: string;
  color: string;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const timeRanges = ["Week", "Month", "3 Months", "6 Months", "Year", "ALL"];

const CompanyProgress = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [kpiData, setKpiData] = useState<KpiProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState("ALL");
  const [selectedUserId, setSelectedUserId] = useState<string | "all">("all");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await projectsApi.getKpiProgress();
        // res is { startDate, endDate, data: [...] }
        setKpiData(res as KpiProgressResponse);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load KPI progress.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const employees: EmployeeSeries[] = useMemo(() => {
    const data = kpiData?.data ?? [];
    if (data.length === 0) return [];
    const colorPalette = ["#3b82f6", "#22c55e", "#eab308", "#a855f7", "#f97316"];
    const byUser = new Map<string, EmployeeSeries>();
    data.forEach((p) => {
      if (!byUser.has(p.userId)) {
        const idx = byUser.size;
        byUser.set(p.userId, {
          userId: p.userId,
          userName: p.userName,
          color: colorPalette[idx % colorPalette.length],
        });
      }
    });
    return Array.from(byUser.values());
  }, [kpiData]);

  // overall min/max dates
  const [minIso, maxIso] = useMemo(() => {
    const data = kpiData?.data ?? [];
    if (data.length === 0) {
      const today = new Date().toISOString().split("T")[0];
      return [today, today];
    }
    const dates = data.map((p) => p.date).sort();
    return [dates[0], dates[dates.length - 1]];
  }, [kpiData]);

  // apply range filter
  const [rangeStartIso, rangeEndIso] = useMemo(() => {
    const min = new Date(minIso);
    const max = new Date(maxIso);

    const clone = (d: Date) => new Date(d.getTime());
    let start = min;
    let end = max;

    if (selectedRange === "Week") {
      end = clone(max);
      start = new Date(end);
      start.setDate(end.getDate() - 7);
    } else if (selectedRange === "Month") {
      end = clone(max);
      start = new Date(end);
      start.setMonth(end.getMonth() - 1);
    } else if (selectedRange === "3 Months") {
      end = clone(max);
      start = new Date(end);
      start.setMonth(end.getMonth() - 3);
    } else if (selectedRange === "6 Months") {
      end = clone(max);
      start = new Date(end);
      start.setMonth(end.getMonth() - 6);
    } else if (selectedRange === "Year") {
      end = clone(max);
      start = new Date(end);
      start.setFullYear(end.getFullYear() - 1);
    } else {
      start = min;
      end = max;
    }

    if (start < min) start = min;
    if (end > max) end = max;

    return [
      start.toISOString().split("T")[0],
      end.toISOString().split("T")[0],
    ];
  }, [minIso, maxIso, selectedRange]);

  // build chart data
  const chartData = useMemo(() => {
    const data = kpiData?.data ?? [];
    if (data.length === 0) return [];

    const byDate: Record<
      string,
      { dateLabel: string; [userId: string]: number | undefined }
    > = {};

    data.forEach((p) => {
      if (p.date < rangeStartIso || p.date > rangeEndIso) return;
      if (selectedUserId !== "all" && p.userId !== selectedUserId) return;

      if (!byDate[p.date]) {
        byDate[p.date] = {
          dateLabel: formatDate(p.date),
        };
      }
      byDate[p.date][p.userId] = p.points;
    });

    return Object.keys(byDate)
      .sort()
      .map((d) => byDate[d]);
  }, [kpiData, rangeStartIso, rangeEndIso, selectedUserId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-24">
          <div className="text-center">Loading project KPI progress...</div>
        </div>
      </div>
    );
  }

  const data = kpiData?.data ?? [];
  if (!kpiData || data.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-24">
          <div className="text-center text-muted-foreground">
            No KPI data available.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-24 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Company KPI Progress
            </h1>
            <p className="text-muted-foreground text-sm">
              Employee KPI points over time across projects
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Admin Dashboard
          </Button>
        </div>

        <Card className="bg-card">
          <CardHeader className="pb-2 flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-foreground">
                Project Progress Chart
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                KPI points per employee over time
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {timeRanges.map((range) => (
                <Button
                  key={range}
                  variant={selectedRange === range ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "text-xs px-2 py-1 h-7",
                    selectedRange === range
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setSelectedRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border/50"
                  />
                  <XAxis
                    dataKey="dateLabel"
                    className="text-xs"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                    }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                    }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                    domain={[0, "auto"]}
                    label={{
                      value: "KPI Points",
                      angle: -90,
                      position: "insideLeft",
                      style: {
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid " + "hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    formatter={(value) => {
                      const emp = employees.find((e) => e.userId === value);
                      return (
                        <span className="text-muted-foreground text-sm">
                          {emp?.userName || value}
                        </span>
                      );
                    }}
                  />
                  {employees
                    .filter(
                      (e) =>
                        selectedUserId === "all" || e.userId === selectedUserId
                    )
                    .map((emp) => (
                      <Line
                        key={emp.userId}
                        type="monotone"
                        dataKey={emp.userId}
                        name={emp.userId}
                        stroke={emp.color}
                        strokeWidth={2.5}
                        dot={{ fill: emp.color, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                        connectNulls={false}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Employee filter buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedUserId("all")}
                className={cn(
                  "text-xs px-2 py-1 rounded-full border",
                  selectedUserId === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground"
                )}
              >
                All employees
              </button>
              {employees.map((emp) => (
                <button
                  key={emp.userId}
                  type="button"
                  onClick={() => setSelectedUserId(emp.userId)}
                  className={cn(
                    "flex items-center gap-2 text-xs px-2 py-1 rounded-full border",
                    selectedUserId === emp.userId
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border text-muted-foreground"
                  )}
                >
                  <User className="w-3 h-3" />
                  {emp.userName}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyProgress;
