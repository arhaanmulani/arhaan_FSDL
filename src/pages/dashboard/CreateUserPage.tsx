import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const CreateUserPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [form, setForm] = useState({
    email: '', password: '', fullName: '',
    employeeId: '', department: '', phone: '', specialization: '',
    rollNumber: '', classId: '', parentName: '', parentEmail: '', parentPhone: '',
    dateOfBirth: '', address: '',
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await supabase.from('classes').select('*').order('name');
      return data || [];
    },
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: form.email,
          password: form.password,
          role,
          fullName: form.fullName,
          additionalData: role === 'teacher'
            ? { employeeId: form.employeeId, department: form.department, phone: form.phone, specialization: form.specialization }
            : { rollNumber: form.rollNumber, classId: form.classId || null, parentName: form.parentName, parentEmail: form.parentEmail, parentPhone: form.parentPhone, dateOfBirth: form.dateOfBirth || null, address: form.address },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: 'User created successfully!', description: `${form.fullName} has been added as a ${role}.` });
      setForm({ email: '', password: '', fullName: '', employeeId: '', department: '', phone: '', specialization: '', rollNumber: '', classId: '', parentName: '', parentEmail: '', parentPhone: '', dateOfBirth: '', address: '' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-primary" /> Create New User
        </h1>
        <p className="text-muted-foreground">Add a new teacher or student to the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>Fill in the information below to create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v: 'teacher' | 'student') => setRole(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} required minLength={6} />
              </div>
            </div>

            {role === 'teacher' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <Input value={form.employeeId} onChange={(e) => handleChange('employeeId', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input value={form.department} onChange={(e) => handleChange('department', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <Input value={form.specialization} onChange={(e) => handleChange('specialization', e.target.value)} />
                </div>
              </div>
            )}

            {role === 'student' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label>Roll Number</Label>
                  <Input value={form.rollNumber} onChange={(e) => handleChange('rollNumber', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select value={form.classId} onValueChange={(v) => handleChange('classId', v)}>
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {classes?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name} - {c.section}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Parent Name</Label>
                  <Input value={form.parentName} onChange={(e) => handleChange('parentName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Parent Email</Label>
                  <Input type="email" value={form.parentEmail} onChange={(e) => handleChange('parentEmail', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Parent Phone</Label>
                  <Input value={form.parentPhone} onChange={(e) => handleChange('parentPhone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={form.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Address</Label>
                  <Input value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4" /> Create {role === 'teacher' ? 'Teacher' : 'Student'}</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateUserPage;
