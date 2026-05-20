import { useState } from "react";
import {
  Calendar,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";

export function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 15)); // March 15, 2026

  const teamMembers = [
    "박미소",
    "송희경",
    "고명주",
    "오소원",
    "민지원",
    "이채현",
  ];

  const [meetings, setMeetings] = useState([
    {
      id: 1,
      date: "2026-03-16",
      time: "16:00",
      title: "중간 점검 회의",
      description: "진행 상황 공유 및 이슈 논의",
    },
    {
      id: 2,
      date: "2026-03-18",
      time: "14:00",
      title: "발표 자료 검토",
      description: "최종 발표 자료 피드백",
    },
    {
      id: 3,
      date: "2026-03-19",
      time: "14:00",
      title: "최종 발표",
      description: "프로젝트 최종 발표 및 시연",
    },
  ]);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});

  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

  const getDateStrFromDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const hasMeeting = (day: number | null) => {
    if (!day) return false;
    const dateStr = getDateStrFromDay(day);
    return meetings.some((meeting) => meeting.date === dateStr);
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date(2026, 2, 15); // March 15, 2026
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const selectedDateStr =
    selectedDay != null ? getDateStrFromDay(selectedDay) : null;

  const availableMembers =
    selectedDateStr != null
      ? teamMembers.filter((m) => availability[`${selectedDateStr}-${m}`])
      : [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">📅</span>
          <h1 className="text-3xl font-bold text-gray-900">일정 관리</h1>
        </div>
        <p className="text-gray-600 mt-1">팀 일정과 회의를 관리하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-md p-6 border border-amber-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-amber-50 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-amber-50 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-blue-800 py-2"
              >
                {day}
              </div>
            ))}
            {getDaysInMonth(currentDate).map((day, index) => (
              <div
                key={index}
                onClick={() => day != null && setSelectedDay(day)}
                className={`aspect-square flex items-center justify-center rounded-2xl relative ${
                  day
                    ? isToday(day)
                      ? "bg-gradient-to-br from-blue-600 to-indigo-500 text-white font-semibold shadow-md"
                      : hasMeeting(day)
                      ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 font-medium"
                      : "hover:bg-blue-50 text-gray-700"
                    : ""
                } transition-all cursor-pointer ${
                  day != null && selectedDay === day
                    ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-white"
                    : ""
                }`}
              >
                {day}
                {day && hasMeeting(day) && !isToday(day) && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              disabled={selectedDay == null}
              onClick={() => {
                if (selectedDateStr == null || selectedDay == null) return;
                const nextTitle = "회의 일정 생성";
                const nextDescription =
                  availableMembers.length > 0
                    ? `가능자: ${availableMembers.join(", ")}`
                    : "가능자 없음(기본 일정)";

                setMeetings((prev) => {
                  const nextId =
                    prev.length > 0 ? Math.max(...prev.map((m) => m.id)) + 1 : 1;

                  return [
                    {
                      id: nextId,
                      date: selectedDateStr,
                      time: "14:00",
                      title: nextTitle,
                      description: nextDescription,
                    },
                    ...prev,
                  ];
                });

                setSelectedDay(null);
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-full hover:from-blue-700 hover:to-indigo-600 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              회의 일정 생성
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-md p-6 border border-amber-100">
          {/* Team Availability */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              팀원별 가능한 날짜
            </h2>
            <p className="text-sm text-gray-600">
              캘린더에서 날짜를 선택하면, 해당 날짜의 가능 여부를 체크할 수 있습니다.
            </p>

            <div className="mt-4">
              {selectedDateStr ? (
                <>
                  <div className="text-sm text-blue-700 font-semibold mb-3">
                    선택 날짜: {selectedDateStr}
                  </div>

                  <div className="space-y-2">
                    {teamMembers.map((member) => {
                      const key = `${selectedDateStr}-${member}`;
                      const checked = availability[key] ?? false;

                      return (
                        <label
                          key={member}
                          className="flex items-center justify-between bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-2xl border border-blue-100 transition-colors cursor-pointer"
                        >
                          <span className="text-sm font-medium text-gray-800">
                            {member}
                          </span>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const next = e.target.checked;
                              setAvailability((prev) => ({
                                ...prev,
                                [key]: next,
                              }));
                            }}
                          />
                        </label>
                      );
                    })}
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    선택된 가능자:{" "}
                    <span className="font-semibold text-blue-700">
                      {availableMembers.length}명
                    </span>
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
            <Calendar className="w-5 h-5 text-blue-600" />
            예정된 회의
          </h2>
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="p-4 border border-blue-200 rounded-2xl hover:border-blue-400 transition-all hover:shadow-md bg-gradient-to-br from-blue-50 to-indigo-50"
              >
                <div className="flex items-start gap-3 mb-2">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {meeting.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {meeting.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-blue-800 font-medium">
                      <span>{meeting.date}</span>
                      <span>·</span>
                      <span>{meeting.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}