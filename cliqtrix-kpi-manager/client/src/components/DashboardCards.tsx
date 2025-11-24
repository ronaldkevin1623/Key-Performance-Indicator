import { Card } from "@/components/ui/card";
import { TrendingUp, Clock, Target, Users } from "lucide-react";

const DashboardCards = () => {
  return (
    <div className="relative h-[600px]">
      {/* Lead Time Card */}
      <Card className="absolute top-0 right-0 w-80 bg-gradient-card border-border shadow-card animate-float p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Lead Time For Changes</h3>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div className="h-32 flex items-end justify-between gap-2">
            <div className="flex-1 bg-primary/20 rounded-t-lg relative" style={{ height: '60%' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-primary/10 rounded-t-lg" />
            </div>
            <div className="flex-1 bg-primary/30 rounded-t-lg" style={{ height: '80%' }}>
              <div className="h-full bg-gradient-to-t from-primary/50 to-primary/20 rounded-t-lg" />
            </div>
            <div className="flex-1 bg-primary/40 rounded-t-lg" style={{ height: '70%' }}>
              <div className="h-full bg-gradient-to-t from-primary/60 to-primary/30 rounded-t-lg" />
            </div>
          </div>
        </div>
      </Card>

      {/* Historical Data Card */}
      <Card className="absolute top-32 right-24 w-96 bg-gradient-card border-border shadow-card animate-float-delayed p-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Historical Open PR Data</h3>
          <div className="h-40 relative">
            <svg className="w-full h-full" viewBox="0 0 300 100">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(180, 100%, 60%)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="hsl(180, 100%, 60%)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 80 Q 75 40 150 60 T 300 50"
                stroke="hsl(180, 100%, 60%)"
                strokeWidth="2"
                fill="none"
                className="opacity-70"
              />
              <path
                d="M 0 80 Q 75 40 150 60 T 300 50 L 300 100 L 0 100 Z"
                fill="url(#gradient)"
              />
              <circle cx="150" cy="60" r="4" fill="hsl(180, 100%, 60%)" />
            </svg>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span className="text-muted-foreground">Historical</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Ongoing Tasks Card */}
      <Card className="absolute bottom-32 right-12 w-72 bg-gradient-card border-border shadow-card animate-float p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Ongoing Tasks Per User</h3>
            <Target className="h-4 w-4 text-secondary" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-32 text-xs text-muted-foreground">Admin Reviews</div>
              <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-secondary to-secondary/70 w-4/5" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 text-xs text-muted-foreground">Build Fixes</div>
              <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary/70 w-3/5" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 text-xs text-muted-foreground">In Progress</div>
              <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-destructive to-destructive/70 w-2/5" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Score Card */}
      <Card className="absolute bottom-0 right-48 w-80 bg-gradient-card border-border shadow-card animate-float-delayed p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Cycle Time Overview</h3>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="text-6xl font-bold text-primary">127</div>
              <TrendingUp className="absolute -top-2 -right-8 h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-primary/90 rounded-lg p-3 text-center">
              <div className="text-xs text-primary-foreground/80">67 hours</div>
              <div className="text-sm font-semibold text-primary-foreground">Coding time</div>
            </div>
            <div className="flex-1 bg-secondary/90 rounded-lg p-3 text-center">
              <div className="text-xs text-foreground/80">33 hours</div>
              <div className="text-sm font-semibold text-foreground">Review time</div>
            </div>
            <div className="flex-1 bg-muted rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground">27 hours</div>
              <div className="text-sm font-semibold text-foreground">Merge time</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardCards;
