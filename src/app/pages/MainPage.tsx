import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import api from "../store/api";
import {
  Calendar,
  ListTodo,
  MessageCircle,
  Share2,
  Star,
} from "lucide-react";
import { useDispatch, UseDispatch, useSelector } from "react-redux";
import { login, logout } from "../store/authSlice"
import { RootState } from "../store";
import { BASE_API_URL, Team, PORT } from "../types/tpyes";

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

const logInFunction = async (dispatch: any, user_id : string, password : string) => {
  try{
    const res = await api.post(`/api/auth/login`, { "email" : `${user_id}`, "password" : `${password}`});
    if ( res.data.access_token ) {
        const token = res.data.access_token;
        const user = res.data.user_id;
        await dispatch(login({ user_id : user, token : token }));
        return 1;
    }
    console.log("No exist token");
    return -1;
  } catch ( err ) {
    console.log(`Login Failure`);
    return -1

  }
};

export const fetchMyteams = async () : Promise<Team[]> => {
 try{
  const res = await api.get(`/api/teams`);

  if (Array.isArray(res.data)) {
    //console.log(res.data);
    return res.data;
  }
  else {
    console.log("팀 목록이 없습니다.");
    return [];
  }
} catch (err) {
  console.log("팀 목록을 서버에서 가져오지 못했습니다.");
  return [];
}
};

const createNewTeam = async (team_info  : Team) => {
  /* 2-1 새 팀 생성 요청을 보냄
  require : team name, subject_name, deadline
  return으로  invite code : string으로
  */
  try {
    const res = await api.post(`/api/teams`, team_info);
    if (res.data.invite_code) {
      return res.data.invite_code;
    }
    return "";
  } catch(err) {
    return "";
  }
};

const joinNewTeam = async (team_code  : string) => {
  /* 2-2 코드로 팀 초대 요청을 전송
  
  */
  try {
    const res = await api.post(`/api/teams/join`, {"invite_code" : team_code });
    if (res.status == 201) {
      return 1;
    }
    return -1;
  } catch(err) {
    return -1;
  }
};


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

const CreateTeamParamsDump : Team = {
    team_name: "프로젝트 팀 A",
    subject_name: "소프트웨어공학",
    invite_code: "ABC123",
    //deadline: "2025-12-31",
    leader_id: 1
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
              <p className="text-sm font-semibold text-gray-800 truncate">{team.team_name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{team.subject_name}</p>
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
  onLoginClick,
  onSignUpClick
}: {
  isLoggedIn: boolean;
  teams: Team[];
  selectedTeam: Team | null;
  onSelectTeam: (team: Team) => void;
  onLogout: () => void;
  onLoginClick: () => void;
  onSignUpClick: () => void;
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
              <button 
                onClick={() => onSignUpClick()}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-full hover:from-blue-700 hover:to-indigo-600 transition-all shadow-md text-sm font-medium">
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
} : {
    closeModal : () => void;
}) {

  const dispatch = useDispatch();
    
  const [user_id, setUserId] = useState("");
  const [password, setPassword] = useState("");

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
              value={user_id}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full border border-blue-200 rounded-xl px-4 py-3 mb-3 outline-none focus:border-blue-500"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value = {password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-blue-200 rounded-xl px-4 py-3 mb-6 outline-none focus:border-blue-500"
            />

            <button
              onClick={async () => {
                if (!user_id || !password) {
                  return;
                }
                logInFunction(dispatch, user_id, password);
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

function CreateTeamModal( { closeModal} : { closeModal : () => void}) {
  // 모달 내에 인증 코드를 제출 => 서버에서 검증 후 팀 선택을 개시
  const [teamData, setTeamData] = useState<Team>({
    team_name : "",
    subject_name : "",
  });

  const [team_name, setTeamName] = useState("");
  const [subject_name, setSubjectName] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [invite_code, setInviteCode] = useState("");

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        >
      </div>

      <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={() => closeModal()} // 배경 클릭 시 닫기
      >
      { invite_code === "" ? 
      <>
          <div
            className="bg-white rounded-3xl p-8 w-96 shadow-xl"
            onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않게
          >
            <input
              className="w-full border border-blue-200 rounded-xl px-4 py-3 mb-6 outline-none focus:border-blue-500"
              placeholder="팀명"
              type="text"
              value={team_name}
              onChange={(e) => setTeamName(e.target.value)}
            />

            <input
              className="w-full border border-blue-200 rounded-xl px-4 py-3 mb-6 outline-none focus:border-blue-500"
              placeholder="과목명"
              type="text"
              value={subject_name}
              onChange={(e) => setSubjectName(e.target.value)}/>

            <div className="flex flex-col gap-2 w-full mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <label className="text-sm font-semibold text-gray-700">
                마감일 선택
              </label>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-blue-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-700"
              />
              <p className="text-xs text-gray-400 mt-1">
                {selectedDate ? `선택한 날짜: ${selectedDate}` : "날짜를 선택해주세요."}
              </p>
            </div>
            <button
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl font-medium"
              onClick={  async () => {
                const newTeamData = {
                  team_name : team_name,
                  subject_name: subject_name, 
                  deadline: selectedDate
                }

                setTeamData(newTeamData);

                try {
                  const result = await createNewTeam(newTeamData);

                  if ( result != "") {
                    setInviteCode(result);
                  }
                  else {}
                } catch(err) {

                }
              }
            }
            > 
            전송
            </button>
          </div>
      </> : <>
      
        <div
              className="bg-white rounded-3xl p-8 w-96 shadow-xl"
              onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않게
            >
              <h3
                className="text-gray-500 mb-4"
              > {teamData.team_name}의 초대 코드 </h3>
              
              <h1
              className="text-3xl font-bold text-gray-900 mb-5"
              > {invite_code} </h1>

              <button onClick={closeModal}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl font-medium"
            > 확인 </button>
        </div>
        </>
        }
      
          
        </div>
      </>
  );
}

function JoinTeamModal( { closeModal} : { closeModal : () => void}) {
  // 모달 내에 인증 코드를 제출 => 서버에서 검증 후 팀 선택을 개시
  const [invite_code, setInviteCode] = useState("");
  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        >
      </div>
      <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => closeModal()} // 배경 클릭 시 닫기
      >
          <div
            className="bg-white rounded-3xl p-8 w-96 shadow-xl"
            onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않게
          >
            <h2 className="text-2xl font-bold text-gray-900">
              초대 코드 입력
            </h2>
            <p className="text-gray-400 mb-6"> 참여 팀의 인증 코드를 입력해주세요</p>
            <input
              className="w-full border border-blue-200 rounded-xl px-4 py-3 mb-6 outline-none focus:border-blue-500"
              placeholder="초대 코드"
              type="text"
              value={invite_code}
              onChange={(e) => setInviteCode(e.target.value)}
            />
            <button
            onClick={async () => {
                if (!invite_code) {
                  return;
                }
                let isClose = await joinNewTeam(invite_code);
                if (isClose == 1) {
                  closeModal(); // 성공 시 모달 닫기
                }
              }}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl font-medium"
            > 참여하기</button>
          </div>

      </div>
    </>
  );
}

function SignUpModal( {closeModal} : { closeModal : () => void }) {
  const [userInfomation, setUserInfomation] = useState({"email": "user@example.com",
                                                        "password": "",
                                                        "name": "",
                                                        "department": "",
                                                        "student_id": ""});
  const [ email, setEmail ] = useState("");
  const [ password, setPassword ] = useState("");
  const [ check_password, setCheckPassowrd ] = useState("");
  const [ name, setName ] = useState("");
  const [ department, setDepartment] = useState("");
  const [ student_id, setStudentId] = useState("");
  return ( 
  <>
      <div 
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        >
      </div>
      <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => closeModal()} // 배경 클릭 시 닫기
      >
          <div
            className="bg-white rounded-3xl p-8 w-96 shadow-xl"
            onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫히지 않게
          >
            <h2 className="text-2xl font-bold text-gray-900">
              회원 가입
            </h2>
            <p className="text-gray-400 mb-6"> 참여 팀의 인증 코드를 입력해주세요</p>
            <input
              className="w-full border border-blue-200 rounded-xl px-4 py-3 mb-6 outline-none focus:border-blue-500"
              placeholder="Email@example.com"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full border border-blue-200 rounded-xl px-4 py-3 mb-6 outline-none focus:border-blue-500"
              placeholder="비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              className="w-full border border-blue-200 rounded-xl px-4 py-3 mb-6 outline-none focus:border-blue-500"
              placeholder="이름"
              type="password"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="w-full border border-blue-200 rounded-xl px-4 py-3 mb-6 outline-none focus:border-blue-500"
              placeholder="학부"
              type="password"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <input
              className="w-full border border-blue-200 rounded-xl px-4 py-3 mb-6 outline-none focus:border-blue-500"
              placeholder="학번"
              type="password"
              value={student_id}
              onChange={(e) => setStudentId(e.target.value)}
            />
            <button
            onClick={async () => {
                if (1) {
                  closeModal(); // 성공 시 모달 닫기
                }
              }}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl font-medium"
            > 가입하기</button>
          </div>

      </div>
    </>)
}
// ────────────────────────────────────────────
// 메인 페이지
// ────────────────────────────────────────────
export function MainPage() {

  // 로그인 유지를 위한 코드//
  const isLoggedIn = useSelector((state:RootState) => state.auth.isLoggedIn);
  const token = useSelector((state:RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.userId);
  const dispatch = useDispatch();
  //

  const [ showLoginModal, setShowLoginModal ] = useState(false);
  const [ showCreateTeamModal, setShowCreateTeamModal ] = useState(false);
  const [ showJoinTeamModal, setShowJoinTeamModal ] = useState(false);
  const [ showSignUp, setShowSignUp ] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isLoadding, setIsLoadding] = useState(false);
  const [myTeams, setMyTeams] = useState<Team[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      const loadTeams = async () => {
        setIsLoadding(true);
        const myTeamList = await fetchMyteams();
        setMyTeams(myTeamList);
        setIsLoadding(false);
      };
      loadTeams();
    }
    else {
      setMyTeams([]);
      setSelectedTeam(null);
    }
  }, [isLoggedIn, showCreateTeamModal, showJoinTeamModal]);


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
      <Header
        isLoggedIn={isLoggedIn}
        teams={myTeams}
        selectedTeam={selectedTeam}
        onSelectTeam={setSelectedTeam}
        onLogout={() => {                      
          dispatch(logout());
          setMyTeams([]);
        }}
        onLoginClick={() => {
          setShowLoginModal(true);}}
        onSignUpClick={() => { setShowSignUp(true)}}
      />

      {showLoginModal && (
        <LoginModal
          closeModal={() => setShowLoginModal(false)}
          /> )
      }

      {showCreateTeamModal && (
        <CreateTeamModal
          closeModal={() => setShowCreateTeamModal(false)} />
      )}


      {showJoinTeamModal && (
        <JoinTeamModal
          closeModal={() => setShowJoinTeamModal(false)} />
      )}

      {showSignUp && (
        <SignUpModal closeModal={ () => setShowSignUp(false)} />
      )}

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
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-full text-lg hover:from-blue-700 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl"
                  onClick={() => {setShowJoinTeamModal(true)}}>
            🐻 팀 찾기
          </button>
          <button className="px-8 py-4 bg-white text-blue-700 border-2 border-blue-600 rounded-full text-lg hover:bg-blue-50 transition-colors shadow-md"
                  onClick = {(() => setShowCreateTeamModal(true))}>
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