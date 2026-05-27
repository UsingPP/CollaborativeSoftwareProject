import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate, useParams } from "react-router";
import { Home, Bell, Calendar, ListTodo, FolderOpen, MessageCircle, Star, ChevronDown, Check, Palette } from "lucide-react";
import { useTheme, themes } from "../contexts/ThemeContext";
import { login, logout } from "../store/authSlice";
import { RootState } from "../store";
import { Team } from "../types/tpyes";
import { useDispatch, UseDispatch, useSelector } from "react-redux";
import { fetchMyteams } from "../pages/MainPage";

const TEAMS = [
  { id: 1, name: "웹 개발 프로젝트" },
  { id: 2, name: "모바일 앱 프로젝트" },
  { id: 3, name: "데이터 분석 프로젝트" },
];

const THEME_COLORS: Record<string, string> = {
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
  dark: "bg-slate-600",
};

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { teamId } = useParams();

  const { theme, setThemeName } = useTheme();

  const [myTeams, setMyteams] = useState<Team[]>([]);

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);


  const [showTeamDropdown, setShowTeamDropdown] = useState(false);


  const menuItems = [
    { path: `/team/${teamId}`, icon: Home, label: "홈" },
    { path: `/team/${teamId}/announcements`, icon: Bell, label: "공지사항" },
    { path: `/team/${teamId}/tasks`, icon: ListTodo, label: "업무 관리" },
    { path: `/team/${teamId}/schedule`, icon: Calendar, label: "일정" },
    { path: `/team/${teamId}/files`, icon: FolderOpen, label: "자료실" },
    { path: `/team/${teamId}/chat`, icon: MessageCircle, label: "채팅" },
    { path: `/team/${teamId}/evaluation`, icon: Star, label: "상호 평가" },
  ];

  
  const dumpTeams : Team[] = [ {id : 1, subject_name : "1번 과목"}, {id : 2, subject_name : "2번 과목"} ];

  useEffect(() => {
    const fatchTeams = async () => {
      try {
        const teams = await fetchMyteams();
        console.log(teams);
        if (teams.length === 0) {
          throw new Error("에러가 발생했습니다!");
        }
        setMyteams(teams);

        const currentTeam = teams.find(team => String(team.id) === String(teamId));

        if (currentTeam) {
          setSelectedTeam(currentTeam);
        }
      } catch (err) { 
        console.log(1);
        setMyteams(dumpTeams);
        const currentTeam =  dumpTeams[0];
        setSelectedTeam(currentTeam);
       }
    };
    fatchTeams();
  }, [teamId]
  );


   if (!selectedTeam) {
     return <div className="p-8 text-center text-slate-500">데이터를 불러오는 중입니다...</div>; 
   }

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shadow-sm shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2.5">
            <div className={`w-8 h-8 ${theme.gradientBg} rounded-xl flex items-center justify-center text-white text-sm shadow-sm`}>
              🐻
            </div>
            <span className={`text-lg font-bold bg-gradient-to-r ${theme.logoText} bg-clip-text text-transparent`}>
              TeamTeam
            </span>
          </Link>
        </div>

        {/* Team Switcher */}
        <div className="px-5 py-3 border-b border-slate-100 relative">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">현재 팀</p>
          <button
            type="button"
            onClick={() => setShowTeamDropdown(!showTeamDropdown)}
            className="w-full flex items-center justify-between gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            <span className="truncate">{selectedTeam.subject_name}</span>
            <ChevronDown className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform ${showTeamDropdown ? "rotate-180" : ""}`} />
          </button>
          {showTeamDropdown && (
            <div className="absolute left-3 right-3 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
              {
                myTeams.map(team => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => { setSelectedTeam(team); setShowTeamDropdown(false); navigate(`/team/${team.id}`) }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${selectedTeam.id === team.id
                        ? `${theme.bgLight} ${theme.textDark} font-medium`
                        : "text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    {selectedTeam.id === team.id
                      ? <Check className={`w-3.5 h-3.5 shrink-0 ${theme.textAccent}`} />
                      : <span className="w-3.5 shrink-0" />
                    }
                    <span>{team.subject_name}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          <ul className="space-y-0.5">
            {menuItems.map(item => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${isActive ? theme.navActive : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? theme.navActiveIcon : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Theme Picker */}
        <div className="px-5 py-3 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">테마</span>
          </div>
          <div className="flex gap-2">
            {Object.entries(THEME_COLORS).map(([name, colorClass]) => (
              <button
                key={name}
                type="button"
                onClick={() => setThemeName(name)}
                title={themes[name].label}
                className={`w-5 h-5 rounded-full ${colorClass} transition-all ${theme.name === name
                    ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                    : "opacity-60 hover:opacity-100 hover:scale-110"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Profile */}
        <div className="px-3 pb-4 border-t border-slate-100 pt-3">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className={`w-8 h-8 ${theme.gradientBg} rounded-full flex items-center justify-center text-white text-xs shadow-sm shrink-0`}>
              🐻
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">박미소</p>
              <p className="text-xs text-slate-400 truncate">내 프로필</p>
            </div>
          </Link>
        </div>
      </aside>
      

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
