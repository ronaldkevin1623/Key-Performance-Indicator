import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const { projectsApi, usersApi, teamsApi } = api as any;

interface ProjectOption {
  _id: string;
  name: string;
}

interface EmployeeOption {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const CreateTeam = () => {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [teamName, setTeamName] = useState("");
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editLoaded, setEditLoaded] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Read ?projectId from query for edit mode
  const params = new URLSearchParams(location.search);
  const editProjectId = params.get("projectId");

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

    fetchProjects();
    fetchEmployees();
  }, [navigate]);

  // Load existing team when editing
  useEffect(() => {
    if (!editProjectId) return;
    if (projects.length === 0 || employees.length === 0) return;
    if (editLoaded) return;

    const loadTeam = async () => {
      try {
        const data = await teamsApi.getByProject(editProjectId);
        const t = data?.data?.team || data.team || data;

        setSelectedProjectId(editProjectId);
        setTeamName(t.name || "");
        setSelectedMembers((t.members || []).map((m: any) => m._id));
        setEditLoaded(true);
      } catch {
        // No team yet for this project: still preselect project
        setSelectedProjectId(editProjectId);
        setEditLoaded(true);
      }
    };

    loadTeam();
  }, [editProjectId, projects, employees, editLoaded]);

  const fetchProjects = async () => {
    try {
      const data = await projectsApi.getAll();
      const arr = Array.isArray(data) ? data : data?.data?.projects || [];
      setProjects(arr);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await usersApi.getEmployeeDropdown();
      const arr = Array.isArray(data) ? data : data?.data?.employees || data?.employees || [];
      setEmployees(arr);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      });
    }
  };

  const handleSelectMember = (id: string) => {
    setSelectedMembers((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setSearch("");
    setShowDropdown(false);
  };

  const handleRemoveMember = (id: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || selectedMembers.length === 0) {
      toast({
        title: "Missing data",
        description: "Select a project and at least one team member.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await teamsApi.upsertForProject(selectedProjectId, {
        name: teamName || "Project Team",
        memberIds: selectedMembers,
      });

      toast({
        title: "Team saved",
        description: "Team has been created/updated for this project.",
      });
      navigate(`/teams`);
    } catch {
      toast({
        title: "Error",
        description: "Failed to save team.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const text = `${emp.firstName} ${emp.lastName} ${emp.email}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const getEmployeeById = (id: string) => employees.find((e) => e._id === id);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-6 py-24 max-w-3xl">
        <Card className="border-border/50 shadow-elegant">
          <CardHeader>
            <CardTitle>
              {editProjectId ? "Edit Project Team" : "Create / Edit Project Team"}
            </CardTitle>
            <CardDescription>
              Assign a team of employees to a specific project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select
                  value={selectedProjectId}
                  onValueChange={(value) => setSelectedProjectId(value)}
                  disabled={!!editProjectId} // lock in edit mode
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p._id || (p as any).id} value={p._id || (p as any).id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name (optional)</Label>
                <Input
                  id="teamName"
                  placeholder="Backend Squad"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Team Members</Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      placeholder="Type to search employees..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                    />
                    {showDropdown && search.trim().length > 0 && (
                      <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-md border border-border/60 bg-popover shadow-lg">
                        {filteredEmployees.length === 0 && (
                          <div className="px-3 py-2 text-xs text-muted-foreground">
                            No matching employees
                          </div>
                        )}
                        {filteredEmployees.map((emp) => (
                          <button
                            key={emp._id}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                            onClick={() => handleSelectMember(emp._id)}
                          >
                            {emp.firstName} {emp.lastName}{" "}
                            <span className="text-xs text-muted-foreground">
                              ({emp.email})
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedMembers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedMembers.map((id) => {
                        const emp = getEmployeeById(id);
                        if (!emp) return null;
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs text-foreground"
                          >
                            {emp.firstName} {emp.lastName}
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(id)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Saving..." : "Save Team"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/teams")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTeam;
