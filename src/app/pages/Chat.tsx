import { useEffect, useRef, useState } from "react";
import { Send, Search, Plus, Sparkles, Copy, Check, X } from "lucide-react";
import { useSelector } from "react-redux";
import api from "../store/api";
import { useParams } from "react-router";
import { RootState } from "../store";

interface ChatroomListInfo {
  id: string;
  team_id: string;
  room_name: string;
  created_at: string;
  members: any;
}

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  message_content: string;
  created_at: string;
  isMine?: boolean;
}

const createChatRooms = async (team_id: string | undefined, chat_room_name: string | undefined, member_ids: string[] | undefined) => {
  if (!chat_room_name || !member_ids) return;
  try {
    return await api.post(`/api/teams/${team_id}/chat-rooms`, { room_name: chat_room_name, member_ids });
  } catch (err) {
    console.log(err);
  }
};

const fetchChatRoomsList = async (team_id: string | undefined) => {
  if (!team_id) return [];
  try {
    const res = await api.get(`/api/teams/${team_id}/chat-rooms`);
    return res.data;
  } catch {
    return [];
  }
};

const fetchChatRoomLogs = async (chat_room_id: string | undefined) => {
  if (!chat_room_id || chat_room_id === "0") return [];
  try {
    const res = await api.get(`/api/chat-rooms/${chat_room_id}/messages`);
    return res.data;
  } catch {
    return [];
  }
};

const postMessage = async (room_id: string | undefined, message: string) => {
  if (!room_id) return;
  try {
    const res = await api.post(`/api/chat-rooms/${room_id}/messages`, { message_content: message });
    return res.status;
  } catch (err) {
    console.log(err);
  }
};

const fetchMyTeamMembers = async (team_id: string | undefined) => {
  if (!team_id) return [];
  try {
    const res = await api.get(`/api/teams/${team_id}`);
    return res.data.members ?? [];
  } catch {
    return [];
  }
};

const createAIPromptInRoom = async (room_id: string | undefined) => {
  if (!room_id || room_id === "0") return null;
  try {
    const res = await api.post(`/api/chat-rooms/${room_id}/ai-prompt`, { room_id });
    return res.data;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export function Chat() {
  const param = useParams();
  const myUserId = useSelector((state: RootState) => state.auth.userId);
  const serverUrl = (import.meta as any).env?.VITE_SERVER_URL as string || "http://localhost:8000";

  const [message, setMessage] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [selectedChatRoom, setSelectedChatRoom] = useState<string | undefined>(undefined);
  const [chat_log, setChatLog] = useState<Message[]>([]);
  const [chat_room_list, setChatRoomList] = useState<ChatroomListInfo[]>([]);
  const [myTeamMembers, setMyTeamMembers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [newChatRoomName, setNewChatRoomName] = useState("");
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = (roomId: string) => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    const wsBase = serverUrl.replace(/^http/, "ws");
    const ws = new WebSocket(`${wsBase}/ws/chat-rooms/${roomId}?user_id=${myUserId}`);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setChatLog(prev => {
          const already = prev.some(m => m.id === String(msg.id));
          if (already) return prev;
          return [...prev, { ...msg, id: String(msg.id), isMine: String(msg.sender_id) === String(myUserId) }];
        });
      } catch { /* ignore malformed messages */ }
    };

    ws.onerror = () => { /* silently ignore WS errors — fall back to REST log */ };
    wsRef.current = ws;
  };

  useEffect(() => {
    return () => { wsRef.current?.close(); };
  }, []);

  const getChatList = async () => {
    const list = await fetchChatRoomsList(param.teamId);
    setChatRoomList(list);
    return list;
  };

  const getChatLogs = async () => {
    const logs = await fetchChatRoomLogs(selectedChatRoom);
    if (logs && logs.length > 0) {
      setChatLog(logs.map((log: any) => ({ ...log, isMine: String(log.sender_id) === String(myUserId) })));
    } else {
      setChatLog([]);
    }
  };

  const getTeamMembers = async () => {
    const members = await fetchMyTeamMembers(param.teamId);
    setMyTeamMembers(members);
  };

  useEffect(() => { getChatList(); }, []);

  useEffect(() => {
    if (selectedChatRoom) {
      getChatLogs();
      connectWebSocket(selectedChatRoom);
    } else {
      setChatLog([]);
    }
  }, [selectedChatRoom]);

  useEffect(() => { getTeamMembers(); }, [param.teamId]);

  const handleSend = async () => {
    if (!message.trim() || !selectedChatRoom) return;
    const text = message;
    setMessage("");
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message_content: text }));
    } else {
      await postMessage(selectedChatRoom, text);
      getChatLogs();
    }
  };

  const handleSendCreateTeam = async () => {
    await createChatRooms(param.teamId, newChatRoomName, selectedMembers);
    setSelectedMembers([]);
    setNewChatRoomName("");
    getChatList();
  };

  const toggleMember = (userId: string, checked: boolean) => {
    setSelectedMembers(prev => checked ? [...prev, userId] : prev.filter(id => id !== userId));
  };

  const handleGenerateAIPrompt = async () => {
    const promptData: { prompt: string } | null = await createAIPromptInRoom(selectedChatRoom);
    setShowPromptModal(true);
    setIsGenerating(true);
    setGeneratedPrompt("");
    setCopied(false);
    if (promptData) {
      setTimeout(() => { setGeneratedPrompt(promptData.prompt); setIsGenerating(false); }, 1200);
    } else {
      setGeneratedPrompt("에러가 발생했어요.");
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen flex">
      {/* Chat List Sidebar */}
      <div className="w-80 bg-white border-r border-amber-100 flex flex-col">
        <div className="p-4 border-b border-amber-100">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="채팅방 검색..."
              className="w-full pl-10 pr-4 py-2 border border-amber-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button onClick={() => setShowNewChatModal(true)}
            className="w-full px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-full hover:from-amber-700 hover:to-orange-600 transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />새 채팅방 만들기
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chat_room_list.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm font-medium text-gray-400 text-center">
              <h1 className="text-xl text-gray-300">아직 생성된 채팅창이 없어요</h1>
            </div>
          ) : (
            chat_room_list.map(chat => (
              <div key={chat.id} onClick={() => setSelectedChatRoom(chat.id)}
                className={`p-4 border-b border-amber-50 cursor-pointer transition-colors ${selectedChatRoom === chat.id ? "bg-amber-100" : "hover:bg-amber-50"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                    {chat.room_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{chat.room_name}</h3>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50">
        <div className="bg-white border-b border-amber-100 p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">💬</span>
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedChatRoom ? (chat_room_list.find(c => c.id === selectedChatRoom)?.room_name ?? "채팅방") : "채팅방을 선택해주세요"}
              </h2>
            </div>
            <button onClick={handleGenerateAIPrompt}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all shadow-sm text-xs font-medium mr-2"
            >
              <Sparkles className="w-3.5 h-3.5" />AI 프롬프트 생성
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chat_log.map(msg => (
            <div key={msg.id} className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-md ${msg.isMine ? "bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-md" : "bg-white text-gray-900 border border-amber-100 shadow-sm"} rounded-3xl p-4`}>
                {!msg.isMine && <p className="text-sm font-semibold mb-1 text-amber-800">{msg.sender_name}</p>}
                <p className="mb-1">{msg.message_content}</p>
                <p className={`text-xs ${msg.isMine ? "text-orange-100" : "text-gray-500"}`}>{msg.created_at}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border-t border-amber-100 p-4 shadow-lg">
          <div className="flex gap-3">
            <input type="text" value={message} onChange={e => setMessage(e.target.value)}
              onKeyPress={e => e.key === "Enter" && handleSend()}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-3 border border-amber-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button onClick={handleSend}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-full hover:from-amber-700 hover:to-orange-600 transition-all flex items-center gap-2 shadow-md"
            >
              <Send className="w-5 h-5" />전송
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">채팅방 이름</label>
              <input type="text" placeholder="예: 프론트엔드팀" value={newChatRoomName}
                onChange={e => setNewChatRoomName(e.target.value)}
                className="w-full px-4 py-2 border border-amber-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">참여할 팀원</label>
              <div className="space-y-2">
                {myTeamMembers.map((member: any) => (
                  <label key={member.user_id} className="flex items-center gap-3 p-2 hover:bg-amber-50 rounded-xl cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-amber-600 rounded"
                      checked={selectedMembers.includes(String(member.user_id))}
                      onChange={e => toggleMember(String(member.user_id), e.target.checked)}
                    />
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {(member.name || member.user_name || "?").charAt(0)}
                    </div>
                    <span className="text-gray-700">{member.name || member.user_name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowNewChatModal(false); setSelectedMembers([]); }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button onClick={() => { setShowNewChatModal(false); handleSendCreateTeam(); }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-full hover:from-amber-700 hover:to-orange-600 transition-all shadow-md"
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
              <button onClick={() => setShowPromptModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
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
                    <p className="text-xs text-violet-700">아래 프롬프트를 복사해서 AI 채팅에 붙여넣으면 팀 프로젝트에 맞는 답변을 받을 수 있어요.</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">{generatedPrompt}</pre>
                  </div>
                </div>
              )}
            </div>
            {!isGenerating && (
              <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
                <button onClick={() => setShowPromptModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm"
                >
                  닫기
                </button>
                <button onClick={handleCopy}
                  className={`flex-1 px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-sm ${copied ? "bg-green-500 text-white" : "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"}`}
                >
                  {copied ? <><Check className="w-4 h-4" />복사 완료!</> : <><Copy className="w-4 h-4" />프롬프트 복사</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
