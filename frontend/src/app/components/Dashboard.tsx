import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  FileText,
  MessageSquare,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import {
  useComplianceItems,
  useRequests,
  useOverdueTraining,
} from "../hooks/useHRApi";
import { Skeleton } from "./ui/skeleton";

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { data: complianceData, isLoading: complianceLoading } =
    useComplianceItems();
  const { data: requestsData, isLoading: requestsLoading } = useRequests();
  const { data: overdueTrainingData } = useOverdueTraining();

  // Calculate stats from API data or use defaults
  const complianceItems = Array.isArray(complianceData) ? complianceData : [];
  const requests = Array.isArray(requestsData) ? requestsData : [];
  const overdueTraining = Array.isArray(overdueTrainingData)
    ? overdueTrainingData
    : [];

  const alertCount = complianceItems.filter(
    (item: any) => item.status === "expiring" || item.status === "overdue",
  ).length;

  const stats = [
    {
      title: "Pending Documents",
      value: requests.length.toString(),
      description: "Active requests",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      onClick: () => onNavigate("documents"),
    },
    {
      title: "HR Requests",
      value: requests
        .filter((r: any) => r.status === "pending")
        .length.toString(),
      description: "Awaiting action",
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      onClick: () => onNavigate("assistant"),
    },
    {
      title: "Compliance Alerts",
      value: alertCount.toString(),
      description: `Items needing attention`,
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      onClick: () => onNavigate("compliance"),
    },
    {
      title: "Overdue Training",
      value: overdueTraining.length.toString(),
      description: "Training items",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50",
      onClick: () => onNavigate("compliance"),
    },
  ];

  const recentActivity = [
    ...complianceItems.slice(0, 2).map((item: any) => ({
      id: item.id,
      type: "compliance",
      title: `Compliance: ${item.title}`,
      description: `${item.employee || item.jurisdiction} - ${item.status}`,
      timestamp: item.dueDate,
      status: item.status === "compliant" ? "completed" : "pending",
      icon: item.status === "compliant" ? CheckCircle : Clock,
      color: item.status === "compliant" ? "text-green-600" : "text-amber-600",
    })),
    ...requests.slice(0, 2).map((req: any) => ({
      id: req.id,
      type: req.type,
      title: `Request: ${req.type}`,
      description: req.reason || req.description || "Request submitted",
      timestamp: req.createdAt || "Recently",
      status: req.status,
      icon: req.status === "approved" ? CheckCircle : Clock,
      color: req.status === "approved" ? "text-green-600" : "text-amber-600",
    })),
  ];

  const isLoading = complianceLoading || requestsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>HR Operations Dashboard</h1>
        <p className="text-muted-foreground">
          Intelligent automation for document generation, employee support, and
          compliance monitoring
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={stat.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : (
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest automated actions and system updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-lg border"
                >
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.slice(0, 4).map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-lg border"
                  >
                    <div
                      className={`p-2 rounded-lg ${activity.status === "completed" ? "bg-green-50" : "bg-amber-50"}`}
                    >
                      <Icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            AI Insights
          </CardTitle>
          <CardDescription>
            GenAI-powered recommendations to optimize your HR operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-lg border border-purple-100">
              <p className="text-sm font-medium">📊 Pattern Detected</p>
              <p className="text-sm text-muted-foreground mt-1">
                40% of questions are about remote work policy. Consider updating
                the FAQ section.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-purple-100">
              <p className="text-sm font-medium">⚡ Efficiency Gain</p>
              <p className="text-sm text-muted-foreground mt-1">
                Document generation time reduced by 87% this week. 45 hours
                saved.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-purple-100">
              <p className="text-sm font-medium">🎯 Proactive Alert</p>
              <p className="text-sm text-muted-foreground mt-1">
                8 employees will need compliance training renewal in the next 60
                days.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
