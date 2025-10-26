import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FileText, Plus, LogOut, Edit, Trash2 } from 'lucide-react';
import ResumeEditor from './ResumeEditor';

interface Resume {
  id: string;
  title: string;
  template: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { signOut, user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewResume = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: user!.id,
          title: 'Untitled Resume',
          template: 'modern',
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setResumes([data, ...resumes]);
        setSelectedResumeId(data.id);
      }
    } catch (error) {
      console.error('Error creating resume:', error);
    }
  };

  const deleteResume = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      const { error } = await supabase.from('resumes').delete().eq('id', id);
      if (error) throw error;
      setResumes(resumes.filter((r) => r.id !== id));
      if (selectedResumeId === id) {
        setSelectedResumeId(null);
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
    }
  };

  if (selectedResumeId) {
    return (
      <ResumeEditor
        resumeId={selectedResumeId}
        onBack={() => {
          setSelectedResumeId(null);
          loadResumes();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Smart Resume Builder</h1>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Your Resumes</h2>
          <p className="text-slate-600">Create and manage your professional resumes</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-600">Loading...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={createNewResume}
              className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-slate-400 hover:bg-slate-50 transition-all group min-h-[200px] flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors">
                <Plus className="w-8 h-8 text-slate-600" />
              </div>
              <span className="text-lg font-medium text-slate-700">Create New Resume</span>
            </button>

            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-slate-700" />
                  </div>
                  <button
                    onClick={() => deleteResume(resume.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mb-2">{resume.title}</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Updated {new Date(resume.updated_at).toLocaleDateString()}
                </p>

                <button
                  onClick={() => setSelectedResumeId(resume.id)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2 px-4 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Resume
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
