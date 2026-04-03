import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
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

    const ai = new GoogleGenAI({ apiKey });
    
    // Khởi tạo parts chứa JD text
    const parts = [
      { text: `Bạn là một chuyên gia tuyển dụng nhân sự (HR Expert). Hãy đánh giá các ứng viên từ các file CV (được đính kèm và trích xuất) dựa trên Job Description (JD).
      
[JOB DESCRIPTION]
${jd}

[YÊU CẦU ĐÁNH GIÁ]
Hãy đối chiếu từng CV với JD và trả về ĐÚNG cấu trúc JSON sau (dạng mảng các object). Chỉ trả về JSON, không kèm định dạng markdown hay văn bản giải thích nào khác.

[
  {
    "name": "Tên ứng viên (hoặc tên file nếu không tìm thấy tên)",
    "match": Điểm số phù hợp từ 0-100 (dạng số nguyên),
    "strengths": ["Điểm mạnh 1", "Điểm mạnh 2", "... tối đa 3 điểm"],
    "gaps": ["Khoảng trống/điểm yếu 1", "Khoảng trống 2", "... tối đa 2 điểm"],
    "status": "Shortlist" HOẶC "Review thêm" HOẶC "Chưa phù hợp"
  }
]` }
    ];

    // Xử lý từng file CV
    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (file.name.toLowerCase().endsWith('.pdf')) {
          // Gemini hỗ trợ native PDF qua inlineData
          parts.push({ text: `\nĐÂY LÀ FILE CV: ${file.name}\n---` });
          parts.push({
            inlineData: {
              data: buffer.toString('base64'),
              mimeType: 'application/pdf'
            }
          });
        } else if (file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')) {
          const result = await mammoth.extractRawText({ buffer });
          const text = result.value;
          parts.push({ text: `\nĐÂY LÀ NỘI DUNG CV: ${file.name}\n---\n${text.substring(0, 8000)}` });
        } else {
          const text = buffer.toString('utf8');
          parts.push({ text: `\nĐÂY LÀ NỘI DUNG CV: ${file.name}\n---\n${text.substring(0, 8000)}` });
        }
      } catch (err) {
        console.error(`Lỗi đọc file ${file.name}:`, err);
        parts.push({ text: `\nĐÂY LÀ FILE CV: ${file.name}\n(Lỗi hệ thống không thể trích xuất)\n---` });
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts }],
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
