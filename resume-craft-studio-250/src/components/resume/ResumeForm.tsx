import { useState } from 'react';
import { ResumeData, Experience, Education } from '@/types/resume';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, User, Briefcase, GraduationCap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

const SectionHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10">
      <Icon className="w-4 h-4 text-accent" />
    </div>
    <h3 className="text-lg font-semibold font-display text-foreground">{title}</h3>
  </div>
);

const FormSection = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card rounded-xl p-5 border border-border"
  >
    {children}
  </motion.div>
);

export const ResumeForm = ({ data, onChange }: ResumeFormProps) => {
  const [newSkill, setNewSkill] = useState('');

  const updatePersonal = (field: keyof typeof data.personal, value: string) => {
    onChange({ ...data, personal: { ...data.personal, [field]: value } });
  };

  const addExperience = () => {
    const exp: Experience = {
      id: crypto.randomUUID(),
      company: '', position: '', startDate: '', endDate: '', description: '',
    };
    onChange({ ...data, experiences: [...data.experiences, exp] });
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    onChange({
      ...data,
      experiences: data.experiences.map(e => e.id === id ? { ...e, [field]: value } : e),
    });
  };

  const removeExperience = (id: string) => {
    onChange({ ...data, experiences: data.experiences.filter(e => e.id !== id) });
  };

  const addEducation = () => {
    const edu: Education = {
      id: crypto.randomUUID(),
      school: '', degree: '', field: '', startDate: '', endDate: '',
    };
    onChange({ ...data, education: [...data.education, edu] });
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    onChange({
      ...data,
      education: data.education.map(e => e.id === id ? { ...e, [field]: value } : e),
    });
  };

  const removeEducation = (id: string) => {
    onChange({ ...data, education: data.education.filter(e => e.id !== id) });
  };

  const addSkill = () => {
    if (newSkill.trim() && !data.skills.includes(newSkill.trim())) {
      onChange({ ...data, skills: [...data.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    onChange({ ...data, skills: data.skills.filter(s => s !== skill) });
  };

  return (
    <div className="space-y-5">
      <FormSection>
        <SectionHeader icon={User} title="Personal Info" />
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Full Name" value={data.personal.fullName} onChange={e => updatePersonal('fullName', e.target.value)} className="col-span-2" />
          <Input placeholder="Job Title" value={data.personal.title} onChange={e => updatePersonal('title', e.target.value)} className="col-span-2" />
          <Input placeholder="Email" value={data.personal.email} onChange={e => updatePersonal('email', e.target.value)} />
          <Input placeholder="Phone" value={data.personal.phone} onChange={e => updatePersonal('phone', e.target.value)} />
          <Input placeholder="Location" value={data.personal.location} onChange={e => updatePersonal('location', e.target.value)} className="col-span-2" />
          <Textarea placeholder="Professional summary..." value={data.personal.summary} onChange={e => updatePersonal('summary', e.target.value)} className="col-span-2 min-h-[80px] resize-none" />
        </div>
      </FormSection>

      <FormSection>
        <SectionHeader icon={Briefcase} title="Experience" />
        <AnimatePresence>
          {data.experiences.map(exp => (
            <motion.div key={exp.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-4 rounded-lg bg-muted/50 border border-border relative group">
              <button onClick={() => removeExperience(exp.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Company" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} />
                <Input placeholder="Position" value={exp.position} onChange={e => updateExperience(exp.id, 'position', e.target.value)} />
                <Input placeholder="Start Date" value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} />
                <Input placeholder="End Date" value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} />
                <Textarea placeholder="Description..." value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} className="col-span-2 min-h-[60px] resize-none" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <Button variant="outline" size="sm" onClick={addExperience} className="w-full border-dashed">
          <Plus className="w-4 h-4 mr-1" /> Add Experience
        </Button>
      </FormSection>

      <FormSection>
        <SectionHeader icon={GraduationCap} title="Education" />
        <AnimatePresence>
          {data.education.map(edu => (
            <motion.div key={edu.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-4 rounded-lg bg-muted/50 border border-border relative group">
              <button onClick={() => removeEducation(edu.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="School" value={edu.school} onChange={e => updateEducation(edu.id, 'school', e.target.value)} />
                <Input placeholder="Degree" value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} />
                <Input placeholder="Field of Study" value={edu.field} onChange={e => updateEducation(edu.id, 'field', e.target.value)} className="col-span-2" />
                <Input placeholder="Start Date" value={edu.startDate} onChange={e => updateEducation(edu.id, 'startDate', e.target.value)} />
                <Input placeholder="End Date" value={edu.endDate} onChange={e => updateEducation(edu.id, 'endDate', e.target.value)} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <Button variant="outline" size="sm" onClick={addEducation} className="w-full border-dashed">
          <Plus className="w-4 h-4 mr-1" /> Add Education
        </Button>
      </FormSection>

      <FormSection>
        <SectionHeader icon={Sparkles} title="Skills" />
        <div className="flex gap-2 mb-3">
          <Input placeholder="Add a skill..." value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
          <Button variant="outline" size="default" onClick={addSkill}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {data.skills.map(skill => (
              <motion.span key={skill} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => removeSkill(skill)}>
                {skill}
                <Trash2 className="w-3 h-3" />
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </FormSection>
    </div>
  );
};
