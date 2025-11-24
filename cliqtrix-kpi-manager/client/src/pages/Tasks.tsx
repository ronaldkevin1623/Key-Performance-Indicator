import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { CheckCircle2, Clock, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const { tasksApi } = api;

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  points: number;
  dueDate: string;
  projectName: string;
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth/login");
      return;
    }

    fetchTasks(token);
  }, [navigate]);

  const fetchTasks = async (token: string) => {
    try {
      const data = await tasksApi.getAll() as Task[];
      setTasks(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
      navigate('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in-progress":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Tasks</h1>
            <p className="text-muted-foreground">View and manage all your tasks</p>
          </div>
          <Button onClick={() => navigate("/tasks/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <Card className="border-border/50 shadow-elegant">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No tasks found</p>
              <Button onClick={() => navigate("/tasks/create")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                className="border-border/50 shadow-elegant hover:shadow-glow transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {task.status === "completed" ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        )}
                        <h3 className="text-lg font-semibold text-foreground">{task.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant={getStatusColor(task.status)} className="capitalize">
                          {task.status}
                        </Badge>
                        <Badge variant={getPriorityColor(task.priority)} className="capitalize">
                          {task.priority}
                        </Badge>
                        <span className="text-muted-foreground">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                        <span className="text-muted-foreground">Project: {task.projectName}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{task.points}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
