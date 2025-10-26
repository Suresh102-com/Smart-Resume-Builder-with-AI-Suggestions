import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Section {
  id: string;
  section_type: string;
  content: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { resumeId, sections } = await req.json();

    if (!resumeId || !sections) {
      throw new Error("Missing required fields");
    }

    const suggestions = generateSuggestions(sections, resumeId);

    for (const suggestion of suggestions) {
      await supabase.from("ai_suggestions").insert(suggestion);
    }

    return new Response(
      JSON.stringify({ success: true, count: suggestions.length }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

function generateSuggestions(sections: Section[], resumeId: string) {
  const suggestions: any[] = [];

  sections.forEach((section) => {
    if (section.section_type === "summary" && section.content.text) {
      const text = section.content.text;
      if (text.length < 100) {
        suggestions.push({
          resume_id: resumeId,
          section_id: section.id,
          suggestion_type: "improve_content",
          original_content: text,
          suggested_content: `${text} Consider expanding this summary to include more specific achievements, quantifiable results, and unique value propositions that set you apart from other candidates.`,
          applied: false,
        });
      }

      if (!text.toLowerCase().includes("experience") && !text.toLowerCase().includes("skilled")) {
        suggestions.push({
          resume_id: resumeId,
          section_id: section.id,
          suggestion_type: "add_keywords",
          original_content: text,
          suggested_content: `${text} Add industry-specific keywords and highlight your years of experience to improve ATS compatibility and recruiter interest.`,
          applied: false,
        });
      }
    }

    if (section.section_type === "experience" && section.content.items) {
      section.content.items.forEach((exp: any) => {
        if (exp.description && exp.description.length < 50) {
          suggestions.push({
            resume_id: resumeId,
            section_id: section.id,
            suggestion_type: "improve_content",
            original_content: `${exp.position} at ${exp.company}: ${exp.description}`,
            suggested_content: `For ${exp.position} at ${exp.company}, expand the description to include: specific responsibilities, quantifiable achievements (use numbers/percentages), technologies used, and impact on the organization. Use action verbs like 'Led', 'Developed', 'Increased', 'Reduced'.`,
            applied: false,
          });
        }

        if (exp.description && !/\d/.test(exp.description)) {
          suggestions.push({
            resume_id: resumeId,
            section_id: section.id,
            suggestion_type: "add_keywords",
            original_content: `${exp.position} description`,
            suggested_content: `Add quantifiable metrics to your ${exp.position} role. Examples: 'Increased sales by 25%', 'Managed team of 10', 'Reduced costs by $50K', 'Improved efficiency by 30%'. Numbers make your achievements more credible and impressive.`,
            applied: false,
          });
        }
      });
    }

    if (section.section_type === "skills" && section.content.list) {
      const skills = section.content.list.split(",").map((s: string) => s.trim());
      if (skills.length < 5) {
        suggestions.push({
          resume_id: resumeId,
          section_id: section.id,
          suggestion_type: "improve_content",
          original_content: section.content.list,
          suggested_content: "Consider adding more relevant skills including: technical skills, soft skills, industry-specific tools, certifications, and languages. Aim for 8-12 skills that are relevant to your target role.",
          applied: false,
        });
      }
    }

    if (section.section_type === "education" && section.content.items) {
      const hasGPA = section.content.items.some((edu: any) => 
        edu.degree && (edu.degree.toLowerCase().includes("gpa") || edu.degree.toLowerCase().includes("honors"))
      );
      
      if (!hasGPA) {
        suggestions.push({
          resume_id: resumeId,
          section_id: section.id,
          suggestion_type: "improve_content",
          original_content: "Education section",
          suggested_content: "If you graduated with honors or maintained a GPA above 3.5, consider adding it to your education section. Also include relevant coursework, academic projects, or thesis topics if they're relevant to your target role.",
          applied: false,
        });
      }
    }
  });

  if (!sections.some((s) => s.section_type === "certifications")) {
    suggestions.push({
      resume_id: resumeId,
      section_id: null,
      suggestion_type: "improve_content",
      original_content: "",
      suggested_content: "Consider adding a Certifications section to showcase your professional credentials and continuous learning. Industry certifications can significantly boost your resume's appeal.",
      applied: false,
    });
  }

  if (!sections.some((s) => s.section_type === "projects")) {
    suggestions.push({
      resume_id: resumeId,
      section_id: null,
      suggestion_type: "improve_content",
      original_content: "",
      suggested_content: "Add a Projects section to demonstrate practical experience and passion for your field. Include personal projects, open-source contributions, or freelance work that showcases your skills.",
      applied: false,
    });
  }

  return suggestions.slice(0, 8);
}
