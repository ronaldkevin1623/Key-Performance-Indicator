import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import { Users, Calendar, TrendingUp, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const { projectsApi } = api;

interface ProjectOverview {
  project: {
    id: string;
    name: string;
    description?: string;
    startDate?: string | null;
    endDate?: string | null;
  };
  stats: {
    teamSize: number;
    completionRate: number;
    totalTasks: number;
  };
  teamMembers: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
  recentTasks: {
    id: string;
    title: string;
    status: string;
    dueDate?: string;
  }[];
}

const ProjectDetail = () => {
  const { id } = useParams();
  const [overview, setOverview] = useState<ProjectOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth/login");
      return;
    }

    if (!id) return;

    const fetchOverview = async () => {
      try {
        const data = await projectsApi.getOverview(id);
        const o = data?.data || data;
        setOverview(o as ProjectOverview);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load project",
          variant: "destructive",
        });
        navigate("/projects");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [id, navigate, toast]);

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

  if (!overview) return null;

  const { project, stats, teamMembers, recentTasks } = overview;

  const start = project.startDate ? new Date(project.startDate) : null;
  const end = project.endDate ? new Date(project.endDate) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {project.name}
            </h1>
            <p className="text-muted-foreground">
              {project.description || "No description provided."}
            </p>
          </div>
          <Button onClick={() => navigate("/tasks/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border/50 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Size</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats.teamSize}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Active members</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats.totalTasks}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Assigned tasks</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Timeline</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-foreground">
                {start && end
                  ? `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
                  : "Not set"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Project duration</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50 shadow-elegant mb-6">
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
            <CardDescription>Overall completion status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion</span>
                <span className="text-sm text-muted-foreground">
                  {stats.completionRate}%
                </span>
              </div>
              <Progress value={stats.completionRate} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Project contributors</CardDescription>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No team members assigned yet
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {teamMembers.map((m) => (
                    <li key={m._id}>
                      {m.firstName} {m.lastName}{" "}
                      <span className="text-xs text-muted-foreground">
                        ({m.email})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>Latest project activities</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tasks created yet
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {recentTasks.map((t) => (
                    <li key={t.id} className="flex justify-between">
                      <span>{t.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {t.status}
                        {t.dueDate &&
                          ` • ${new Date(t.dueDate).toLocaleDateString()}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
