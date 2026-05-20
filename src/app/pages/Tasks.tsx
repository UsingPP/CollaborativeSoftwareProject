import { useState, useEffect } from "react";
import axios from 'axios';
// 원래 사용하던 아이콘 세트 유지
import { Plus, Filter, X, Trash2 } from "lucide-react";

// ────────────────────────────────────────────
// 백엔드 Swagger 명세서 규격에 맞춘 타입 정의
// ────────────────────────────────────────────
interface Task {
  id: number;
  team_id: number;
  assignee_id: number;
  assignee_name: string; // 백엔드 담당자 이름 필드명 반영
  task_name: string;     // 백엔드 업무명 필드명 반영
  due_date: string;      // 백엔드 마감일 필드명 반영
  status: string;        // "pending", "in-progress", "completed" 등
  created_at: string;
  updated_at: string;
}

// POST 요청 시 전송할 바디 규격 (Swagger 규격 반영)
interface CreateTaskParams {
  task_name: string;
  due_date: string;
}

// 백엔드 IP 및 팀 ID 정의 (우선 테스트용으로 1 설정)
const BASE_IP = "http://34.227.111.164:8000";
const TEAM_ID = 1; 

export function Tasks() {
  // 기존 상태 관리 변수 및 필터 로직 유지
  const [filterMyTasks, setFilterMyTasks] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 필터링용 임시 사용자 이름 (백엔드 데이터의 assignee_name과 매핑)
  const currentUser = "오소원";

  // 서버로부터 받아올 업무 상태 관리
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 모달창 폼 입력값 상태 관리
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  // ────────────────────────────────────────────
  // 로컬스토리지 토큰 주입 공통 헬퍼 함수
  // ────────────────────────────────────────────
  const getAuthHeaders = () => {
    // 로그인 시 저장된 토큰 가져오기 (만약 키 이름이 다르면 "token"을 수정하세요)
    const token = localStorage.getItem("token") || localStorage.getItem("access_token"); 
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ────────────────────────────────────────────
  // API 비동기 통신 함수 (Axios)
  // ────────────────────────────────────────────

  // 1. 데이터베이스에서 업무 전체 목록 조회 (GET) - 토큰 및 경로 반영
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${BASE_IP}/api/teams/${TEAM_ID}/tasks`, 
        getAuthHeaders() // 토큰 자동 주입
      );
      
      // 안전장치: 서버 응답이 배열이 맞는지 검증
      if (res.data && Array.isArray(res.data)) {
        setTasks(res.data);
      } else {
        console.warn("응답 데이터가 배열 형식이 아닙니다.");
        setTasks([]);
      }
    } catch (error) {
      console.error("데이터를 불러오는 중 오류 발생:", error);
      setTasks(DUMP_TASKS); // 에러 발생 시 화면 보호용 덤프 데이터 출력
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 최초 1회 실행
  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. 데이터베이스에 새 업무 생성 등록 (POST) - 토큰 및 규격 수정
  const handleAddTask = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    // Swagger 명세서 규격에 맞게 변수명 매핑 (task_name, due_date)
    const params: CreateTaskParams = {
      task_name: newTitle,
      due_date: newDueDate,
    };

    try {
      await axios.post(
        `${BASE_IP}/api/teams/${TEAM_ID}/tasks`, 
        params, 
        getAuthHeaders() //토큰 자동 주입
      );
      await fetchTasks(); // 등록 성공 후 목록 갱신

      // 폼 리셋 및 모달 닫기
      setNewTitle("");
      setNewDueDate("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("업무 추가 중 오류 발생:", error);
      // 로컬 화면 테스트용 가상 데이터 추가 생성 (서버 오프라인 대비)
      const fakeNewTask: Task = {
        id: Date.now(),
        team_id: TEAM_ID,
        assignee_id: 0,
        assignee_name: currentUser,
        task_name: params.task_name,
        due_date: params.due_date,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setTasks(Array.isArray(tasks) ? [...tasks, fakeNewTask] : [fakeNewTask]);
      setIsModalOpen(false);
    }
  };

  // 3. 데이터베이스에서 업무 삭제 (DELETE) - 토큰 반영
  const handleDeleteTask = async (id: number) => {
    if (!confirm("이 업무를 정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(
        `${BASE_IP}/api/tasks/${id}`, 
        getAuthHeaders() // 토큰 자동 주입
      );
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("업무 삭제 중 오류 발생:", error);
      if (Array.isArray(tasks)) {
        setTasks(tasks.filter((task) => task.id !== id));
      }
    }
  };

  // 4. 진행 상태 순구조 변경 기능 (PATCH) - 토큰 및 Swagger 경로/바디 규격 반영
  const handleToggleStatus = async (id: number, currentStatus: string) => {
    let nextStatus = "pending";

    if (currentStatus === "pending") {
      nextStatus = "in-progress";
    } else if (currentStatus === "in-progress") {
      nextStatus = "completed";
    } else {
      nextStatus = "pending";
    }

    // 현재 클릭한 태스크 정보 찾기
    const targetTask = tasks.find(t => t.id === id);
    if (!targetTask) return;

    // PATCH 바디 규격 매핑
    const patchBody = {
      task_name: targetTask.task_name,
      due_date: targetTask.due_date,
      status: nextStatus
    };

    try {
      // 명세서에 명시된 PATCH /api/tasks/{task_id} 경로 호출
      await axios.patch(
        `${BASE_IP}/api/tasks/${id}`, 
        patchBody, 
        getAuthHeaders() // 토큰 자동 주입
      );
      
      // 현재 화면 리스트 갱신
      setTasks(tasks.map((task) => (task.id === id ? { ...task, status: nextStatus } : task)));
    } catch (error) {
      console.error("상태 업데이트 중 오류 발생:", error);
      if (Array.isArray(tasks)) {
        setTasks(tasks.map((task) => (task.id === id ? { ...task, status: nextStatus } : task)));
      }
    }
  };

  // ────────────────────────────
  // UI 디자인 및 데이터 가공
  // ────────────────────────────
  
  // 데이터가 배열인지 검증
  const currentTasks = Array.isArray(tasks) ? tasks : [];

  // 내 업무 보기 필터링 로직 
  const displayedTasks = filterMyTasks
    ? currentTasks.filter((task) => task.assignee_name === currentUser)
    : currentTasks;

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
    <div className="p-8 relative">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📝</span>
            <h1 className="text-3xl font-bold text-gray-900">업무 관리</h1>
          </div>
          <p className="text-gray-600 mt-1">팀 업무를 관리하고 추적하세요</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setFilterMyTasks(!filterMyTasks)}
            className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${
              filterMyTasks
                ? "bg-gradient-to-r from-amber-600 to-orange-500 text-white border-amber-600 shadow-md"
                : "bg-white text-gray-700 border-amber-200 hover:bg-amber-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            내 업무만 보기
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-full hover:from-amber-700 hover:to-orange-600 transition-all flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            할 일 추가
          </button>
        </div>
      </div>

      {/* 로딩 표시 */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-500 bg-white rounded-3xl border border-amber-100">
          데이터를 불러오는 중입니다...
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-md overflow-hidden border border-amber-100">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">업무명</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">담당자</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">마감일</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">진행 상태</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {displayedTasks.map((task) => (
                <tr key={task.id} className="hover:bg-amber-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{task.task_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-500 rounded-full flex items-center justify-center text-white text-sm shadow-sm">
                        {task.assignee_name ? task.assignee_name.charAt(0) : "본"}
                      </div>
                      <span className="text-gray-700">{task.assignee_name || "본인"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700">{task.due_date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(task.id, task.status)}
                      className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-transform duration-100 active:scale-95 ${getStatusColor(task.status)}`}
                      title="클릭하여 상태 변경"
                    >
                      {getStatusText(task.status)}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                      title="업무 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 신규 업무 할당 모달창 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-amber-100">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>➕</span> 새 업무 추가
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">업무명</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="업무 내용을 입력하세요"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">마감일</label>
                <input 
                  type="date" 
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-sm"
                  required
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors text-sm"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white rounded-xl font-medium shadow-md transition-all text-sm"
                >
                  추가하기
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────
//더미 데이터 
// ────────────────────────────────────────────
const DUMP_TASKS: Task[] = [
  { id: 1, team_id: 1, assignee_id: 10, assignee_name: "박미소", task_name: "UI 디자인 초안 제출", due_date: "2026-03-16", status: "in-progress", created_at: "", updated_at: "" },
  { id: 2, team_id: 1, assignee_id: 11, assignee_name: "송희경", task_name: "데이터베이스 스키마 설계", due_date: "2026-03-17", status: "in-progress", created_at: "", updated_at: "" },
  { id: 3, team_id: 1, assignee_id: 12, assignee_name: "고명주", task_name: "API 명세서 작성", due_date: "2026-03-18", status: "pending", created_at: "", updated_at: "" },
  { id: 4, team_id: 1, assignee_id: 13, assignee_name: "오소원", task_name: "프론트엔드 개발", due_date: "2026-03-20", status: "in-progress", created_at: "", updated_at: "" },
  { id: 5, team_id: 1, assignee_id: 14, assignee_name: "민지원", task_name: "테스트 케이스 작성", due_date: "2026-03-19", status: "pending", created_at: "", updated_at: "" },
  { id: 6, team_id: 1, assignee_id: 15, assignee_name: "이채현", task_name: "발표 자료 제작", due_date: "2026-03-18", status: "completed", created_at: "", updated_at: "" },
];