import { useState } from "react";
import { Pin, Bell, Plus, X } from "lucide-react";

type Announcement = {
  id: number;
  title: string;
  author: string;
  date: string;
  content: string;
  isPinned: boolean;
};

export function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { id: 1, title: "[중요] 이번 주 금요일 최종 발표", author: "박미소", date: "2026-03-15",
      content: "최종 발표가 3월 19일(금) 오후 2시에 예정되어 있습니다. 발표 자료는 목요일까지 완성해주세요. 발표 시간은 팀당 15분이며, 질의응답 5분이 포함됩니다.", isPinned: true },
    { id: 2, title: "중간 점검 회의 일정 공지", author: "박미소", date: "2026-03-12",
      content: "3월 16일(수) 오후 4시에 중간 점검 회의를 진행합니다. 각자 진행 상황을 정리해서 공유해주세요.", isPinned: true },
    { id: 3, title: "회의록 작성 안내", author: "송희경", date: "2026-03-14",
      content: "회의가 끝난 후에는 회의록을 자료실에 업로드 부탁드립니다. 템플릿은 자료실에 있습니다.", isPinned: false },
    { id: 4, title: "개발 환경 설정 가이드", author: "고명주", date: "2026-03-13",
      content: "프론트엔드 개발을 위한 환경 설정 가이드를 자료실에 업로드했습니다. 참고해주세요.", isPinned: false },
    { id: 5, title: "역할 분담 확정", author: "박미소", date: "2026-03-10",
      content: "각자의 역할이 확정되었습니다. 업무 관리 페이지에서 확인 가능합니다.", isPinned: false },
    { id: 6, title: "프로젝트 킥오프 회의 결과", author: "박미소", date: "2026-03-08",
      content: "킥오프 회의에서 논의된 내용을 정리했습니다. 프로젝트 목표와 일정을 확인해주세요.", isPinned: false },
  ]);

  const [showForm, setShowForm]       = useState(false);
  const [formTitle, setFormTitle]     = useState("");
  const [formContent, setFormContent] = useState("");
  const [formIsPinned, setFormIsPinned] = useState(false);

  const isLeader = true;

  const handleSubmit = () => {
    if (!formTitle.trim() || !formContent.trim()) return;
    setAnnouncements(prev => [{
      id: prev.length > 0 ? Math.max(...prev.map(a => a.id)) + 1 : 1,
      title: formTitle.trim(), author: "박미소",
      date: new Date().toISOString().split("T")[0],
      content: formContent.trim(), isPinned: formIsPinned,
    }, ...prev]);
    setFormTitle(""); setFormContent(""); setFormIsPinned(false); setShowForm(false);
  };

  const pinned  = announcements.filter(a => a.isPinned);
  const regular = announcements.filter(a => !a.isPinned);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">공지사항</h1>
          <p className="text-slate-500 mt-1 text-sm">팀 공지사항을 확인하세요</p>
        </div>
        {isLeader && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl hover:from-blue-700 hover:to-indigo-600 transition-all shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />공지 작성
          </button>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">공지 작성</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">제목</label>
                <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)}
                  placeholder="공지 제목을 입력하세요"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">내용</label>
                <textarea value={formContent} onChange={e => setFormContent(e.target.value)}
                  placeholder="공지 내용을 입력하세요" rows={5}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div onClick={() => setFormIsPinned(!formIsPinned)}
                  className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${formIsPinned ? "bg-blue-500" : "bg-slate-200"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${formIsPinned ? "translate-x-4" : "translate-x-0"}`} />
                </div>
                <span className="text-sm text-slate-600 flex items-center gap-1">
                  <Pin className="w-3.5 h-3.5 text-blue-500" />상단 고정 (팀장 공지)
                </span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} disabled={!formTitle.trim() || !formContent.trim()}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl hover:from-blue-700 hover:to-indigo-600 transition-all shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                등록
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-sm"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pinned */}
      {pinned.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Pin className="w-3.5 h-3.5" />고정된 공지
          </h2>
          <div className="space-y-3">
            {pinned.map(a => (
              <div key={a.id} className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <Pin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1.5 text-sm">{a.title}</h3>
                    <p className="text-slate-600 text-sm mb-3">{a.content}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{a.author}</span><span>·</span><span>{a.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Bell className="w-3.5 h-3.5" />일반 공지
        </h2>
        <div className="space-y-3">
          {regular.map(a => (
            <div key={a.id} className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-1.5 text-sm">{a.title}</h3>
              <p className="text-slate-600 text-sm mb-3">{a.content}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>{a.author}</span><span>·</span><span>{a.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
