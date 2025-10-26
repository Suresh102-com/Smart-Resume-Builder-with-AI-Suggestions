import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Sparkles, Check, X, RefreshCw } from 'lucide-react';

interface AISuggestionsProps {
  resumeId: string;
  sections: Array<{
    id: string;
    section_type: string;
    content: Record<string, any>;
  }>;
}

interface Suggestion {
  id: string;
  section_id: string | null;
  suggestion_type: string;
  original_content: string;
  suggested_content: string;
  applied: boolean;
}

export default function AISuggestions({ resumeId, sections }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, [resumeId]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_suggestions')
        .select('*')
        .eq('resume_id', resumeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    setGenerating(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-suggestions`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ resumeId, sections }),
      });

      if (!response.ok) throw new Error('Failed to generate suggestions');

      await loadSuggestions();
    } catch (error) {
      console.error('Error generating suggestions:', error);
      alert('Failed to generate AI suggestions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const applySuggestion = async (suggestionId: string) => {
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ applied: true })
        .eq('id', suggestionId);

      if (error) throw error;
      setSuggestions(
        suggestions.map((s) => (s.id === suggestionId ? { ...s, applied: true } : s))
      );
    } catch (error) {
      console.error('Error applying suggestion:', error);
    }
  };

  const dismissSuggestion = async (suggestionId: string) => {
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .delete()
        .eq('id', suggestionId);

      if (error) throw error;
      setSuggestions(suggestions.filter((s) => s.id !== suggestionId));
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
    }
  };

  const getSuggestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      improve_content: 'Improve Content',
      add_keywords: 'Add Keywords',
      grammar_check: 'Grammar Check',
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-slate-900" />
          <h3 className="text-lg font-semibold text-slate-900">AI Suggestions</h3>
        </div>
        <button
          onClick={generateSuggestions}
          disabled={generating}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-600">Loading suggestions...</div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-600 mb-4">No suggestions yet</p>
          <button
            onClick={generateSuggestions}
            disabled={generating}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-4 h-4" />
            {generating ? 'Generating...' : 'Generate Suggestions'}
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`p-4 rounded-lg border ${
                suggestion.applied
                  ? 'bg-green-50 border-green-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-slate-600">
                  {getSuggestionTypeLabel(suggestion.suggestion_type)}
                </span>
                {!suggestion.applied && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => applySuggestion(suggestion.id)}
                      className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                      title="Apply suggestion"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => dismissSuggestion(suggestion.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Dismiss suggestion"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {suggestion.original_content && (
                <div className="mb-2">
                  <p className="text-xs text-slate-500 mb-1">Original:</p>
                  <p className="text-sm text-slate-700 line-through">
                    {suggestion.original_content}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-slate-500 mb-1">Suggested:</p>
                <p className="text-sm text-slate-900 font-medium">
                  {suggestion.suggested_content}
                </p>
              </div>

              {suggestion.applied && (
                <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                  <Check className="w-3 h-3" />
                  Applied
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
