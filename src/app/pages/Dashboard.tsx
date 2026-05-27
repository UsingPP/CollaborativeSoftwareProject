import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  FileText,
  MessageCircle,
  Pin,
  Star,
} from "lucide-react";
import api from "../store/api";

type Announcement = {
  id: number;
  title: string;
  body: string;
  author: string;
  created_at: string;
  is_leader_notice: boolean;
};

type TaskItem = {
  id: number;
  task: string;
  assignee: string;
  progress: number;
  created_at: string;
  time?: string;
  title?: string;
};

type FileItem = {
  id: number;
  name: string;
  uploader: string;
  uploaded_at: string;
  date?: string;
};

type ChatMessage = {
  id: number;
  sender: string;
  text: string;
  created_at: string;
};

type ChatRoom = {
  id: number;
  room_name: string;
  participants: string;
  messages: ChatMessage[];
};

type Evaluation = {
  id: number;
  evaluator: string;
  target: string;
  score: number;
  comment: string;
  created_at: string;
};

// 주어진 항목 배열을 복사하여 날짜 기준 내림차순으로 정렬
// 원본 배열을 직접 변경하지 않기 위해 spread 연산자로 새 배열을 생성
const sortByDateDesc = <T extends Record<string, any>>(items: T[], dateKey: string) => {
  return [...items].sort(
    (a, b) => new Date(b[dateKey]).getTime() - new Date(a[dateKey]).getTime()
  );
};

// ────────────────────────────────────────────
// Dashboard 컴포넌트
// ────────────────────────────────────────────
export function Dashboard() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [announcementExpanded, setAnnouncementExpanded] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // 발표 목록을 메모이제이션하여 렌더링 성능을 개선
  // 리더 공지는 항상 상단에 고정되고, 그 외 공지는 최신순으로 정렬
  const latestAnnouncements = useMemo(() => {
    const pinned = announcements
      .filter((announcement) => announcement.is_leader_notice)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const regular = announcements
      .filter((announcement) => !announcement.is_leader_notice)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return [...pinned, ...regular];
  }, [announcements]);

  // ────────────────────────────────────────────
  // 요약 정보 계산
  // ────────────────────────────────────────────
  const todayTasks = useMemo(
    () => sortByDateDesc(tasks, "created_at").slice(0, 3),
    [tasks]
  );

  const ongoingTasks = useMemo(
    () => sortByDateDesc(tasks, "created_at").filter((task) => task.progress < 100),
    [tasks]
  );

  const recentFiles = useMemo(
    () => sortByDateDesc(files, "uploaded_at").slice(0, 3),
    [files]
  );

  // 채팅방별 마지막 메시지를 계산하고, 최근 활동 순서대로 정렬
  // 각 채팅룸의 메시지 배열에서 마지막 요소를 추출한 뒤, 메시지 작성 시간으로 비교
  const chatPreviews = useMemo(() => {
    return [...chats]
      .map((room) => {
        const lastMessage = room.messages?.slice(-1)[0];
        return {
          ...room,
          lastMessage,
        };
      })
      .sort((a, b) => {
        const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
        const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
        return bTime - aTime;
      });
  }, [chats]);

  const latestEvaluations = useMemo(
    () => sortByDateDesc(evaluations, "created_at").slice(0, 3),
    [evaluations]
  );

  // ────────────────────────────────────────────
  // 데이터 페칭
  // ────────────────────────────────────────────
  // 대시보드에 필요한 모든 데이터를 병렬로 요청
  // Promise.all을 사용하면 각 API 호출이 동시에 실행되어 전체 로드 시간이 줄어든다.
  const fetchDashboardData = async () => {
    try {
      const [annRes, taskRes, fileRes, chatRes, evalRes] = await Promise.all([
        api.get<Announcement[]>("/announcements"),
        api.get<TaskItem[]>("/tasks"),
        api.get<FileItem[]>("/files"),
        api.get<ChatRoom[]>("/chats"),
        api.get<Evaluation[]>("/evaluations"),
      ]);

      setAnnouncements(sortByDateDesc(annRes.data, "created_at"));
      setTasks(sortByDateDesc(taskRes.data, "created_at"));
      setFiles(sortByDateDesc(fileRes.data, "uploaded_at"));
      setChats(chatRes.data);
      setEvaluations(sortByDateDesc(evalRes.data, "created_at"));
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    intervalRef.current = window.setInterval(() => {
      fetchDashboardData();
    }, 15000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  // ────────────────────────────────────────────
  // 렌더링
  // ────────────────────────────────────────────
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🐻</span>
          <h1 className="text-3xl font-bold text-gray-900">웹 개발 프로젝트</h1>
        </div>
      </div>

      {/* Announcement List */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 mb-8 shadow-md">
        <div className="flex items-start gap-3 mb-4">
          <Pin className="w-5 h-5 text-amber-700 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">최근 공지사항</h3>
            <p className="text-gray-700">
              최신 공지사항을 실시간으로 동기화하고, 리더 공지는 상단에 고정해서 보여줍니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAnnouncementExpanded((prev) => !prev)}
            className="rounded-full p-2 bg-white/90 text-amber-700 shadow-sm hover:bg-amber-100 transition"
            aria-label={announcementExpanded ? "공지사항 접기" : "공지사항 펼치기"}
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform ${announcementExpanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <div className="space-y-4 transition-all duration-300">
          {latestAnnouncements
            .slice(0, announcementExpanded ? latestAnnouncements.length : 1)
            .map((announcement) => (
              <div
                key={announcement.id}
                className={`rounded-3xl p-5 border ${
                  announcement.is_leader_notice
                    ? "border-amber-300 bg-amber-50"
                    : "border-amber-100 bg-white"
                } shadow-sm`}
              >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {announcement.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{announcement.body}</p>
                </div>
                {announcement.is_leader_notice && (
                  <span className="text-xs font-semibold uppercase text-amber-700">
                    리더 공지
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500 mt-4">
                <span>작성자: {announcement.author}</span>
                <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {latestAnnouncements.length === 0 && (
            <p className="text-sm text-gray-500">공지사항이 없습니다.</p>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-3xl shadow-md p-6 border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-amber-700" />
            <h2 className="text-lg font-semibold text-gray-900">오늘 일정</h2>
          </div>
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="pb-3 border-b border-amber-50 last:border-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{task.task}</p>
                    <p className="text-sm text-gray-600">{task.assignee}</p>
                  </div>
                  <span className="text-sm text-amber-700 font-medium">
                    {task.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ongoing Tasks */}
        <div className="bg-white rounded-3xl shadow-md p-6 border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-amber-700" />
            <h2 className="text-lg font-semibold text-gray-900">진행 중 업무</h2>
          </div>
          <div className="space-y-4">
            {ongoingTasks.map((task) => (
              <div key={task.id}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{task.task}</p>
                    <p className="text-sm text-gray-600">{task.assignee}</p>
                  </div>
                  <span className="text-sm text-amber-700 font-medium">
                    {task.progress}%
                  </span>
                </div>
                <div className="w-full bg-amber-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Files */}
        <div className="bg-white rounded-3xl shadow-md p-6 border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-amber-700" />
            <h2 className="text-lg font-semibold text-gray-900">
              최근 업로드 자료
            </h2>
          </div>
          <div className="space-y-3">
            {recentFiles.map((file) => (
              <div
                key={file.id}
                className="pb-3 border-b border-amber-50 last:border-0"
              >
                <p className="font-medium text-gray-900 mb-1">{file.name}</p>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{file.uploader}</span>
                  <span>{file.date ?? new Date(file.uploaded_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat + Evaluation Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-3xl shadow-md p-6 border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-amber-700" />
            <h2 className="text-lg font-semibold text-gray-900">채팅 미리보기</h2>
          </div>
          <div className="space-y-4">
            {chatPreviews.map((room) => (
              <div
                key={room.id}
                className="rounded-3xl p-4 border border-amber-50 bg-amber-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{room.room_name}</p>
                    <p className="text-sm text-gray-600">{room.participants}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {room.lastMessage
                      ? new Date(room.lastMessage.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {room.lastMessage ? room.lastMessage.text : "최근 메시지가 없습니다."}
                </p>
              </div>
            ))}
            {chatPreviews.length === 0 && (
              <p className="text-sm text-gray-500">채팅 데이터가 없습니다.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-md p-6 border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-700" />
            <h2 className="text-lg font-semibold text-gray-900">상호 평가</h2>
          </div>
          <div className="space-y-4">
            {latestEvaluations.map((evaluation) => (
              <div
                key={evaluation.id}
                className="rounded-3xl p-4 border border-amber-50 bg-amber-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {evaluation.evaluator} → {evaluation.target}
                    </p>
                    <p className="text-sm text-gray-600">{evaluation.comment}</p>
                  </div>
                  <span className="text-sm text-amber-700 font-semibold">
                    {evaluation.score}/5
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(evaluation.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
            {latestEvaluations.length === 0 && (
              <p className="text-sm text-gray-500">상호 평가 내역이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}