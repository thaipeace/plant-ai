import { NextResponse } from "next/server";

// Đảm bảo bạn đã cài đặt: npm install @google/generative-ai
// Hoặc chúng ta sẽ dùng fetch() trực tiếp để giữ nó đơn giản
// Lấy API key từ biến môi trường
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Đây là JSON Schema mà Gemini sẽ tuân theo
const plantSchema = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING" },
    place: { type: "STRING" },
    current_status_of_plant: { type: "STRING" },
    edible_parts_and_how_to_cook: { type: "STRING" },
    poisonous_parts: { type: "STRING" },
    how_to_grow_and_take_care: { type: "STRING" },
    useful_advices: { type: "STRING" },
    is_plant: { type: "BOOLEAN" },
  },
  required: ["name", "is_plant"],
};

/**
 * Xử lý request POST từ client
 */
export async function POST(request: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Chưa cấu hình GEMINI_API_KEY" },
      { status: 500 }
    );
  }

  try {
    // 1. Lấy dữ liệu từ body của request
    const body = await request.json();
    const { imageBase64, mimeType = "image/png" } = body; // Giả định mimeType nếu không được cung cấp

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Không tìm thấy imageBase64 trong body" },
        { status: 400 }
      );
    }

    // 2. Lấy ngôn ngữ từ header (giống như trong curl command của bạn)
    const langHeader = request.headers.get("Accept-Language");
    const lang = langHeader?.startsWith("vi") ? "Tiếng Việt" : "English";

    // 3. Chuẩn bị prompt và payload cho Gemini
    const systemPrompt = `Bạn là trợ lý phân tích thực vật chuyên nghiệp. Phân tích hình ảnh được cung cấp.
        Nếu là thực vật, trả về một đối tượng JSON tuân thủ nghiêm ngặt schema, điền tất cả các trường bằng ngôn ngữ: ${lang}. Đặt 'is_plant' thành true.
        Nếu KHÔNG phải là thực vật, trả về một đối tượng JSON với 'is_plant' là false, và các trường khác là 'N/A' (hoặc 'Không phải cây trồng' nếu là tiếng Việt).`;

    const userQuery =
      "Phân tích hình ảnh này và cung cấp thông tin toàn diện về loài cây bằng định dạng JSON được chỉ định.";

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: userQuery },
            {
              inlineData: {
                mimeType: mimeType,
                data: imageBase64, // Dữ liệu Base64 từ request
              },
            },
          ],
        },
      ],
      // Yêu cầu Gemini trả về JSON theo cấu trúc
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: plantSchema,
      },
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      model: "gemini-2.5-flash-preview-09-2025", // Sử dụng model hỗ trợ JSON schema
    };

    // 4. Gọi Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Lỗi từ Gemini API:", errorText);
      return NextResponse.json(
        { error: "Lỗi từ Gemini API", details: errorText },
        { status: 500 }
      );
    }

    const result = await geminiResponse.json();
    const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!jsonText) {
      return NextResponse.json(
        { error: "Không nhận được nội dung JSON từ Gemini" },
        { status: 500 }
      );
    }

    // 5. Trả về kết quả JSON đã được phân tích
    // Chúng ta không cần JSON.parse(jsonText) vì Gemini đã trả về JSON trực tiếp
    return NextResponse.json(JSON.parse(jsonText), { status: 200 });
  } catch (error: any) {
    console.error("Lỗi nội bộ server:", error);
    return NextResponse.json(
      { error: "Lỗi nội bộ server", details: error.message },
      { status: 500 }
    );
  }
}
