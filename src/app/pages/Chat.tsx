import { useState } from "react";
<<<<<<< HEAD
import { Send, Search, Phone, Video, Plus, Sparkles, Copy, Check, X } from "lucide-react";
import "../types/tpyes"
import axios from "axios";
import { BASE_API_URL, Chat_Message, PORT } from "../types/tpyes";


type Message = { id: number; sender: string; content: string; time: string; isMine: boolean };

// --------------------------
// API 코드 구현부
// --------------------------

const createChatRooms = async (team_id : string) => {
  try {
    const int_team_id = parseInt(team_id, 10);
    const res = await axios.post(`${BASE_API_URL}:${PORT}/api/teams/${int_team_id}/rooms`);
    return res;
  } catch ( err ) {

  }
};

const fatchChatRoomsList = async (team_id : string) => {
  try {
    
    const int_team_id = parseInt(team_id, 10);
    const res = await axios.get(`${BASE_API_URL}:${PORT}/api/teams/${int_team_id}/chat-rooms`);
    return res.data;
  } catch ( err ) {
    
  }
};

const fatchLastChatsInRoom = async (room_id : string) => {
  try {
    const int_room_id = parseInt(room_id, 10);
    const res = await axios.post(`${BASE_API_URL}:${PORT}/api/chat-rooms/${int_room_id}/messages`);
  } catch ( err ) {
    
  }
};

const createAIPromptInRoom = async (chat_message_list : Chat_Message[] ) => {
  try {
    if (chat_message_list.length != 0 && chat_message_list[0].room_id != null) {
      const res = await axios.post(`${BASE_API_URL}:${PORT}/api/chat-rooms/`);
      return 1;
    }
    else {
      console.log("지금까지 나눈 채팅이 하나도 없어요")
    }
  } catch ( err ) {
    
  }
};




const DEMO_PROMPT = `당신은 팀 프로젝트 협업 AI 어시스턴트입니다. 아래 팀 회의 내용을 바탕으로 팀원들을 도와주세요.

---

## 📋 프로젝트 개요

- **주제/서비스**: 캠퍼스 스터디 매칭 플랫폼 "StudyMate"
- **한 줄 설명**: 대학생들이 스터디 그룹을 쉽게 구성하고, 일정·자료·진도를 함께 관리할 수 있는 웹 서비스

---

## 🎯 문제 상황 및 목적

- **문제**: 기존에는 에브리타임 게시판이나 오픈채팅으로 스터디원을 구하다 보니 매칭 후 관리가 안 되고 흐지부지 해산되는 경우가 많음
- **목적**: 관심 분야·시간대·학교 기준으로 스터디원을 자동 추천하고, 그룹 내 일정·자료·출석을 한 곳에서 관리
- **기대 효과**: 스터디 지속률 향상, 학습 성과 공유 활성화

---

## 👥 팀원 및 역할 분담

| 이름 | 역할 | 담당 기능 |
|------|------|-----------|
| 박미소 | 팀장 / 기획 | 요구사항 정의, UI 기획, 발표 자료 |
| 송희경 | 프론트엔드 | React 화면 구현, 컴포넌트 설계 |
| 고명주 | 백엔드 | Spring Boot API 개발, DB 설계 |
| 나 (김지우) | 풀스택 | 매칭 알고리즘, 배포(AWS) |

---

## 🛠️ 기술 스택

- **프론트엔드**: React 18, TypeScript, Tailwind CSS
- **백엔드**: Spring Boot 3, Java 17
- **데이터베이스**: MySQL 8 (메인), Redis (세션/캐시)
- **인프라**: AWS EC2 + S3, GitHub Actions CI/CD
- **협업 도구**: GitHub, Notion, Figma

---

## 📅 일정 및 마감

- **전체 기간**: 2026년 4월 1일 ~ 6월 13일 (약 10주)
- **주요 마일스톤**:
  - 4월 2주차: 기획 완료 + 화면 설계(Figma)
  - 4월 4주차: DB 설계 + API 명세서 작성
  - 5월 2주차: 핵심 기능 구현 완료 (매칭, 그룹 관리)
  - 5월 4주차: 통합 테스트 + 버그 수정
  - 6월 1주차: 최종 발표 준비
  - **6월 13일**: 최종 발표 및 제출

---

## 💬 대화 요약

총 8개 메시지, 참여자: 박미소, 송희경, 고명주, 나(김지우)

주요 결정 사항:
1. 프로젝트명 "StudyMate"로 확정
2. 백엔드는 고명주가 Spring Boot로 진행, 프론트는 송희경이 React 담당
3. DB는 MySQL 사용하되 Redis 캐싱 추가로 성능 보완하기로 함
4. 매칭 알고리즘은 태그 기반 유사도 + 시간대 필터 방식으로 구현 예정
5. 다음 회의는 이번 주 금요일 오후 2시, Figma 초안 가져오기로 함

---

위 정보를 바탕으로 팀이 질문하면 구체적인 도움을 제공해 주세요.`;
export function Chat() {
  const [message, setMessage] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const chats = [
    {
      id: 1,
      name: "팀 전체",
      lastMessage: "내일 회의 준비 완료했어요!",
      unread: 2,
    },
    {
      id: 2,
      name: "개발팀",
      lastMessage: "API 연동 완료했습니다",
      unread: 0,
    },
    {
      id: 3,
      name: "디자인팀",
      lastMessage: "UI 목업 공유드립니다",
      unread: 1,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "박미소",
      content: "안녕하세요! 오늘 회의 자료 준비 다 하셨나요?",
      time: "14:30",
      isMine: false,
    },
    {
      id: 2,
      sender: "나",
      content: "네, 준비 완료했습니다!",
      time: "14:32",
      isMine: true,
    },
    {
      id: 3,
      sender: "송희경",
      content: "저도 준비 끝났어요. 발표 자료는 자료실에 올려뒀습니다.",
      time: "14:35",
      isMine: false,
    },
    {
      id: 4,
      sender: "고명주",
      content: "감사합니다! 확인했어요 👍",
      time: "14:37",
      isMine: false,
    },
    {
      id: 5,
      sender: "나",
      content: "그럼 내일 2시에 뵙겠습니다!",
      time: "14:40",
      isMine: true,
    },
  ];

  const handleSend = () => {
    if (message.trim()) {
      // 메시지 전송 로직
      setMessage("");
    }
  };

  return (
    <div className="h-screen flex">
      {/* Chat List Sidebar */}
      <div className="w-80 bg-white border-r border-amber-100 flex flex-col">
        <div className="p-4 border-b border-amber-100">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="채팅방 검색..."
              className="w-full pl-10 pr-4 py-2 border border-amber-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="w-full px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-full hover:from-amber-700 hover:to-orange-600 transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            새 채팅방 만들기
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="p-4 border-b border-amber-50 hover:bg-amber-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                  {chat.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900">{chat.name}</h3>
                    {chat.unread > 0 && (
                      <span className="bg-gradient-to-r from-amber-600 to-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50">
        {/* Chat Header */}
        <div className="bg-white border-b border-amber-100 p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">💬</span>
              <h2 className="text-xl font-semibold text-gray-900">팀 전체</h2>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-amber-50 rounded-full transition-colors">
                <Phone className="w-5 h-5 text-amber-700" />
              </button>
              <button className="p-2 hover:bg-amber-50 rounded-full transition-colors">
                <Video className="w-5 h-5 text-amber-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-md ${
                  msg.isMine ? "bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-md" : "bg-white text-gray-900 border border-amber-100 shadow-sm"
                } rounded-3xl p-4`}
              >
                {!msg.isMine && (
                  <p className="text-sm font-semibold mb-1 text-amber-800">{msg.sender}</p>
                )}
                <p className="mb-1">{msg.content}</p>
                <p
                  className={`text-xs ${
                    msg.isMine ? "text-orange-100" : "text-gray-500"
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-amber-100 p-4 shadow-lg">
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-3 border border-amber-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={handleSend}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-full hover:from-amber-700 hover:to-orange-600 transition-all flex items-center gap-2 shadow-md"
            >
              <Send className="w-5 h-5" />
              전송
            </button>
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">새 채팅방 만들기</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                채팅방 이름
              </label>
              <input
                type="text"
                placeholder="예: 프론트엔드팀"
                className="w-full px-4 py-2 border border-amber-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                참여할 팀원
              </label>
              <div className="space-y-2">
                {["박미소", "송희경", "고명주", "오소원", "민지원", "이채현"].map((member) => (
                  <label key={member} className="flex items-center gap-3 p-2 hover:bg-amber-50 rounded-xl cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-amber-600 rounded" />
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {member.charAt(0)}
                    </div>
                    <span className="text-gray-700">{member}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-full hover:from-amber-700 hover:to-orange-600 transition-all shadow-md"
              >
                만들기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}