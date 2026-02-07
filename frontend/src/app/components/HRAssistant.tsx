import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Clock,
  CheckCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useChatSessions,
  useSendChatMessage,
  useRequests,
} from "../hooks/useHRApi";
import { Skeleton } from "./ui/skeleton";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  actions?: Array<{
    label: string;
    type: string;
    status: "pending" | "completed";
  }>;
}

interface EmployeeRequest {
  id: string;
  employee: string;
  type: string;
  question: string;
  status: "new" | "answered" | "escalated";
  timestamp: string;
  priority: "low" | "medium" | "high";
}

export function HRAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch chat sessions and employee requests from API
  const { data: chatSessions, isLoading: sessionsLoading } = useChatSessions();
  const { mutate: sendMessage, isPending: isSending } = useSendChatMessage(
    currentSessionId || "",
  );
  const { data: requestsData, isLoading: requestsLoading } = useRequests();

  // Convert API requests to component format
  const employeeRequests = Array.isArray(requestsData)
    ? requestsData.map((req: any) => ({
        id: req.id || req._id,
        employee: req.employee?.name || req.employeeName || "Unknown",
        type: req.type || "General Request",
        question: req.description || req.message || "",
        status: req.status || ("new" as "new" | "answered" | "escalated"),
        timestamp: req.createdAt
          ? new Date(req.createdAt).toLocaleString()
          : "Just now",
        priority: req.priority || ("medium" as "low" | "medium" | "high"),
      }))
    : [];

  // Initialize with welcome message if no session exists
  useEffect(() => {
    if (
      !messages.length &&
      chatSessions &&
      Array.isArray(chatSessions) &&
      chatSessions.length > 0
    ) {
      setCurrentSessionId(chatSessions[0].id);
      setMessages([
        {
          id: "1",
          role: "assistant",
          content:
            "Hello! I'm your AI-powered HR assistant. I can help you with policy questions, update employee details, process requests, and route complex issues to the right team. How can I assist you today?",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } else if (!messages.length) {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content:
            "Hello! I'm your AI-powered HR assistant. I can help you with policy questions, update employee details, process requests, and route complex issues to the right team. How can I assist you today?",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }
  }, [chatSessions, messages.length]);

  // Knowledge base (hardcoded as it's UI configuration, not API data)
  const knowledgeBase = [
    {
      category: "Time Off",
      topics: ["PTO accrual", "Sick leave", "Parental leave", "Holidays"],
      queries: 234,
    },
    {
      category: "Benefits",
      topics: [
        "Health insurance",
        "401(k)",
        "Life insurance",
        "Wellness programs",
      ],
      queries: 189,
    },
    {
      category: "Remote Work",
      topics: [
        "Work from home",
        "International work",
        "Equipment policy",
        "Expenses",
      ],
      queries: 156,
    },
    {
      category: "Compensation",
      topics: ["Salary reviews", "Bonuses", "Stock options", "Pay schedule"],
      queries: 142,
    },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const simulateAIResponse = async (userMessage: string): Promise<Message> => {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const lowerMessage = userMessage.toLowerCase();

    let response = "";
    let actions = [];

    if (
      lowerMessage.includes("pto") ||
      lowerMessage.includes("vacation") ||
      lowerMessage.includes("time off")
    ) {
      response =
        "Based on our PTO policy:\n\n✅ Full-time employees accrue 15 days of PTO annually\n✅ PTO accrues monthly and can be used after 90 days\n✅ You can carry over up to 5 unused days to the next year\n✅ PTO requests should be submitted at least 2 weeks in advance\n\nWould you like me to check your current PTO balance or submit a request?";
      actions = [
        {
          label: "Check PTO Balance",
          type: "query",
          status: "pending" as const,
        },
        {
          label: "Submit PTO Request",
          type: "action",
          status: "pending" as const,
        },
      ];
    } else if (
      lowerMessage.includes("remote") ||
      lowerMessage.includes("work from home")
    ) {
      response =
        "Our remote work policy allows:\n\n🏠 Flexible remote work up to 3 days per week\n🌍 International work requires approval (max 30 days/year)\n💻 Company provides laptop and $500 home office stipend\n📋 VPN and security protocols must be followed\n\nFor working from a different country, I'll need to route this to our Global Mobility team for compliance review. Shall I create a ticket?";
      actions = [
        {
          label: "Create Mobility Ticket",
          type: "escalate",
          status: "pending" as const,
        },
      ];
    } else if (
      lowerMessage.includes("benefit") ||
      lowerMessage.includes("insurance") ||
      lowerMessage.includes("health")
    ) {
      response =
        "I can help you with benefits enrollment:\n\n• Medical, dental, and vision coverage available\n• You can add dependents during open enrollment or within 30 days of a qualifying event\n• Life changes (marriage, birth) trigger special enrollment periods\n\nWould you like me to start a benefits update request or send you the enrollment forms?";
      actions = [
        {
          label: "Update Benefits",
          type: "action",
          status: "pending" as const,
        },
        {
          label: "Send Enrollment Forms",
          type: "action",
          status: "pending" as const,
        },
      ];
    } else if (
      lowerMessage.includes("payroll") ||
      lowerMessage.includes("paycheck") ||
      lowerMessage.includes("salary")
    ) {
      response =
        "Payroll inquiries require verification for security. I'm escalating your request to the Payroll team with priority status. They typically respond within 4 business hours.\n\nTicket #PAY-2026-1847 has been created. You'll receive an email confirmation shortly.";
      actions = [
        {
          label: "Escalated to Payroll",
          type: "escalate",
          status: "completed" as const,
        },
      ];
    } else if (
      lowerMessage.includes("update") &&
      (lowerMessage.includes("address") ||
        lowerMessage.includes("phone") ||
        lowerMessage.includes("contact"))
    ) {
      response =
        "I can help you update your contact information. For security purposes, I'll need to verify your identity first. Please check your email for a verification link.\n\nOnce verified, you can update:\n• Home address\n• Phone number\n• Emergency contact\n• Email preferences";
      actions = [
        {
          label: "Send Verification",
          type: "action",
          status: "completed" as const,
        },
      ];
    } else {
      response =
        "I understand you're asking about: \"" +
        userMessage +
        "\"\n\nI've searched our knowledge base and found several relevant policies. Based on your question, I recommend:\n\n1. Reviewing the Employee Handbook (Section 4.2)\n2. Checking with your direct manager for department-specific guidelines\n\nIf you need more specific guidance, I can connect you with an HR specialist. Would that be helpful?";
      actions = [
        {
          label: "Connect with HR Specialist",
          type: "escalate",
          status: "pending" as const,
        },
      ];
    }

    return {
      id: Date.now().toString(),
      role: "assistant",
      content: response,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      actions: actions.length > 0 ? actions : undefined,
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    const aiResponse = await simulateAIResponse(inputValue);
    setIsTyping(false);
    setMessages((prev) => [...prev, aiResponse]);
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
  };

  const quickActions = [
    "Check my PTO balance",
    "How do I update my address?",
    "What's the remote work policy?",
    "Benefits enrollment information",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Conversational HR Assistant</h1>
        <p className="text-muted-foreground">
          AI-powered chatbot for policy questions, request routing, and employee
          support
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[700px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-600" />
                HR Assistant Chat
              </CardTitle>
              <CardDescription>
                Ask questions, update details, or get policy information
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === "user"
                            ? "bg-blue-100"
                            : "bg-purple-100"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Bot className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      <div
                        className={`flex flex-col gap-2 max-w-[80%] ${message.role === "user" ? "items-end" : ""}`}
                      >
                        <div
                          className={`rounded-lg p-3 ${
                            message.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-line">
                            {message.content}
                          </p>
                        </div>
                        {message.actions && message.actions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {message.actions.map((action, idx) => (
                              <Button
                                key={idx}
                                variant={
                                  action.status === "completed"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  toast.success(`Action: ${action.label}`)
                                }
                                disabled={action.status === "completed"}
                              >
                                {action.status === "completed" ? (
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                ) : (
                                  <ArrowRight className="mr-1 h-3 w-3" />
                                )}
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex gap-1">
                          <span
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Quick Actions */}
              {messages.length === 1 && (
                <div className="p-4 border-t border-b bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Quick actions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction(action)}
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Ask a question or describe what you need help with..."
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isTyping || !inputValue.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Powered by GenAI • All responses reviewed for accuracy
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      Answer Policy Questions
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Instant responses from knowledge base
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      Update Employee Details
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Address, contact info, preferences
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Intelligent Routing</p>
                    <p className="text-xs text-muted-foreground">
                      Escalate complex issues to specialists
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">24/7 Availability</p>
                    <p className="text-xs text-muted-foreground">
                      Reduce HR team workload
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>Most accessed topics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {knowledgeBase.map((kb, idx) => (
                  <div key={idx} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{kb.category}</span>
                      <Badge variant="secondary">{kb.queries} queries</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {kb.topics.map((topic, tidx) => (
                        <Badge key={tidx} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Requests</CardTitle>
              <CardDescription>
                Employee inquiries being processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="new">New</TabsTrigger>
                  <TabsTrigger value="escalated">Escalated</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-2 mt-4">
                  {employeeRequests.slice(0, 3).map((request) => (
                    <div
                      key={request.id}
                      className="p-2 rounded border space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">
                          {request.employee}
                        </span>
                        <Badge
                          variant={
                            request.status === "answered"
                              ? "default"
                              : request.status === "escalated"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {request.question}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {request.timestamp}
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="new" className="space-y-2 mt-4">
                  {employeeRequests
                    .filter((r) => r.status === "new")
                    .map((request) => (
                      <div
                        key={request.id}
                        className="p-2 rounded border space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">
                            {request.employee}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {request.question}
                        </p>
                      </div>
                    ))}
                </TabsContent>
                <TabsContent value="escalated" className="space-y-2 mt-4">
                  {employeeRequests
                    .filter((r) => r.status === "escalated")
                    .map((request) => (
                      <div
                        key={request.id}
                        className="p-2 rounded border space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">
                            {request.employee}
                          </span>
                          <Badge variant="destructive" className="text-xs">
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {request.question}
                        </p>
                      </div>
                    ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
