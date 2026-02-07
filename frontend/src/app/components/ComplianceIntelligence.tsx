import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Users,
  Globe,
  TrendingUp,
  Calendar,
  Bell,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useComplianceItems,
  useExpiringComplianceItems,
} from "../hooks/useHRApi";
import { Skeleton } from "./ui/skeleton";

interface ComplianceItem {
  id: string;
  type: "permit" | "training" | "certification" | "audit";
  title: string;
  employee?: string;
  jurisdiction: string;
  status: "compliant" | "expiring" | "overdue" | "pending";
  dueDate: string;
  daysUntilDue: number;
  priority: "low" | "medium" | "high" | "critical";
}

interface AuditArea {
  name: string;
  score: number;
  items: number;
  lastReview: string;
  status: "pass" | "warning" | "fail";
}

export function ComplianceIntelligence() {
  const [selectedJurisdiction, setSelectedJurisdiction] =
    useState<string>("all");
  const { data: complianceData, isLoading: complianceLoading } =
    useComplianceItems();
  const { data: expiringData } = useExpiringComplianceItems();

  const complianceItems = (
    Array.isArray(complianceData) ? complianceData : []
  ) as ComplianceItem[];
  const expiringItems = Array.isArray(expiringData) ? expiringData : [];

  const filteredItems =
    selectedJurisdiction === "all"
      ? complianceItems
      : complianceItems.filter(
          (item) =>
            item.jurisdiction === selectedJurisdiction ||
            item.jurisdiction.startsWith(selectedJurisdiction),
        );

  // Compute audit areas from compliance items by type
  const auditAreas: AuditArea[] = [
    {
      name: "Permits & Licenses",
      score:
        complianceItems.filter(
          (i) => i.type === "permit" && i.status === "compliant",
        ).length > 0
          ? 95
          : 70,
      items: complianceItems.filter((i) => i.type === "permit").length,
      lastReview: new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString(),
      status:
        complianceItems.filter(
          (i) =>
            i.type === "permit" &&
            (i.status === "overdue" || i.status === "expiring"),
        ).length > 0
          ? "warning"
          : "pass",
    },
    {
      name: "Employee Training",
      score:
        complianceItems.filter(
          (i) => i.type === "training" && i.status === "compliant",
        ).length > 0
          ? 88
          : 65,
      items: complianceItems.filter((i) => i.type === "training").length,
      lastReview: new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString(),
      status:
        complianceItems.filter(
          (i) =>
            i.type === "training" &&
            (i.status === "overdue" || i.status === "expiring"),
        ).length > 0
          ? "warning"
          : "pass",
    },
    {
      name: "Certifications",
      score:
        complianceItems.filter(
          (i) => i.type === "certification" && i.status === "compliant",
        ).length > 0
          ? 92
          : 75,
      items: complianceItems.filter((i) => i.type === "certification").length,
      lastReview: new Date(
        Date.now() - 14 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString(),
      status:
        complianceItems.filter(
          (i) =>
            i.type === "certification" &&
            (i.status === "overdue" || i.status === "expiring"),
        ).length > 0
          ? "warning"
          : "pass",
    },
    {
      name: "Audit Records",
      score:
        complianceItems.filter(
          (i) => i.type === "audit" && i.status === "compliant",
        ).length > 0
          ? 98
          : 80,
      items: complianceItems.filter((i) => i.type === "audit").length,
      lastReview: new Date(
        Date.now() - 1 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString(),
      status: "pass",
    },
  ];

  const getStatusColor = (status: ComplianceItem["status"]) => {
    switch (status) {
      case "compliant":
        return "text-green-600 bg-green-50";
      case "expiring":
        return "text-amber-600 bg-amber-50";
      case "overdue":
        return "text-red-600 bg-red-50";
      case "pending":
        return "text-blue-600 bg-blue-50";
    }
  };

  const getStatusIcon = (status: ComplianceItem["status"]) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4" />;
      case "expiring":
        return <Clock className="h-4 w-4" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: ComplianceItem["priority"]) => {
    const variants = {
      critical: "destructive",
      high: "default",
      medium: "secondary",
      low: "outline",
    } as const;
    return <Badge variant={variants[priority]}>{priority}</Badge>;
  };

  const handleTakeAction = (item: ComplianceItem) => {
    toast.success(`Action initiated for ${item.title}`, {
      description: "HR team has been notified and will follow up",
    });
  };

  const overallScore = 90;

  const criticalItems = complianceItems.filter(
    (i) => i.priority === "critical" || i.status === "overdue",
  );
  const expiringItemsCount = complianceItems.filter(
    (i) => i.status === "expiring" && i.daysUntilDue <= 30,
  ).length;

  const jurisdictions = [
    { code: "all", name: "All Jurisdictions", count: complianceItems.length },
    {
      code: "US",
      name: "United States",
      count: complianceItems.filter((i) => i.jurisdiction.startsWith("US"))
        .length,
    },
    {
      code: "UK",
      name: "United Kingdom",
      count: complianceItems.filter((i) => i.jurisdiction === "UK").length,
    },
    {
      code: "DE",
      name: "Germany",
      count: complianceItems.filter((i) => i.jurisdiction === "DE").length,
    },
    {
      code: "FR",
      name: "France",
      count: complianceItems.filter((i) => i.jurisdiction === "FR").length,
    },
    {
      code: "AU",
      name: "Australia",
      count: complianceItems.filter((i) => i.jurisdiction === "AU").length,
    },
    {
      code: "SG",
      name: "Singapore",
      count: complianceItems.filter((i) => i.jurisdiction === "SG").length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Proactive Compliance Intelligence</h1>
        <p className="text-muted-foreground">
          AI-powered monitoring of permits, training, and audit readiness across
          jurisdictions
        </p>
      </div>

      {/* Alert Banner */}
      {criticalItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">
                  Critical Compliance Issues
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {criticalItems.length} item(s) require immediate attention to
                  maintain compliance
                </p>
              </div>
              <Button variant="destructive" size="sm">
                <Bell className="mr-2 h-4 w-4" />
                View All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {complianceLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-2 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{overallScore}%</div>
                <Progress value={overallScore} className="mt-2" />
              </>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Audit readiness
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {complianceLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{criticalItems.length}</div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Require immediate action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            {complianceLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{expiringItemsCount}</div>
            )}
            <p className="text-xs text-muted-foreground mt-2">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jurisdictions</CardTitle>
            <Globe className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jurisdictions.length - 1}</div>
            <p className="text-xs text-muted-foreground mt-2">Active regions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Compliance Items */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Monitoring</CardTitle>
              <CardDescription>
                Track permits, training, and certifications across all
                jurisdictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {complianceLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="p-4 rounded-lg border space-y-3">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <Tabs defaultValue="all">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="overdue">Overdue</TabsTrigger>
                    <TabsTrigger value="expiring">Expiring</TabsTrigger>
                    <TabsTrigger value="compliant">Compliant</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                  </TabsList>

                  {["all", "overdue", "expiring", "compliant", "pending"].map(
                    (tabValue) => (
                      <TabsContent
                        key={tabValue}
                        value={tabValue}
                        className="space-y-3 mt-4"
                      >
                        {filteredItems
                          .filter(
                            (item) =>
                              tabValue === "all" || item.status === tabValue,
                          )
                          .map((item) => (
                            <div
                              key={item.id}
                              className="p-4 rounded-lg border space-y-3"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {item.type}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {item.jurisdiction}
                                    </Badge>
                                    {getPriorityBadge(item.priority)}
                                  </div>
                                  <h4 className="font-semibold">
                                    {item.title}
                                  </h4>
                                  {item.employee && (
                                    <p className="text-sm text-muted-foreground">
                                      <Users className="inline h-3 w-3 mr-1" />
                                      {item.employee}
                                    </p>
                                  )}
                                </div>
                                <div
                                  className={`p-2 rounded-lg ${getStatusColor(item.status)}`}
                                >
                                  {getStatusIcon(item.status)}
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>Due: {item.dueDate}</span>
                                  <span
                                    className={`ml-2 font-medium ${
                                      item.daysUntilDue < 0
                                        ? "text-red-600"
                                        : item.daysUntilDue <= 30
                                          ? "text-amber-600"
                                          : "text-green-600"
                                    }`}
                                  >
                                    (
                                    {item.daysUntilDue < 0
                                      ? `${Math.abs(item.daysUntilDue)} days overdue`
                                      : `${item.daysUntilDue} days remaining`}
                                    )
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => handleTakeAction(item)}
                                >
                                  Take Action
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        {filteredItems.filter(
                          (item) =>
                            tabValue === "all" || item.status === tabValue,
                        ).length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            No items found in this category
                          </div>
                        )}
                      </TabsContent>
                    ),
                  )}
                </Tabs>
              )}
            </CardContent>
          </Card>

          {/* Audit Readiness */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Readiness Dashboard</CardTitle>
              <CardDescription>
                Real-time compliance scores across all audit areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {complianceLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-2 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {auditAreas.map((area, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              area.status === "pass"
                                ? "bg-green-600"
                                : area.status === "warning"
                                  ? "bg-amber-600"
                                  : "bg-red-600"
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {area.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {area.items} items
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              area.score >= 90
                                ? "text-green-600"
                                : area.score >= 80
                                  ? "text-amber-600"
                                  : "text-red-600"
                            }`}
                          >
                            {area.score}%
                          </span>
                        </div>
                      </div>
                      <Progress value={area.score} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Last reviewed: {area.lastReview}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Jurisdiction Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Filter by Jurisdiction</CardTitle>
              <CardDescription>View compliance by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {jurisdictions.map((jurisdiction) => (
                  <button
                    key={jurisdiction.code}
                    onClick={() => setSelectedJurisdiction(jurisdiction.code)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedJurisdiction === jurisdiction.code
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {jurisdiction.name}
                    </span>
                    <Badge
                      variant={
                        selectedJurisdiction === jurisdiction.code
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {jurisdiction.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                AI Insights
              </CardTitle>
              <CardDescription>
                Proactive compliance recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-purple-100">
                  <p className="text-sm font-medium">🎯 Predicted Risk</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    3 work permits will expire in Q2 2026. Start renewal process
                    now to avoid gaps.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-purple-100">
                  <p className="text-sm font-medium">📊 Training Gap</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    18% of employees need updated harassment training for
                    California compliance.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-purple-100">
                  <p className="text-sm font-medium">⚖️ Regulation Change</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    New GDPR requirements in Germany effective March 1. Review
                    data handling procedures.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Human Oversight */}
          <Card>
            <CardHeader>
              <CardTitle>Human Oversight</CardTitle>
              <CardDescription>Compliance review workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Automated Monitoring</p>
                  <p className="text-xs text-muted-foreground">
                    AI tracks all compliance items 24/7
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Risk Assessment</p>
                  <p className="text-xs text-muted-foreground">
                    GenAI prioritizes critical items
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">HR Review Required</p>
                  <p className="text-xs text-muted-foreground">
                    All high-priority items escalated to team
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Legal Verification</p>
                  <p className="text-xs text-muted-foreground">
                    Critical changes reviewed by legal counsel
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
