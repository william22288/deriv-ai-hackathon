import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { FileText, MessageSquare, Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const stats = [
    {
      title: "Pending Documents",
      value: "12",
      description: "Contracts awaiting generation",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      onClick: () => onNavigate("documents")
    },
    {
      title: "HR Requests",
      value: "28",
      description: "Active employee inquiries",
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      onClick: () => onNavigate("assistant")
    },
    {
      title: "Compliance Alerts",
      value: "5",
      description: "Items needing attention",
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      onClick: () => onNavigate("compliance")
    },
    {
      title: "Audit Score",
      value: "94%",
      description: "Overall compliance rate",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50",
      onClick: () => onNavigate("compliance")
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "document",
      title: "Employment contract generated",
      description: "Sarah Johnson - Software Engineer (US-CA)",
      timestamp: "2 hours ago",
      status: "completed",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      id: 2,
      type: "assistant",
      title: "Policy question answered",
      description: "PTO policy clarification for team lead",
      timestamp: "3 hours ago",
      status: "completed",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      id: 3,
      type: "compliance",
      title: "Work permit expiring soon",
      description: "Miguel Rodriguez - Expires in 30 days",
      timestamp: "5 hours ago",
      status: "pending",
      icon: Clock,
      color: "text-amber-600"
    },
    {
      id: 4,
      type: "document",
      title: "NDA customized and sent",
      description: "Alex Chen - Contractor agreement",
      timestamp: "1 day ago",
      status: "completed",
      icon: CheckCircle,
      color: "text-green-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>HR Operations Dashboard</h1>
        <p className="text-muted-foreground">
          Intelligent automation for document generation, employee support, and compliance monitoring
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
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
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
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border">
                  <div className={`p-2 rounded-lg ${activity.status === 'completed' ? 'bg-green-50' : 'bg-amber-50'}`}>
                    <Icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                </div>
              );
            })}
          </div>
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
                40% of questions are about remote work policy. Consider updating the FAQ section.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-purple-100">
              <p className="text-sm font-medium">⚡ Efficiency Gain</p>
              <p className="text-sm text-muted-foreground mt-1">
                Document generation time reduced by 87% this week. 45 hours saved.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-purple-100">
              <p className="text-sm font-medium">🎯 Proactive Alert</p>
              <p className="text-sm text-muted-foreground mt-1">
                8 employees will need compliance training renewal in the next 60 days.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
