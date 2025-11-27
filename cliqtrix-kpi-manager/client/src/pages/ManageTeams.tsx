import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const { teamsApi } = api as any;

interface TeamRow {
  _id: string;
  name: string;
  project?: { _id: string; name: string };
  members?: { _id: string; firstName: string; lastName: string; email: string }[];
}

const ManageTeams = () => {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      navigate("/auth/login");
      return;
    }

    const u = JSON.parse(user);
    if (u.role !== "admin") {
      navigate("/dashboard/employee");
      return;
    }

    loadTeams();
  }, [navigate]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await teamsApi.getAll();
      const list = data?.data?.teams || data.teams || [];
      setTeams(list);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (team: TeamRow) => {
    if (!team.project?._id) return;
    navigate(`/teams/create?projectId=${team.project._id}`);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await teamsApi.delete(deletingId);
      toast({ title: "Team deleted", description: "The team has been removed." });
      setDeletingId(null);
      loadTeams();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive",
      });
    }
  };

  const cancelDelete = () => setDeletingId(null);

  const deletingTeam = teams.find((t) => t._id === deletingId);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-6 py-24 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manage Teams</h1>
            <p className="text-muted-foreground">
              View, edit, and delete project teams.
            </p>
          </div>
          <Button onClick={() => navigate("/teams/create")}>Create Team</Button>
        </div>

        <Card className="border-border/50 shadow-elegant">
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>Teams associated with your projects.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-6 text-center text-muted-foreground">
                Loading teams...
              </div>
            ) : teams.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground">
                No teams created yet.
              </div>
            ) : (
              <div className="space-y-4">
                {teams.map((team) => (
                  <div
                    key={team._id}
                    className="flex items-center justify-between border border-border/40 rounded-md px-4 py-3"
                  >
                    <div>
                      <div className="font-medium text-foreground">
                        {team.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Project: {team.project?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Members: {team.members?.length || 0}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(team)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(team._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete confirmation overlay */}
        {deletingId && deletingTeam && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <Card className="w-full max-w-sm border-border/60 shadow-elevated bg-background">
              <CardHeader>
                <CardTitle>Delete Confirmation</CardTitle>
                <CardDescription>
                  Do you want to delete the below team?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <div>
                    <span className="font-semibold">Team:</span>{" "}
                    {deletingTeam.name}
                  </div>
                  <div>
                    <span className="font-semibold">Project:</span>{" "}
                    {deletingTeam.project?.name || "Unknown"}
                  </div>
                  <div>
                    <span className="font-semibold">Members:</span>{" "}
                    {deletingTeam.members?.length || 0}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={cancelDelete}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={confirmDelete}>
                    Confirm
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTeams;
