// Use your backend API instead of Supabase directly
const BASE_URL = 'http://localhost:3000/api/v1';

// Note: Token will be passed from components that have access to auth context
// For now, we'll rely on localStorage as a fallback
function getAuthToken() {
  // Try to get from localStorage (fallback mechanism)
  return localStorage.getItem('accessToken') || '';
}

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ==================== DOCUMENT GENERATION API ====================

export async function fetchDocuments() {
  return apiCall('/documents/list');
}

export async function generateDocument(data: {
  documentType: string;
  employeeName: string;
  position?: string;
  jurisdiction: string;
  startDate?: string;
  salary?: string;
  workLocation?: string;
  additionalClauses?: string;
}) {
  return apiCall('/documents/generate', {
    method: 'POST',
    body: JSON.stringify({ documentType: data.documentType, data }),
  });
}

export async function updateDocumentStatus(documentId: string, status: string) {
  return apiCall(`/documents/${documentId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// ==================== HR ASSISTANT API ====================

export async function fetchChatHistory(employeeId: string) {
  return apiCall(`/chat/${employeeId}`);
}

export async function saveChatMessage(employeeId: string, message: any) {
  return apiCall(`/chat/${employeeId}/message`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export async function fetchRequests() {
  return apiCall('/requests');
}

export async function createRequest(data: any) {
  return apiCall('/requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRequest(requestId: string, status: string, response?: string) {
  return apiCall(`/requests/${requestId}`, {
    method: 'PUT',
    body: JSON.stringify({ status, response }),
  });
}

// ==================== COMPLIANCE API ====================

export async function fetchComplianceItems() {
  return apiCall('/documents/compliance');
}

export async function addComplianceItem(data: any) {
  return apiCall('/documents/compliance', {
    method: 'POST',
    body: JSON.stringify({ item: data }),
  });
}

export async function updateComplianceItem(itemId: string, updates: any) {
  // This would need a PUT endpoint in your backend
  return apiCall(`/documents/compliance/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteComplianceItem(itemId: string) {
  // This would need a DELETE endpoint in your backend
  return apiCall(`/documents/compliance/${itemId}`, {
    method: 'DELETE',
  });
}

export async function fetchComplianceAnalytics() {
  // This would need an analytics endpoint in your backend
  return apiCall('/documents/compliance/analytics');
}

// ==================== EMPLOYEE DATA API ====================

export async function fetchEmployee(employeeId: string) {
  return apiCall(`/employees/${employeeId}`);
}

export async function updateEmployee(employeeId: string, updates: any) {
  return apiCall(`/employees/${employeeId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}
