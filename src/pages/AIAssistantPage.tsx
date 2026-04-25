import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AIAssistantPage() {
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <h1 className="font-display text-4xl font-bold mb-2 flex items-center gap-2"><Sparkles className="h-7 w-7 text-accent" /> AI Assistant</h1>
      <Card className="p-8 space-y-3">
        <p className="text-muted-foreground">
          Use the floating <strong>"Ask AI"</strong> button at the bottom-right of every page to chat with the EasyEstate assistant.
        </p>
        <ul className="text-sm space-y-1 list-disc pl-5">
          <li>Ask for property recommendations</li>
          <li>Calculate EMI for a property</li>
          <li>Get help navigating the platform</li>
          <li>Compare neighbourhoods</li>
        </ul>
      </Card>
    </div>
  );
}
