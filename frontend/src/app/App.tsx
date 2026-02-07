import { useState, useEffect } from "react";
import { Dashboard } from "./components/Dashboard";
import { DocumentGeneration } from "./components/DocumentGeneration";
import { HRAssistant } from "./components/HRAssistant";
import { ComplianceIntelligence } from "./components/ComplianceIntelligence";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Shield,
  Sparkles,
  LogOut
} from "lucide-react";
import { seedComplianceData } from "./api/seed-data";

export default function App() {
  const [currentView, setCurrentView] = useState<"dashboard" | "documents" | "assistant" | "compliance">("dashboard");

  useEffect(() => {
    // Initialize sample data on first load
    seedComplianceData();
  }, []);

  const handleLogout = () => {
    // Add logout logic here (e.g., clear session, redirect to login)
    console.log("Logging out...");
    // You can add actual logout logic here when authentication is implemented
  };

  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "documents", label: "Document Generation", icon: FileText },
    { id: "assistant", label: "HR Assistant", icon: MessageSquare },
    { id: "compliance", label: "Compliance", icon: Shield }
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">HR Intelligence Platform</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Self-Service Operations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="text-xs">Log Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 border-r bg-muted/10 p-4">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Features List */}
          <div className="mt-8 space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-semibold mb-2">Platform Features</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>AI document generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>24/7 conversational assistant</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Proactive compliance monitoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Multi-jurisdiction support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Human oversight workflow</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-purple-900">Powered by GenAI</p>
                  <p className="text-xs text-purple-700 mt-1">
                    All AI-generated content requires human review for legal accuracy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="container mx-auto max-w-7xl">
            {currentView === "dashboard" && <Dashboard onNavigate={setCurrentView} />}
            {currentView === "documents" && <DocumentGeneration />}
            {currentView === "assistant" && <HRAssistant />}
            {currentView === "compliance" && <ComplianceIntelligence />}
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}