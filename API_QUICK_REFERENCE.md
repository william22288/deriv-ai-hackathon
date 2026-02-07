# API Functions Quick Reference

## All Available Functions (66 total)

### Token Management (3 functions)
```typescript
getToken()              // Get current JWT token
setToken(token, refreshToken)  // Store tokens
clearTokens()           // Clear all tokens
```

### Authentication (5 functions)
```typescript
registerUser(data)      // Register new user
loginUser(email, password)  // Login user
logoutUser()            // Logout and clear session
refreshAuthToken()      // Refresh expired token
getCurrentUser()        // Get current user profile
```

### Employees (5 functions)
```typescript
getAllEmployees()       // Get all employees
getEmployee(id)         // Get specific employee
createEmployee(data)    // Create employee
updateEmployee(id, data)  // Update employee
getEmployeeTeam(id)     // Get team members
```

### Documents - Templates (4 functions)
```typescript
getDocumentTemplates()  // List all templates
getDocumentTemplate(id) // Get single template
createDocumentTemplate(data)  // Create template
updateDocumentTemplate(id, data)  // Update template
```

### Documents - Contracts (6 functions)
```typescript
generateContract(data)  // Generate new contract
getContracts()          // List all contracts
getContract(id)         // Get single contract
getContractVersions(id) // Get contract versions
downloadContract(id)    // Download contract
signContract(id, data)  // Sign contract
```

### Documents - Equity (2 functions)
```typescript
generateEquityDocs(employeeId, data)  // Generate equity docs
getEmployeeEquity(employeeId)         // Get equity info
```

### Chat (7 functions)
```typescript
createChatSession()     // Create new session
getChatSessions()       // List all sessions
getChatSession(id)      // Get session with history
sendChatMessage(sessionId, message)  // Send message
deleteChatSession(id)   // Delete session
fetchChatHistory(employeeId)   // Legacy wrapper
saveChatMessage(employeeId, message)  // Legacy wrapper
```

### Policies (5 functions)
```typescript
getPolicies()           // List all policies
getPolicy(id)           // Get single policy
createPolicy(data)      // Create policy
updatePolicy(id, data)  // Update policy
searchPolicies(query)   // Search policies
```

### Laws (3 functions)
```typescript
getAllLaws()            // Get all laws
getLawsByJurisdiction(jurisdiction)  // Filter by location
getLawsByCategory(jurisdiction, category)  // Filter by category
```

### Requests (7 functions)
```typescript
getRequests()           // List all requests
getRequest(id)          // Get single request
createRequest(data)     // Create request
updateRequest(id, data) // Update request
assignRequest(id, assigneeId)  // Assign request
approveRequest(id, notes)      // Approve request
rejectRequest(id, reason)      // Reject request
```

### Compliance (8 functions)
```typescript
getComplianceItems()    // List all items
getComplianceItem(id)   // Get single item
createComplianceItem(data)     // Create item
updateComplianceItem(id, data) // Update item
deleteComplianceItem(id)       // Delete item
getExpiringComplianceItems()   // Get expiring soon
getComplianceDashboard()       // Get dashboard data
generateComplianceReport(data) // Generate report
```

### Training (8 functions)
```typescript
getTrainingPrograms()   // List programs
getTrainingProgram(id)  // Get single program
createTrainingProgram(data)     // Create program
updateTrainingProgram(id, data) // Update program
getTrainingAssignments()        // List assignments
createTrainingAssignment(data)  // Create assignment
completeTrainingAssignment(id)  // Mark as complete
getOverdueTraining()            // Get overdue items
```

### Legacy Functions (4 functions - for backward compatibility)
```typescript
fetchDocuments()        // → Use getContracts()
generateDocument(data)  // → Use generateContract(data)
fetchComplianceItems()  // → Use getComplianceItems()
addComplianceItem(data) // → Use createComplianceItem(data)
fetchComplianceAnalytics()  // → Use getComplianceDashboard()
updateDocumentStatus(id, status)  // → Use updatePolicy(id, {status})
```

## Import Examples

### Single Function
```typescript
import { getEmployee } from '@/app/api/hr-api';

const employee = await getEmployee('emp-123');
```

### Multiple Functions
```typescript
import { 
  getAllEmployees, 
  getEmployee, 
  createEmployee,
  updateEmployee 
} from '@/app/api/hr-api';

const employees = await getAllEmployees();
const newEmp = await createEmployee(data);
```

### Everything (not recommended)
```typescript
import * as api from '@/app/api/hr-api';

const employees = await api.getAllEmployees();
const employee = await api.getEmployee('emp-123');
```

## Function Categories by Use Case

### User Management
- `registerUser()` - New user registration
- `loginUser()` - User authentication
- `logoutUser()` - End session
- `getCurrentUser()` - Get profile
- `refreshAuthToken()` - Maintain session

### Employee Operations
- `getAllEmployees()` - List view
- `getEmployee()` - Detail view
- `createEmployee()` - Onboarding
- `updateEmployee()` - HR updates
- `getEmployeeTeam()` - Org chart

### Document Management
- `generateContract()` - Create contracts
- `getContracts()` - List documents
- `signContract()` - E-signature
- `downloadContract()` - Export
- `getDocumentTemplates()` - Template library

### Chat & Assistance
- `createChatSession()` - Start conversation
- `sendChatMessage()` - Get AI response
- `getChatSessions()` - Conversation history
- `deleteChatSession()` - Cleanup

### Compliance & Policies
- `getPolicies()` - Read policies
- `createPolicy()` - Create/update policies
- `getComplianceItems()` - Track compliance
- `getExpiringComplianceItems()` - Alerts
- `generateComplianceReport()` - Reporting

### Learning & Development
- `getTrainingPrograms()` - Catalog
- `createTrainingAssignment()` - Assign training
- `completeTrainingAssignment()` - Track completion
- `getOverdueTraining()` - Outstanding items

### Request Management
- `createRequest()` - Submit request
- `getRequests()` - List requests
- `approveRequest()` - Approve
- `rejectRequest()` - Deny

## Error Handling Template

```typescript
try {
  const result = await getEmployee('emp-123');
  // Use result
} catch (error) {
  console.error('Failed:', error.message);
  // Show user-friendly error message
}
```

## Common Patterns

### Get Single Item
```typescript
const item = await getEmployee('id');
const policy = await getPolicy('id');
const contract = await getContract('id');
```

### Get All Items
```typescript
const employees = await getAllEmployees();
const policies = await getPolicies();
const contracts = await getContracts();
```

### Create Item
```typescript
const newEmp = await createEmployee(data);
const newPolicy = await createPolicy(data);
const newContract = await generateContract(data);
```

### Update Item
```typescript
const updated = await updateEmployee('id', data);
const updated = await updatePolicy('id', data);
```

### Delete Item
```typescript
await deleteComplianceItem('id');
await deleteChatSession('id');
```

### Special Operations
```typescript
// Search
const results = await searchPolicies('keyword');

// Filter
const usLaws = await getLawsByJurisdiction('US');
const expired = await getExpiringComplianceItems();

// Action
await signContract('id', data);
await approveRequest('id', notes);
await completeTrainingAssignment('id');
```

## Base URL Configuration

The API uses:
```
http://localhost:3000/api
```

This can be configured in `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

For production:
```env
VITE_API_BASE_URL=https://api.mydomain.com/api
```

## HTTP Methods Used

- **GET** - Read data (`get*`, `fetch*`)
- **POST** - Create data (`create*`, `send*`, `generate*`)
- **PUT** - Replace data (`update*`)
- **PATCH** - Partial update (`update*`)
- **DELETE** - Remove data (`delete*`)

## Status Codes

- `200` - OK (GET, PUT, PATCH, DELETE)
- `201` - Created (POST success)
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Server Error (backend issue)

## Rate Limiting

Currently: None implemented
Future: Will be added with configurable limits per role

## CORS Support

Configured for:
- `http://localhost:5173` (dev frontend)
- `http://localhost:3000` (same-origin)
- Other origins configurable in backend `.env`

## WebSocket Support

Chat API currently uses HTTP polling. WebSocket support can be added for real-time updates.

## Caching Strategy

Currently: No caching (fresh data on each call)
Recommended: Implement React Query or SWR for:
- Automatic caching
- Background refetching
- Request deduplication
- Mutation optimization

## Performance Tips

1. **Batch requests** - Load related data together
2. **Pagination** - Implement for large lists
3. **Caching** - Use React Query/SWR
4. **Lazy loading** - Load data on demand
5. **Error boundaries** - Graceful error handling

## Testing

### Test a Function
```typescript
import { getEmployee } from '@/app/api/hr-api';

const employee = await getEmployee('test-emp');
console.log(employee);
```

### Test with Error
```typescript
try {
  await getEmployee('invalid-id');
} catch (error) {
  console.log('Expected error:', error.message);
}
```

### Test Authentication
```typescript
const user = await loginUser('user@example.com', 'password');
console.log('Token stored:', !!getToken());

await logoutUser();
console.log('Token cleared:', !getToken());
```
