import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import axios from 'axios'
import {
  Calendar,
  ListTodo,
  MessageCircle,
  Share2,
  Star,
  ChevronDown,
  LogOut,
  User,
  Users,
} from "lucide-react";
import { useDispatch, UseDispatch, useSelector } from "react-redux";
import { login, logout, setMyTeamList } from "../store/authSlice"
import { RootState } from "../store";
import { Team } from "../types/tpyes";

// ────────────────────────────────────────────
// 타입(임시)
// ────────────────────────────────────────────

interface CreateTeamParams {
  team_name : string;
  subject_name : string;
  invite_code : string;
  deadline?: string;
  leader_id : string
}

// ────────────────────────────────────────────
// API 호출부 & 로그인 관리
// ────────────────────────────────────────────

const fetchMyteams = async (userId : string | null) : Promise<Team[]> => {
  // 실제 구현 시 fetch로 교체할 부분
  await new Promise((resolve) => setTimeout(resolve, 800)); // 로딩 시뮬레이션

  return MY_TEAMS;
}


// ────────────────────────────────────────────
// 더미 데이터
// ────────────────────────────────────────────
const MY_TEAMS: Team[] = [
  {
    id: 1,
    subject_name: "클라우드 컴퓨팅 팀프로젝트",
  },
  {
    id: 2,
    subject_name: "운영체제 팀플",
  },
  {
    id: 3,
    subject_name: "쿠피사이트 개발",

  },
];

const CreateTeamParamsDump = {
    team_name: "프로젝트 팀 A",
    subject_name: "소프트웨어공학",
    invite_code: "ABC123",
    deadline: "2025-12-31",
    leader_id: "1"
}


// ────────────────────────────────────────────
// 팀 드롭다운
// ────────────────────────────────────────────
function TeamDropdown({
  teams,
  selectedTeam,
  onSelect,
}: {
  teams: Team[];
  selectedTeam: Team | null;
  onSelect: (team: Team) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-gray-700 rounded-full hover:border-blue-400 transition-colors text-sm font-medium"
      >
        <Users className="w-4 h-4 text-blue-500" />
        <span className="max-w-[140px] truncate">
          {selectedTeam ? selectedTeam.subject_name : "팀 선택"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* 클래스로 애니메이션 제어 */}
      <div
        className={`absolute right-0 mt-2 w-64 bg-white border border-blue-100 rounded-2xl shadow-xl z-50 overflow-hidden
          transition-all duration-200 ease-out
          ${open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
      >
        {teams.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-400 text-center">
            참여 중인 팀이 없습니다
          </div>
        ) : (
          teams.map((team) => (
            <button
              key={team.id}
              onClick={() => {
                onSelect(team);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-blue-50 last:border-0 ${
                selectedTeam?.id === team.id ? "bg-blue-50" : ""
              }`}
            >
              <p className="text-sm font-semibold text-gray-800 truncate">{team.subject_name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{team.id}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// 헤더
// ────────────────────────────────────────────
function Header({
  isLoggedIn,
  teams,
  selectedTeam,
  onSelectTeam,
  onLogout,
  onLoginClick
}: {
  isLoggedIn: boolean;
  teams: Team[];
  selectedTeam: Team | null;
  onSelectTeam: (team: Team) => void;
  onLogout: () => void;
  onLoginClick: () => void;
}) {
  const navigate = useNavigate();

    const handleTeamSelect = (team: Team) => {
      onSelectTeam(team);
      navigate(`/team/${team.id}`);
    };


  return (
    <header className="bg-white/80 backdrop-blur shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-3xl">🐻</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
            TeamTeam
          </span>
        </Link>

        {/* 네비게이션 */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {/* 팀 선택 드롭다운 */}
              <TeamDropdown
                teams={teams}
                selectedTeam={selectedTeam}
                onSelect={handleTeamSelect}
              />

              {/* 마이페이지 */}
              <Link
                to="/profile"
                className="flex items-center gap-1.5 px-4 py-2 text-gray-600 hover:bg-blue-50 rounded-full transition-colors text-sm font-medium"
              >
                <User className="w-4 h-4" />
                마이페이지
              </Link>

              {/* 로그아웃 */}
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-4 py-2 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onLoginClick()}
                className="px-4 py-2 text-blue-700 hover:bg-blue-50 rounded-full transition-colors text-sm font-medium"
              >
                로그인
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-full hover:from-blue-700 hover:to-indigo-600 transition-all shadow-md text-sm font-medium">
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


function LoginModal({
    closeModal,
    getTeamList,
} : {
    closeModal : () => void;
    getTeamList : () => void;
}) {

    const dispatch = useDispatch();

    return (
      <>
        <div 
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        ></div>
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => closeModal()} // 배경 클릭 시 닫기
        >
          <div
            className="bg-white rounded-3xl p-8 w-96 shadow-xl"
            onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않게
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">로그인</h2>

            <input
              type="text"
              placeholder="아이디"
              className="w-full border border-blue-200 rounded-xl px-4 py-3 mb-3 outline-none focus:border-blue-500"
            />
            <input
              type="password"
              placeholder="비밀번호"
              className="w-full border border-blue-200 rounded-xl px-4 py-3 mb-6 outline-none focus:border-blue-500"
            />

            <button
              onClick={async () => {
                dispatch(login({ userId : "userId"}));
                await getTeamList();
                closeModal(); // 로그인 성공 시 모달 닫기
              }}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl font-medium"
            >
              로그인
            </button>
          </div>
        </div>
      </>
    )
    
}

// ────────────────────────────────────────────
// 메인 페이지
// ────────────────────────────────────────────
export function MainPage() {

  // 로그인 유지를 위한 코드//
  const isLoggedIn = useSelector((state:RootState) => state.auth.isLoggedIn);
  const userId = useSelector((state: RootState) => state.auth.userId);
  const dispatch = useDispatch();
  //

  const [showLoginModal, setShowLoginModal] = useState(false);

  const myTeams = useSelector((state:RootState) => state.auth.myTeamList);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isLoadding, setIsLoadding] = useState(false);


  // 로그인 시 해당 팀 가져오기 
  // 통신으로 새로고침할 때마다 수행하는 방식으로 바꾸는게 낫지 않을까 싶음
const getTeamList = async() => {
  setIsLoadding(true);

  
  try {
    const teams = await fetchMyteams("userId");
    dispatch(setMyTeamList(teams));
  } catch (error) {
    console.error("팀 정보를 못 불러왔어요")
  } finally {
    setIsLoadding(false)
  }
}

// ----------------------
// 팀 생성 및 참여 동작 코드
// ----------------------

const createTeam = async(params : CreateTeamParams) => {

/* 코드 동작 목적
   1. 로그인이 되어 있지 않다면 팀 생성을 멈춘다
   2. 로그인이 되어 있다면 CreateTeamParams의 Interface대로 JSON을 전송해 팀 생성 요청을 백엔드로 전송한다.
   3-1. (이후 미구현) 백엔드 단에서 res.staus 가 200이면 팀 초대 코드를 출력한다.
   3-2. 실패하면 실패 오류를 출력한다.
*/

  if (!isLoggedIn) { return; }
  try {
    const res = await axios.post("http://localhost:3000/api/teams", params);
    console.log("팀 생성 성공");
    console.log(res.status);
  } catch (error) {
      console.log("팀 생성 실패")
      if (axios.isAxiosError(error)) {
      }
  }
}


const joinTeam = async(params : string) => {
  /* 코드 동작 목적 (미구현)
   1. 로그인이 되어 있고, 초대 코드를 담아 서버에 초대 코드를 보내 해당 팀에 넣기를 요청한다.
   2-1. 백엔드 단에서 res.staus 가 200이면 해당 팀으로 이동한다.
   2-2. 실패하면 실패 오류를 출력한다.
*/
  try {
    const res = await axios.post("http://localhost:3000/api/teams/join", { invite_code : params }) // <- 어떤 양식으로 보내야 할 지 미정
  } catch (err) {}
}

// 실제 서버 상 동작 코드
/*
const handleLogin = async() => {
 const response = await fetch("api/login" , {
  method : "POST",
  body : JSON.stringfy({id, password});

  if (response.ok) {
    setIsLoggedIn(true)
  }

  else {
    return;
  }

  const teams = await fetchMyteams(id);
  setMyteams(teams)
}
*/


  const featureCards = [
    {
      title: "일정 관리",
      description: "팀 회의와 마감 일정을 한눈에 정리합니다.",
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      title: "팀 회의",
      description: "회의 일정과 커뮤니케이션을 한 공간에서 진행합니다.",
      icon: <MessageCircle className="w-6 h-6" />,
    },
    {
      title: "업무 분담",
      description: "담당자/마감일/진행 상태로 업무를 추적하세요.",
      icon: <ListTodo className="w-6 h-6" />,
    },
    {
      title: "자료 공유",
      description: "PPT/문서/PDF 등 팀 자료를 깔끔하게 관리합니다.",
      icon: <Share2 className="w-6 h-6" />,
    },
    {
      title: "상호 평가",
      description: "참여도와 소통을 기준으로 팀원을 평가합니다.",
      icon: <Star className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-indigo-50">
      <Header
        isLoggedIn={isLoggedIn}
        teams={myTeams}
        selectedTeam={selectedTeam}
        onSelectTeam={setSelectedTeam}
        onLogout={() => {                      // 실제 구현 시 로그아웃 로직으로 교체
          dispatch(logout());
        }}
        onLoginClick={() => {setShowLoginModal(true);}}
      />

      {showLoginModal && (
        <LoginModal
          closeModal={() => setShowLoginModal(false)}
          getTeamList={getTeamList}
          /> )
      }

      {/* Hero */}
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
          <button onClick = {() => createTeam(CreateTeamParamsDump)} className="px-8 py-4 bg-white text-blue-700 border-2 border-blue-600 rounded-full text-lg hover:bg-blue-50 transition-colors shadow-md">
            + 팀 만들기
          </button>
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