export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // 1. API KEY SECURITY
    const apiKey = req.headers.get("x-internal-api-key");

    if (!apiKey || apiKey !== process.env.DOCX_API_SECRET) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    // 2. PARSE BODY
    const body = await req.json();

    if (!body || !body.meta || !body.personal) {
      return new Response(
        JSON.stringify({ error: "Invalid payload" }),
        { status: 400 }
      );
    }

    // 3. TEMP SUCCESS RESPONSE (DOCX COMES NEXT)
    return new Response(
      JSON.stringify({
        status: "OK",
        message: "BA resume payload received",
        role: body.meta.role,
        level: body.meta.level
      }),
      { status: 200 }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
}
