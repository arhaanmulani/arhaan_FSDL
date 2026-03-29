import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Student = {
  id: string;
  first_name: string;
  last_name: string;
  roll_no: string;
  contact_number: string;
  created_at: string;
  updated_at: string;
};

export type StudentFormData = {
  first_name: string;
  last_name: string;
  roll_no: string;
  password: string;
  confirm_password: string;
  contact_number: string;
};

const fetchStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export function useStudents() {
  return useQuery({ queryKey: ["students"], queryFn: fetchStudents });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: StudentFormData) => {
      const { error } = await supabase.from("students").insert({
        first_name: data.first_name,
        last_name: data.last_name,
        roll_no: data.roll_no,
        contact_number: data.contact_number,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student registered successfully!");
    },
    onError: (err: any) => toast.error(err.message),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StudentFormData> }) => {
      const { error } = await supabase
        .from("students")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          roll_no: data.roll_no,
          contact_number: data.contact_number,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student updated successfully!");
    },
    onError: (err: any) => toast.error(err.message),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student deleted successfully!");
    },
    onError: (err: any) => toast.error(err.message),
  });
}
