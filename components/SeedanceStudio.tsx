"use client";

import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Video, Wand2, X } from "lucide-react";

export default function SeedanceStudio() {
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [resultVideo, setResultVideo] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [orchestrationData, setOrchestrationData] = useState<any>(null);

  const handleSynthesize = async () => {
    if (!prompt) return;
    setIsSynthesizing(true);
    setOrchestrationData(null);
    setResultVideo(null);

    try {
      // 1. OPENCLAW COGNITIVE HANDSHAKE
      const res = await fetch("/api/seedance/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          hasImage: !!imageFile,
          hasVideo: !!videoFile
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setOrchestrationData(data.data);
      } else {
        throw new Error(data.error || "Orchestration failed");
      }

    } catch (e) {
      console.error(e);
      // Fallback behavior if generation fails
    }

    // 2. SIMULATE SEEDANCE API CALL USING THE OPENCLAW OUTPUT
    setTimeout(() => {
      setIsSynthesizing(false);
      setResultVideo("https://assets.mixkit.co/videos/preview/mixkit-futuristic-technology-digital-background-seamless-loop-32537-large.mp4");
    }, 4000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pt-4">
      {/* BAŞLIK */}
      <div className="flex items-center gap-3 border-b border-[#0e1e2b] pb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00c8ff] to-[#ff5e1a] flex items-center justify-center shadow-[0_0_15px_rgba(0,200,255,0.3)]">
          <Wand2 size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#d8eaf2]">Seedance Studio</h2>
          <p className="text-xs text-[#6a90a0] font-mono tracking-widest uppercase">Multimodal Mimesis Engine</p>
        </div>
      </div>

      {/* GİRİŞ ALANI (Glassmorphism) */}
      <div className="bg-[#0b141d]/80 backdrop-blur-xl border border-[#0e1e2b] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        {/* Dekoratif Glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00c8ff] rounded-full blur-[100px] opacity-10 pointer-events-none" />

        <div className="space-y-4 relative z-10">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Zihnindeki sahneyi betimle (Prompt)..."
            className="w-full bg-[#03070a]/50 border border-[#152535] rounded-xl p-4 text-[#d8eaf2] text-sm focus:outline-none focus:border-[#00c8ff]/50 focus:ring-1 focus:ring-[#00c8ff]/20 min-h-[100px] transition-all resize-none placeholder:text-[#2e4858]"
          />

          <div className="flex flex-wrap items-center gap-4">
            {/* Resim Ekle */}
            <button 
              onClick={() => imageInputRef.current?.click()}
              className="px-4 py-2 bg-[#060d12] border border-[#152535] hover:border-[#ff5e1a]/50 rounded-lg flex items-center gap-2 text-xs font-mono text-[#6a90a0] hover:text-[#d8eaf2] transition-colors"
            >
              <ImageIcon size={14} /> 
              {imageFile ? imageFile.name : "+ Image Ref"}
            </button>
            <input type="file" accept="image/*" ref={imageInputRef} className="hidden" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} />

            {/* Video Ekle */}
            <button 
              onClick={() => videoInputRef.current?.click()}
              className="px-4 py-2 bg-[#060d12] border border-[#152535] hover:border-[#00c8ff]/50 rounded-lg flex items-center gap-2 text-xs font-mono text-[#6a90a0] hover:text-[#d8eaf2] transition-colors"
            >
              <Video size={14} /> 
              {videoFile ? videoFile.name : "+ Motion Ref"}
            </button>
            <input type="file" accept="video/*" ref={videoInputRef} className="hidden" onChange={(e) => e.target.files && setVideoFile(e.target.files[0])} />

            {/* Sentezle Butonu */}
            <button
              onClick={handleSynthesize}
              disabled={isSynthesizing || !prompt}
              className="ml-auto px-6 py-2 bg-gradient-to-r from-[#00c8ff] to-[#008fbb] hover:from-[#ff5e1a] hover:to-[#00c8ff] text-white font-bold text-xs rounded-lg shadow-[0_0_20px_rgba(0,200,255,0.2)] hover:shadow-[0_0_25px_rgba(255,94,26,0.3)] transition-all disabled:opacity-50 disabled:grayscale uppercase tracking-wider relative overflow-hidden"
            >
              {isSynthesizing ? (
                <span className="flex items-center gap-2">
                  <Wand2 size={14} className="animate-spin" /> Yükleniyor...
                </span>
              ) : (
                "Synthesize"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AGENT ORCHESTRATION LOGS */}
      {orchestrationData && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#00c8ff] animate-pulse" />
            <span className="text-xs font-mono text-[#00c8ff] tracking-widest uppercase">Cognitive Handshake Complete</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Nexus */}
            <div className="bg-[#04090e] border border-[#152535] rounded-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#00c8ff]" />
              <div className="text-[#00c8ff] font-mono text-[10px] mb-2 uppercase flex items-center gap-2">
                <span>⬡</span> Nexus (Weaver)
              </div>
              <p className="text-[#6a90a0] text-xs leading-relaxed">{orchestrationData.agents.nexus}</p>
            </div>

            {/* Vera */}
            <div className="bg-[#04090e] border border-[#152535] rounded-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#ff5e1a]" />
              <div className="text-[#ff5e1a] font-mono text-[10px] mb-2 uppercase flex items-center gap-2">
                <span>◑</span> Vera (Friction)
              </div>
              <p className="text-[#6a90a0] text-xs leading-relaxed">{orchestrationData.agents.vera}</p>
            </div>

            {/* Kael */}
            <div className="bg-[#04090e] border border-[#152535] rounded-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#00e8a2]" />
              <div className="text-[#00e8a2] font-mono text-[10px] mb-2 uppercase flex items-center gap-2">
                <span>◎</span> Kael (Depth)
              </div>
              <p className="text-[#6a90a0] text-xs leading-relaxed">{orchestrationData.agents.kael}</p>
            </div>
          </div>

          <div className="bg-[#0b141d]/80 border border-[#00e8a2]/30 rounded-xl p-4 flex flex-col gap-2">
            <span className="text-[#00e8a2] font-mono text-[10px] uppercase">// Final Seedance Prompt</span>
            <p className="text-[#d8eaf2] text-sm italic">{`"${orchestrationData.seedance_prompt}"`}</p>
            <div className="flex items-center gap-2 mt-2">
               <span className="text-[#6a90a0] font-mono text-[10px] uppercase">Glow Intensity Theme:</span>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: orchestrationData.glow_theme, boxShadow: `0 0 10px ${orchestrationData.glow_theme}` }} />
                 <span className="text-xs font-mono text-white">{orchestrationData.glow_theme}</span>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* SONUÇ KARTI (Glow Effect) */}
      {resultVideo && (
        <div className="relative p-[1px] md:p-[2px] rounded-2xl overflow-hidden mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Animated Glow Border driven by Orchestration Data */}
          <div className="absolute inset-0 animate-[spin_4s_linear_infinite] opacity-60" 
            style={{ 
              background: `conic-gradient(from 0deg, transparent 60%, ${orchestrationData?.glow_theme || '#00e8a2'} 100%)` 
            }} 
          />
          
          <div className="relative bg-[#060d12] rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center">
            <div className="w-full flex justify-between items-center p-4 border-b border-[#152535]/50 bg-[#0b141d]/80 z-10">
              <div className="flex gap-2 items-center">
                <span className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] animate-pulse" style={{ backgroundColor: orchestrationData?.glow_theme || '#00e8a2', color: orchestrationData?.glow_theme || '#00e8a2' }} />
                <span className="font-mono text-xs uppercase tracking-widest" style={{ color: orchestrationData?.glow_theme || '#00e8a2' }}>Rendered Entity</span>
              </div>
              <button onClick={() => setResultVideo(null)} className="text-[#6a90a0] hover:text-white">
                <X size={16} />
              </button>
            </div>

            <video 
              src={resultVideo} 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-auto max-h-[500px] object-cover pointer-events-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
