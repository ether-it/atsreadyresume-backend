import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { v4 as uuidv4 } from "uuid";

/**
 * Security: simple internal API key check
 */
function isAuthorized(request: Request) {
  const key = request.headers.get("x-internal-api-key");
  return key && key === process.env.DOCX_API_SECRET;
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    /**
     * 1. Load the locked DOCX template
     */
    const templatePath = path.join(
      process.cwd(),
      "templates",
      "senior-business-analyst.docx"
    );

    const content = fs.readFileSync(templatePath, "binary");

    /**
     * 2. Prepare docxtemplater
     */
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    /**
     * 3. Map JSON → template variables
     * (Keep this simple for now)
     */
    doc.render({
      full_name: body.personal?.full_name || "",
      email: body.personal?.email || "",
      phone: body.personal?.phone || "",
      location: body.personal?.location || "",
      summary: body.summary || "",
      skills: (body.skills || []).join(", "),
      experience: body.experience || "",
      education: body.education || "",
    });

    /**
     * 4. Generate output DOCX
     */
    const outputBuffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    const fileName = `resume-${uuidv4()}.docx`;
    const outputPath = path.join("/tmp", fileName);

    fs.writeFileSync(outputPath, outputBuffer);

    /**
     * 5. Return success
     */
    return NextResponse.json({
      success: true,
      fileName,
      message: "DOCX generated successfully",
    });

  } catch (error: any) {
    console.error("DOCX generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate DOCX" },
      { status: 500 }
    );
  }
}
