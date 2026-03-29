import { useState } from "react";
import StudentForm from "@/components/StudentForm";
import StudentTable from "@/components/StudentTable";
import type { Student } from "@/hooks/useStudents";
import { GraduationCap } from "lucide-react";

export default function Index() {
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary py-6 shadow-md">
        <div className="container mx-auto flex items-center gap-3 px-4">
          <GraduationCap className="h-8 w-8 text-primary-foreground" />
          <h1 className="text-2xl font-bold text-primary-foreground tracking-tight">
            Student Registration System
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
        <StudentForm editingStudent={editingStudent} onCancelEdit={() => setEditingStudent(null)} />
        <StudentTable onEdit={setEditingStudent} />
      </main>
    </div>
  );
}
