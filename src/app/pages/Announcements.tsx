import { useState, useEffect } from "react";
import { Pin, Bell, Plus, X } from "lucide-react";
import api from "../store/api";
import { useParams } from "react-router";

type Announcement = {
  id: number;
  title: string;
  author: string;
  date: string;
  content: string;
  isPinned: boolean;
};

const fetchAnnouncementsData = async (team_id: string) => {
  try {
    const res = await api.get(`/api/teams/${team_id}/notices`);
    if (res.status === 200) {
      return res.data.map((item: any) => ({
        id: item.id || 0,
        team_id: item.team_id || 0,
        author_id: item.author_id || 0,
        author_name: item.author_name || "알 수 없음",
        title: item.title || "제목 없음",
        content: item.content || "",
        is_leader_notice: Boolean(item.is_leader_notice),
        created_at: item.created_at || new Date().toISOString(),
      }));
    }
    return [];
  } catch {
    return [];
  }
};

const postAnnouncementsData = async (team_id: string, content: any) => {
  try {
    const res = await api.post(`/api/teams/${team_id}/notices`, content);
    return res.status === 200 ? 1 : -1;
  } catch {
    return -1;
  }
};

const fetchDetailAnnouncementData = async (notice_id: string) => {
  try {
    const res = await api.get(`/api/notices/${notice_id}`);
    return res.data;
  } catch {
    return null;
  }
};

export function Announcements() {
  const params = useParams();
  const teamId = params.teamId ?? "";

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const loadAnnouncements = async () => {
    if (!teamId) return;
    const data = await fetchAnnouncementsData(teamId);
    if (Array.isArray(data)) {
      setAnnouncements(data.map((item: any) => ({
        id: item.id,
        title: item.title,
        author: item.author_name,
        date: item.created_at.split("T")[0],
        content: item.content,
        isPinned: item.is_leader_notice,
      })));
    }
  };

  const handleAnnouncementClick = async (a: Announcement) => {
    const detail = await fetchDetailAnnouncementData(String(a.id));
    setSelectedAnnouncement(detail ? {
      id: detail.id,
      title: detail.title,
      author: detail.author_name,
      date: detail.created_at?.split("T")[0] ?? "",
      content: detail.content,
      isPinned: detail.is_leader_notice,
    } : a);
  };

  useEffect(() => {
    loadAnnouncements();
  }, [teamId]);

  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");

  const isLeader = true;

  const handleSubmit = async () => {
    if (!formTitle.trim() || !formContent.trim() || !teamId) return;
    await postAnnouncementsData(teamId, { title: formTitle, content: formContent });
    await loadAnnouncements();
    setFormTitle("");
    setFormContent("");
    setShowForm(false);
  };

  const pinned = announcements.filter(a => a.isPinned);
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

      {/* Write Modal */}
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
        </div>
      )}

      {/* Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">{selectedAnnouncement.title}</h2>
              <button onClick={() => setSelectedAnnouncement(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed mb-4">{selectedAnnouncement.content}</p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>{selectedAnnouncement.author}</span><span>·</span><span>{selectedAnnouncement.date}</span>
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
              <div key={a.id}
                onClick={() => handleAnnouncementClick(a)}
                className="bg-blue-50 border border-blue-200 rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <Pin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1.5 text-sm">{a.title}</h3>
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">{a.content}</p>
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
            <div key={a.id}
              onClick={() => handleAnnouncementClick(a)}
              className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-all border border-slate-200 cursor-pointer">
              <h3 className="font-semibold text-slate-900 mb-1.5 text-sm">{a.title}</h3>
              <p className="text-slate-600 text-sm mb-3 line-clamp-2">{a.content}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>{a.author}</span><span>·</span><span>{a.date}</span>
              </div>
            </div>
          ))}
          {regular.length === 0 && pinned.length === 0 && (
            <p className="text-sm text-slate-400 py-4 text-center">공지사항이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
