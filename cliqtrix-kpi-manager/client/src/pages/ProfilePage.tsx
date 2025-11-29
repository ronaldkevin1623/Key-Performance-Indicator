// src/pages/ProfilePage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  User as UserIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const { usersApi } = api as any;

interface CompanyInfo {
  _id: string;
  name: string;
  industry?: string;
  size?: string;
  website?: string;
  createdAt?: string;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "employee" | string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  company?: CompanyInfo | string;
  createdAt?: string;
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await usersApi.getMyProfile();
      const data = (res as any).data || res;
      setProfile(data.user as UserProfile);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load profile.",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const initials =
    profile?.name
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "?";

  const isAdmin = profile?.role === "admin";
  const company =
    typeof profile?.company === "object" ? (profile.company as CompanyInfo) : undefined;

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-24">
          <div className="text-center text-muted-foreground">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-6 py-24 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              {profile.name}
            </h1>
            <p className="text-muted-foreground text-sm">
              {profile.jobTitle || (isAdmin ? "Company Admin" : "Employee")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(isAdmin ? "/dashboard" : "/dashboard/employee")
              }
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to dashboard
            </Button>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: avatar + contact */}
          <Card className="border-border/60 shadow-elegant lg:col-span-1">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-semibold text-primary">
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {profile.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 border-sky-500/60 text-sky-300"
                    >
                      {isAdmin ? "Admin" : "Employee"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Joined{" "}
                    {profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>

              {profile.department && (
                <div className="text-xs text-muted-foreground">
                  Department:{" "}
                  <span className="text-foreground">{profile.department}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: company + meta */}
          <div className="lg:col-span-2 space-y-4">
            {/* Company info for both, but highlight for admin */}
            <Card className="border-border/60 shadow-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Company
                </CardTitle>
                <CardDescription>
                  Your organization and company identifier.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium text-foreground">
                    {company?.name || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Company ID</span>
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded-full">
                    {company?._id || "—"}
                  </span>
                </div>
                {company?.industry && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Industry</span>
                    <span className="text-foreground">{company.industry}</span>
                  </div>
                )}
                {company?.website && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Website</span>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary underline"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                {company?.createdAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Onboarded</span>
                    <span className="text-foreground">
                      {new Date(company.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Simple “about”/meta section */}
            <Card className="border-border/60 shadow-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-primary" />
                  About
                </CardTitle>
                <CardDescription>
                  Summary of your role and workspace.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Role:{" "}
                  <span className="text-foreground font-medium">
                    {isAdmin ? "Admin (manages company settings and KPIs)" : "Employee (tracks and completes assigned KPIs)"}
                  </span>
                </p>
                <p>
                  Workspace:{" "}
                  <span className="text-foreground font-medium">
                    {company?.name || "Not assigned"}
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
