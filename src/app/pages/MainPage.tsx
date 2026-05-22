import { Link } from "react-router";
import {
  Calendar,
  ListTodo,
  MessageCircle,
  Share2,
  Star,
} from "lucide-react";

export function MainPage() {
  const myTeams = [
    {
      id: 1,
      name: "클라우드 컴퓨팅 팀프로젝트",
      course: "웹프로그래밍",
      members: ["박미소", "송희경", "고명주", "오소원"],
      status: "진행중",
      progress: 65,
      dueDate: "2026-03-19",
    },
    {
      id: 2,
      name: "운영체제 팀플",
      course: "데이터베이스",
      members: ["민지원", "이채현", "박미소"],
      status: "진행중",
      progress: 40,
      dueDate: "2026-03-25",
    },
    {
      id: 3,
      name: "쿠피사이트 개발",
      course: "인공지능",
      members: ["송희경", "고명주", "민지원", "오소원"],
      status: "진행중",
      progress: 80,
      dueDate: "2026-03-20",
    },
  ];

  const featureCards = [
    {
      title: "일정 관리",
      description: "팀 회의와 마감 일정을 한눈에 정리합니다.",
      to: "/team/schedule",
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      title: "팀 회의",
      description: "회의 일정과 커뮤니케이션을 한 공간에서 진행합니다.",
      to: "/team/chat",
      icon: <MessageCircle className="w-6 h-6" />,
    },
    {
      title: "업무 분담",
      description: "담당자/마감일/진행 상태로 업무를 추적하세요.",
      to: "/team/tasks",
      icon: <ListTodo className="w-6 h-6" />,
    },
    {
      title: "자료 공유",
      description: "PPT/문서/PDF 등 팀 자료를 깔끔하게 관리합니다.",
      to: "/team/files",
      icon: <Share2 className="w-6 h-6" />,
    },
    {
      title: "상호 평가",
      description: "참여도와 소통을 기준으로 팀원을 평가합니다.",
      to: "/team/evaluation",
      icon: <Star className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-4xl">🐻</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
              TeamTeam
            </span>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-blue-700 hover:bg-blue-50 rounded-full transition-colors">
              로그인
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-full hover:from-blue-700 hover:to-indigo-600 transition-all shadow-md">
              회원가입
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-7xl mb-6">🐻</div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          대학생 팀플을 위한
          <br />
          <span className="bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
            올인원 협업 플랫폼
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          일정 관리부터 자료 공유까지, 팀 프로젝트에 필요한 모든 것을 한곳에서
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-full text-lg hover:from-blue-700 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl">
            🐻 팀 찾기
          </button>
          <button className="px-8 py-4 bg-white text-blue-700 border-2 border-blue-600 rounded-full text-lg hover:bg-blue-50 transition-colors shadow-md">
            + 팀 만들기
          </button>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">주요 기능</h2>
          <p className="text-gray-600 mt-2">
            팀 프로젝트에 필요한 일정을 관리하고, 업무를 분담하며, 자료를 공유하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group bg-white/80 backdrop-blur border border-blue-100 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md">
                  {card.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="font-medium text-blue-700">바로가기</span>
                <span className="text-blue-500 group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* (Optional) teams preview: keep placeholder data to avoid empty-state UX */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">내 팀 한눈에 보기</h2>
            <Link
              to="/team"
              className="text-blue-700 hover:text-blue-900 font-medium"
            >
              대시보드로 이동 →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myTeams.map((team) => (
              <Link
                key={team.id}
                to="/team"
                className="bg-white/80 backdrop-blur p-6 rounded-3xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-blue-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {team.name}
                    </h3>
                    <p className="text-sm text-gray-600">{team.course}</p>
                  </div>
                  <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 text-green-700 rounded-full text-sm font-medium">
                    {team.status}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>진행률</span>
                    <span className="text-blue-700 font-medium">
                      {team.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${team.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>마감: {team.dueDate}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-sky-50 to-indigo-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>© 2026 TeamTeam 🐻. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}