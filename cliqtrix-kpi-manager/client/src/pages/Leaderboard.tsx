import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const { dashboardApi } = api;

interface LeaderboardRow {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  earnedPoints: number;
  totalPoints: number;
  pendingTasks: number;
}

const Leaderboard = () => {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");

    if (!token || !userRaw) {
      navigate("/auth/login");
      return;
    }

    const user = JSON.parse(userRaw);
    if (user.role !== "admin") {
      navigate("/dashboard/employee");
      return;
    }

    fetchLeaderboard();
  }, [navigate]);

  const fetchLeaderboard = async () => {
    try {
      const data = await dashboardApi.getLeaderboard();
      const list = data?.data?.leaderboard || data.leaderboard || [];
      setRows(list);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load leaderboard",
        variant: "destructive",
      });
      navigate("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Leaderboard</h1>
            <p className="text-muted-foreground">
              Top performers in your company, ordered by KPI points and workload.
            </p>
          </div>
        </div>

        <Card className="border-border/50 shadow-elegant">
          <CardHeader>
            <CardTitle>Employee Performance</CardTitle>
            <CardDescription>
              Higher earned points and fewer pending tasks rank higher.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">Loading leaderboard...</div>
            ) : rows.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No data yet. Assign tasks and record progress to see the leaderboard.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground">
                      <th className="text-left px-3 py-2">Rank</th>
                      <th className="text-left px-3 py-2">Employee</th>
                      <th className="text-left px-3 py-2">Email</th>
                      <th className="text-right px-3 py-2">Earned Points</th>
                      <th className="text-right px-3 py-2">Total Points</th>
                      <th className="text-right px-3 py-2">Pending Tasks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={row.userId} className="border-b border-border/20">
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="px-3 py-2">
                          {row.firstName} {row.lastName}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{row.email}</td>
                        <td className="px-3 py-2 text-right font-semibold text-primary">
                          {row.earnedPoints || 0}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {row.totalPoints || 0}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {row.pendingTasks || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
