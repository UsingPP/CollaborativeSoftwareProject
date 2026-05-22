import { useState, useEffect } from "react";
import axios from 'axios';
import { Plus, Filter, X, Trash2 } from "lucide-react";
import { useParams } from "react-router";

// ────────────────────────────────────────────
// 백엔드 Swagger 명세서 규격에 맞춘 타입 정의
// ────────────────────────────────────────────
interface Task {
  id: number;
  team_id: number;
  assignee_id: number;
  assignee_name: string;
  task_name: string;
  due_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CreateTaskParams {
  task_name: string;
  due_date: string;
}

// ────────────────────────────────────────────
// 덤프 데이터 (서버 장애 혹은 로딩 실패 대비 Fallback용)
// ────────────────────────────────────────────
const DUMP_TASKS: Task[] = [
  { id: 1, team_id: 1, assignee_id: 10, assignee_name: "박미소", task_name: "UI 디자인 초안 제출", due_date: "2026-03-16", status: "in-progress", created_at: "", updated_at: "" },
  { id: 2, team_id: 1, assignee_id: 11, assignee_name: "송희경", task_name: "데이터베이스 스키마 설계", due_date: "2026-03-17", status: "in-progress", created_at: "", updated_at: "" },
  { id: 3, team_id: 1, assignee_id: 12, assignee_name: "고명주", task_name: "API 명세서 작성", due_date: "2026-03-18", status: "pending", created_at: "", updated_at: "" },
  { id: 4, team_id: 1, assignee_id: 13, assignee_name: "오소원", task_name: "프론트엔드 개발", due_date: "2026-03-20", status: "in-progress", created_at: "", updated_at: "" },
  { id: 5, team_id: 1, assignee_id: 14, assignee_name: "민지원", task_name: "테스트 케이스 작성", due_date: "2026-03-19", status: "pending", created_at: "", updated_at: "" },
  { id: 6, team_id: 1, assignee_id: 15, assignee_name: "이채현", task_name: "발표 자료 제작", due_date: "2026-03-18", status: "completed", created_at: "", updated_at: "" },
];

export function Tasks() {
  const { team_id } = useParams<{ team_id: string }>();
  const teamId = team_id || "1";

  const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL as string) || "http://localhost:8000";

  const [filterMyTasks, setFilterMyTasks] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  const currentUser = localStorage.getItem("user_name") || "오소원";

  // 인증 헤더 구성 헬퍼
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token"); 
    return {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };
  };

  // 1. 업무 전체 목록 조회 (GET)
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/teams/${teamId}/tasks`,
        getAuthHeaders()
      );
      
      if (res.data && Array.isArray(res.data)) {
        setTasks(res.data);
      } else {
        console.warn("응답 데이터가 배열 형식이 아닙니다.");
        setTasks([]);
      }
    } catch (error) {
      console.error("데이터를 불러오는 중 오류 발생:", error);
      setTasks(DUMP_TASKS); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [teamId]);

  // 2. 새 업무 생성 등록 (POST)
  const handleAddTask = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const params: CreateTaskParams = {
      task_name: newTitle,
      due_date: newDueDate,
    };

    try {
      await axios.post(
        `${API_BASE_URL}/api/teams/${teamId}/tasks`,
        params,
        getAuthHeaders()
      );
      await fetchTasks();

      setNewTitle("");
      setNewDueDate("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("업무 추가 중 오류 발생:", error);
      
      // Fallback: 서버 에러 시 가상 데이터 UI 반영
      const fakeNewTask: Task = {
        id: Date.now(),
        team_id: Number(teamId),
        assignee_id: 0,
        assignee_name: currentUser,
        task_name: params.task_name,
        due_date: params.due_date,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setTasks(prev => [...prev, fakeNewTask]);
      setIsModalOpen(false);
    }
  };

  // 3. 업무 삭제 (DELETE)
  const handleDeleteTask = async (id: number) => {
    if (!confirm("이 업무를 정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/api/tasks/${id}`,
        getAuthHeaders()
      );
      setTasks(prev => prev.filter((task) => task.id !== id));
    } catch (error) {
      console.error("업무 삭제 중 오류 발생:", error);
      setTasks(prev => prev.filter((task) => task.id !== id));
    }
  };

  // 4. 진행 상태 순구조 변경 기능 (PATCH)
  const handleToggleStatus = async (id: number, currentStatus: string) => {
    let nextStatus = "pending";
    if (currentStatus === "pending") nextStatus = "in-progress";
    else if (currentStatus === "in-progress") nextStatus = "completed";

    const targetTask = tasks.find(t => t.id === id);
    if (!targetTask) return;

    // 만약 백엔드에서 status만 수정하는 것을 허용한다면 불필요한 필드는 제외하는 것이 좋습니다.
    const patchBody = {
      task_name: targetTask.task_name,
      due_date: targetTask.due_date,
      status: nextStatus
    };

    try {
      await axios.patch(
        `${API_BASE_URL}/api/tasks/${id}`,
        patchBody,
        getAuthHeaders()
      );
      setTasks(prev => prev.map((task) => (task.id === id ? { ...task, status: nextStatus } : task)));
    } catch (error) {
      console.error("상태 업데이트 중 오류 발생:", error);
      setTasks(prev => prev.map((task) => (task.id === id ? { ...task, status: nextStatus } : task)));
    }
  };

  // UI 필터링 조건
  const displayedTasks = filterMyTasks
    ? tasks.filter((task) => task.assignee_name === currentUser)
    : tasks;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-amber-100 text-amber-800";
      case "pending": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "완료";
      case "in-progress": return "진행 중";
      case "pending": return "진행 전";
      default: return status || "진행 전";
    }
  };

  return (
    <div className="p-8">
      {/* 타이틀 영역 */}
            <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📝</span>
            <h1 className="text-3xl font-bold text-gray-900">업무 관리</h1>
          </div>

      {/* 상태별 카운트 대시보드 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-blue-100">
          <div className="text-sm text-gray-600 mb-1">진행 전</div>
          <div className="text-3xl font-bold text-orange-600">{tasks.filter(t => t.status === 'pending').length}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-blue-100">
          <div className="text-sm text-gray-600 mb-1">진행 중</div>
          <div className="text-3xl font-bold text-amber-600">{tasks.filter(t => t.status === 'in-progress').length}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-blue-100">
          <div className="text-sm text-gray-600 mb-1">완료</div>
          <div className="text-3xl font-bold text-green-600">{tasks.filter(t => t.status === 'completed').length}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-blue-100">
          <div className="text-sm text-gray-600 mb-1">전체</div>
          <div className="text-3xl font-bold text-blue-600">{tasks.length}</div>
        </div>
      </div>

      {/* 업무 리스트 테이블 */}
      <div className="bg-white rounded-3xl shadow-md border border-blue-100 overflow-hidden">
        <div className="p-6 border-b border-blue-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">업무 목록</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterMyTasks(!filterMyTasks)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filterMyTasks ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4 inline mr-2" />
              내 업무
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              추가
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">업무명</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">담당자</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">마감일</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">상태</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">로드 중...</td></tr>
              ) : displayedTasks.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">업무가 없습니다.</td></tr>
              ) : (
                displayedTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{task.task_name}</td>
                    <td className="px-6 py-4 text-gray-700">{task.assignee_name}</td>
                    <td className="px-6 py-4 text-gray-700">{task.due_date}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(task.id, task.status)}
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer hover:shadow-md hover:scale-100 ${getStatusColor(task.status)}`}
                      >
                        {getStatusText(task.status)}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 업무 등록 모달 팝업 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">새 업무 추가</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">업무명</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="업무명 입력"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">마감일</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
