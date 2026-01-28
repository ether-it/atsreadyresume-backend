import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    // 🔐 Simple internal auth
    const apiKey = req.headers.get('x-internal-api-key');
    if (apiKey !== process.env.DOCX_API_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await req.json();

    // 📄 Load DOCX template
    const templatePath = path.join(
      process.cwd(),
      'templates',
      'Sr BA for Web.docx'
    );

    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // 🧠 Map JSON → DOCX placeholders
    doc.setData({
      summary: data.summary || '',
      skills: (data.skills || []).join(', '),
      experience: data.experience || '',
      education: data.education || '',
      tools: (data.tools || []).join(', '),
    });

    doc.render();

    // 🆔 Create output file
    const buffer = doc.getZip().generate({ type: 'nodebuffer' });
    const fileName = `resume-${uuidv4()}.docx`;

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
