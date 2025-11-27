import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const { tasksApi } = api;

const TaskDetails = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completionDetails, setCompletionDetails] = useState("");
  const [completionPercent, setCompletionPercent] = useState<number>(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!taskId) return;
    fetchTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getById(taskId!);
      const t = data?.data?.task || data?.task || data;
      setTask(t);
      setCompletionDetails(t.completionDetails || "");
      setCompletionPercent(t.completionPercent || 0);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId) return;

    try {
      // 1) Update completion fields
      await tasksApi.update(taskId, {
        completionDetails,
        completionPercent,
        status: completionPercent >= 100 ? "completed" : task.status,
      });

      // 2) Add a history entry as a comment (progress log)
      const logText = `Progress updated to ${completionPercent}% - ${completionDetails || "No details"}`;
      await tasksApi.addComment(taskId, { text: logText });

      toast({ title: "Task updated", description: "Completion details saved!" });
      await fetchTask(); // Refresh to show new log
    } catch {
      toast({
        title: "Error",
        description: "Could not update task completion.",
        variant: "destructive",
      });
    }
  };

  if (loading || !task)
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-24 text-center">Loading task...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="border-border/50 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
              {task.title}
              <span
                className={
                  "ml-2 px-2 py-1 rounded text-sm " +
                  (task.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : task.status === "in-progress"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700")
                }
              >
                {task.status}
              </span>
            </CardTitle>
            <CardDescription>
              Project: <span className="font-medium">{task.project?.name}</span>
              <br />
              Assigned by: {task.assignedBy?.firstName} {task.assignedBy?.lastName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Description</Label>
              <div className="bg-muted rounded p-3 mb-4">{task.description}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start</Label>
                <Input
                  value={
                    task.startDate
                      ? new Date(task.startDate).toLocaleString()
                      : "-"
                  }
                  readOnly
                />
              </div>
              <div>
                <Label>Due</Label>
                <Input
                  value={
                    task.dueDate ? new Date(task.dueDate).toLocaleString() : "-"
                  }
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>End Time</Label>
                <Input
                  value={
                    task.endTime ? new Date(task.endTime).toLocaleString() : "-"
                  }
                  readOnly
                />
              </div>
              <div>
                <Label>Grace / Max Time</Label>
                <Input
                  value={
                    task.graceTime
                      ? new Date(task.graceTime).toLocaleString()
                      : "-"
                  }
                  readOnly
                />
              </div>
            </div>

            {/* Completion form */}
            <form onSubmit={handleUpdateCompletion} className="space-y-4">
              <div>
                <Label>
                  Completion (
                  <span className="text-primary font-semibold">
                    {completionPercent}%
                  </span>
                  )
                </Label>
                <Progress value={completionPercent} className="h-2" />
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  className="w-24 mt-2"
                  value={completionPercent}
                  onChange={(e) =>
                    setCompletionPercent(
                      Math.max(0, Math.min(100, Number(e.target.value)))
                    )
                  }
                />
              </div>
              <div>
                <Label>Completion Details</Label>
                <Textarea
                  rows={3}
                  value={completionDetails}
                  onChange={(e) => setCompletionDetails(e.target.value)}
                  placeholder="Describe your progress or completion..."
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save Progress</Button>
                <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                  Back
                </Button>
              </div>
            </form>

            {/* Progress history (comments styled like a comment box) */}
            <div className="pt-6 border-t border-border/40 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                Progress History
              </h3>

              {(!task.comments || task.comments.length === 0) && (
                <p className="text-sm text-muted-foreground">
                  No progress updates yet.
                </p>
              )}

              <div className="space-y-5">
                {task.comments &&
                  task.comments
                    .slice()
                    .sort(
                      (a: any, b: any) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                    )
                    .map((c: any) => (
                      <div
                        key={c._id || c.createdAt}
                        className="flex items-start gap-3"
                      >
                        {/* Avatar circle */}
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground/80">
                          {(c.user?.firstName?.[0] || "").toUpperCase()}
                          {(c.user?.lastName?.[0] || "").toUpperCase()}
                        </div>

                        {/* Comment content */}
                        <div className="flex-1 border-b border-border/40 pb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">
                              {c.user?.firstName} {c.user?.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(c.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {c.text}
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskDetails;
