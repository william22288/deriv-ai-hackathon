import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/hr-api";
import { toast } from "sonner";

// ==================== EMPLOYEES QUERIES ====================

export function useAllEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: () => api.getAllEmployees(),
  });
}

export function useEmployee(employeeId: string) {
  return useQuery({
    queryKey: ["employees", employeeId],
    queryFn: () => api.getEmployee(employeeId),
    enabled: !!employeeId,
  });
}

// ==================== CONTRACTS QUERIES ====================

export function useContracts() {
  return useQuery({
    queryKey: ["contracts"],
    queryFn: () => api.getContracts(),
  });
}

export function useContract(contractId: string) {
  return useQuery({
    queryKey: ["contracts", contractId],
    queryFn: () => api.getContract(contractId),
    enabled: !!contractId,
  });
}

// ==================== CONTRACTS MUTATIONS ====================

export function useGenerateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.generateContract(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast.success("Contract generated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate contract");
    },
  });
}

// ==================== CHAT SESSIONS QUERIES ====================

export function useChatSessions() {
  return useQuery({
    queryKey: ["chatSessions"],
    queryFn: () => api.getChatSessions(),
  });
}

export function useChatSession(sessionId: string) {
  return useQuery({
    queryKey: ["chatSessions", sessionId],
    queryFn: () => api.getChatSession(sessionId),
    enabled: !!sessionId,
  });
}

// ==================== CHAT SESSIONS MUTATIONS ====================

export function useCreateChatSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.createChatSession(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create chat session");
    },
  });
}

export function useSendChatMessage(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) => api.sendChatMessage(sessionId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatSessions", sessionId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send message");
    },
  });
}

export function useDeleteChatSession(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.deleteChatSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] });
      toast.success("Chat session deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete chat session");
    },
  });
}

// ==================== COMPLIANCE QUERIES ====================

export function useComplianceItems() {
  return useQuery({
    queryKey: ["compliance", "items"],
    queryFn: () => api.getComplianceItems(),
  });
}

export function useExpiringComplianceItems() {
  return useQuery({
    queryKey: ["compliance", "expiring"],
    queryFn: () => api.getExpiringComplianceItems(),
  });
}

export function useComplianceDashboard() {
  return useQuery({
    queryKey: ["compliance", "dashboard"],
    queryFn: () => api.getComplianceDashboard(),
  });
}

// ==================== COMPLIANCE MUTATIONS ====================

export function useCreateComplianceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.createComplianceItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance", "items"] });
      toast.success("Compliance item created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create compliance item");
    },
  });
}

export function useUpdateComplianceItem(itemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.updateComplianceItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance", "items"] });
      queryClient.invalidateQueries({
        queryKey: ["compliance", "items", itemId],
      });
      toast.success("Compliance item updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update compliance item");
    },
  });
}

// ==================== REQUESTS QUERIES ====================

export function useRequests() {
  return useQuery({
    queryKey: ["requests"],
    queryFn: () => api.getRequests(),
  });
}

export function useRequest(requestId: string) {
  return useQuery({
    queryKey: ["requests", requestId],
    queryFn: () => api.getRequest(requestId),
    enabled: !!requestId,
  });
}

// ==================== REQUESTS MUTATIONS ====================

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Request created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create request");
    },
  });
}

export function useApproveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, notes }: { requestId: string; notes?: string }) =>
      api.approveRequest(requestId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Request approved!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to approve request");
    },
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      reason,
    }: {
      requestId: string;
      reason: string;
    }) => api.rejectRequest(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success("Request rejected!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reject request");
    },
  });
}

// ==================== TRAINING QUERIES ====================

export function useTrainingPrograms() {
  return useQuery({
    queryKey: ["training", "programs"],
    queryFn: () => api.getTrainingPrograms(),
  });
}

export function useTrainingAssignments() {
  return useQuery({
    queryKey: ["training", "assignments"],
    queryFn: () => api.getTrainingAssignments(),
  });
}

export function useOverdueTraining() {
  return useQuery({
    queryKey: ["training", "overdue"],
    queryFn: () => api.getOverdueTraining(),
  });
}

// ==================== TRAINING MUTATIONS ====================

export function useCreateTrainingAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.createTrainingAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training", "assignments"] });
      toast.success("Training assignment created!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create training assignment");
    },
  });
}

export function useCompleteTrainingAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignmentId: string) =>
      api.completeTrainingAssignment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training", "assignments"] });
      toast.success("Training assignment completed!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to complete training assignment");
    },
  });
}

// ==================== POLICIES QUERIES ====================

export function usePolicies() {
  return useQuery({
    queryKey: ["policies"],
    queryFn: () => api.getPolicies(),
  });
}

export function useSearchPolicies(query: string) {
  return useQuery({
    queryKey: ["policies", "search", query],
    queryFn: () => api.searchPolicies(query),
    enabled: !!query && query.length > 0,
  });
}
