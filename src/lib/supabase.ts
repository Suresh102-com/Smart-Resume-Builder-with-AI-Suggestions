import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          template: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          template?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          template?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      resume_sections: {
        Row: {
          id: string;
          resume_id: string;
          section_type: string;
          content: Record<string, any>;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resume_id: string;
          section_type: string;
          content?: Record<string, any>;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resume_id?: string;
          section_type?: string;
          content?: Record<string, any>;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_suggestions: {
        Row: {
          id: string;
          resume_id: string;
          section_id: string | null;
          suggestion_type: string;
          original_content: string;
          suggested_content: string;
          applied: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          resume_id: string;
          section_id?: string | null;
          suggestion_type: string;
          original_content?: string;
          suggested_content?: string;
          applied?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          resume_id?: string;
          section_id?: string | null;
          suggestion_type?: string;
          original_content?: string;
          suggested_content?: string;
          applied?: boolean;
          created_at?: string;
        };
      };
    };
  };
};
