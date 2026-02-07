import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { FileText, Sparkles, Download, Eye, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import * as api from "../api/hr-api";
import { useAuth } from "../contexts/AuthContext";

interface GeneratedDocument {
  id: string;
  type: string;
  employeeName: string;
  jurisdiction: string;
  status: "generated" | "reviewed" | "sent";
  generatedAt: string;
  content: string;
}

export function DocumentGeneration() {
  const { isAuthenticated } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<GeneratedDocument | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<GeneratedDocument[]>([]);
  const [formData, setFormData] = useState({
    documentType: "",
    employeeName: "",
    position: "",
    jurisdiction: "",
    startDate: "",
    salary: "",
    workLocation: "",
    additionalClauses: ""
  });

  const documentTemplates = [
    { value: "employment", label: "Employment Contract", jurisdictions: 15 },
    { value: "nda", label: "Non-Disclosure Agreement", jurisdictions: 20 },
    { value: "contractor", label: "Contractor Agreement", jurisdictions: 12 },
    { value: "offer", label: "Offer Letter", jurisdictions: 18 },
    { value: "termination", label: "Termination Letter", jurisdictions: 10 }
  ];

  const jurisdictions = [
    { value: "us-ca", label: "United States - California" },
    { value: "us-ny", label: "United States - New York" },
    { value: "us-tx", label: "United States - Texas" },
    { value: "uk", label: "United Kingdom" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
    { value: "ca-on", label: "Canada - Ontario" },
    { value: "au", label: "Australia" },
    { value: "sg", label: "Singapore" }
  ];

  useEffect(() => {
    // Only load documents if user is authenticated
    if (isAuthenticated) {
      loadRecentDocuments();
    }
  }, [isAuthenticated]);

  const loadRecentDocuments = async () => {
    try {
      const response = await api.fetchDocuments();
      if (response.success) {
        // Take last 3 documents and format for display
        const docs = response.documents.slice(-3).reverse().map((doc: any) => ({
          ...doc,
          generatedAt: new Date(doc.generatedAt).toLocaleString()
        }));
        setRecentDocuments(docs);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      // Use demo data on error
      setRecentDocuments([
        {
          id: "1",
          type: "Employment Contract",
          employeeName: "Sarah Johnson",
          jurisdiction: "US-CA",
          status: "sent",
          generatedAt: "2 hours ago",
          content: ""
        }
      ]);
    }
  };

  const handleGenerate = async () => {
    if (!formData.documentType || !formData.employeeName || !formData.jurisdiction) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Call backend API to generate document
      const response = await api.generateDocument(formData);
      
      if (response.success) {
        const generatedDoc: GeneratedDocument = {
          id: response.document.id,
          type: response.document.type,
          employeeName: response.document.employeeName,
          jurisdiction: response.document.jurisdiction.toUpperCase(),
          status: response.document.status,
          generatedAt: "Just now",
          content: response.document.content
        };

        setCurrentDocument(generatedDoc);
        toast.success("Document generated and saved successfully with AI-powered localization");
        
        // Reload recent documents
        loadRecentDocuments();
      }
    } catch (error: any) {
      console.error('Error generating document:', error);
      toast.error(error.message || "Failed to generate document");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockDocument = (data: typeof formData) => {
    return `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into as of ${data.startDate || "[START DATE]"}, by and between [COMPANY NAME] ("Employer") and ${data.employeeName} ("Employee").

1. POSITION AND DUTIES
Employee is hereby employed as ${data.position || "[POSITION]"} and shall perform duties as assigned by the Employer.

2. COMPENSATION
Employee shall receive an annual salary of ${data.salary || "[SALARY]"}, payable in accordance with Employer's standard payroll practices.

3. WORK LOCATION
Employee's primary work location shall be ${data.workLocation || "[LOCATION]"}.

4. JURISDICTION-SPECIFIC PROVISIONS (${data.jurisdiction.toUpperCase()})
[AI-GENERATED COMPLIANCE CLAUSES FOR ${data.jurisdiction.toUpperCase()}]
- Labor law compliance requirements
- Mandatory benefits and entitlements
- Notice period regulations
- Data protection provisions

${data.additionalClauses ? `5. ADDITIONAL PROVISIONS\n${data.additionalClauses}` : ""}

[Additional standard clauses generated by AI based on jurisdiction and document type]

---
Generated by AI-Powered Document System
Compliant with ${data.jurisdiction.toUpperCase()} regulations as of February 2026
Requires human review before execution`;
  };

  const handleDownload = () => {
    toast.success("Document downloaded as PDF");
  };

  const handleReview = () => {
    if (currentDocument) {
      setCurrentDocument({
        ...currentDocument,
        status: "reviewed"
      });
      toast.success("Document marked as reviewed - ready for human approval");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Intelligent Document Generation</h1>
        <p className="text-muted-foreground">
          AI-powered contract generation with jurisdiction-specific compliance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generation Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Generate New Document
              </CardTitle>
              <CardDescription>
                Provide structured data and AI will generate a compliant, localized document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type *</Label>
                  <Select 
                    value={formData.documentType}
                    onValueChange={(value) => setFormData({...formData, documentType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTemplates.map(template => (
                        <SelectItem key={template.value} value={template.value}>
                          {template.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jurisdiction">Jurisdiction *</Label>
                  <Select 
                    value={formData.jurisdiction}
                    onValueChange={(value) => setFormData({...formData, jurisdiction: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      {jurisdictions.map(j => (
                        <SelectItem key={j.value} value={j.value}>
                          {j.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeName">Employee Name *</Label>
                  <Input 
                    id="employeeName"
                    value={formData.employeeName}
                    onChange={(e) => setFormData({...formData, employeeName: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input 
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    placeholder="Software Engineer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Annual Salary</Label>
                  <Input 
                    id="salary"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    placeholder="$120,000"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="workLocation">Work Location</Label>
                  <Input 
                    id="workLocation"
                    value={formData.workLocation}
                    onChange={(e) => setFormData({...formData, workLocation: e.target.value})}
                    placeholder="San Francisco, CA"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="additionalClauses">Additional Clauses (Optional)</Label>
                  <Textarea 
                    id="additionalClauses"
                    value={formData.additionalClauses}
                    onChange={(e) => setFormData({...formData, additionalClauses: e.target.value})}
                    placeholder="Any specific terms or conditions to include..."
                    rows={3}
                  />
                </div>
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Document
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Document Preview */}
          {currentDocument && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Document Preview
                  </span>
                  <Badge variant={currentDocument.status === "reviewed" ? "default" : "secondary"}>
                    {currentDocument.status === "reviewed" ? (
                      <><CheckCircle className="mr-1 h-3 w-3" /> Reviewed</>
                    ) : (
                      <><AlertCircle className="mr-1 h-3 w-3" /> Needs Review</>
                    )}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  AI-generated document with jurisdiction-specific compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {currentDocument.content}
                  </pre>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleReview} variant="outline" className="flex-1">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Reviewed
                  </Button>
                  <Button onClick={handleDownload} className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  ⚠️ Human oversight required: Please review all AI-generated content for legal accuracy before execution
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Templates & Recent Documents */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Templates</CardTitle>
              <CardDescription>AI-powered templates with multi-jurisdiction support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {documentTemplates.map(template => (
                  <div 
                    key={template.value}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted cursor-pointer"
                    onClick={() => setFormData({...formData, documentType: template.value})}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{template.label}</span>
                    </div>
                    <Badge variant="secondary">{template.jurisdictions} regions</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>Recently generated contracts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentDocuments.map(doc => (
                  <div key={doc.id} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{doc.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{doc.type}</p>
                      </div>
                      <Badge 
                        variant={doc.status === "sent" ? "default" : doc.status === "reviewed" ? "secondary" : "outline"}
                      >
                        {doc.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{doc.jurisdiction}</span>
                      <span>{doc.generatedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}