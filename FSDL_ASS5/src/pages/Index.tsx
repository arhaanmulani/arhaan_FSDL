import { useState } from 'react';
import { ResumeData, defaultResumeData } from '@/types/resume';
import { ResumeForm } from '@/components/resume/ResumeForm';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { FileText } from 'lucide-react';

const Index = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <FileText className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="text-lg font-display font-semibold text-foreground">ResumeForge</span>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block">Build your professional resume</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Form Panel */}
          <div className="order-2 lg:order-1">
            <div className="lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-2 scrollbar-thin">
              <ResumeForm data={resumeData} onChange={setResumeData} />
            </div>
          </div>

          {/* Preview Panel */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <div className="bg-muted/30 rounded-xl p-4 md:p-6 border border-border min-h-[400px]">
              <ResumePreview data={resumeData} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
