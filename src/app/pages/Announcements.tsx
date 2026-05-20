import { useState, useEffect } from "react";
import { Pin, Bell, Plus, X } from "lucide-react";
import api from "../store/api";
import { BASE_API_URL, Notice, PORT } from "../types/tpyes";
import { useParams } from "react-router";
import axios from "axios";

type Announcement = {
  id: number;
  title: string;
  author: string;
  date: string;
  content: string;
  isPinned: boolean;
};



const fatchAnnouncementsData = async ( team_id : string | null ) => { 
  /* 3. 공지사항 목록 조회 메서드 구현
    - API 요청 사항
    /api/teams/{teamId}/notices로 요청할 때 해당 페이지는 notice를 리스트로 묶어서 json으로 반환
    반환된 json은 정의된 Notice 형태의 인터페이스로 교환 후 리스트로 변환시켜 반환
    {
      "id": 0,
      "team_id": 0,
      "author_id": 0,
      "author_name": "string",
      "title": "string",
      "content": "string",
      "is_leader_notice": true,
      "created_at": "2026-05-19T16:10:43.976Z"
    } 
    실패 시(status != 200인 경우) 예외 처리 (어떻게 처리할 지는 아직 미정)
  */
  try { 
    const res = await api.get(`/api/teams/${team_id}/notice`);
    if (res.status == 200)
      {      
        const transformList = res.data.map( (item : any) => ( {
          id: item.id || "0",
          team_id: item.team_id || "0",
          author_id: item.author_id || "0",
          author_name: item.author_name || "알 수 없음",
          title: item.title || "제목 없음",
          content: item.content || "",
          is_leader_notice: Boolean(item.is_leader_notice),
          created_at: item.created_at || new Date().toISOString()
        }) )
        return transformList; 
      }
    else { return []; }
  } catch (err) {
    if (err == axios.isAxiosError(err)) {
      console.log("서버 오류")
    }
  }
  return [];
};

const postAnnouncemetsData = async (team_id : string, content : any) => {
  /* 3-2 공지사항 작성 메서드
  - API 요청사항
  해당 POST 요청이 성공하면 status가 200을, 아니면 해당 오류에 관련된 status를 반환
  - 함수 진행
  요청에 성공 시 1을 return, 아니면 -1을 리턴
  */
  try{
    const res = await api.post(`/api/teams/${team_id}/notice`, content);
    if (res.status == 200) {
      console.log(res.status);
      return 1;
    }
    else { return -1 }
  } catch (err) {
    return -1
  }
};

const fatchDetailAnnouncementsData = async ( notice_id : string ) => {
  /* 3-3 공지사항 세부 확인 메서드
  - API 요청 사항 : Notice 인터페이스 형식의 JSON으로 요청
  오류 발생 시 처리 : 미정
  */
    try {
      const res = await axios.get(`/api/teams/notices/${notice_id}`);
      return res.data;
    } catch (err) {
      return -1;
    }
};

const writeAnnouncement = (user_id : string, 
                           team_id:string, 
                           title : string, 
                           content : string, 
                           is_leader :boolean) : Notice => {
  /*
    내부 수행 함수. user_id, team_id, ....을 작성하면 Notice 형태로 반환
  */
  
  const parse_team_num = parseInt(team_id, 10);
  const parse_auther_num = parseInt(user_id, 10);
  const data : Notice = { 
    team_id : parse_team_num,
    author_id: parse_auther_num,
    title: title,
    content: content,
    is_leader_notice: is_leader,
  }
  return data;
} 

export function Announcements() {
<<<<<<< HEAD
  const params =  useParams();
  const [announcements, setAnnouncements] = useState<Announcement[]>([
  ]);

  const getAnnouncementsData = async () => {

    const team_id = params.teamId;

    const data = await fatchAnnouncementsData(team_id);

    if (Array.isArray(data)) {
    const formattedData: Announcement[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        author: item.author_name, // 서버의 author_name을 author로
        date: item.created_at.split("T")[0], //
        content: item.content,
        isPinned: item.is_leader_notice, // 서버의 리더 공지 여부를 상단 고정 여부로
      }));
      setAnnouncements(formattedData);
    }
  }

  const getAnnouncementsDetailData = async(notice_id : string) => {
    const data = await fatchDetailAnnouncementsData(notice_id);
  }

  useEffect(() => {
    getAnnouncementsData();
  }, []);


  const [showForm, setShowForm]       = useState(false);
  const [formTitle, setFormTitle]     = useState("");
  const [formContent, setFormContent] = useState("");
  const [formIsPinned, setFormIsPinned] = useState(false);

  const isLeader = true;

  const handleSubmit = () => {
    if (!formTitle.trim() || !formContent.trim()) return;
    const team_id = params.teamId;
    postAnnouncemetsData(team_id, {title : formTitle, content : formContent});
    getAnnouncementsData();
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
        <button onClick={() => {setShowForm(true);}}
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