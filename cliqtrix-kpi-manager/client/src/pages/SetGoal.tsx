import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const { goalsApi } = api as any;

const SetGoal = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [targetPoints, setTargetPoints] = useState<number | "">("");
  const [priority, setPriority] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !startDate || !endDate) {
      toast({
        title: "Missing fields",
        description: "Title, start date and end date are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await goalsApi.create({
        title,
        description: description || undefined,
        startDate,
        endDate,
        targetPoints:
          targetPoints === "" ? undefined : Number(targetPoints),
        priority: priority === "" ? undefined : Number(priority),
      });

      toast({
        title: "Goal set",
        description: "Your goal has been saved.",
      });
      navigate("/dashboard/employee");
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save goal.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-6 py-24 max-w-2xl">
        <Card className="border-border/50 shadow-elegant">
          <CardHeader>
            <CardTitle>Set your goal</CardTitle>
            <CardDescription>
              Define what you want to achieve in a specific time window.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Goal title</Label>
                <Input
                  id="title"
                  placeholder="Finish all high-priority tasks"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you want to focus on."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="start">Start</Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end">End</Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="points">Target points (optional)</Label>
                <Input
                  id="points"
                  type="number"
                  min={0}
                  value={targetPoints}
                  onChange={(e) =>
                    setTargetPoints(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  placeholder="e.g. 100"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="priority">
                  Priority (1 = highest, 5 = lowest, optional)
                </Label>
                <Input
                  id="priority"
                  type="number"
                  min={1}
                  max={5}
                  value={priority}
                  onChange={(e) =>
                    setPriority(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  placeholder="e.g. 1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard/employee")}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save goal"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetGoal;
