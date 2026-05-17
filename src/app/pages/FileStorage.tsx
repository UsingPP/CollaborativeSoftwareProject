import { Upload, Download, FileText, Presentation, File } from "lucide-react";

export function FileStorage() {
  const files = [
    { id: 1, name: "프로젝트 계획서.pptx", uploader: "박미소", date: "2026-03-14", size: "2.4 MB", type: "presentation" },
    { id: 2, name: "요구사항 정의서.pdf",  uploader: "송희경", date: "2026-03-13", size: "1.8 MB", type: "document" },
    { id: 3, name: "회의록_0312.docx",     uploader: "고명주", date: "2026-03-12", size: "856 KB", type: "document" },
    { id: 4, name: "데이터베이스_ERD.png", uploader: "오소원", date: "2026-03-11", size: "3.2 MB", type: "image" },
    { id: 5, name: "UI_목업.figma",        uploader: "민지원", date: "2026-03-10", size: "4.1 MB", type: "document" },
    { id: 6, name: "발표_자료_v1.pptx",   uploader: "이채현", date: "2026-03-09", size: "5.6 MB", type: "presentation" },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case "presentation": return <Presentation className="w-7 h-7 text-indigo-500" />;
      case "document":     return <FileText      className="w-7 h-7 text-blue-500" />;
      case "image":        return <File          className="w-7 h-7 text-violet-500" />;
      default:             return <FileText      className="w-7 h-7 text-slate-400" />;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">자료실</h1>
          <p className="text-slate-500 mt-1 text-sm">팀 자료를 업로드하고 관리하세요</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl hover:from-blue-700 hover:to-indigo-600 transition-all flex items-center gap-2 shadow-sm text-sm">
          <Upload className="w-4 h-4" />
          파일 업로드
        </button>
      </div>

      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all border border-slate-200 flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 shrink-0">
              {getFileIcon(file.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 text-sm mb-1 truncate">{file.name}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>{file.uploader}</span>
                <span>·</span>
                <span>{file.date}</span>
                <span>·</span>
                <span>{file.size}</span>
              </div>
            </div>
            <button className="shrink-0 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all flex items-center gap-1.5 text-xs font-medium border border-blue-100">
              <Download className="w-3.5 h-3.5" />
              다운로드
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
