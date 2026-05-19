import { useState } from "react";
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
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  const chats = [
    { id: 1, name: "팀 전체",  lastMessage: "금요일 2시에 Figma 들고 오세요!", unread: 2 },
    { id: 2, name: "개발팀",   lastMessage: "Redis 캐싱 추가하는 거 맞죠?",    unread: 0 },
    { id: 3, name: "디자인팀", lastMessage: "Figma 초안 올려뒀어요",             unread: 1 },
  ];

  const messages: Message[] = [
    { id: 1, sender: "박미소", content: "안녕하세요! 오늘 프로젝트 주제 최종 확정하는 날이에요. StudyMate로 가는 거 다들 동의하시죠?", time: "14:10", isMine: false },
    { id: 2, sender: "나",     content: "네 좋아요! 스터디 매칭 플랫폼으로 확정하죠 🙌",                                              time: "14:11", isMine: true },
    { id: 3, sender: "고명주", content: "저는 백엔드 담당할게요. Spring Boot + MySQL로 API 만들겠습니다. Redis 캐싱도 붙이는 게 좋을 것 같아요.", time: "14:13", isMine: false },
    { id: 4, sender: "송희경", content: "저는 프론트엔드 맡을게요! React + Tailwind로 화면 구현하겠습니다. Figma 초안은 이번 주 금요일까지 준비할게요.", time: "14:15", isMine: false },
    { id: 5, sender: "나",     content: "그럼 저는 매칭 알고리즘이랑 AWS 배포 담당할게요. 태그 기반 유사도 + 시간대 필터 방식으로 구현해볼게요.", time: "14:17", isMine: true },
    { id: 6, sender: "박미소", content: "완벽해요! 기획이랑 발표 자료는 제가 맡겠습니다. 마감이 6월 13일이니까 역산해서 일정 짜볼게요.", time: "14:20", isMine: false },
    { id: 7, sender: "고명주", content: "DB 설계 먼저 하고 API 명세서 작성하는 순서로 가면 좋겠어요. 다음 주까지 ERD 초안 올릴게요!", time: "14:23", isMine: false },
    { id: 8, sender: "나",     content: "좋아요! 그럼 다음 회의는 금요일 오후 2시로 하고, Figma 초안 가져오는 걸로 해요 👍",          time: "14:25", isMine: true },
  ];

  const handleSend = () => {
    if (message.trim()) setMessage("");
  };

  const handleGeneratePrompt = () => {
    setShowPromptModal(true);
    setIsGenerating(true);
    setGeneratedPrompt("");
    setCopied(false);
    setTimeout(() => {
      setGeneratedPrompt(DEMO_PROMPT);
      setIsGenerating(false);
    }, 1200);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen flex">
      {/* Chat List Sidebar */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="채팅방 검색..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl hover:from-blue-700 hover:to-indigo-600 transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />새 채팅방 만들기
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div key={chat.id} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm shrink-0">
                  {chat.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="font-semibold text-slate-900 text-sm">{chat.name}</h3>
                    {chat.unread > 0 && (
                      <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{chat.lastMessage}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Chat Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-slate-900">팀 전체</h2>
            <div className="flex gap-1 items-center">
              <button
                onClick={handleGeneratePrompt}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all shadow-sm text-xs font-medium mr-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI 프롬프트 생성
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Phone className="w-4 h-4 text-slate-500" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Video className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-sm ${
                msg.isMine
                  ? "bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-sm"
                  : "bg-white text-slate-900 border border-slate-200 shadow-sm"
              } rounded-2xl px-4 py-3`}>
                {!msg.isMine && (
                  <p className="text-xs font-semibold mb-1 text-blue-600">{msg.sender}</p>
                )}
                <p className="text-sm mb-1">{msg.content}</p>
                <p className={`text-xs ${msg.isMine ? "text-blue-200" : "text-slate-400"}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-slate-200 px-6 py-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleSend}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl hover:from-blue-700 hover:to-indigo-600 transition-all flex items-center gap-2 shadow-sm text-sm"
            >
              <Send className="w-4 h-4" />전송
            </button>
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-7 max-w-md w-full shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-5">새 채팅방 만들기</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">채팅방 이름</label>
              <input
                type="text"
                placeholder="예: 프론트엔드팀"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">참여할 팀원</label>
              <div className="space-y-1">
                {["박미소","송희경","고명주","오소원","민지원","이채현"].map((member) => (
                  <label key={member} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {member.charAt(0)}
                    </div>
                    <span className="text-sm text-slate-700">{member}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm"
              >
                취소
              </button>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl hover:from-blue-700 hover:to-indigo-600 transition-all shadow-sm text-sm"
              >
                만들기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">AI 프롬프트 생성</h2>
                  <p className="text-xs text-slate-400">대화 내용을 분석해 프롬프트를 생성했습니다</p>
                </div>
              </div>
              <button
                onClick={() => setShowPromptModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-700">대화 내용 분석 중...</p>
                    <p className="text-xs text-slate-400 mt-1">주제, 역할, 기술 스택 등을 추출하고 있어요</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
                    <Sparkles className="w-4 h-4 text-violet-500 shrink-0" />
                    <p className="text-xs text-violet-700">
                      아래 프롬프트를 복사해서 AI 채팅(ChatGPT, Claude 등)에 붙여넣으면 팀 프로젝트에 맞는 답변을 받을 수 있어요.
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">
                      {generatedPrompt}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!isGenerating && (
              <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => setShowPromptModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm"
                >
                  닫기
                </button>
                <button
                  onClick={handleCopy}
                  className={`flex-1 px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-sm ${
                    copied
                      ? "bg-green-500 text-white"
                      : "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                  }`}
                >
                  {copied ? (
                    <><Check className="w-4 h-4" />복사 완료!</>
                  ) : (
                    <><Copy className="w-4 h-4" />프롬프트 복사</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
