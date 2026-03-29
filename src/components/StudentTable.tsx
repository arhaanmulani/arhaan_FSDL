import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStudents, useDeleteStudent, type Student } from "@/hooks/useStudents";
import { Pencil, Trash2, Users, Loader2 } from "lucide-react";

type Props = {
  onEdit: (student: Student) => void;
};

export default function StudentTable({ onEdit }: Props) {
  const { data: students, isLoading } = useStudents();
  const deleteMutation = useDeleteStudent();

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-primary rounded-t-lg">
        <CardTitle className="text-primary-foreground flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Registered Students ({students?.length ?? 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !students?.length ? (
          <p className="text-center py-12 text-muted-foreground">No students registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{s.first_name}</TableCell>
                    <TableCell>{s.last_name}</TableCell>
                    <TableCell className="font-mono text-sm">{s.roll_no}</TableCell>
                    <TableCell>{s.contact_number}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => onEdit(s)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate(s.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
