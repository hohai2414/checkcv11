import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

export const maxDuration = 60; // Next.js serverless function timeout

export async function POST(request) {
  try {
    const formData = await request.formData();
    const apiKey = formData.get('apiKey');
    const jd = formData.get('jd');
    const files = formData.getAll('files');

    if (!apiKey) return NextResponse.json({ error: 'Missing API Key' }, { status: 400 });
    if (!jd) return NextResponse.json({ error: 'Missing Job Description' }, { status: 400 });
    if (!files || files.length === 0) return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });

    // 1. Phân tích nội dung các File CV
    const cvContents = [];
    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let text = '';

        if (file.name.toLowerCase().endsWith('.pdf')) {
          const pdfData = await pdfParse(buffer);
          text = pdfData.text;
        } else if (file.name.toLowerCase().endsWith('.docx')) {
          const result = await mammoth.extractRawText({ buffer });
          text = result.value;
        } else {
          // Fallback cho text file
          text = buffer.toString('utf8');
        }

        cvContents.push(`\n--- BẮT ĐẦU CV: ${file.name} ---\n${text.substring(0, 5000)}\n--- KẾT THÚC CV: ${file.name} ---`);
      } catch (err) {
        console.error(`Lỗi đọc file ${file.name}:`, err);
        cvContents.push(`\n--- BẮT ĐẦU CV: ${file.name} ---\n(Không thể trích xuất nội dung file này)\n--- KẾT THÚC CV: ${file.name} ---`);
      }
    }

    // 2. Chuyển cho Gemini chấm điểm
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
Bạn là một chuyên gia tuyển dụng nhân sự (HR Expert). Hãy đánh giá các ứng viên sau dựa trên Job Description (JD).

[JOB DESCRIPTION]
${jd}

[DANH SÁCH CV ỨNG VIÊN]
${cvContents.join('\n')}

Hãy đối chiếu từng CV với JD và trả về ĐÚNG cấu trúc JSON sau (dạng mảng các object). Chỉ trả về JSON, không kèm định dạng markdown (như \`\`\`json) hay văn bản giải thích nào khác.

[
  {
    "name": "Tên ứng viên (hoặc tên file nếu không tìm thấy tên)",
    "match": Điểm số phù hợp từ 0-100 (dạng số nguyên),
    "strengths": ["Điểm mạnh 1", "Điểm mạnh 2", "... tối đa 3 điểm"],
    "gaps": ["Khoảng trống/điểm yếu 1", "Khoảng trống 2", "... tối đa 2 điểm"],
    "status": "Shortlist" HOẶC "Review thêm" HOẶC "Chưa phù hợp"
  }
]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              match: { type: Type.INTEGER },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
              status: { type: Type.STRING }
            },
            required: ["name", "match", "strengths", "gaps", "status"]
          }
        }
      }
    });

    const resultText = response.text;
    
    // An toàn kiểm tra parse JSON
    let parsedData = [];
    try {
      parsedData = JSON.parse(resultText);
    } catch (e) {
      console.error("Gemini returned invalid JSON:", resultText);
      return NextResponse.json({ error: 'AI trả về định dạng không mong đợi. Vui lòng thử lại.' }, { status: 500 });
    }

    return NextResponse.json({ results: parsedData });

  } catch (error) {
    console.error("Lỗi hệ thống:", error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}
