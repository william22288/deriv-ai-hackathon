// Backend API Configuration
const BASE_URL = process.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Token management
const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, refreshToken?: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add auth token if available
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ==================== AUTH API ====================

export async function registerUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const response = await apiCall("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  setToken(response.accessToken, response.refreshToken);
  return response;
}

export async function loginUser(email: string, password: string) {
  const response = await apiCall("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(response.accessToken, response.refreshToken);
  return response;
}

export async function logoutUser() {
  clearTokens();
  return apiCall("/auth/logout", { method: "POST" }).catch(() => {});
}

export async function refreshAuthToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await apiCall("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  setToken(response.accessToken, response.refreshToken);
  return response;
}

export async function getCurrentUser() {
  return apiCall("/auth/me");
}

// ==================== EMPLOYEES API ====================

export async function getAllEmployees() {
  return apiCall("/employees");
}

export async function getEmployee(employeeId: string) {
  return apiCall(`/employees/${employeeId}`);
}

export async function createEmployee(data: any) {
  return apiCall("/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEmployee(employeeId: string, data: any) {
  return apiCall(`/employees/${employeeId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getEmployeeTeam(employeeId: string) {
  return apiCall(`/employees/${employeeId}/team`);
}

// ==================== DOCUMENTS API ====================

// Templates
export async function getDocumentTemplates() {
  return apiCall("/documents/templates");
}

export async function getDocumentTemplate(templateId: string) {
  return apiCall(`/documents/templates/${templateId}`);
}

export async function createDocumentTemplate(data: any) {
  return apiCall("/documents/templates", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDocumentTemplate(templateId: string, data: any) {
  return apiCall(`/documents/templates/${templateId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Contracts
export async function generateContract(data: any) {
  return apiCall("/documents/contracts/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getContracts() {
  return apiCall("/documents/contracts");
}

export async function getContract(contractId: string) {
  return apiCall(`/documents/contracts/${contractId}`);
}

export async function getContractVersions(contractId: string) {
  return apiCall(`/documents/contracts/${contractId}/versions`);
}

export async function downloadContract(contractId: string) {
  return apiCall(`/documents/contracts/${contractId}/download`);
}

export async function signContract(contractId: string, data: any) {
  return apiCall(`/documents/contracts/${contractId}/sign`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Equity
export async function generateEquityDocs(employeeId: string, data: any) {
  return apiCall("/documents/equity/generate", {
    method: "POST",
    body: JSON.stringify({ employeeId, ...data }),
  });
}

export async function getEmployeeEquity(employeeId: string) {
  return apiCall(`/documents/equity/${employeeId}`);
}

// Legacy document endpoints (backward compatibility)
export async function fetchDocuments() {
  return getContracts();
}

export async function generateDocument(data: any) {
  return generateContract(data);
}

// ==================== CHAT/SESSIONS API ====================

export async function createChatSession() {
  return apiCall("/chat/sessions", {
    method: "POST",
  });
}

export async function getChatSessions() {
  return apiCall("/chat/sessions");
}

export async function getChatSession(sessionId: string) {
  return apiCall(`/chat/sessions/${sessionId}`);
}

export async function sendChatMessage(sessionId: string, message: string) {
  return apiCall(`/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export async function deleteChatSession(sessionId: string) {
  return apiCall(`/chat/sessions/${sessionId}`, {
    method: "DELETE",
  });
}

// Legacy chat endpoints (backward compatibility)
export async function fetchChatHistory(employeeId: string) {
  return getChatSession(employeeId).catch(() => []);
}

export async function saveChatMessage(employeeId: string, message: any) {
  return sendChatMessage(employeeId, message.text || message);
}

// ==================== POLICIES API ====================

export async function getPolicies() {
  return apiCall("/policies");
}

export async function getPolicy(policyId: string) {
  return apiCall(`/policies/${policyId}`);
}

export async function createPolicy(data: any) {
  return apiCall("/policies", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePolicy(policyId: string, data: any) {
  return apiCall(`/policies/${policyId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function searchPolicies(query: string) {
  return apiCall("/policies/search", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

// ==================== LABOUR LAWS API ====================

export async function getAllLaws() {
  return apiCall("/laws");
}

export async function getLawsByJurisdiction(jurisdiction: string) {
  return apiCall(`/laws/${jurisdiction}`);
}

export async function getLawsByCategory(
  jurisdiction: string,
  category: string,
) {
  return apiCall(`/laws/${jurisdiction}/${category}`);
}

// ==================== REQUESTS API ====================

export async function getRequests() {
  return apiCall("/requests");
}

export async function getRequest(requestId: string) {
  return apiCall(`/requests/${requestId}`);
}

export async function createRequest(data: any) {
  return apiCall("/requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateRequest(requestId: string, data: any) {
  return apiCall(`/requests/${requestId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function assignRequest(requestId: string, assigneeId: string) {
  return apiCall(`/requests/${requestId}/assign`, {
    method: "POST",
    body: JSON.stringify({ assigneeId }),
  });
}

export async function approveRequest(requestId: string, notes?: string) {
  return apiCall(`/requests/${requestId}/approve`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
}

export async function rejectRequest(requestId: string, reason: string) {
  return apiCall(`/requests/${requestId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

// ==================== COMPLIANCE API ====================

export async function getComplianceItems() {
  return apiCall("/compliance/items");
}

export async function getComplianceItem(itemId: string) {
  return apiCall(`/compliance/items/${itemId}`);
}

export async function createComplianceItem(data: any) {
  return apiCall("/compliance/items", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateComplianceItem(itemId: string, data: any) {
  return apiCall(`/compliance/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteComplianceItem(itemId: string) {
  return apiCall(`/compliance/items/${itemId}`, {
    method: "DELETE",
  });
}

export async function getExpiringComplianceItems() {
  return apiCall("/compliance/expiring");
}

export async function getComplianceDashboard() {
  return apiCall("/compliance/dashboard");
}

export async function generateComplianceReport(data: any) {
  return apiCall("/compliance/reports/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Legacy compliance endpoints (backward compatibility)
export async function fetchComplianceItems() {
  return getComplianceItems();
}

export async function addComplianceItem(data: any) {
  return createComplianceItem(data);
}

// ==================== TRAINING API ====================

export async function getTrainingPrograms() {
  return apiCall("/training/programs");
}

export async function getTrainingProgram(programId: string) {
  return apiCall(`/training/programs/${programId}`);
}

export async function createTrainingProgram(data: any) {
  return apiCall("/training/programs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTrainingProgram(programId: string, data: any) {
  return apiCall(`/training/programs/${programId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getTrainingAssignments() {
  return apiCall("/training/assignments");
}

export async function createTrainingAssignment(data: any) {
  return apiCall("/training/assignments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function completeTrainingAssignment(assignmentId: string) {
  return apiCall(`/training/assignments/${assignmentId}/complete`, {
    method: "POST",
  });
}

export async function getOverdueTraining() {
  return apiCall("/training/overdue");
}

// ==================== LEGACY ENDPOINTS (for backward compatibility) ====================

export async function fetchComplianceAnalytics() {
  return getComplianceDashboard();
}

export async function updateDocumentStatus(documentId: string, status: string) {
  return updatePolicy(documentId, { status });
}
