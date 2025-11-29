// src/pages/EmployeeDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  TrendingUp,
  Bell,
  Target,
  Bot,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const { dashboardApi, tasksApi, goalsApi } = api as any;

interface EmployeeStats {
  totalTasks: number;
  completedTasks: number;
  totalPoints: number;
  completionRate: number;
}

interface TaskNotification {
  _id: string;
  title: string;
  status: string;
  dueDate?: string;
}

interface EmployeeGoal {
  _id: string;
  title: string;
  description?: string;
  targetPoints?: number;
  priority?: number;
  startDate: string;
  endDate: string;
  status: "open" | "done";
}

const WEEKLY_TARGET_POINTS = 200;

const EmployeeDashboard = () => {
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [recentCompleted, setRecentCompleted] = useState<TaskNotification[]>(
    []
  );
  const [recentPending, setRecentPending] = useState<TaskNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);

  const [pendingCount, setPendingCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [dueTodayCount, setDueTodayCount] = useState(0);

  const [todayGoals, setTodayGoals] = useState<EmployeeGoal[]>([]);
  const [goalLoading, setGoalLoading] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      navigate("/auth/login");
      return;
    }

    fetchDashboardData();
    loadTasksAndNotifications();
    loadTodayGoals();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const data = await dashboardApi.getEmployeeStats();
      setStats(data.data);
    } catch {
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

  const loadTasksAndNotifications = async () => {
    try {
      setNotifLoading(true);
      const data = await tasksApi.getAll();
      const list: any[] = Array.isArray(data) ? data : data?.tasks || data || [];

      list.sort((a, b) => {
        const da = new Date(
          a.updatedAt || a.dueDate || a.createdAt || 0
        ).getTime();
        const db = new Date(
          b.updatedAt || b.dueDate || b.createdAt || 0
        ).getTime();
        return db - da;
      });

      const today = new Date();
      let pending = 0;
      let inProg = 0;
      let comp = 0;
      let dueToday = 0;

      list.forEach((t) => {
        if (t.status === "completed") comp += 1;
        else if (t.status === "in-progress") inProg += 1;
        else pending += 1;

        if (t.dueDate) {
          const d = new Date(t.dueDate);
          if (
            d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate()
          ) {
            dueToday += 1;
          }
        }
      });

      setPendingCount(pending);
      setInProgressCount(inProg);
      setCompletedCount(comp);
      setDueTodayCount(dueToday);

      const completed = list
        .filter((t) => t.status === "completed")
        .slice(0, 10);
      const pendingList = list
        .filter((t) => t.status !== "completed")
        .slice(0, 10);

      setRecentCompleted(
        completed.map((t) => ({
          _id: t._id,
          title: t.title,
          status: t.status,
          dueDate: t.dueDate,
        }))
      );
      setRecentPending(
        pendingList.map((t) => ({
          _id: t._id,
          title: t.title,
          status: t.status,
          dueDate: t.dueDate,
        }))
      );
    } finally {
      setNotifLoading(false);
    }
  };

  const loadTodayGoals = async () => {
    try {
      setGoalLoading(true);
      const res = await goalsApi.getToday();
      const data = (res as any).data || res;
      const goals: EmployeeGoal[] = data.goals || data.goal || [];
      goals.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
      setTodayGoals(goals);
    } catch {
      setTodayGoals([]);
    } finally {
      setGoalLoading(false);
    }
  };

  const handleCompleteGoal = async (id: string) => {
    try {
      await goalsApi.complete(id);
      setTodayGoals((prev) => prev.filter((g) => g._id !== id));
    } catch {
      toast({
        title: "Error",
        description: "Failed to complete goal.",
        variant: "destructive",
      });
    }
  };

  const openTask = (id: string) => {
    navigate(`/tasks/${id}`);
  };

  const weeklyPoints = stats?.totalPoints || 0;
  const weeklyProgress = Math.min(
    100,
    (weeklyPoints / WEEKLY_TARGET_POINTS) * 100
  );
  const weeklyStatus =
    weeklyProgress >= 100
      ? "Goal reached"
      : weeklyProgress >= 75
      ? "On track"
      : "Needs focus";

  const milestones = useMemo(() => {
    const pts = stats?.totalPoints || 0;
    const comp = stats?.completedTasks || 0;
    const list: string[] = [];
    if (pts >= 100) list.push("Crossed 100 total points");
    if (pts >= 500) list.push("Crossed 500 total points");
    if (comp >= 10) list.push("Completed 10 tasks");
    if (comp >= 25) list.push("Completed 25 tasks");
    return list;
  }, [stats]);

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
      <div className="container mx-auto px-6 py-24">
        {/* Header + Chatbot + Set goal buttons */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-1">
              My Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your performance and assigned tasks
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/chatbot")}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Bot className="h-4 w-4" />
              Chatbot
            </button>
            <button
              onClick={() => navigate("/goals/set")}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              <Target className="h-4 w-4" />
              Set goal
            </button>
          </div>
        </div>

        {/* Today's goals card */}
        <Card className="mb-8 border-border/50 shadow-elegant">
          <CardContent className="py-6 px-6 flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="mt-1 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-base font-semibold text-foreground">
                  Today&apos;s goal
                </div>
                {goalLoading ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    Loading your goals...
                  </p>
                ) : todayGoals.length === 0 ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    Focus on your most important tasks and complete them within
                    your working hours to avoid overdue items.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {todayGoals.map((g) => (
                      <li
                        key={g._id}
                        className="flex items-center justify-between text-sm text-foreground"
                      >
                        <span>
                          {g.title}
                          {g.priority !== undefined && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (Priority {g.priority})
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCompleteGoal(g._id)}
                          className="inline-flex items-center gap-1 rounded-full border border-emerald-500/70 bg-emerald-500/5 px-3 py-0.5 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/15 hover:border-emerald-400 transition-colors"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Done
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/goals/completed")}
              className="text-xs text-primary underline"
            >
              Completed goals →
            </button>
          </CardContent>
        </Card>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50 shadow-elegant hover:shadow-glow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Points
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats?.totalPoints || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Performance score
              </p>
            </CardContent>
          </Card>

          <Card
            className="border-border/50 shadow-elegant hover:shadow-glow transition-shadow cursor-pointer"
            onClick={() => navigate("/tasks/assigned")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Assigned Tasks
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats?.totalTasks || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active assignments
              </p>
              <button
                className="mt-4 underline text-primary text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/tasks/assigned");
                }}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                View assigned tasks →
              </button>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-elegant hover:shadow-glow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats?.completedTasks || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tasks finished
              </p>
            </CardContent>
          </Card>

          {/* UPDATED: Completion Rate card navigates to employee progress */}
          <Card
            className="border-border/50 shadow-elegant hover:shadow-glow transition-shadow cursor-pointer"
            onClick={() => navigate("/employee/progress")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completion Rate
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats?.completionRate || 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                View progress over time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom row: performance progress + notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Progress card */}
          <Card className="border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle>Performance Progress</CardTitle>
              <CardDescription>Your current achievement level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Task Completion</span>
                  <span className="text-sm text-muted-foreground">
                    {stats?.completionRate || 0}%
                  </span>
                </div>
                <Progress value={stats?.completionRate || 0} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">
                    This week&apos;s goal
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {weeklyPoints}/{WEEKLY_TARGET_POINTS}
                  </span>
                </div>
                <Progress value={weeklyProgress} className="h-2" />
                <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                  <span>Status:</span>
                  <span
                    className={
                      weeklyStatus === "Goal reached"
                        ? "text-emerald-400"
                        : weeklyStatus === "On track"
                        ? "text-sky-400"
                        : "text-amber-300"
                    }
                  >
                    {weeklyStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Today&apos;s workload
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge
                    variant="outline"
                    className="border-sky-500/60 text-sky-300"
                  >
                    Pending: {pendingCount}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-amber-500/60 text-amber-300"
                  >
                    In progress: {inProgressCount}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/60 text-emerald-300"
                  >
                    Completed: {completedCount}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-fuchsia-500/60 text-fuchsia-300"
                  >
                    Due today: {dueTodayCount}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Milestones
                </span>
                {milestones.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Keep going to unlock your first milestone.
                  </p>
                ) : (
                  <ul className="text-xs list-disc list-inside text-emerald-300 space-y-1">
                    {milestones.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Completed and pending tasks</CardDescription>
            </CardHeader>
            <CardContent>
              {notifLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading notifications...
                </p>
              ) : recentCompleted.length === 0 &&
                recentPending.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No notifications right now.
                </p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {[
                    ...recentCompleted.map((t) => ({
                      t,
                      type: "completed" as const,
                    })),
                    ...recentPending.map((t) => ({
                      t,
                      type: "pending" as const,
                    })),
                  ].map(({ t, type }) => (
                    <button
                      key={t._id}
                      type="button"
                      onClick={() => openTask(t._id)}
                      className="w-full text-left rounded-2xl bg-muted/80 border border-border/40 px-4 py-3 flex gap-3 items-start shadow-sm hover:bg-muted transition-colors"
                    >
                      <div className="mt-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bell className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>
                            {type === "completed"
                              ? "Task completed"
                              : "Pending task"}
                          </span>
                          <span>now</span>
                        </div>
                        <div className="font-semibold text-sm text-foreground">
                          {t.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {type === "completed"
                            ? "Great job! This task is finished."
                            : t.dueDate
                            ? `Due ${new Date(
                                t.dueDate
                              ).toLocaleDateString("en-IN")}`
                            : "No due date set."}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
