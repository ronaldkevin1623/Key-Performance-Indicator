import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, User as UserIcon } from "lucide-react";

const Navigation = () => {
  const navigate = useNavigate();

  const userRaw =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userRaw ? JSON.parse(userRaw) : null;
  const isLoggedIn = !!userRaw;
  const isAdmin = user?.role === "admin";

  const handleLogoClick = () => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }
    navigate(isAdmin ? "/dashboard" : "/dashboard/employee");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleLogoClick}
          >
            <BarChart3 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              Cliqtrix KPI
            </span>
          </button>

          {/* Static marketing links (only on landing / optional) */}
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

          {/* Right side auth / profile actions */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Button
                  variant="ghost"
                  className="text-foreground hidden sm:inline-flex"
                  type="button"
                  onClick={() =>
                    navigate(isAdmin ? "/dashboard" : "/dashboard/employee")
                  }
                >
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => navigate("/profile")}
                >
                  <UserIcon className="h-4 w-4 mr-1" />
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  className="text-foreground"
                  type="button"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
