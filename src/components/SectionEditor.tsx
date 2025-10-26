import { useState } from 'react';
import { Trash2, GripVertical, Plus, Minus } from 'lucide-react';

interface SectionEditorProps {
  section: {
    id: string;
    section_type: string;
    content: Record<string, any>;
  };
  onUpdate: (sectionId: string, content: Record<string, any>) => void;
  onDelete: (sectionId: string) => void;
}

export default function SectionEditor({ section, onUpdate, onDelete }: SectionEditorProps) {
  const [content, setContent] = useState(section.content);

  const handleChange = (field: string, value: any) => {
    const newContent = { ...content, [field]: value };
    setContent(newContent);
    onUpdate(section.id, newContent);
  };

  const getSectionTitle = (type: string) => {
    const titles: Record<string, string> = {
      personal_info: 'Personal Information',
      summary: 'Professional Summary',
      experience: 'Work Experience',
      education: 'Education',
      skills: 'Skills',
      projects: 'Projects',
      certifications: 'Certifications',
    };
    return titles[type] || type;
  };

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Full Name"
          value={content.fullName || ''}
          onChange={(e) => handleChange('fullName', e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          value={content.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="tel"
          placeholder="Phone"
          value={content.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
        />
        <input
          type="text"
          placeholder="Location"
          value={content.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
        />
      </div>
      <input
        type="url"
        placeholder="LinkedIn Profile"
        value={content.linkedin || ''}
        onChange={(e) => handleChange('linkedin', e.target.value)}
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
      />
    </div>
  );

  const renderSummary = () => (
    <textarea
      placeholder="Write a compelling professional summary that highlights your key strengths and career objectives..."
      value={content.text || ''}
      onChange={(e) => handleChange('text', e.target.value)}
      rows={5}
      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none resize-none"
    />
  );

  const renderExperience = () => {
    const experiences = content.items || [];

    const addExperience = () => {
      handleChange('items', [
        ...experiences,
        { company: '', position: '', startDate: '', endDate: '', description: '' },
      ]);
    };

    const updateExperience = (index: number, field: string, value: string) => {
      const updated = [...experiences];
      updated[index] = { ...updated[index], [field]: value };
      handleChange('items', updated);
    };

    const removeExperience = (index: number) => {
      handleChange('items', experiences.filter((_: any, i: number) => i !== index));
    };

    return (
      <div className="space-y-4">
        {experiences.map((exp: any, index: number) => (
          <div key={index} className="p-4 bg-slate-50 rounded-lg space-y-3 relative">
            <button
              onClick={() => removeExperience(index)}
              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-600 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Company"
                value={exp.company || ''}
                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              />
              <input
                type="text"
                placeholder="Position"
                value={exp.position || ''}
                onChange={(e) => updateExperience(index, 'position', e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Start Date (e.g., Jan 2020)"
                value={exp.startDate || ''}
                onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              />
              <input
                type="text"
                placeholder="End Date (e.g., Present)"
                value={exp.endDate || ''}
                onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              />
            </div>

            <textarea
              placeholder="Describe your responsibilities and achievements..."
              value={exp.description || ''}
              onChange={(e) => updateExperience(index, 'description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none resize-none"
            />
          </div>
        ))}

        <button
          onClick={addExperience}
          className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
      </div>
    );
  };

  const renderEducation = () => {
    const educations = content.items || [];

    const addEducation = () => {
      handleChange('items', [
        ...educations,
        { institution: '', degree: '', field: '', graduationDate: '' },
      ]);
    };

    const updateEducation = (index: number, field: string, value: string) => {
      const updated = [...educations];
      updated[index] = { ...updated[index], [field]: value };
      handleChange('items', updated);
    };

    const removeEducation = (index: number) => {
      handleChange('items', educations.filter((_: any, i: number) => i !== index));
    };

    return (
      <div className="space-y-4">
        {educations.map((edu: any, index: number) => (
          <div key={index} className="p-4 bg-slate-50 rounded-lg space-y-3 relative">
            <button
              onClick={() => removeEducation(index)}
              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-600 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder="Institution"
              value={edu.institution || ''}
              onChange={(e) => updateEducation(index, 'institution', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Degree"
                value={edu.degree || ''}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              />
              <input
                type="text"
                placeholder="Field of Study"
                value={edu.field || ''}
                onChange={(e) => updateEducation(index, 'field', e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              />
            </div>

            <input
              type="text"
              placeholder="Graduation Date"
              value={edu.graduationDate || ''}
              onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
            />
          </div>
        ))}

        <button
          onClick={addEducation}
          className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      </div>
    );
  };

  const renderSkills = () => (
    <textarea
      placeholder="List your skills (comma-separated): JavaScript, React, Node.js, Python..."
      value={content.list || ''}
      onChange={(e) => handleChange('list', e.target.value)}
      rows={4}
      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none resize-none"
    />
  );

  const renderProjects = () => {
    const projects = content.items || [];

    const addProject = () => {
      handleChange('items', [
        ...projects,
        { name: '', description: '', technologies: '', link: '' },
      ]);
    };

    const updateProject = (index: number, field: string, value: string) => {
      const updated = [...projects];
      updated[index] = { ...updated[index], [field]: value };
      handleChange('items', updated);
    };

    const removeProject = (index: number) => {
      handleChange('items', projects.filter((_: any, i: number) => i !== index));
    };

    return (
      <div className="space-y-4">
        {projects.map((project: any, index: number) => (
          <div key={index} className="p-4 bg-slate-50 rounded-lg space-y-3 relative">
            <button
              onClick={() => removeProject(index)}
              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-600 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder="Project Name"
              value={project.name || ''}
              onChange={(e) => updateProject(index, 'name', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
            />

            <textarea
              placeholder="Project Description"
              value={project.description || ''}
              onChange={(e) => updateProject(index, 'description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none resize-none"
            />

            <input
              type="text"
              placeholder="Technologies Used"
              value={project.technologies || ''}
              onChange={(e) => updateProject(index, 'technologies', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
            />

            <input
              type="url"
              placeholder="Project Link (optional)"
              value={project.link || ''}
              onChange={(e) => updateProject(index, 'link', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
            />
          </div>
        ))}

        <button
          onClick={addProject}
          className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>
    );
  };

  const renderCertifications = () => {
    const certifications = content.items || [];

    const addCertification = () => {
      handleChange('items', [
        ...certifications,
        { name: '', issuer: '', date: '', credentialId: '' },
      ]);
    };

    const updateCertification = (index: number, field: string, value: string) => {
      const updated = [...certifications];
      updated[index] = { ...updated[index], [field]: value };
      handleChange('items', updated);
    };

    const removeCertification = (index: number) => {
      handleChange('items', certifications.filter((_: any, i: number) => i !== index));
    };

    return (
      <div className="space-y-4">
        {certifications.map((cert: any, index: number) => (
          <div key={index} className="p-4 bg-slate-50 rounded-lg space-y-3 relative">
            <button
              onClick={() => removeCertification(index)}
              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-600 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Certification Name"
                value={cert.name || ''}
                onChange={(e) => updateCertification(index, 'name', e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              />
              <input
                type="text"
                placeholder="Issuing Organization"
                value={cert.issuer || ''}
                onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Date Obtained"
                value={cert.date || ''}
                onChange={(e) => updateCertification(index, 'date', e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              />
              <input
                type="text"
                placeholder="Credential ID (optional)"
                value={cert.credentialId || ''}
                onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
              />
            </div>
          </div>
        ))}

        <button
          onClick={addCertification}
          className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Certification
        </button>
      </div>
    );
  };

  const renderContent = () => {
    switch (section.section_type) {
      case 'personal_info':
        return renderPersonalInfo();
      case 'summary':
        return renderSummary();
      case 'experience':
        return renderExperience();
      case 'education':
        return renderEducation();
      case 'skills':
        return renderSkills();
      case 'projects':
        return renderProjects();
      case 'certifications':
        return renderCertifications();
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900">
            {getSectionTitle(section.section_type)}
          </h3>
        </div>
        <button
          onClick={() => onDelete(section.id)}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {renderContent()}
    </div>
  );
}
