import React, { useState, useRef } from 'react';

export default function CvJdMatcherApp() {
  const [apiKey, setApiKey] = useState(sessionStorage.getItem('geminiApiKey') || '');
  const [jobDesc, setJobDesc] = useState('');
  const [cvFiles, setCvFiles] = useState([]);
  const fileInputRef = useRef(null);

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
  const features = [
    {
      title: "Nhập Gemini API Key",
      desc: "Cho phép người dùng dán API key trực tiếp trên giao diện, ẩn/hiện key và lưu tạm trong session để dùng cho phân tích CV.",
    },
    {
      title: "Tải lên Job Description",
      desc: "JD có thể nhập bằng cách dán văn bản hoặc tải file .docx/.pdf để hệ thống chuẩn hóa yêu cầu tuyển dụng.",
    },
    {
      title: "Upload nhiều CV cùng lúc",
      desc: "Hỗ trợ kéo-thả nhiều CV để hệ thống đọc, trích xuất kỹ năng, kinh nghiệm, học vấn và đối chiếu với JD.",
    },
    {
      title: "So khớp và chấm điểm",
      desc: "Hiển thị tỷ lệ match tổng thể, mức độ phù hợp theo từng tiêu chí và các điểm mạnh/yếu của từng ứng viên.",
    },
    {
      title: "Lọc ứng viên",
      desc: "Cho phép lọc theo % match, kỹ năng bắt buộc, số năm kinh nghiệm, trình độ học vấn và từ khóa chuyên môn.",
    },
    {
      title: "Giải thích bằng AI",
      desc: "Gemini trả về giải thích vì sao CV phù hợp/chưa phù hợp, gợi ý shortlist và các câu hỏi phỏng vấn đề xuất.",
    },
  ];

  const sampleCandidates = [
    {
      name: "Nguyen Minh Anh",
      match: 89,
      strengths: ["Kinh nghiệm tuyển dụng 4 năm", "Có HR Analytics", "Tiếng Anh tốt"],
      gaps: ["Chưa rõ kinh nghiệm ATS nâng cao"],
      status: "Shortlist",
    },
    {
      name: "Tran Hoang Bao",
      match: 76,
      strengths: ["Có kinh nghiệm Talent Acquisition", "Phỏng vấn số lượng lớn"],
      gaps: ["Thiếu dữ liệu HR", "Chưa thấy kinh nghiệm AI tools"],
      status: "Review thêm",
    },
    {
      name: "Le Thu Trang",
      match: 64,
      strengths: ["Giao tiếp tốt", "Có background đào tạo nội bộ"],
      gaps: ["Thiếu kinh nghiệm đúng JD", "Ít kỹ năng phân tích"],
      status: "Chưa phù hợp",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">CV Matcher với Gemini API</h1>
            <p className="text-sm text-slate-600 mt-1">So sánh nhiều CV với 1 Job Description trên cùng một giao diện</p>
          </div>
          <button className="px-4 py-2 rounded-2xl bg-slate-900 text-white shadow-sm hover:opacity-90 transition">
            Xem demo luồng xử lý
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">1. Cấu hình AI</h2>
            <label className="block text-sm font-medium mb-2">Gemini API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Nhập Gemini API Key..."
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300"
              />
              <button 
                onClick={handleSaveApiKey} 
                className="px-4 py-3 rounded-2xl border bg-slate-100 hover:bg-slate-200 transition"
              >
                Lưu
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-3">Khuyến nghị chỉ lưu tạm ở trình duyệt hoặc session để tăng bảo mật.</p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">2. Job Description</h2>
            <textarea
              rows={10}
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Dán nội dung JD tại đây..."
              className="w-full rounded-2xl border px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button 
                onClick={() => alert(jobDesc ? 'Đang phân tích JD bằng Gemini...' : 'Vui lòng nhập JD trước!')}
                className="px-4 py-2 rounded-2xl bg-slate-900 text-white hover:opacity-90 transition"
              >
                Phân tích JD
              </button>
              <button className="px-4 py-2 rounded-2xl border hover:bg-slate-50 transition">Tải file JD</button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">3. Upload CV</h2>
            <div 
              className="border-2 border-dashed rounded-3xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                multiple 
                accept=".pdf,.docx,.doc" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <p className="font-medium">Kéo & thả CV vào đây hoặc click để chọn</p>
              <p className="text-sm text-slate-500 mt-1">Hỗ trợ PDF, DOCX. Có thể tải nhiều file cùng lúc.</p>
              
              {cvFiles.length > 0 ? (
                <div className="mt-4 space-y-2">
                  <div className="text-sm text-indigo-600 font-medium">Đã chọn {cvFiles.length} file:</div>
                  <div className="text-xs text-slate-500 truncate max-w-full">
                    {cvFiles.map(f => f.name).join(', ')}
                  </div>
                </div>
              ) : (
                <button className="mt-4 px-4 py-2 rounded-2xl bg-white border hover:bg-slate-50 transition pointer-events-none">
                  Chọn file CV
                </button>
              )}
            </div>
            <button 
              onClick={() => alert(`Sẽ gửi ${cvFiles.length} CV và JD lên Gemini để chấm điểm...`)}
              className="mt-4 w-full px-4 py-3 rounded-2xl bg-slate-900 text-white font-medium hover:opacity-90 transition"
            >
              So sánh CV với JD
            </button>
          </div>
        </section>

        <section className="xl:col-span-8 space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl shadow-sm border p-5">
              <p className="text-sm text-slate-500">Số CV đã tải</p>
              <p className="text-3xl font-bold mt-2">{cvFiles.length}</p>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border p-5">
              <p className="text-sm text-slate-500">Ứng viên vượt ngưỡng 80%</p>
              <p className="text-3xl font-bold mt-2">7</p>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border p-5">
              <p className="text-sm text-slate-500">Tiêu chí bắt buộc</p>
              <p className="text-3xl font-bold mt-2">5</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-semibold">Bảng kết quả so khớp</h2>
                <p className="text-sm text-slate-500 mt-1">Gemini phân tích CV dựa trên nội dung JD và tiêu chí tuyển dụng</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <select className="rounded-2xl border px-4 py-2 bg-white">
                  <option>Lọc theo trạng thái</option>
                  <option>Shortlist</option>
                  <option>Review thêm</option>
                  <option>Chưa phù hợp</option>
                </select>
                <select className="rounded-2xl border px-4 py-2 bg-white">
                  <option>Ngưỡng match</option>
                  <option>{'>'}= 80%</option>
                  <option>{'>'}= 70%</option>
                  <option>{'>'}= 60%</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {sampleCandidates.map((candidate, index) => (
                <div key={index} className="rounded-3xl border p-5 hover:shadow-sm transition">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold">{candidate.name}</h3>
                        <span className="text-sm px-3 py-1 rounded-full bg-slate-100 border">{candidate.status}</span>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-1">Điểm mạnh</p>
                        <div className="flex flex-wrap gap-2">
                          {candidate.strengths.map((item, i) => (
                            <span key={i} className="text-sm px-3 py-1 rounded-full bg-slate-100">{item}</span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-1">Khoảng trống</p>
                        <div className="flex flex-wrap gap-2">
                          {candidate.gaps.map((item, i) => (
                            <span key={i} className="text-sm px-3 py-1 rounded-full bg-white border">{item}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="min-w-[150px]">
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Tỷ lệ match</p>
                        <p className="text-3xl font-bold">{candidate.match}%</p>
                      </div>
                      <div className="mt-3 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 rounded-full" style={{ width: `${candidate.match}%` }} />
                      </div>
                      <button className="mt-4 w-full px-4 py-2 rounded-2xl bg-slate-900 text-white">Xem giải thích AI</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-5">Các tính năng chính cần có</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="rounded-3xl border p-5 bg-slate-50">
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 leading-6">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
