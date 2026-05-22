import { useState } from "react";
import { Send, Search, Phone, Video, Plus } from "lucide-react";

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