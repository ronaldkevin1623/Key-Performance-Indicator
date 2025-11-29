// src/pages/EmployeeProgressPage.tsx
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const { tasksApi } = api as any;

interface Point {
  date: string;
  completion: number;
}

const EmployeeProgressPage = () => {
  const [series, setSeries] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await tasksApi.getAll();
      const data: any[] = Array.isArray(res) ? res : res?.tasks || res || [];

      const byDate: Record<string, { done: number; total: number }> = {};

      data.forEach((t) => {
        const d = new Date(t.updatedAt || t.dueDate || t.createdAt || Date.now());
        const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
        if (!byDate[key]) byDate[key] = { done: 0, total: 0 };
        byDate[key].total += 1;
        if (t.status === "completed") byDate[key].done += 1;
      });

      const sortedKeys = Object.keys(byDate).sort();
      let cumDone = 0;
      let cumTotal = 0;

      const points: Point[] = sortedKeys.map((k) => {
        cumDone += byDate[k].done;
        cumTotal += byDate[k].total;
        return {
          date: k,
          completion: cumTotal ? Math.round((cumDone / cumTotal) * 100) : 0,
        };
      });

      setSeries(points);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load progress data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-6 py-24">
        <Card className="border-border/50 shadow-elegant">
          <CardHeader>
            <CardTitle>My task progress</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">
                Loading chart...
              </p>
            ) : series.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tasks yet to show progress.
              </p>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2933" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#020617",
                        borderColor: "#1f2933",
                        fontSize: 12,
                      }}
                      formatter={(value) => [`${value}%`, "Completion"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="completion"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeProgressPage;
