import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateStudent, useUpdateStudent, type Student, type StudentFormData } from "@/hooks/useStudents";
import { UserPlus, Save, X } from "lucide-react";

type Props = {
  editingStudent: Student | null;
  onCancelEdit: () => void;
};

const emptyForm: StudentFormData = {
  first_name: "",
  last_name: "",
  roll_no: "",
  password: "",
  confirm_password: "",
  contact_number: "",
};

export default function StudentForm({ editingStudent, onCancelEdit }: Props) {
  const [form, setForm] = useState<StudentFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormData, string>>>({});
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();

  useEffect(() => {
    if (editingStudent) {
      setForm({
        first_name: editingStudent.first_name,
        last_name: editingStudent.last_name,
        roll_no: editingStudent.roll_no,
        password: "",
        confirm_password: "",
        contact_number: editingStudent.contact_number,
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [editingStudent]);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.first_name.trim()) e.first_name = "First name is required";
    if (!form.last_name.trim()) e.last_name = "Last name is required";
    if (!form.roll_no.trim()) e.roll_no = "Roll No is required";
    if (!form.contact_number.trim()) e.contact_number = "Contact number is required";
    else if (!/^\d{10}$/.test(form.contact_number.trim())) e.contact_number = "Enter a valid 10-digit number";
    if (!editingStudent) {
      if (!form.password) e.password = "Password is required";
      else if (form.password.length < 6) e.password = "Min 6 characters";
      if (form.password !== form.confirm_password) e.confirm_password = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (editingStudent) {
      await updateMutation.mutateAsync({ id: editingStudent.id, data: form });
      onCancelEdit();
    } else {
      await createMutation.mutateAsync(form);
      setForm(emptyForm);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const set = (key: keyof StudentFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-primary rounded-t-lg">
        <CardTitle className="text-primary-foreground flex items-center gap-2 text-lg">
          {editingStudent ? <Save className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
          {editingStudent ? "Edit Student" : "Student Registration"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          {([
            ["first_name", "First Name", "text"],
            ["last_name", "Last Name", "text"],
            ["roll_no", "Roll No / ID", "text"],
            ["contact_number", "Contact Number", "tel"],
          ] as const).map(([key, label, type]) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type={type}
                placeholder={label}
                value={form[key]}
                onChange={set(key)}
                disabled={editingStudent !== null && key === "roll_no"}
              />
              {errors[key] && <p className="text-sm text-destructive">{errors[key]}</p>}
            </div>
          ))}
          {!editingStudent && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Password" value={form.password} onChange={set("password")} />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input id="confirm_password" type="password" placeholder="Confirm Password" value={form.confirm_password} onChange={set("confirm_password")} />
                {errors.confirm_password && <p className="text-sm text-destructive">{errors.confirm_password}</p>}
              </div>
            </>
          )}
          <div className="sm:col-span-2 flex gap-3 pt-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Saving..." : editingStudent ? "Update Student" : "Register Student"}
            </Button>
            {editingStudent && (
              <Button type="button" variant="outline" onClick={onCancelEdit}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
