import { Link } from "react-router";
import { Calendar, CheckCircle2, FileText, Pin } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import axios from 'axios'
import { useParams } from "react-router";
import { Team, BASE_API_URL, PORT } from "../types/tpyes";
import { useEffect, useState } from "react";

const fetchMyteams = async (team_id : string | undefined) => {
  try {
    const res = await axios.get<Team>(`${BASE_API_URL}:${PORT}/api/teams/${team_id}`);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
    } else {
    }
  }
  return 
}

export function Dashboard() {
  const { teamId } = useParams();
  const { theme } = useTheme();
  const [ teamData, setTeamData ] = useState<Team | null >(null); 

  useEffect(() => {
    const fatchData = async () => {
    const data = await fetchMyteams(teamId);
    setTeamData(data);
    }
    fatchData();
  }, [teamId]
  );

  const todayTasks = [
    { id: 1, task: "UI 디자인 초안 제출", assignee: "박미소" },
    { id: 2, task: "팀 회의",             assignee: "전체" },
    { id: 3, task: "보고서 1차 피드백",   assignee: "송희경" },
  ];

  const ongoingTasks = [
    { id: 1, task: "프론트엔드 개발", progress: 60, assignee: "고명주" },
    { id: 2, task: "백엔드 API 설계", progress: 40, assignee: "오소원" },
    { id: 3, task: "데이터 분석",     progress: 80, assignee: "민지원" },
  ];

  const recentFiles = [
    { id: 1, name: "프로젝트 계획서.pptx", uploader: "박미소", date: "2026-03-14" },
    { id: 2, name: "요구사항 정의서.pdf",  uploader: "송희경", date: "2026-03-13" },
    { id: 3, name: "회의록_0312.docx",     uploader: "고명주", date: "2026-03-12" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900"> {teamData?.subject_name}</h1>
        <p className="text-slate-500 mt-1 text-sm">Team Alpha</p>
      </div>

      {/* Pinned Announcement */}
      <Link
        to="/team/announcements"
        className={`block ${theme.bgLight} border ${theme.borderAccent} rounded-2xl p-5 mb-8 ${theme.hoverBg} transition-colors`}
      >
        <div className="flex items-start gap-3">
          <Pin className={`w-4 h-4 ${theme.textAccent} mt-0.5 shrink-0`} />
          <div>
            <h3 className="font-semibold text-slate-900 mb-1 text-sm">
              [중요] 이번 주 금요일 최종 발표
            </h3>
            <p className="text-slate-600 text-sm">
              최종 발표가 3월 19일(금) 오후 2시에 예정되어 있습니다. 발표 자료는 목요일까지 완성해주세요.
            </p>
            <p className="text-xs text-slate-400 mt-2">김민수 · 2026-03-15</p>
          </div>
        </div>
      </Link>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Today's Schedule */}
        <Link to="/team/schedule" className="block bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className={`w-4 h-4 ${theme.textAccent}`} />
            <h2 className="text-sm font-semibold text-slate-700">오늘 일정</h2>
          </div>
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div key={task.id} className="pb-3 border-b border-slate-100 last:border-0">
                <p className="font-medium text-slate-900 text-sm">{task.task}</p>
                <p className="text-xs text-slate-400 mt-0.5">{task.assignee}</p>
              </div>
            ))}
          </div>
        </Link>

        {/* Ongoing Tasks */}
        <Link to="/team/tasks" className="block bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className={`w-4 h-4 ${theme.textAccent}`} />
            <h2 className="text-sm font-semibold text-slate-700">진행 중 업무</h2>
          </div>
          <div className="space-y-4">
            {ongoingTasks.map((task) => (
              <div key={task.id}>
                <div className="flex justify-between items-center mb-1.5">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{task.task}</p>
                    <p className="text-xs text-slate-400">{task.assignee}</p>
                  </div>
                  <span className={`text-xs ${theme.textAccent} font-semibold`}>{task.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className={`bg-gradient-to-r ${theme.avatarGradient} h-1.5 rounded-full transition-all`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Link>

        {/* Recent Files */}
        <Link to="/team/files" className="block bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-4">
            <FileText className={`w-4 h-4 ${theme.textAccent}`} />
            <h2 className="text-sm font-semibold text-slate-700">최근 업로드 자료</h2>
          </div>
          <div className="space-y-3">
            {recentFiles.map((file) => (
              <div key={file.id} className="pb-3 border-b border-slate-100 last:border-0">
                <p className="font-medium text-slate-900 text-sm mb-1 truncate">{file.name}</p>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{file.uploader}</span>
                  <span>{file.date}</span>
                </div>
              </div>
            ))}
          </div>
        </Link>
      </div>
    </div>
  );
}
