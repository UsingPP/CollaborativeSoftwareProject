import { Calendar, CheckCircle2, FileText, Pin } from "lucide-react";
export function Dashboard() {
  const todayTasks = [
    { id: 1, task: "UI 디자인 초안 제출", time: "14:00", assignee: "박미소" },
    { id: 2, task: "팀 회의", time: "16:00", assignee: "전체" },
    { id: 3, task: "보고서 1차 피드백", time: "18:00", assignee: "송희경" },
  ];

  const ongoingTasks = [
    { id: 1, task: "프론트엔드 개발", progress: 60, assignee: "고명주" },
    { id: 2, task: "백엔드 API 설계", progress: 40, assignee: "오소원" },
    { id: 3, task: "데이터 분석", progress: 80, assignee: "민지원" },
  ];

  const recentFiles = [
    {
      id: 1,
      name: "프로젝트 계획서.pptx",
      uploader: "박미소",
      date: "2026-03-14",
    },
    {
      id: 2,
      name: "요구사항 정의서.pdf",
      uploader: "송희경",
      date: "2026-03-13",
    },
    {
      id: 3,
      name: "회의록_0312.docx",
      uploader: "고명주",
      date: "2026-03-12",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🐻</span>
          <h1 className="text-3xl font-bold text-gray-900">웹 개발 프로젝트</h1>
        </div>
        <p className="text-gray-600 mt-1">Team Alpha</p>
      </div>

      {/* Important Announcement */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 mb-8 shadow-md">
        <div className="flex items-start gap-3">
          <Pin className="w-5 h-5 text-amber-700 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">
              [중요] 이번 주 금요일 최종 발표
            </h3>
            <p className="text-gray-700">
              최종 발표가 3월 19일(금) 오후 2시에 예정되어 있습니다. 발표 자료는
              목요일까지 완성해주세요.
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