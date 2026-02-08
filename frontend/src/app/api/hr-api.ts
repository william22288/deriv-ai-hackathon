// Use your backend API instead of Supabase directly
const BASE_URL = 'http://localhost:3000/api/v1';

// Note: Token will be passed from components that have access to auth context
// For now, we'll rely on localStorage as a fallback
function getAuthToken() {
  // Try to get from localStorage (fallback mechanism)
  return localStorage.getItem('accessToken') || '';
}

function getRefreshToken() {
  return localStorage.getItem('refreshToken') || '';
}

function clearStoredAuth() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth:logout'));
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json().catch(() => null);
  const newAccessToken = data?.data?.access_token as string | undefined;
  const newRefreshToken = data?.data?.refresh_token as string | undefined;

  if (newAccessToken) {
    localStorage.setItem('accessToken', newAccessToken);
  }
  if (newRefreshToken) {
    localStorage.setItem('refreshToken', newRefreshToken);
  }

  return newAccessToken || null;
}

async function apiCall(endpoint: string, options: RequestInit = {}, retry = true) {
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
    if (response.status === 401 && retry) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return apiCall(endpoint, options, false);
      }
      clearStoredAuth();
      throw new Error('Session expired. Please sign in again.');
    }

    const rawText = await response.text().catch(() => '');
    let parsed: any = undefined;
    if (rawText) {
      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = undefined;
      }
    }

    const message =
      (parsed && (parsed.error?.message || parsed.error || parsed.message)) ||
      rawText ||
      `HTTP ${response.status}`;

    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return response.json();
}

// ==================== DOCUMENT GENERATION API ====================

export async function fetchDocuments() {
  const response = await apiCall('/documents/list');
  return {
    success: response.success,
    documents: response.data?.documents ?? response.documents ?? [],
  };
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
  const normalizeJurisdiction = (value: string) => {
    const normalized = value.toLowerCase();
    if (normalized.startsWith('us-') || normalized === 'us') return 'US';
    if (normalized === 'uk' || normalized === 'gb') return 'UK';
    return normalized.toUpperCase();
  };

  const payload = {
    ...data,
    jurisdiction: normalizeJurisdiction(data.jurisdiction),
  };

  const response = await apiCall('/documents/generate', {
    method: 'POST',
    body: JSON.stringify({ documentType: data.documentType, data: payload }),
  });
  return {
    success: response.success,
    document: response.data?.document ?? response.document,
  };
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
  const response = await apiCall('/documents/compliance');
  return {
    success: response.success,
    items: response.data?.items ?? response.items ?? [],
  };
}

export async function addComplianceItem(data: any) {
  const response = await apiCall('/documents/compliance', {
    method: 'POST',
    body: JSON.stringify({ item: data }),
  });
  return {
    success: response.success,
    item: response.data?.item ?? response.item,
  };
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
