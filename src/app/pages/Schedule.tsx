import { useState } from "react";
import {
  Bot, Plus, Trash2, Sparkles, ChevronDown, ChevronUp,
  CheckCircle, Clock, Edit2, ChevronLeft, ChevronRight, X, CalendarDays,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type ManualEvent = {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
};

type AITask = {
  task_name: string;
  start_date: string;
  due_date: string;
};

type Session = {
  id: number;
  goal: string;
  deadline: string;
  status: "pending" | "completed";
  created_at: string;
  tasks: AITask[];
  color: string;
};

type EventBar = {
  id: string;
  label: string;
  color: string;
  startCol: number;
  endCol: number;
  lane: number;
  startsHere: boolean;
  endsHere: boolean;
};

type View = "list" | "step1" | "step2";

// ── Color map ──────────────────────────────────────────────────────────────

type ColorKey = "blue" | "violet" | "emerald" | "rose" | "amber" | "orange";

const colorMap: Record<ColorKey, { bar: string; accent: string; dot: string; chip: string }> = {
  blue:    { bar: "bg-blue-50 text-blue-600",     accent: "bg-blue-400",    dot: "bg-blue-400",    chip: "bg-blue-100 text-blue-800 border-blue-200" },
  violet:  { bar: "bg-violet-50 text-violet-600", accent: "bg-violet-400",  dot: "bg-violet-400",  chip: "bg-violet-100 text-violet-800 border-violet-200" },
  emerald: { bar: "bg-emerald-50 text-emerald-600", accent: "bg-emerald-400", dot: "bg-emerald-400", chip: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  rose:    { bar: "bg-rose-50 text-rose-600",     accent: "bg-rose-400",    dot: "bg-rose-400",    chip: "bg-rose-100 text-rose-800 border-rose-200" },
  amber:   { bar: "bg-amber-50 text-amber-600",   accent: "bg-amber-400",   dot: "bg-amber-400",   chip: "bg-amber-100 text-amber-800 border-amber-200" },
  orange:  { bar: "bg-orange-50 text-orange-600", accent: "bg-orange-400",  dot: "bg-orange-400",  chip: "bg-orange-100 text-orange-800 border-orange-200" },
};

const SESSION_COLORS: ColorKey[] = ["blue", "violet", "emerald", "rose", "amber"];

// ── Helpers ────────────────────────────────────────────────────────────────

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function toStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function generateAIDates(taskNames: string[], deadline: string): AITask[] {
  const today = new Date().toISOString().split("T")[0];
  const totalMs = new Date(deadline).getTime() - new Date(today).getTime();
  const totalDays = Math.max(taskNames.length, Math.floor(totalMs / (1000 * 60 * 60 * 24)));
  const daysEach = Math.floor(totalDays / taskNames.length);
  return taskNames.map((name, i) => ({
    task_name: name,
    start_date: addDays(today, i * daysEach),
    due_date: i === taskNames.length - 1 ? deadline : addDays(today, (i + 1) * daysEach - 1),
  }));
}

// ── Component ──────────────────────────────────────────────────────────────

export function Schedule() {
  const isLeader = true;

  // ── Data ──────────────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 1,
      goal: "mid 발표 준비",
      deadline: "2026-05-20",
      status: "pending",
      created_at: "2026-05-02",
      color: "blue",
      tasks: [
        { task_name: "API 명세서 마무리",  start_date: "2026-05-02", due_date: "2026-05-08" },
        { task_name: "ERD 완료",           start_date: "2026-05-09", due_date: "2026-05-13" },
        { task_name: "피그마 완성",         start_date: "2026-05-02", due_date: "2026-05-15" },
        { task_name: "발표 자료 작성",      start_date: "2026-05-16", due_date: "2026-05-20" },
      ],
    },
  ]);

  const [manualEvents, setManualEvents] = useState<ManualEvent[]>([
    { id: 1, title: "팀 미팅", start_date: "2026-05-07", end_date: "2026-05-07" },
  ]);

  // ── UI ────────────────────────────────────────────────────────────────────
  const [view, setView]               = useState<View>("list");
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<number | null>(1);

  // Manual event modal
  const [showEventModal, setShowEventModal] = useState(false);
  const [evtTitle, setEvtTitle] = useState("");
  const [evtStart, setEvtStart] = useState("");
  const [evtEnd,   setEvtEnd]   = useState("");

  // AI Step 1
  const [goal,       setGoal]       = useState("");
  const [deadline,   setDeadline]   = useState("");
  const [taskInputs, setTaskInputs] = useState<string[]>(["", "", ""]);

  // AI Step 2
  const [reviewTasks, setReviewTasks] = useState<AITask[]>([]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function addTaskInput()                           { setTaskInputs(p => [...p, ""]); }
  function removeTaskInput(i: number)               { setTaskInputs(p => p.filter((_, idx) => idx !== i)); }
  function changeTaskInput(i: number, val: string)  { setTaskInputs(p => p.map((t, idx) => idx === i ? val : t)); }
  function changeReviewTask(i: number, f: keyof AITask, v: string) {
    setReviewTasks(p => p.map((t, idx) => idx === i ? { ...t, [f]: v } : t));
  }

  function handleGenerateAI() {
    const valid = taskInputs.map(t => t.trim()).filter(Boolean);
    if (!goal.trim() || !deadline || valid.length === 0) return;
    setReviewTasks(generateAIDates(valid, deadline));
    setView("step2");
  }

  function handleConfirm() {
    const color = SESSION_COLORS[sessions.length % SESSION_COLORS.length];
    const s: Session = {
      id: sessions.length > 0 ? Math.max(...sessions.map(s => s.id)) + 1 : 1,
      goal: goal.trim(), deadline, status: "pending",
      created_at: new Date().toISOString().split("T")[0],
      color, tasks: reviewTasks,
    };
    setSessions(p => [s, ...p]);
    setGoal(""); setDeadline(""); setTaskInputs(["", "", ""]); setReviewTasks([]);
    setExpandedSession(s.id);
    setView("list");
  }

  function handleCancel() {
    setGoal(""); setDeadline(""); setTaskInputs(["", "", ""]); setReviewTasks([]);
    setView("list");
  }

  function openEventModal(day?: string) {
    setEvtTitle(""); setEvtStart(day ?? ""); setEvtEnd(day ?? "");
    setShowEventModal(true);
  }

  function handleAddEvent() {
    if (!evtTitle.trim() || !evtStart) return;
    setManualEvents(p => [
      ...p,
      { id: p.length > 0 ? Math.max(...p.map(e => e.id)) + 1 : 1,
        title: evtTitle.trim(), start_date: evtStart, end_date: evtEnd || evtStart },
    ]);
    setShowEventModal(false);
  }

  function deleteSession(id: number) {
    setSessions(p => p.filter(s => s.id !== id));
    if (expandedSession === id) setExpandedSession(null);
  }

  function deleteManualEvent(id: number) {
    setManualEvents(p => p.filter(e => e.id !== id));
  }

  // ── Calendar computation ──────────────────────────────────────────────────
  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  function getDaysGrid(): (number | null)[] {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  function getWeeks(): (string | null)[][] {
    const grid = getDaysGrid();
    const weeks: (string | null)[][] = [];
    for (let i = 0; i < grid.length; i += 7) {
      weeks.push(grid.slice(i, i + 7).map(d => d ? toStr(year, month, d) : null));
    }
    return weeks;
  }

  function getBarsForWeek(week: (string | null)[]): EventBar[] {
    const validDates = week.filter(Boolean) as string[];
    if (validDates.length === 0) return [];
    const weekStart = validDates[0];
    const weekEnd   = validDates[validDates.length - 1];

    const raw: Omit<EventBar, "lane">[] = [];

    // AI tasks
    sessions.forEach(session => {
      session.tasks.forEach((task, ti) => {
        if (task.due_date < weekStart || task.start_date > weekEnd) return;
        const effStart = task.start_date >= weekStart ? task.start_date : weekStart;
        const effEnd   = task.due_date   <= weekEnd   ? task.due_date   : weekEnd;
        const startCol = week.indexOf(effStart);
        const endCol   = week.indexOf(effEnd);
        if (startCol === -1 || endCol === -1) return;
        raw.push({
          id: `ai-${session.id}-${ti}`,
          label: task.task_name,
          color: session.color,
          startCol, endCol,
          startsHere: task.start_date >= weekStart,
          endsHere:   task.due_date   <= weekEnd,
        });
      });
    });

    // Manual events
    manualEvents.forEach(ev => {
      if (ev.end_date < weekStart || ev.start_date > weekEnd) return;
      const effStart = ev.start_date >= weekStart ? ev.start_date : weekStart;
      const effEnd   = ev.end_date   <= weekEnd   ? ev.end_date   : weekEnd;
      const startCol = week.indexOf(effStart);
      const endCol   = week.indexOf(effEnd);
      if (startCol === -1 || endCol === -1) return;
      raw.push({
        id: `manual-${ev.id}`,
        label: ev.title,
        color: "orange",
        startCol, endCol,
        startsHere: ev.start_date >= weekStart,
        endsHere:   ev.end_date   <= weekEnd,
      });
    });

    // Sort: earlier start first, longer bars first
    raw.sort((a, b) => a.startCol - b.startCol || (b.endCol - b.startCol) - (a.endCol - a.startCol));

    // Lane assignment (greedy)
    const laneEnd: number[] = [];
    return raw.map(bar => {
      let lane = laneEnd.findIndex(e => e < bar.startCol);
      if (lane === -1) lane = laneEnd.length;
      laneEnd[lane] = bar.endCol;
      return { ...bar, lane };
    });
  }

  function getEventsForDay(dateStr: string) {
    const manual = manualEvents.filter(e => dateStr >= e.start_date && dateStr <= e.end_date);
    const ai: { label: string; color: string }[] = [];
    sessions.forEach(s => s.tasks.forEach(t => {
      if (dateStr >= t.start_date && dateStr <= t.due_date)
        ai.push({ label: t.task_name, color: s.color });
    }));
    return { manual, ai };
  }

  const todayStr    = new Date().toISOString().split("T")[0];
  const monthNames  = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
  const daysOfWeek  = ["일","월","화","수","목","금","토"];
  const selectedEvts = selectedDay ? getEventsForDay(selectedDay) : null;

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 1
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "step1") return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">AI 일정 도우미</h1>
        </div>
        <p className="text-gray-500 text-sm">목표·마감일·할 일을 입력하면 AI가 일정을 추천해드립니다</p>
      </div>

      <div className="bg-white rounded-3xl shadow-md border border-blue-100 p-7 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">마감 목표</label>
          <input type="text" value={goal} onChange={e => setGoal(e.target.value)}
            placeholder="예: mid 발표"
            className="w-full px-4 py-2.5 border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">마감 일자</label>
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
            className="w-full px-4 py-2.5 border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">해야 할 일</label>
          <div className="space-y-2">
            {taskInputs.map((task, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-blue-300 rounded flex-shrink-0" />
                <input type="text" value={task} onChange={e => changeTaskInput(i, e.target.value)}
                  placeholder="예: API 명세서 마무리하기"
                  className="flex-1 px-4 py-2 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                />
                <button type="button" onClick={() => removeTaskInput(i)}
                  disabled={taskInputs.length === 1}
                  className="p-1 hover:bg-red-50 rounded-full text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addTaskInput}
            className="mt-3 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />할 일 추가
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={handleGenerateAI}
            disabled={!goal.trim() || !deadline || taskInputs.every(t => !t.trim())}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-full hover:from-blue-700 hover:to-indigo-600 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />AI 일정 생성
          </button>
          <button type="button" onClick={handleCancel}
            className="px-6 py-3 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-all"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 2
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "step2") return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900">AI 추천 일정</h1>
        </div>
        <p className="text-gray-500 text-sm">
          <span className="font-semibold text-gray-700">{goal}</span>
          {" · "}마감 <span className="font-semibold text-gray-700">{deadline}</span>
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-md border border-blue-100 p-7">
        <div className="flex items-center gap-2 mb-5">
          <Bot className="w-5 h-5 text-blue-500" />
          <p className="text-sm text-blue-700 font-medium">AI가 추천한 일정입니다. 날짜를 자유롭게 조정해보세요.</p>
        </div>

        <div className="space-y-4">
          {reviewTasks.map((task, i) => (
            <div key={i} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Edit2 className="w-4 h-4 text-blue-500 shrink-0" />
                <p className="font-semibold text-gray-800 text-sm">{task.task_name}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <input type="date" value={task.start_date}
                  onChange={e => changeReviewTask(i, "start_date", e.target.value)}
                  className="px-3 py-1.5 border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                />
                <span className="text-gray-400 text-sm">~</span>
                <input type="date" value={task.due_date}
                  onChange={e => changeReviewTask(i, "due_date", e.target.value)}
                  className="px-3 py-1.5 border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={handleConfirm}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-full hover:from-blue-700 hover:to-indigo-600 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />일정 확정
          </button>
          <button type="button" onClick={() => setView("step1")}
            className="px-6 py-3 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-all"
          >
            다시 입력
          </button>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // LIST ─ 캘린더 + 세션 목록
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="p-8">
      {/* 수동 일정 모달 */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">수동 일정 등록</h2>
              <button type="button" onClick={() => setShowEventModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">일정 제목</label>
                <input type="text" value={evtTitle} onChange={e => setEvtTitle(e.target.value)}
                  placeholder="예: 팀 미팅"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                  <input type="date" value={evtStart} onChange={e => setEvtStart(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                  <input type="date" value={evtEnd} onChange={e => setEvtEnd(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={handleAddEvent}
                disabled={!evtTitle.trim() || !evtStart}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                등록
              </button>
              <button type="button" onClick={() => setShowEventModal(false)}
                className="px-6 py-3 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📅</span>
            <h1 className="text-3xl font-bold text-gray-900">일정 관리</h1>
          </div>
          <p className="text-gray-600 text-sm">캘린더에서 팀 일정을 확인하고 관리하세요</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => openEventModal()}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-all"
          >
            <CalendarDays className="w-4 h-4" />수동 등록
          </button>
          {isLeader && (
            <button type="button" onClick={() => setView("step1")}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-full hover:from-blue-700 hover:to-indigo-600 transition-all shadow-md"
            >
              <Bot className="w-4 h-4" />AI 일정 도우미
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── 캘린더 ────────────────────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl shadow-md border border-blue-100 overflow-hidden">
            {/* 월 네비게이션 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {year}년 {monthNames[month]}
              </h2>
              <div className="flex gap-1">
                <button type="button"
                  onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                  className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button type="button"
                  onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                  className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {daysOfWeek.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-blue-800 py-2">{d}</div>
              ))}
            </div>

            {/* 주 rows */}
            {getWeeks().map((week, wIdx) => {
              const bars = getBarsForWeek(week);
              const maxLane = bars.length > 0 ? Math.max(...bars.map(b => b.lane)) + 1 : 0;

              return (
                <div key={wIdx} className="border-b border-gray-100 last:border-0">
                  {/* 날짜 숫자 행 */}
                  <div className="grid grid-cols-7">
                    {week.map((dateStr, colIdx) => {
                      if (!dateStr) return <div key={`empty-${colIdx}`} className="h-10" />;
                      const day = new Date(dateStr).getDate();
                      const isToday    = dateStr === todayStr;
                      const isSelected = dateStr === selectedDay;
                      return (
                        <button
                          key={dateStr}
                          type="button"
                          onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                          className="h-10 flex items-center justify-center"
                        >
                          <span className={`
                            w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all
                            ${isToday ? "bg-blue-600 text-white shadow-sm" : ""}
                            ${isSelected && !isToday ? "ring-2 ring-blue-300 text-blue-700" : ""}
                            ${!isToday && !isSelected ? "text-gray-700 hover:bg-gray-100" : ""}
                          `}>
                            {day}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 이벤트 바 행 */}
                  {maxLane > 0 && (
                    <div
                      className="grid grid-cols-7 px-0.5 pb-1.5"
                      style={{ gridAutoRows: "22px", minHeight: `${maxLane * 24}px` }}
                    >
                      {bars.map(bar => {
                        const c = colorMap[bar.color as ColorKey] ?? colorMap.blue;
                        return (
                          <div
                            key={bar.id}
                            title={bar.label}
                            style={{
                              gridColumn: `${bar.startCol + 1} / ${bar.endCol + 2}`,
                              gridRow: bar.lane + 1,
                            }}
                            className={`
                              flex items-center h-5 text-xs font-medium overflow-hidden mt-0.5
                              ${c.bar}
                              ${bar.startsHere ? "rounded-l-full" : "rounded-l-none -ml-0.5"}
                              ${bar.endsHere   ? "rounded-r-full" : "rounded-r-none -mr-0.5"}
                            `}
                          >
                            {bar.startsHere && (
                              <>
                                <span className={`w-1 h-3 rounded-full shrink-0 ml-1.5 mr-1 ${c.accent}`} />
                                <span className="truncate pr-2">{bar.label}</span>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* 범례 */}
            <div className="flex flex-wrap gap-4 px-6 py-3 border-t border-gray-100 bg-gray-50">
              <span className="text-xs text-gray-400 font-medium">범례</span>
              {sessions.map(s => (
                <div key={s.id} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className={`w-3 h-3 rounded-sm ${colorMap[s.color as ColorKey]?.bar.split(" ")[0]}`} />
                  {s.goal}
                </div>
              ))}
              {manualEvents.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="w-3 h-3 rounded-sm bg-orange-200" />수동 일정
                </div>
              )}
            </div>
          </div>

          {/* 선택된 날 패널 */}
          {selectedDay && (
            <div className="bg-white rounded-3xl shadow-md border border-blue-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{selectedDay} 일정</h3>
                <button type="button" onClick={() => openEventModal(selectedDay)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />일정 추가
                </button>
              </div>
              {selectedEvts && selectedEvts.manual.length + selectedEvts.ai.length === 0 && (
                <p className="text-sm text-gray-400">이 날의 일정이 없습니다</p>
              )}
              <div className="space-y-2">
                {selectedEvts?.ai.map((e, i) => (
                  <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-2xl border text-sm ${colorMap[e.color as ColorKey]?.chip}`}>
                    <Bot className="w-3.5 h-3.5 shrink-0" />{e.label}
                    <span className="ml-auto text-xs opacity-50">AI</span>
                  </div>
                ))}
                {selectedEvts?.manual.map(e => (
                  <div key={e.id} className="flex items-center gap-2 px-3 py-2 rounded-2xl border text-sm bg-orange-50 border-orange-200 text-orange-800">
                    <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                    <span className="flex-1 truncate">{e.title}</span>
                    {e.start_date !== e.end_date && (
                      <span className="text-xs opacity-60">~ {e.end_date}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteManualEvent(e.id)}
                      className="p-0.5 hover:bg-orange-100 rounded-full text-orange-400 hover:text-red-500 transition-colors shrink-0"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── AI 세션 목록 ──────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />AI 일정 세션
          </h2>

          {sessions.length === 0 && (
            <div className="bg-white rounded-3xl border border-blue-100 p-8 text-center">
              <Bot className="w-10 h-10 text-blue-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">생성된 AI 일정이 없습니다</p>
            </div>
          )}

          {sessions.map(session => (
            <div key={session.id} className="bg-white rounded-3xl shadow-md border border-blue-100 overflow-hidden">
              <div className="p-4 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-2.5 h-2.5 rounded-sm shrink-0 ${colorMap[session.color as ColorKey]?.bar.split(" ")[0]}`} />
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                        session.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {session.status === "completed" ? "완료" : "진행중"}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm truncate">{session.goal}</p>
                    <p className="text-xs text-gray-500 mt-0.5">마감 {session.deadline}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); deleteSession(session.id); }}
                      className="p-1 hover:bg-red-50 rounded-full text-red-400 hover:text-red-600 transition-colors"
                      title="세션 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {expandedSession === session.id
                      ? <ChevronUp   className="w-4 h-4 text-gray-400" />
                      : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
              </div>

              {expandedSession === session.id && (
                <div className="border-t border-blue-50 px-4 pb-4 pt-3 space-y-2">
                  {session.tasks.map((task, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 bg-blue-50 rounded-2xl border border-blue-100">
                      <Clock className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-800">{task.task_name}</p>
                        <p className="text-xs text-gray-500">{task.start_date} ~ {task.due_date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="bg-gradient-to-br from-blue-600 to-indigo-500 rounded-3xl p-5 text-white shadow-md">
            <div className="flex justify-between mb-2">
              <span className="text-sm opacity-80">완료</span>
              <span className="font-bold">{sessions.filter(s => s.status === "completed").length}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm opacity-80">진행 중</span>
              <span className="font-bold">{sessions.filter(s => s.status === "pending").length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm opacity-80">수동 일정</span>
              <span className="font-bold">{manualEvents.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
