// src/pages/CompletedGoals.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const { goalsApi } = api as any;

interface EmployeeGoal {
  _id: string;
  title: string;
  description?: string;
  targetPoints?: number;
  priority?: number;
  startDate: string;
  endDate: string;
  status: "open" | "done";
  createdAt?: string;
  updatedAt?: string;
}

const CompletedGoals = () => {
  const [completedGoals, setCompletedGoals] = useState<EmployeeGoal[]>([]);
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

    loadCompletedGoals();
  }, [navigate]);

  const loadCompletedGoals = async () => {
    try {
      setLoading(true);
      const res = await goalsApi.getCompleted();
      const data = (res as any).data || res;
      const goals: EmployeeGoal[] = data.goals || data.goal || [];
      goals.sort((a, b) => {
        const da = new Date(a.updatedAt || a.endDate).getTime();
        const db = new Date(b.updatedAt || b.endDate).getTime();
        return db - da; // newest first
      });
      setCompletedGoals(goals);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load completed goals.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-6 py-24 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Completed goals
            </h1>
            <p className="text-muted-foreground text-sm">
              Goals you have marked as done.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard/employee")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to dashboard
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/goals/set")}
            >
              <Target className="h-4 w-4 mr-1" />
              New goal
            </Button>
          </div>
        </div>

        <Card className="border-border/50 shadow-elegant">
          <CardHeader>
            <CardTitle>Completed goals</CardTitle>
            <CardDescription>
              Review what you have already achieved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">
                Loading completed goals...
              </p>
            ) : completedGoals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You have not completed any goals yet.
              </p>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {completedGoals.map((g) => (
                  <div
                    key={g._id}
                    className="rounded-xl border border-border/60 bg-muted/60 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-7 w-7 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">
                            {g.title}
                          </span>
                          <Badge
                            variant="outline"
                            className="border-emerald-500/60 text-emerald-300 text-[10px] px-1.5 py-0"
                          >
                            Done
                          </Badge>
                          {g.priority !== undefined && (
                            <Badge
                              variant="outline"
                              className="border-sky-500/60 text-sky-300 text-[10px] px-1.5 py-0"
                            >
                              Priority {g.priority}
                            </Badge>
                          )}
                        </div>
                        {g.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {g.description}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Finished on{" "}
                          {new Date(
                            g.updatedAt || g.endDate
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                          {g.targetPoints !== undefined && (
                            <> · Target {g.targetPoints} pts</>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompletedGoals;
