
import { GoogleGenAI } from "@google/genai";

export interface GeminiResponse {
  text: string;
  sources: { title: string; uri: string }[];
}

export async function askGeminiSupport(query: string): Promise<GeminiResponse> {
  try {
    // Initializing Gemini API client with process.env.API_KEY directly as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `You are the chief support AI for 'Diamond Nova', a elite diamond-earning web platform.
        Current Context:
        - Domain: GitHub Pages (username.github.io)
        - System: React 19 + Tailwind + Gemini 3.0
        - Purpose: Earn points via short-links, withdraw to ATM or Game Diamonds.
        - Rules: 1 VND = 10 Points. Min withdraw 5,000 VND.
        - Hosting: Support users asking how to deploy this code to GitHub Pages. Explain using index.html and 404.html for SPA support.
        Respond in Vietnamese with a professional, helpful, and tech-savvy tone. Always use Google Search for recent events or troubleshooting deployment errors.`,
      },
    });

    // Accessing the .text property directly as per guidelines
    const text = response.text || "Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn.";
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sourceMap = new Map<string, string>();
    
    chunks.forEach((chunk: any) => {
      if (chunk.web && chunk.web.uri) {
        sourceMap.set(chunk.web.uri, chunk.web.title || 'Tham khảo');
      }
    });

    const sources = Array.from(sourceMap.entries()).map(([uri, title]) => ({
      title,
      uri
    }));

    return { text, sources };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { 
      text: "Hệ thống hỗ trợ AI hiện đang bận. Vui lòng thử lại sau.", 
      sources: [] 
    };
  }
}
