"use client";
import React, { useState, useRef } from 'react';

export default function CvJdMatcherApp() {
  const [apiKey, setApiKey] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [cvFiles, setCvFiles] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize from sessionStorage on mount safely
  React.useEffect(() => {
    setApiKey(sessionStorage.getItem('geminiApiKey') || '');
  }, []);

  const handleSaveApiKey = () => {
    sessionStorage.setItem('geminiApiKey', apiKey);
    alert('Đã lưu API Key vào session storage tạm thời!');
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setCvFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setCvFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleAnalyze = async () => {
    if (!apiKey) return alert("Vui lòng nhập và lưu API Key trước!");
    if (!jobDesc) return alert("Vui lòng nhập Job Description!");
    if (cvFiles.length === 0) return alert("Vui lòng chọn hoặc kéo thả ít nhất 1 file CV!");

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('apiKey', apiKey);
      formData.append('jd', jobDesc);
      for (const file of cvFiles) {
        formData.append('files', file);
      }

      const res = await fetch('/api/match', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Có lỗi xảy ra khi phân tích');
      }

      const data = await res.json();
      setCandidates(data.results);
    } catch (err) {
      alert("Lỗi: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { title: "Nhập Gemini API Key", desc: "ẩn/hiện key và lưu tạm trong session để dùng cho phân tích CV." },
    { title: "Tải lên Job Description", desc: "JD nhập bằng văn bản hoặc tải file để chuẩn hóa yêu cầu tuyển dụng." },
    { title: "Upload nhiều CV cùng lúc", desc: "Hỗ trợ kéo-thả nhiều CV pdf/docx để hệ thống trích xuất nội dung." },
    { title: "Giải thích hệ thống", desc: "Gọi backend Nodejs để bóc tách text CV rồi truyền vào Gemini API." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">CV Matcher với Gemini API</h1>
            <p className="text-sm text-slate-600 mt-1">Hệ thống Fullstack tự động bằng Next.js & Google AI</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border p-6 hover:shadow-md transition">
            <h2 className="text-xl font-semibold mb-4 text-indigo-700">1. Cấu hình AI</h2>
            <label className="block text-sm font-medium mb-2">Gemini API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Nhập Gemini API Key..."
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                onClick={handleSaveApiKey} 
                className="px-4 py-3 rounded-2xl border bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition"
              >
                Lưu
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border p-6 hover:shadow-md transition">
            <h2 className="text-xl font-semibold mb-4 text-indigo-700">2. Job Description</h2>
            <textarea
              rows={6}
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Dán nội dung JD bằng văn bản tại đây..."
              className="w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border p-6 hover:shadow-md transition">
            <h2 className="text-xl font-semibold mb-4 text-indigo-700">3. Upload CV</h2>
            <div 
              className="border-2 border-dashed rounded-3xl p-8 text-center bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" multiple accept=".pdf,.docx,.doc" 
                className="hidden" ref={fileInputRef} onChange={handleFileChange}
              />
              <p className="font-medium text-slate-700">Kéo & thả CV vào đây hoặc click để chọn</p>
              <p className="text-sm text-slate-500 mt-1">Hỗ trợ PDF, DOCX.</p>
              
              {cvFiles.length > 0 && (
                <div className="mt-4 p-3 bg-white rounded-2xl border shadow-sm text-left">
                  <div className="text-sm text-indigo-600 font-bold mb-1">Đã chọn {cvFiles.length} file:</div>
                  <div className="text-xs text-slate-600 line-clamp-3">
                    {cvFiles.map(f => f.name).join(', ')}
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={handleAnalyze}
              disabled={isLoading}
              className={`mt-4 w-full px-4 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition ${isLoading ? 'bg-indigo-300 text-white cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang phân tích AI...
                </>
              ) : 'So sánh CV với JD'}
            </button>
          </div>
        </section>

        <section className="xl:col-span-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl shadow-sm border p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Số CV đang đợi</p>
                <p className="text-3xl font-bold mt-1">{cvFiles.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Ứng viên đã xử lý</p>
                <p className="text-3xl font-bold mt-1 text-emerald-600">{candidates.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border p-6 min-h-[400px]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b">
              <div>
                <h2 className="text-xl font-bold">Bảng kết quả thông minh AI</h2>
                <p className="text-sm text-slate-500 mt-1">Dữ liệu được trả về trực tiếp từ Gemini API Backend</p>
              </div>
            </div>

            {candidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-slate-400 py-12">
                <svg className="w-20 h-20 mb-4 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                <p>Chưa có dữ liệu. Vui lòng nhập JD và Upload CV để phân tích.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {candidates.map((candidate, index) => (
                  <div key={index} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-4">
                          <h3 className="text-xl font-bold text-slate-900">{candidate.name}</h3>
                          <span className={`text-xs px-3 py-1 font-bold rounded-full ${candidate.match >= 80 ? 'bg-emerald-100 text-emerald-700' : candidate.match >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                            {candidate.status || 'Đã phân tích'}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100/50">
                            <p className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.514"></path></svg> Điểm mạnh
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-emerald-700">
                              {candidate.strengths?.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                          </div>
                          <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100/50">
                            <p className="text-sm font-bold text-rose-800 mb-2 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg> Điểm thiếu hụt
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-rose-700">
                              {candidate.gaps?.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="lg:w-48 bg-slate-50 rounded-2xl p-5 border text-center flex flex-col justify-center">
                        <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">Độ Phù Hợp</p>
                        <p className={`text-4xl font-black ${candidate.match >= 80 ? 'text-emerald-500' : candidate.match >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                          {candidate.match}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
