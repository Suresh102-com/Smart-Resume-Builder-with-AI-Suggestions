import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save, Sparkles, Eye, Download } from 'lucide-react';
import SectionEditor from './SectionEditor';
import ResumePreview from './ResumePreview';
import AISuggestions from './AISuggestions';

interface ResumeEditorProps {
  resumeId: string;
  onBack: () => void;
}

interface Resume {
  id: string;
  title: string;
  template: string;
}

interface ResumeSection {
  id: string;
  section_type: string;
  content: Record<string, any>;
  order_index: number;
}

const SECTION_TYPES = [
  { value: 'personal_info', label: 'Personal Information' },
  { value: 'summary', label: 'Professional Summary' },
  { value: 'experience', label: 'Work Experience' },
  { value: 'education', label: 'Education' },
  { value: 'skills', label: 'Skills' },
  { value: 'projects', label: 'Projects' },
  { value: 'certifications', label: 'Certifications' },
];

export default function ResumeEditor({ resumeId, onBack }: ResumeEditorProps) {
  const [resume, setResume] = useState<Resume | null>(null);
  const [sections, setSections] = useState<ResumeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    loadResume();
  }, [resumeId]);

  const loadResume = async () => {
    try {
      const { data: resumeData, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single();

      if (resumeError) throw resumeError;
      setResume(resumeData);

      const { data: sectionsData, error: sectionsError } = await supabase
        .from('resume_sections')
        .select('*')
        .eq('resume_id', resumeId)
        .order('order_index');

      if (sectionsError) throw sectionsError;
      setSections(sectionsData || []);
    } catch (error) {
      console.error('Error loading resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateResumeTitle = async (title: string) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('resumes')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', resumeId);

      if (error) throw error;
      setResume({ ...resume!, title });
    } catch (error) {
      console.error('Error updating title:', error);
    } finally {
      setSaving(false);
    }
  };

  const addSection = async (sectionType: string) => {
    try {
      const maxOrder = sections.length > 0 ? Math.max(...sections.map((s) => s.order_index)) : -1;
      const { data, error } = await supabase
        .from('resume_sections')
        .insert({
          resume_id: resumeId,
          section_type: sectionType,
          content: {},
          order_index: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setSections([...sections, data]);
      }
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  const updateSection = async (sectionId: string, content: Record<string, any>) => {
    try {
      const { error } = await supabase
        .from('resume_sections')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', sectionId);

      if (error) throw error;

      setSections(
        sections.map((s) => (s.id === sectionId ? { ...s, content } : s))
      );

      await supabase
        .from('resumes')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', resumeId);
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const deleteSection = async (sectionId: string) => {
    try {
      const { error } = await supabase
        .from('resume_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;
      setSections(sections.filter((s) => s.id !== sectionId));
    } catch (error) {
      console.error('Error deleting section:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <ResumePreview
        resume={resume!}
        sections={sections}
        onBack={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </button>
              <input
                type="text"
                value={resume?.title || ''}
                onChange={(e) => setResume({ ...resume!, title: e.target.value })}
                onBlur={(e) => updateResumeTitle(e.target.value)}
                className="text-2xl font-bold text-slate-900 bg-transparent border-none outline-none focus:bg-slate-50 px-2 py-1 rounded"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAI(!showAI)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                AI Suggestions
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {sections.map((section) => (
              <SectionEditor
                key={section.id}
                section={section}
                onUpdate={updateSection}
                onDelete={deleteSection}
              />
            ))}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Add Section</h3>
              <div className="grid grid-cols-2 gap-2">
                {SECTION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => addSection(type.value)}
                    disabled={sections.some((s) => s.section_type === type.value)}
                    className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {showAI && (
            <div className="lg:col-span-1">
              <AISuggestions resumeId={resumeId} sections={sections} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
