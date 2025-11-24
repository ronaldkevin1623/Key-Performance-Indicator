import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import DashboardCards from "./DashboardCards";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gradient-hero" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-block mb-6">
              <span className="text-secondary text-sm font-semibold tracking-wider uppercase">
                Track Performance, Drive Success
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Data-Driven Insights
              <br />
              for High-Performing
              <br />
              <span className="text-primary">Teams</span>
            </h1>
            
            <p className="text-xl text-foreground/80 mb-8 leading-relaxed max-w-xl">
              Cliqtrix KPI transforms your team's performance data into actionable insights. 
              Track progress, recognize achievements, and accelerate delivery with real-time analytics.
            </p>
            
            <p className="text-lg text-foreground/70 mb-8">
              Assign. Track. Achieve Elite Status.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow text-lg px-8"
              >
                Start your free trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-border hover:bg-card text-foreground text-lg px-8"
              >
                Request a demo
              </Button>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <DashboardCards />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
