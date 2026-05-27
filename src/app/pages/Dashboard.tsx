import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useSelector } from "react-redux";
import { Calendar, CheckCircle2, Pin, Users, TrendingUp, PowerOff } from "lucide-react";
import api from "../store/api";
import { RootState } from "../store";

interface TeamDetail {
  id: number;
  team_name: string;
  subject_name: string;
  status: string;
  deadline: string;
  leader_id: number;
}

interface Notice {
  id: number;
  title: string;
  content: string;
  author_name: string;
  is_leader_notice: boolean;
  created_at: string;
}

interface TodayTask {
  id: number;
  task_name: string;
  assignee_name: string;
  due_date: string;
  status: string;
}

interface Member {
  user_id: number;
  user_name: string;
}

export function Dashboard() {
  const { teamId } = useParams<{ teamId: string }>();
  const myUserId = useSelector((state: RootState) => state.auth.userId);

  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEndingProject, setIsEndingProject] = useState(false);

  const isLeader = team ? String(team.leader_id) === String(myUserId) : false;

  const fetchDashboardData = async () => {
    if (!teamId) return;
    try {
      const [teamRes, noticesRes] = await Promise.all([
        api.get(`/api/teams/${teamId}`),
        api.get(`/api/teams/${teamId}/notices`),
      ]);

      const teamData = teamRes.data;
      setTeam(teamData.team ?? teamData);
      setTodayTasks(teamData.today_tasks ?? []);
      setMembers(teamData.members ?? []);
      setProgress(teamData.progress ?? 0);

      if (Array.isArray(noticesRes.data)) {
        setNotices(noticesRes.data);
      } else if (teamData.latest_notice) {
        setNotices([teamData.latest_notice]);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [teamId]);

  const handleEndProject = async () => {
    if (!teamId || !confirm("팀 프로젝트를 종료 처리하시겠습니까?")) return;
    setIsEndingProject(true);
    try {
      await api.patch(`/api/teams/${teamId}/status`, { status: "completed" });
      await fetchDashboardData();
    } catch (error) {
      console.error("팀 상태 변경 실패:", error);
    } finally {
      setIsEndingProject(false);
    }
  };

  const pinnedNotices = notices.filter(n => n.is_leader_notice);
  const regularNotices = notices.filter(n => !n.is_leader_notice);
  const sortedNotices = [...pinnedNotices, ...regularNotices];

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">데이터를 불러오는 중...</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🐻</span>
            <h1 className="text-3xl font-bold text-gray-900">
              {team?.team_name ?? team?.subject_name ?? "팀 대시보드"}
            </h1>
            {team?.status === "completed" && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full font-medium">종료됨</span>
            )}
          </div>
          <p className="text-slate-500 text-sm">{team?.subject_name} · 마감일: {team?.deadline ?? "-"}</p>
        </div>
        {isLeader && team?.status !== "completed" && (
          <button
            onClick={handleEndProject}
            disabled={isEndingProject}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <PowerOff className="w-4 h-4" />
            {isEndingProject ? "처리 중..." : "프로젝트 종료"}
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-gray-700">전체 진행률</span>
          </div>
          <span className="text-sm font-bold text-amber-700">{progress}%</span>
        </div>
        <div className="w-full bg-amber-100 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Today's Tasks */}
        <div className="bg-white rounded-3xl shadow-md p-6 border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-amber-700" />
            <h2 className="text-lg font-semibold text-gray-900">오늘 일정</h2>
          </div>
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <p className="text-sm text-gray-400">오늘 예정된 일정이 없습니다.</p>
            ) : (
              todayTasks.map(task => (
                <div key={task.id} className="pb-3 border-b border-amber-50 last:border-0">
                  <p className="font-medium text-gray-900 text-sm">{task.task_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{task.assignee_name}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Progress Details */}
        <div className="bg-white rounded-3xl shadow-md p-6 border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-amber-700" />
            <h2 className="text-lg font-semibold text-gray-900">업무 현황</h2>
          </div>
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <p className="text-sm text-gray-400">업무 데이터가 없습니다.</p>
            ) : (
              todayTasks.map(task => (
                <div key={task.id}>
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium text-gray-900 text-sm truncate flex-1 mr-2">{task.task_name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      task.status === "completed" ? "bg-green-100 text-green-700" :
                      task.status === "in-progress" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {task.status === "completed" ? "완료" : task.status === "in-progress" ? "진행 중" : "대기"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-3xl shadow-md p-6 border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-amber-700" />
            <h2 className="text-lg font-semibold text-gray-900">팀원 ({members.length}명)</h2>
          </div>
          <div className="space-y-2">
            {members.length === 0 ? (
              <p className="text-sm text-gray-400">팀원 정보가 없습니다.</p>
            ) : (
              members.map((member: any) => {
                const name = member.user_name || member.name || "알 수 없음";
                const id = member.user_id || member.id;
                const isTeamLeader = team && String(team.leader_id) === String(id);
                return (
                  <div key={id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {name.charAt(0)}
                    </div>
                    <span className="text-sm text-gray-700">{name}</span>
                    {isTeamLeader && <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">팀장</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Notices */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Pin className="w-5 h-5 text-amber-700" />
          <h3 className="font-semibold text-gray-900">공지사항</h3>
        </div>
        <div className="space-y-3">
          {sortedNotices.length === 0 ? (
            <p className="text-sm text-gray-500">공지사항이 없습니다.</p>
          ) : (
            sortedNotices.slice(0, 3).map(notice => (
              <div key={notice.id} className={`rounded-2xl p-4 border ${notice.is_leader_notice ? "border-amber-300 bg-amber-50" : "border-amber-100 bg-white"} shadow-sm`}>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{notice.title}</h4>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notice.content}</p>
                  </div>
                  {notice.is_leader_notice && (
                    <span className="text-xs font-semibold uppercase text-amber-700 shrink-0">리더 공지</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                  <span>{notice.author_name}</span>
                  <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
