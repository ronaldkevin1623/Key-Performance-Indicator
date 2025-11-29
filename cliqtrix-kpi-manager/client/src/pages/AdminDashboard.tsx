import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import {
  BarChart3,
  Users,
  FolderKanban,
  TrendingUp,
  Plus,
  Trophy,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Target,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const { dashboardApi } = api as any;

interface DashboardStats {
  totalProjects: number;
  totalUsers: number;
  totalTasks: number;
  completionRate: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      navigate("/auth/login");
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== "admin") {
      navigate("/dashboard/employee");
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const data = await dashboardApi.getAdminStats();
      const s = (data as any)?.data || data;
      setStats(s as DashboardStats);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
      navigate("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  const healthLabel =
    (stats?.completionRate || 0) >= 75
      ? "Healthy"
      : (stats?.completionRate || 0) >= 50
      ? "Stable"
      : "Needs attention";

  const completionRate = stats?.completionRate || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-24">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-6 py-24 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Company-wide performance overview
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/leaderboard")}>
              <Trophy className="mr-2 h-4 w-4" />
              Leaderboard
            </Button>
            <Button variant="outline" onClick={() => navigate("/teams/create")}>
              <Users className="mr-2 h-4 w-4" />
              Create Team
            </Button>
            <Button onClick={() => navigate("/projects/create")}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
            <Button variant="outline" onClick={() => navigate("/tasks/create")}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border/50 shadow-elegant hover:shadow-glow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats?.totalProjects || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Active projects</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-elegant hover:shadow-glow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats?.totalUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Active users</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-elegant hover:shadow-glow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats?.totalTasks || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all projects
              </p>
            </CardContent>
          </Card>

          {/* Completion Rate card now navigates to chart page */}
          <Card
            className="border-border/50 shadow-elegant hover:shadow-glow transition-shadow cursor-pointer"
            onClick={() => navigate("/admin/progress")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completion Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {completionRate}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Overall performance (tap to view trend)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions + Performance snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your team and projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                onClick={() => navigate("/projects")}
              >
                <FolderKanban className="mr-2 h-4 w-4" />
                View All Projects
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/tasks")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View All Tasks
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/teams")}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Team
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle>Performance Snapshot</CardTitle>
              <CardDescription>
                Where your organisation stands right now
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Gauge className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    Overall health: {healthLabel}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on completion rate across all active tasks.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border border-border/40 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Delivery status
                    </span>
                    {completionRate >= 60 ? (
                      <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-amber-300" />
                    )}
                  </div>
                  <div className="mt-1 text-sm text-foreground">
                    {completionRate}% tasks completed
                  </div>
                </div>

                <div className="rounded-md border border-border/40 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Work in progress
                    </span>
                    <BarChart3 className="h-3 w-3 text-primary" />
                  </div>
                  <div className="mt-1 text-sm text-foreground">
                    {stats?.totalTasks || 0} total tasks across{" "}
                    {stats?.totalProjects || 0} projects
                  </div>
                </div>

                <div className="rounded-md border border-border/40 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Team size
                    </span>
                    <Users className="h-3 w-3 text-sky-400" />
                  </div>
                  <div className="mt-1 text-sm text-foreground">
                    {stats?.totalUsers || 0} active members
                  </div>
                </div>

                <div className="rounded-md border border-border/40 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Focus suggestion
                    </span>
                    <Target className="h-3 w-3 text-primary" />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {completionRate < 50
                      ? "Review overdue tasks and rebalance workload."
                      : "Keep recognising teams that finish high‑impact work."}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
