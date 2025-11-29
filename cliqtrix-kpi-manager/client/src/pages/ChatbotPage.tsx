import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Bot, User as UserIcon, Send } from "lucide-react";

const { chatbotApi } = api as any;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const ChatbotPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "system",
      content:
        "You are an AI assistant inside a KPI management app called Cliqtrix KPI. Help users with KPIs, tasks, goals and productivity questions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const visibleMessages = messages.filter((m) => m.role !== "system");

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const newMessages = [
      ...messages,
      { role: "user" as const, content: trimmed },
    ];

    setMessages(newMessages);
    setInput("");
    setSending(true);

    try {
      const res = await chatbotApi.send(newMessages);
      const data = (res as any).data || res;
      const reply = data.reply as ChatMessage | undefined;

      if (!reply) {
        throw new Error("No reply from chatbot");
      }

      setMessages((prev) => [...prev, reply]);
    } catch {
      toast({
        title: "Chat error",
        description: "Could not get a response from the assistant.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-6 py-24">
        <Card className="border-border/60 shadow-elegant max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Cliqtrix Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="h-80 md:h-96 overflow-y-auto space-y-3 pr-1 border border-border/40 rounded-lg p-3 bg-muted/40">
              {visibleMessages.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Ask anything about your KPIs, goals, tasks, or how to use this
                  dashboard.
                </p>
              )}

              {visibleMessages.map((m, index) => (
                <div
                  key={index}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm flex items-start gap-2 ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    {m.role === "user" ? (
                      <UserIcon className="h-4 w-4 mt-0.5 shrink-0" />
                    ) : (
                      <Bot className="h-4 w-4 mt-0.5 shrink-0" />
                    )}
                    <span>{m.content}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                placeholder="Ask the assistant about KPIs, goals, or tasks..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={sending}
              />
              <Button type="submit" disabled={sending}>
                <Send className="h-4 w-4 mr-1" />
                {sending ? "Sending..." : "Send"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotPage;
