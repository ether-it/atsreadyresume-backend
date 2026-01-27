import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Read secret from Vercel environment
    const SERVER_SECRET = process.env.DOCX_API_SECRET;

    // 2. Read secret sent by client (n8n)
    const clientSecret = req.headers.get("x-internal-api-key");

    // 3. Block if secret is missing or wrong
    if (!SERVER_SECRET || clientSecret !== SERVER_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 4. Read request body
    const body = await req.json();

    // 5. Basic validation
    if (!body?.meta || !body?.personal) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    // 6. TEMP success response (DOCX comes next)
    return NextResponse.json(
      {
        status: "OK",
        message: "BA resume payload received",
        role: body.meta.role,
        level: body.meta.level,
      },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
