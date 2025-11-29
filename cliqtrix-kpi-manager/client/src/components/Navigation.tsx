import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <BarChart3 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              Cliqtrix KPI
            </span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            <button
              type="button"
              className="text-foreground/80 hover:text-foreground transition-colors text-sm"
              onClick={() => navigate("/#features")}
            >
              Features
            </button>
            <button
              type="button"
              className="text-foreground/80 hover:text-foreground transition-colors text-sm"
              onClick={() => navigate("/#pricing")}
            >
              Pricing
            </button>
            <button
              type="button"
              className="text-foreground/80 hover:text-foreground transition-colors text-sm"
              onClick={() => navigate("/#about")}
            >
              About
            </button>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-foreground"
              type="button"
              onClick={() => navigate("/auth/login")}
            >
              Login
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
              type="button"
              onClick={() => navigate("/auth/signup")}
            >
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
