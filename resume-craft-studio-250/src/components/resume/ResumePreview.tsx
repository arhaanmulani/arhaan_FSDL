import { ResumeData } from '@/types/resume';
import { Mail, Phone, MapPin } from 'lucide-react';

interface ResumePreviewProps {
  data: ResumeData;
}

export const ResumePreview = ({ data }: ResumePreviewProps) => {
  const { personal, experiences, education, skills } = data;
  const hasContent = personal.fullName || personal.title || experiences.length || education.length || skills.length;

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">📄</span>
        </div>
        <p className="text-lg font-display font-medium">Your resume preview</p>
        <p className="text-sm mt-1">Start filling in the form to see it here</p>
      </div>
    );
  }

  return (
    <div className="bg-[hsl(var(--resume-bg))] text-[hsl(var(--resume-text))] p-8 md:p-10 min-h-[842px] max-w-[595px] mx-auto resume-shadow rounded-sm font-[var(--font-body)]">
      {/* Header */}
      <div className="border-b-2 border-[hsl(var(--resume-accent))] pb-5 mb-6">
        {personal.fullName && (
          <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--resume-heading))] font-[var(--font-display)] leading-tight">
            {personal.fullName}
          </h1>
        )}
        {personal.title && (
          <p className="text-base font-medium text-[hsl(var(--resume-accent))] mt-1">
            {personal.title}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-[hsl(var(--resume-muted))]">
          {personal.email && (
            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{personal.email}</span>
          )}
          {personal.phone && (
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{personal.phone}</span>
          )}
          {personal.location && (
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{personal.location}</span>
          )}
        </div>
      </div>

      {/* Summary */}
      {personal.summary && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--resume-heading))] mb-2">Summary</h2>
          <p className="text-sm leading-relaxed text-[hsl(var(--resume-muted))]">{personal.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--resume-heading))] mb-3">Experience</h2>
          <div className="space-y-4">
            {experiences.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-semibold text-[hsl(var(--resume-heading))]">{exp.position || 'Position'}</h3>
                  {(exp.startDate || exp.endDate) && (
                    <span className="text-xs text-[hsl(var(--resume-muted))] shrink-0 ml-2">
                      {exp.startDate}{exp.startDate && exp.endDate && ' — '}{exp.endDate}
                    </span>
                  )}
                </div>
                {exp.company && <p className="text-xs font-medium text-[hsl(var(--resume-accent))]">{exp.company}</p>}
                {exp.description && <p className="text-xs leading-relaxed text-[hsl(var(--resume-muted))] mt-1">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--resume-heading))] mb-3">Education</h2>
          <div className="space-y-3">
            {education.map(edu => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-semibold text-[hsl(var(--resume-heading))]">{edu.degree || 'Degree'}{edu.field && ` in ${edu.field}`}</h3>
                  {(edu.startDate || edu.endDate) && (
                    <span className="text-xs text-[hsl(var(--resume-muted))] shrink-0 ml-2">
                      {edu.startDate}{edu.startDate && edu.endDate && ' — '}{edu.endDate}
                    </span>
                  )}
                </div>
                {edu.school && <p className="text-xs font-medium text-[hsl(var(--resume-accent))]">{edu.school}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--resume-heading))] mb-3">Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.map(skill => (
              <span key={skill} className="px-2.5 py-1 rounded-full bg-[hsl(var(--resume-accent)/0.08)] text-[hsl(var(--resume-accent))] text-xs font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
