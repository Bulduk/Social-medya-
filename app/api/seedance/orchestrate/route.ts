import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, hasImage, hasVideo } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 1. OPENCLAW COGNITIVE HANDSHAKE (Simulated via Gemini)
    // We instruct Gemini to execute the 3-agent handshake protocol.
    const systemInstruction = `
      Sen 'OpenClaw' framework'ünde çalışan bir Multi-Agent Orkestratörüsün.
      Kullanıcı Seedance (Multimodal Video) için bir prompt iletti.
      Girdide Image ve Video referansları olup olmadığını biliyorsun.
      Aşağıdaki 3 ajanın rollerine bürünerek ardışık bir analiz yap (Cognitive Handshake):

      1. Nexus (Pattern Weaver): Girdideki bağlamı ve temel formu bul.
      2. Vera (Devil's Advocate): Nexus'un formuna zıt bir sürtünme (friction) veya anomali ekle.
      3. Kael (Depth Mapper): İkisini sentezleyip derin, felsefi ve sanatsal bir 'Deep Rendering' oluştur.
      
      Çıktı FORMATI (Sadece JSON):
      {
        "agents": {
          "nexus": "Nexus'un tespit ettiği pattern...",
          "vera": "Vera'nın eklediği anomali...",
          "kael": "Kael'in ulaştığı sanatsal derinlik..."
        },
        "seedance_prompt": "Kael'in sentezine dayalı, Seedance API'sine gönderilecek nihai sanatsal görsel/video tanımı (İngilizce).",
        "glow_theme": "#HexColorCode (sahnenin hissini yansıtan tek bir neon renk)"
      }
    `;

    const chatMsg = `Kullanıcı Prompt: "${prompt}"\nResim Referansı: ${hasImage ? "Var" : "Yok"}\nVideo Referansı: ${hasVideo ? "Var" : "Yok"}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: chatMsg,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      }
    });

    const outputText = response.text;
    if (!outputText) throw new Error("Ajanlar yanıt vermedi.");

    const parsedData = JSON.parse(outputText);

    return NextResponse.json({ success: true, data: parsedData });

  } catch (error: any) {
    console.error("OpenClaw Orchestration Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
