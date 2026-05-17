import { useState } from "react";
import { Plus, Filter } from "lucide-react";

export function Tasks() {
  const [filterMyTasks, setFilterMyTasks] = useState(false);

  const tasks = [
    { id: 1, title: "UI 디자인 초안 제출",    assignee: "박미소", dueDate: "2026-03-16", status: "in-progress" },
    { id: 2, title: "데이터베이스 스키마 설계", assignee: "송희경", dueDate: "2026-03-17", status: "in-progress" },
    { id: 3, title: "API 명세서 작성",          assignee: "고명주", dueDate: "2026-03-18", status: "pending" },
    { id: 4, title: "프론트엔드 개발",          assignee: "오소원", dueDate: "2026-03-20", status: "in-progress" },
    { id: 5, title: "테스트 케이스 작성",       assignee: "민지원", dueDate: "2026-03-19", status: "pending" },
    { id: 6, title: "발표 자료 제작",           assignee: "이채현", dueDate: "2026-03-18", status: "completed" },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":  return "bg-green-50 text-green-700 border border-green-200";
      case "in-progress":return "bg-blue-50 text-blue-700 border border-blue-200";
      case "pending":    return "bg-slate-100 text-slate-600 border border-slate-200";
      default:           return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":   return "완료";
      case "in-progress": return "진행 중";
      case "pending":     return "진행 전";
      default:            return status;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">업무 관리</h1>
          <p className="text-slate-500 mt-1 text-sm">팀 업무를 관리하고 추적하세요</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterMyTasks(!filterMyTasks)}
            className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 text-sm ${
              filterMyTasks
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            내 업무만
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl hover:from-blue-700 hover:to-indigo-600 transition-all flex items-center gap-2 shadow-sm text-sm">
            <Plus className="w-4 h-4" />
            할 일 추가
          </button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">업무명</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">담당자</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">마감일</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900 text-sm">{task.title}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                      {task.assignee.charAt(0)}
                    </div>
                    <span className="text-slate-700 text-sm">{task.assignee}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-500 text-sm">{task.dueDate}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusStyle(task.status)}`}>
                    {getStatusText(task.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
