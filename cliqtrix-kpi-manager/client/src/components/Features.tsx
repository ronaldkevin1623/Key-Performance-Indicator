import { Card } from "@/components/ui/card";
import { BarChart3, Users, Target, TrendingUp, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track team performance with live dashboards and instant insights into KPI metrics."
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Easily assign tasks, manage projects, and monitor employee performance in one place."
  },
  {
    icon: Target,
    title: "Points System",
    description: "Motivate your team with a transparent points-based recognition system for completed tasks."
  },
  {
    icon: TrendingUp,
    title: "Performance Tracking",
    description: "Visualize individual and team progress with comprehensive graphs and reports."
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Employees see only their own data while admins maintain full oversight and control."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built for speed with instant updates and seamless performance across all devices."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-card/20" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to <span className="text-primary">Drive Performance</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help your team reach elite status
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-gradient-card border-border p-8 hover:shadow-glow transition-all duration-300"
            >
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
