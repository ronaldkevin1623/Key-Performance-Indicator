import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Cliqtrix KPI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#about" className="text-foreground/80 hover:text-foreground transition-colors">
              About
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-foreground" onClick={() => window.location.href = "/auth/login"}>
              Login
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow" onClick={() => window.location.href = "/auth/signup"}>
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
