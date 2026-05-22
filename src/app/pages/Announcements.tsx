import { Pin, Bell } from "lucide-react";

export function Announcements() {
  const pinnedAnnouncements = [
    {
      id: 1,
      title: "[중요] 이번 주 금요일 최종 발표",
      author: "박미소",
      date: "2026-03-15",
      content:
        "최종 발표가 3월 19일(금) 오후 2시에 예정되어 있습니다. 발표 자료는 목요일까지 완성해주세요. 발표 시간은 팀당 15분이며, 질의응답 5분이 포함됩니다.",
      isPinned: true,
    },
    {
      id: 2,
      title: "중간 점검 회의 일정 공지",
      author: "박미소",
      date: "2026-03-12",
      content:
        "3월 16일(수) 오후 4시에 중간 점검 회의를 진행합니다. 각자 진행 상황을 정리해서 공유해주세요.",
      isPinned: true,
    },
  ];

  const announcements = [
    {
      id: 3,
      title: "회의록 작성 안내",
      author: "송희경",
      date: "2026-03-14",
      content:
        "회의가 끝난 후에는 회의록을 자료실에 업로드 부탁드립니다. 템플릿은 자료실에 있습니다.",
      isPinned: false,
    },
    {
      id: 4,
      title: "개발 환경 설정 가이드",
      author: "고명주",
      date: "2026-03-13",
      content:
        "프론트엔드 개발을 위한 환경 설정 가이드를 자료실에 업로드했습니다. 참고해주세요.",
      isPinned: false,
    },
    {
      id: 5,
      title: "역할 분담 확정",
      author: "박미소",
      date: "2026-03-10",
      content:
        "각자의 역할이 확정되었습니다. 업무 관리 페이지에서 확인 가능합니다.",
      isPinned: false,
    },
    {
      id: 6,
      title: "프로젝트 킥오프 회의 결과",
      author: "박미소",
      date: "2026-03-08",
      content:
        "킥오프 회의에서 논의된 내용을 정리했습니다. 프로젝트 목표와 일정을 확인해주세요.",
      isPinned: false,
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">📢</span>
          <h1 className="text-3xl font-bold text-gray-900">공지사항</h1>
        </div>
        <p className="text-gray-600 mt-1">팀 공지사항을 확인하세요</p>
      </div>

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Pin className="w-5 h-5 text-amber-700" />
            고정된 공지
          </h2>
          <div className="space-y-4">
            {pinnedAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 shadow-md"
              >
                <div className="flex items-start gap-3">
                  <Pin className="w-5 h-5 text-amber-700 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {announcement.title}
                    </h3>
                    <p className="text-gray-700 mb-3">{announcement.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>작성자: {announcement.author}</span>
                      <span>·</span>
                      <span>{announcement.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Announcements */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-600" />
          일반 공지
        </h2>
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-white rounded-3xl shadow-md p-6 hover:shadow-lg transition-all border border-amber-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {announcement.title}
              </h3>
              <p className="text-gray-700 mb-3">{announcement.content}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>작성자: {announcement.author}</span>
                <span>·</span>
                <span>{announcement.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}