import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Question, InsertQuestion, QuestionWithCategory } from "@shared/schema";
import type { Stats } from "@/lib/types";

export function useQuestions(categoryId?: number, searchQuery?: string) {
  const params = new URLSearchParams();
  if (categoryId) params.append("category", categoryId.toString());
  if (searchQuery) params.append("search", searchQuery);
  
  const queryString = params.toString();
  const url = `/api/questions${queryString ? `?${queryString}` : ""}`;
  
  return useQuery<QuestionWithCategory[]>({
    queryKey: ["/api/questions", categoryId, searchQuery],
    queryFn: async () => {
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch questions");
      return response.json();
    },
  });
}

export function useQuestion(id: number) {
  return useQuery<QuestionWithCategory>({
    queryKey: ["/api/questions", id],
    enabled: !!id,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (question: InsertQuestion) => {
      const response = await apiRequest("POST", "/api/questions", question);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertQuestion> }) => {
      const response = await apiRequest("PUT", `/api/questions/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });
}

export function useStats() {
  return useQuery<Stats>({
    queryKey: ["/api/stats"],
  });
}
