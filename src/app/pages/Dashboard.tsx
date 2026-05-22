import { Calendar, CheckCircle2, FileText, Pin } from "lucide-react";
import api from "../store/api";
import { useParams } from "react-router";
import { useState, useEffect } from "react";






const fetchDashboardInfomation = async (teamId: string) => {
  try {
    const res = await api.get(`/api/teams/${teamId}`);
    /*
    {
  "team": {
    "id": 0,
    "team_name": "string",
    "subject_name": "string",
    "invite_code": "string",
    "status": "string",
    "deadline": "2026-05-19",
    "leader_id": 0,
    "created_at": "2026-05-19T16:10:43.968Z"
  },
  "members": [
    {
      "additionalProp1": {}
    }
  ],
  "latest_notice": {
    "additionalProp1": {}
  },
  "today_tasks": [],
  "progress": 0
}
    */
    return res.data;
  } catch (err) {
    console.error("Failed to fetch dashboard information", err);
    return null;
  }
}

export function Dashboard() {

  const params = useParams();
  const teamId = params.teamId as string;
  const [teamName, setTeamName] = useState<string>("");
  const [subject_name, setSubject_name] = useState<string>("");
  const [announcement, setAnnouncement] = useState({});
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [ongoingTask, setOngoingTask] = useState<number>(0);

  const getDashboardInfo = async () => {
    const data = await fetchDashboardInfomation(teamId);
    if (data) {
      setTeamName(data.team.team_name);
      setSubject_name(data.team.subject_name);
      setAnnouncement(data.latest_notice);
      setTodaySchedule(data.today_tasks);
      setOngoingTask(data.progress);
    }
  }

  useEffect(() => {
    getDashboardInfo();
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🐻</span>
          <h1 className="text-3xl font-bold text-gray-900">{subject_name}</h1>
        </div>
        <p className="text-gray-600 mt-1">{teamName}</p>
      </div>

      {/* Important Announcement */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 mb-8 shadow-md">
        <div className="flex items-start gap-3">
          <Pin className="w-5 h-5 text-amber-700 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">
              [중요] {announcement.title}
            </h3>
            <p className="text-gray-700">
              {announcement.content}
            </p>
            <p className="text-sm text-gray-600 mt-2">작성자: 김민수 · 2026-03-15</p>
          </div>
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
            {todaySchedule.map((task) => (
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
                  <span>{file.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}