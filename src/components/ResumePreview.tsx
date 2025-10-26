import { ArrowLeft, Download } from 'lucide-react';

interface ResumePreviewProps {
  resume: {
    title: string;
  };
  sections: Array<{
    id: string;
    section_type: string;
    content: Record<string, any>;
    order_index: number;
  }>;
  onBack: () => void;
}

export default function ResumePreview({ resume, sections, onBack }: ResumePreviewProps) {
  const handleDownload = () => {
    window.print();
  };

  const renderPersonalInfo = (content: Record<string, any>) => (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-slate-900 mb-2">{content.fullName}</h1>
      <div className="flex flex-wrap items-center justify-center gap-3 text-slate-600">
        {content.email && <span>{content.email}</span>}
        {content.phone && <span>•</span>}
        {content.phone && <span>{content.phone}</span>}
        {content.location && <span>•</span>}
        {content.location && <span>{content.location}</span>}
      </div>
      {content.linkedin && (
        <div className="mt-2">
          <a
            href={content.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-slate-900"
          >
            {content.linkedin}
          </a>
        </div>
      )}
    </div>
  );

  const renderSummary = (content: Record<string, any>) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-3 pb-2 border-b-2 border-slate-900">
        Professional Summary
      </h2>
      <p className="text-slate-700 leading-relaxed">{content.text}</p>
    </div>
  );

  const renderExperience = (content: Record<string, any>) => {
    const items = content.items || [];
    if (items.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-3 pb-2 border-b-2 border-slate-900">
          Work Experience
        </h2>
        <div className="space-y-4">
          {items.map((exp: any, index: number) => (
            <div key={index}>
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg font-semibold text-slate-900">{exp.position}</h3>
                <span className="text-slate-600 text-sm">
                  {exp.startDate} - {exp.endDate}
                </span>
              </div>
              <p className="text-slate-700 font-medium mb-2">{exp.company}</p>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEducation = (content: Record<string, any>) => {
    const items = content.items || [];
    if (items.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-3 pb-2 border-b-2 border-slate-900">
          Education
        </h2>
        <div className="space-y-3">
          {items.map((edu: any, index: number) => (
            <div key={index}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{edu.institution}</h3>
                  <p className="text-slate-700">
                    {edu.degree} {edu.field && `in ${edu.field}`}
                  </p>
                </div>
                <span className="text-slate-600 text-sm">{edu.graduationDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = (content: Record<string, any>) => {
    if (!content.list) return null;

    const skillsList = content.list.split(',').map((s: string) => s.trim()).filter(Boolean);
    if (skillsList.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-3 pb-2 border-b-2 border-slate-900">
          Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {skillsList.map((skill: string, index: number) => (
            <span
              key={index}
              className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderProjects = (content: Record<string, any>) => {
    const items = content.items || [];
    if (items.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-3 pb-2 border-b-2 border-slate-900">
          Projects
        </h2>
        <div className="space-y-3">
          {items.map((project: any, index: number) => (
            <div key={index}>
              <h3 className="text-lg font-semibold text-slate-900">{project.name}</h3>
              <p className="text-slate-700 mb-1">{project.description}</p>
              <p className="text-sm text-slate-600 mb-1">
                <span className="font-medium">Technologies:</span> {project.technologies}
              </p>
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  {project.link}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCertifications = (content: Record<string, any>) => {
    const items = content.items || [];
    if (items.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-3 pb-2 border-b-2 border-slate-900">
          Certifications
        </h2>
        <div className="space-y-2">
          {items.map((cert: any, index: number) => (
            <div key={index} className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-slate-900">{cert.name}</h3>
                <p className="text-slate-700">{cert.issuer}</p>
                {cert.credentialId && (
                  <p className="text-sm text-slate-600">ID: {cert.credentialId}</p>
                )}
              </div>
              <span className="text-slate-600 text-sm">{cert.date}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSection = (section: any) => {
    switch (section.section_type) {
      case 'personal_info':
        return renderPersonalInfo(section.content);
      case 'summary':
        return renderSummary(section.content);
      case 'experience':
        return renderExperience(section.content);
      case 'education':
        return renderEducation(section.content);
      case 'skills':
        return renderSkills(section.content);
      case 'projects':
        return renderProjects(section.content);
      case 'certifications':
        return renderCertifications(section.content);
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-12 print:shadow-none print:rounded-none">
          {sections
            .sort((a, b) => a.order_index - b.order_index)
            .map((section) => (
              <div key={section.id}>{renderSection(section)}</div>
            ))}
        </div>
      </main>
    </div>
  );
}
