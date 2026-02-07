# Frontend API Integration Guide

This document describes the integrated backend API endpoints available in the frontend application.

## Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory with the following configuration:

```env
# Backend API Configuration (Local Development)
VITE_API_BASE_URL=http://localhost:3000/api

# Production Example
# VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## Authentication

The API uses JWT (JSON Web Token) based authentication. Tokens are automatically managed by the API client and stored in localStorage.

### Auth Endpoints

#### Register/Login
```typescript
import { registerUser, loginUser, logoutUser, getCurrentUser } from '@/app/api/hr-api';

// Register a new user
const response = await registerUser({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
});

// Login
const response = await loginUser('user@example.com', 'password123');
// Token is automatically saved to localStorage

// Get current user profile
const user = await getCurrentUser();

// Logout
await logoutUser();
```

#### Token Management
```typescript
import { getToken, setToken, clearTokens } from '@/app/api/hr-api';

// Get current authentication token
const token = getToken();

// Manually handle tokens if needed
setToken('new-token', 'refresh-token');

// Clear all tokens
clearTokens();
```

## API Endpoints

### Employees

```typescript
import {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  getEmployeeTeam
} from '@/app/api/hr-api';

// Get all employees (requires HR_ADMIN or SUPER_ADMIN role)
const employees = await getAllEmployees();

// Get specific employee
const employee = await getEmployee('employee-id');

// Create new employee (requires HR_ADMIN or SUPER_ADMIN role)
const newEmployee = await createEmployee({
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  department: 'Engineering',
  // ... other employee fields
});

// Update employee
const updated = await updateEmployee('employee-id', {
  department: 'Product',
  // ... fields to update
});

// Get employee's team
const team = await getEmployeeTeam('employee-id');
```

### Documents

#### Templates
```typescript
import {
  getDocumentTemplates,
  getDocumentTemplate,
  createDocumentTemplate,
  updateDocumentTemplate
} from '@/app/api/hr-api';

// Get all document templates
const templates = await getDocumentTemplates();

// Get specific template
const template = await getDocumentTemplate('template-id');

// Create new template (requires HR_ADMIN or SUPER_ADMIN)
const newTemplate = await createDocumentTemplate({
  name: 'Standard Employment Contract',
  type: 'employment',
  content: '...',
  // ... template fields
});

// Update template (requires HR_ADMIN or SUPER_ADMIN)
const updated = await updateDocumentTemplate('template-id', {
  name: 'Updated Template Name'
});
```

#### Contracts
```typescript
import {
  generateContract,
  getContracts,
  getContract,
  getContractVersions,
  downloadContract,
  signContract
} from '@/app/api/hr-api';

// Generate a new contract
const contract = await generateContract({
  employeeName: 'John Doe',
  position: 'Senior Engineer',
  jurisdiction: 'US-CA',
  startDate: '2026-03-01',
  salary: '150000',
  workLocation: 'Remote',
  additionalClauses: 'Optional additional terms...'
});

// Get all contracts
const contracts = await getContracts();

// Get specific contract
const contract = await getContract('contract-id');

// Get contract versions
const versions = await getContractVersions('contract-id');

// Download contract
const pdf = await downloadContract('contract-id');

// Sign contract
const signed = await signContract('contract-id', {
  signedBy: 'employee-id',
  signature: 'base64-signature',
  timestamp: new Date().toISOString()
});
```

#### Equity
```typescript
import {
  generateEquityDocs,
  getEmployeeEquity
} from '@/app/api/hr-api';

// Generate equity documents for employee (requires HR_ADMIN or SUPER_ADMIN)
const equityDocs = await generateEquityDocs('employee-id', {
  vestingSchedule: 'monthly',
  totalShares: 1000,
  grantDate: '2026-01-01',
  cliffDate: '2026-12-01'
});

// Get employee's equity information
const equity = await getEmployeeEquity('employee-id');
```

### Chat Sessions

```typescript
import {
  createChatSession,
  getChatSessions,
  getChatSession,
  sendChatMessage,
  deleteChatSession
} from '@/app/api/hr-api';

// Create a new chat session
const session = await createChatSession();

// Get all chat sessions for current user
const sessions = await getChatSessions();

// Get specific chat session with history
const sessionData = await getChatSession('session-id');

// Send message in a session (receives AI response)
const response = await sendChatMessage('session-id', 'What is the PTO policy?');

// Delete a chat session
await deleteChatSession('session-id');
```

### Policies

```typescript
import {
  getPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,
  searchPolicies
} from '@/app/api/hr-api';

// Get all policies
const policies = await getPolicies();

// Get specific policy
const policy = await getPolicy('policy-id');

// Create new policy (requires HR_ADMIN or SUPER_ADMIN)
const newPolicy = await createPolicy({
  title: 'Work From Home Policy',
  description: 'Guidelines for remote work',
  content: '...',
  jurisdiction: 'US'
});

// Update policy (requires HR_ADMIN or SUPER_ADMIN)
const updated = await updatePolicy('policy-id', {
  title: 'Updated Policy Title'
});

// Search policies
const results = await searchPolicies('remote work');
```

### Labour Laws

```typescript
import {
  getAllLaws,
  getLawsByJurisdiction,
  getLawsByCategory
} from '@/app/api/hr-api';

// Get all labour laws
const allLaws = await getAllLaws();

// Get laws for specific jurisdiction
const usLaws = await getLawsByJurisdiction('US');
const ukLaws = await getLawsByJurisdiction('UK');

// Get laws for specific jurisdiction and category
const usWageHours = await getLawsByCategory('US', 'wage-and-hour');
const ukHealthSafety = await getLawsByCategory('UK', 'health-and-safety');
```

### Requests

```typescript
import {
  getRequests,
  getRequest,
  createRequest,
  updateRequest,
  assignRequest,
  approveRequest,
  rejectRequest
} from '@/app/api/hr-api';

// Get all requests
const requests = await getRequests();

// Get specific request
const request = await getRequest('request-id');

// Create new request
const newRequest = await createRequest({
  type: 'time-off',
  startDate: '2026-03-15',
  endDate: '2026-03-17',
  reason: 'Personal leave'
});

// Update request
const updated = await updateRequest('request-id', {
  reason: 'Updated reason'
});

// Assign request to someone (requires HR_ADMIN or MANAGER)
const assigned = await assignRequest('request-id', 'assigned-to-user-id');

// Approve request (requires HR_ADMIN or MANAGER)
const approved = await approveRequest('request-id', 'Approved notes');

// Reject request (requires HR_ADMIN or MANAGER)
const rejected = await rejectRequest('request-id', 'Reason for rejection');
```

### Compliance

```typescript
import {
  getComplianceItems,
  getComplianceItem,
  createComplianceItem,
  updateComplianceItem,
  deleteComplianceItem,
  getExpiringComplianceItems,
  getComplianceDashboard,
  generateComplianceReport
} from '@/app/api/hr-api';

// Get all compliance items
const items = await getComplianceItems();

// Get specific compliance item
const item = await getComplianceItem('item-id');

// Create new compliance item (requires HR_ADMIN or SUPER_ADMIN)
const newItem = await createComplianceItem({
  type: 'training',
  title: 'Mandatory Sexual Harassment Training',
  dueDate: '2026-12-31',
  jurisdiction: 'US-CA'
});

// Update compliance item (requires HR_ADMIN or SUPER_ADMIN)
const updated = await updateComplianceItem('item-id', {
  status: 'completed'
});

// Delete compliance item (requires HR_ADMIN or SUPER_ADMIN)
await deleteComplianceItem('item-id');

// Get items expiring soon
const expiring = await getExpiringComplianceItems();

// Get compliance dashboard (requires HR_ADMIN or SUPER_ADMIN)
const dashboard = await getComplianceDashboard();

// Generate compliance report (requires HR_ADMIN or SUPER_ADMIN)
const report = await generateComplianceReport({
  jurisdiction: 'US-CA',
  startDate: '2026-01-01',
  endDate: '2026-03-31'
});
```

### Training

```typescript
import {
  getTrainingPrograms,
  getTrainingProgram,
  createTrainingProgram,
  updateTrainingProgram,
  getTrainingAssignments,
  createTrainingAssignment,
  completeTrainingAssignment,
  getOverdueTraining
} from '@/app/api/hr-api';

// Get all training programs
const programs = await getTrainingPrograms();

// Get specific training program
const program = await getTrainingProgram('program-id');

// Create training program (requires HR_ADMIN or SUPER_ADMIN)
const newProgram = await createTrainingProgram({
  title: 'Diversity and Inclusion',
  description: 'Learn about D&I best practices',
  duration: 120, // minutes
  category: 'compliance'
});

// Update training program (requires HR_ADMIN or SUPER_ADMIN)
const updated = await updateTrainingProgram('program-id', {
  title: 'Updated Program Title'
});

// Get all training assignments
const assignments = await getTrainingAssignments();

// Create training assignment (requires HR_ADMIN or SUPER_ADMIN)
const newAssignment = await createTrainingAssignment({
  employeeId: 'employee-id',
  programId: 'program-id',
  dueDate: '2026-06-30'
});

// Mark training as completed
const completed = await completeTrainingAssignment('assignment-id');

// Get overdue training (requires HR_ADMIN or SUPER_ADMIN)
const overdue = await getOverdueTraining();
```

## Error Handling

All API functions throw errors with descriptive messages. Always wrap API calls in try-catch blocks:

```typescript
try {
  const result = await getEmployee('employee-id');
  // Use result
} catch (error) {
  console.error('Error:', error.message);
  // Handle error - show user message, etc.
}
```

## Backward Compatibility

The following old API function names are maintained for backward compatibility:

- `fetchDocuments()` → `getContracts()`
- `generateDocument()` → `generateContract()`
- `updateDocumentStatus()` → `updatePolicy()`
- `fetchChatHistory()` → `getChatSession()`
- `saveChatMessage()` → `sendChatMessage()`
- `fetchRequests()` → `getRequests()`
- `fetchComplianceItems()` → `getComplianceItems()`
- `addComplianceItem()` → `createComplianceItem()`
- `fetchComplianceAnalytics()` → `getComplianceDashboard()`

## Component Integration

All major components are already integrated with the API:

- **DocumentGeneration**: Uses `getContracts()`, `generateContract()`
- **ComplianceIntelligence**: Uses `getComplianceItems()`, `getExpiringComplianceItems()`
- **HRAssistant**: Uses `createChatSession()`, `sendChatMessage()`
- **Dashboard**: Can use `getComplianceDashboard()`, `getTrainingPrograms()`

## Running the Application

### Backend
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
# Vite will proxy API calls to http://localhost:3000/api
```

## Testing the Integration

1. **With Authentication**: Update the `hr-api.ts` to include proper login/logout flow in components
2. **Without Authentication**: For demo purposes, the API client can work without tokens (some endpoints may fail based on backend requirements)
3. **Error Scenarios**: Test error handling by providing invalid IDs or missing required fields

## Next Steps

1. **Implement Authentication UI**: Add login/register pages
2. **Add Error Boundaries**: Wrap components with error boundaries
3. **Implement Loading States**: Add skeleton loaders for better UX
4. **Add Data Caching**: Implement React Query or SWR for better data management
5. **Test All Endpoints**: Verify each endpoint works with your backend
