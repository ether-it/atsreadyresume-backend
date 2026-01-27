export const runtime = "nodejs";

type BAFormData = {
  fullName: string;
  email: string;
  phone?: string;
  summary: string;
  skills: string[];
  experience: {
    company: string;
    role: string;
    duration: string;
    responsibilities: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    year: string;
  }[];
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic validation
    if (!body || body.role !== "business_analyst" || !body.formData) {
      return new Response(
        JSON.stringify({ error: "Invalid request payload" }),
        { status: 400 }
      );
    }

    // Canonical BA JSON schema (single source of truth)
    const payload = {
      meta: {
        role: "business_analyst",
        template: "ba-v1",
        generatedAt: new Date().toISOString(),
      },
      candidate: body.formData,
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
