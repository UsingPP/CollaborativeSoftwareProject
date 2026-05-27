import { useState, useEffect } from "react";
import { useParams } from "react-router";
import {
  Calendar,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Users,
  Sparkles,
  Check,
  X,
} from "lucide-react";

export function Schedule() {
  const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL as string) || "http://localhost:8000";
  const { teamId } = useParams<{ teamId: string }>();
  const currentTeamId = teamId || "3";

  const [currentDate, setCurrentDate] = useState(new Date());

  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);

  const DUMP_MEMBERS = ["박미소", "송희경", "고명주", "오소원", "민지원", "이채현"];

  const [meetings, setMeetings] = useState([
    { id: 1, date: "2026-03-16", time: "16:00", title: "중간 점검 회의", description: "진행 상황 공유 및 이슈 논의" },
    { id: 2, date: "2026-03-18", time: "14:00", title: "발표 자료 검토", description: "최종 발표 자료 피드백" },
    { id: 3, date: "2026-03-19", time: "14:00", title: "최종 발표", description: "프로젝트 최종 발표 및 시연" },
  ]);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [aiTasks, setAiTasks] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const [aiGoal, setAiGoal] = useState("");
  const [aiDeadline, setAiDeadline] = useState("2026-06-15");
  const [aiTaskInput, setAiTaskInput] = useState("");
  const [aiTaskList, setAiTaskList] = useState<string[]>([]);

  const fetchTeamMembers = async () => {
    setIsMembersLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/teams/${currentTeamId}/members`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        }
      });
      if (!response.ok) throw new Error("팀원 정보를 불러오지 못했습니다.");
      const data = await response.json();
      if (Array.isArray(data)) {
        setTeamMembers(data.map((m: any) => typeof m === "string" ? m : m.name || m.user_name));
      } else {
        setTeamMembers(DUMP_MEMBERS);
      }
    } catch {
      setTeamMembers(DUMP_MEMBERS);
    } finally {
      setIsMembersLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [currentTeamId]);

  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

  const getDateStrFromDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);
    return days;
  };

  const hasMeeting = (day: number | null) => {
    if (!day) return false;
    return meetings.some(m => m.date === getDateStrFromDay(day));
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  };

  const monthNames = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

  const goToPreviousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const selectedDateStr = selectedDay != null ? getDateStrFromDay(selectedDay) : null;
  const availableMembers = selectedDateStr != null ? teamMembers.filter(m => availability[`${selectedDateStr}-${m}`]) : [];

  const handleRequestAiSchedule = async () => {
    if (!aiGoal || aiTaskList.length === 0) {
      alert("최종 목표와 할 일 리스트를 입력해주세요.");
      return;
    }
    setIsAiLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/teams/${currentTeamId}/ai-sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify({ goal: aiGoal, deadline: aiDeadline, tasks: aiTaskList })
      });
      const data = await response.json();
      // 백엔드는 'id' 필드로 반환 (data.sessionId 아님)
      const fetchedSessionId = String(data.id || "3");
      setSessionId(fetchedSessionId);
      await handleFetchAiSchedule(fetchedSessionId);
    } catch {
      setSessionId("3");
      await handleFetchAiSchedule("3");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFetchAiSchedule = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-sessions/${id}`);
      const data = await response.json();
      if (data && data.tasks) {
        setAiTasks(data.tasks);
      } else {
        setAiTasks([
          { task_name: "DB 스키마 설계", due_date: "2026-05-25" },
          { task_name: "API 엔드포인트 구현", due_date: "2026-06-01" },
        ]);
      }
      setShowAiModal(true);
    } catch {
      setAiTasks([
        { task_name: "DB 스키마 설계", due_date: "2026-05-25" },
        { task_name: "API 엔드포인트 구현", due_date: "2026-06-01" },
      ]);
      setShowAiModal(true);
    }
  };

  const handleConfirmAiSchedule = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      await fetch(`${API_BASE_URL}/api/ai-sessions/${sessionId}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify({
          tasks: aiTasks.map(t => ({ task_name: t.task_name, due_date: t.due_date }))
        })
      });
      const convertedMeetings = aiTasks.map((task, index) => ({
        id: Date.now() + index,
        date: task.due_date,
        time: "10:00",
        title: `[AI 확정] ${task.task_name}`,
        description: "AI 추천 분석을 거쳐 등록된 팀 공식 스케줄 일정입니다."
      }));
      setMeetings(prev => [...convertedMeetings, ...prev]);
      setShowAiModal(false);
      setAiGoal("");
      setAiTaskList([]);
      alert("AI 추천 일정이 성공적으로 등록되었습니다.");
    } catch {
      setShowAiModal(false);
    }
  };

  const handleRejectAiSchedule = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      await fetch(`${API_BASE_URL}/api/ai-sessions/${sessionId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
      });
    } catch {
      // 기각 실패해도 모달 닫기
    }
    setShowAiModal(false);
    setAiGoal("");
    setAiTaskList([]);
  };

  const handleAddTask = () => {
    if (aiTaskInput.trim()) {
      setAiTaskList([...aiTaskList, aiTaskInput.trim()]);
      setAiTaskInput("");
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">📅</span>
          <h1 className="text-3xl font-bold text-gray-900">일정 관리</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 달력 섹션 */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-md p-6 border border-amber-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
            </h2>
            <div className="flex gap-2">
              <button onClick={goToPreviousMonth} className="p-2 hover:bg-amber-50 rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={goToNextMonth} className="p-2 hover:bg-amber-50 rounded-full transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map(day => (
              <div key={day} className="text-center font-semibold text-blue-800 py-2">{day}</div>
            ))}
            {getDaysInMonth(currentDate).map((day, index) => {
              const dateStr = day ? getDateStrFromDay(day) : "";
              const approvedMeeting = hasMeeting(day);
              const availableCount = day ? teamMembers.filter(m => availability[`${dateStr}-${m}`]).length : 0;

              return (
                <div
                  key={index}
                  onClick={() => day != null && setSelectedDay(day)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-2xl relative transition-all cursor-pointer ${
                    day
                      ? isToday(day)
                        ? "bg-gradient-to-br from-blue-600 to-indigo-500 text-white font-semibold shadow-md"
                        : approvedMeeting
                        ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 font-medium"
                        : "bg-white hover:bg-blue-50 text-gray-700 border border-gray-50"
                      : ""
                  } ${day != null && selectedDay === day ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-white" : ""}`}
                >
                  <span className={isToday(day) ? "mb-0" : "mb-1"}>{day}</span>
                  {day && !approvedMeeting && !isToday(day) && availableCount > 0 && (
                    <div className="absolute bottom-1.5 flex justify-center gap-0.5 w-full px-1">
                      {Array.from({ length: Math.min(availableCount, 5) }).map((_, i) => (
                        <div key={i} className="w-1 h-1 bg-blue-600 rounded-full" />
                      ))}
                      {availableCount > 5 && <span className="text-[7px] text-blue-600 font-bold leading-none">+</span>}
                    </div>
                  )}
                  {day && approvedMeeting && !isToday(day) && (
                    <div className="absolute bottom-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              disabled={selectedDay == null}
              onClick={async () => {
                if (!selectedDateStr || selectedDay == null) return;
                const nextTitle = "회의 일정 생성";
                const nextDescription = availableMembers.length > 0 ? `가능자: ${availableMembers.join(", ")}` : "가능자 없음(기본 일정)";
                try {
                  const token = localStorage.getItem("token") || localStorage.getItem("access_token");
                  await fetch(`${API_BASE_URL}/api/teams/${currentTeamId}/meetings`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...(token && { "Authorization": `Bearer ${token}` }) },
                    body: JSON.stringify({ date: selectedDateStr, title: nextTitle, description: nextDescription, time: "14:00" })
                  });
                } catch { /* ignore */ }
                setMeetings(prev => {
                  const nextId = prev.length > 0 ? Math.max(...prev.map(m => m.id)) + 1 : 1;
                  return [{ id: nextId, date: selectedDateStr, time: "14:00", title: nextTitle, description: nextDescription }, ...prev];
                });
                setSelectedDay(null);
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-full hover:from-blue-700 hover:to-indigo-600 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />회의 일정 생성
            </button>
          </div>

          {/* AI 추천 요청 폼 */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              AI 스마트 스케줄 추천 요청 <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-normal">팀장 전용</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">최종 목표 (goal)</label>
                <input type="text" placeholder="예: 클라우드 컴퓨팅 기말 팀 프로젝트 완성" value={aiGoal}
                  onChange={e => setAiGoal(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">마감일 (deadline)</label>
                  <input type="date" value={aiDeadline} onChange={e => setAiDeadline(e.target.value)}
                    className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">할 일 리스트 추가 (tasks)</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="예: DB 스키마 설계" value={aiTaskInput}
                      onChange={e => setAiTaskInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleAddTask()}
                      className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button onClick={handleAddTask}
                      className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors">
                      추가
                    </button>
                  </div>
                </div>
              </div>

              {aiTaskList.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  {aiTaskList.map((todo, idx) => (
                    <span key={idx} className="text-xs bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 flex items-center gap-1">
                      • {todo}
                    </span>
                  ))}
                </div>
              )}

              <button onClick={handleRequestAiSchedule}
                disabled={isAiLoading || !aiGoal || aiTaskList.length === 0}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isAiLoading ? "AI 분석 엔진 통신 중..." : "AI 스케줄 추천받기"}
              </button>
            </div>
          </div>
        </div>

        {/* 우측 사이드바 */}
        <div className="bg-white rounded-3xl shadow-md p-6 border border-amber-100">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />팀원별 가능한 날짜
            </h2>
            <p className="text-sm text-gray-600">캘린더에서 날짜를 선택하면, 해당 날짜의 가능 여부를 체크할 수 있습니다.</p>
            <div className="mt-4">
              {isMembersLoading ? (
                <div className="text-center py-4 text-xs text-gray-400">팀원 정보를 불러오는 중...</div>
              ) : selectedDateStr ? (
                <>
                  <div className="text-sm text-blue-700 font-semibold mb-3">선택 날짜: {selectedDateStr}</div>
                  <div className="space-y-2">
                    {teamMembers.map(member => {
                      const key = `${selectedDateStr}-${member}`;
                      return (
                        <label key={member} className="flex items-center justify-between bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-2xl border border-blue-100 transition-colors cursor-pointer">
                          <span className="text-sm font-medium text-gray-800">{member}</span>
                          <input type="checkbox" checked={availability[key] ?? false}
                            onChange={e => setAvailability(prev => ({ ...prev, [key]: e.target.checked }))}
                          />
                        </label>
                      );
                    })}
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    선택된 가능자: <span className="font-semibold text-blue-700">{availableMembers.length}명 / {teamMembers.length}명</span>
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm text-gray-600">
                  날짜를 클릭해 팀원 가능 여부를 선택해보세요.
                </div>
              )}
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />예정된 회의
          </h2>
          <div className="space-y-4">
            {meetings.map(meeting => (
              <div key={meeting.id} className="p-4 border border-blue-200 rounded-2xl hover:border-blue-400 transition-all hover:shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-start gap-3 mb-2">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{meeting.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{meeting.description}</p>
                    <div className="flex items-center gap-2 text-sm text-blue-800 font-medium">
                      <span>{meeting.date}</span><span>·</span><span>{meeting.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI 추천 모달 */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-indigo-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">AI 추천 일정 확인</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              AI 엔진 연산 분석을 통해 수립된 개발 권장 태스크 스케줄입니다. 최종 확정 시 공식 팀 일정 목록으로 일괄 등록됩니다.
            </p>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 mb-6">
              {aiTasks.map((task, index) => (
                <div key={index} className="p-4 border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{task.task_name}</h4>
                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg">기한: {task.due_date}</span>
                  </div>
                  <p className="text-xs text-gray-500">배정 태스크의 분석된 정해진 마감 요구일 기준 권장 일정 일자입니다.</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRejectAiSchedule}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />기각
              </button>
              <button
                onClick={handleConfirmAiSchedule}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />일정 최종 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
