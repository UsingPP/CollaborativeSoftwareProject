import { useState } from "react";
import { Star } from "lucide-react";
import axios from "axios";
import { BASE_API_URL, PORT, EvaluationForm } from "../types/tpyes";

const evaluateMyProjectTeamMate = async ( eval_teammate_form : EvaluationForm ) => {
  try {
    const res = await axios.post(`${BASE_API_URL}:${PORT}/api/teams/${eval_teammate_form.team_id}/members/eval-status`, eval_teammate_form);
    return 1;
  } catch( error ) {

  }
};
const fetchMyTeamMateList = async () => {
  try {
    // 팀원 중 내가 평가한 사람과 평가하지 않은 사람 구분 조회 => 어떤 형식으로 오는건가요?
  } catch( error ) {

  }
};

export function Evaluation() {
  const [selectedMember, setSelectedMember] = useState<number | null>(null);

  const teamMembers = [
    { id: 1, name: "송희경", role: "백엔드 개발",     avatar: "송" },
    { id: 2, name: "고명주", role: "프론트엔드 개발", avatar: "고" },
    { id: 3, name: "오소원", role: "백엔드 개발",     avatar: "오" },
    { id: 4, name: "민지원", role: "데이터베이스 관리", avatar: "민" },
    { id: 5, name: "이채현", role: "UI/UX 디자인",    avatar: "이" },
  ];

  const evaluationCriteria = [
    { id: 1, name: "참여도", description: "팀 활동에 얼마나 적극적으로 참여했는가" },
    { id: 2, name: "책임감", description: "맡은 업무를 성실하게 수행했는가" },
    { id: 3, name: "소통",   description: "팀원들과 원활하게 소통했는가" },
    { id: 4, name: "협업",   description: "팀원들과 협력하여 공동 목표를 달성했는가" },
    { id: 5, name: "창의성", description: "창의적인 아이디어와 해결책을 제시했는가" },
  ];

  const [ratings, setRatings] = useState<{ [key: number]: number }>({ 1:0, 2:0, 3:0, 4:0, 5:0 });
  const [comment, setComment] = useState("");

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">상호 평가</h1>
        <p className="text-slate-500 mt-1 text-sm">팀원들의 기여도를 평가해주세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Team Members */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">평가할 팀원</h2>
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member.id)}
                className={`bg-white rounded-2xl shadow-sm p-4 cursor-pointer transition-all border ${
                  selectedMember === member.id
                    ? "ring-2 ring-blue-400 border-blue-200"
                    : "border-slate-200 hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm">{member.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{member.role}</p>
                  </div>
                  {selectedMember === member.id && (
                    <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-lg font-medium">선택됨</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation Form */}
        <div className="lg:col-span-2">
          {selectedMember ? (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
              <h2 className="font-semibold text-slate-900 mb-5">
                {teamMembers.find(m => m.id === selectedMember)?.name} 평가
              </h2>

              <div className="space-y-5 mb-6">
                {evaluationCriteria.map((criteria) => (
                  <div key={criteria.id} className="pb-5 border-b border-slate-100 last:border-0">
                    <h3 className="font-semibold text-slate-900 text-sm mb-0.5">{criteria.name}</h3>
                    <p className="text-xs text-slate-400 mb-3">{criteria.description}</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setRatings({ ...ratings, [criteria.id]: rating })}
                          className="p-0.5 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-7 h-7 ${
                            rating <= (ratings[criteria.id] || 0)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200"
                          }`} />
                        </button>
                      ))}
                      <span className="ml-2 text-sm font-semibold text-blue-600">
                        {ratings[criteria.id] || 0} / 5
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-5">
                <h3 className="font-semibold text-slate-900 text-sm mb-2">추가 의견 (선택사항)</h3>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="팀원에게 전하고 싶은 의견을 작성해주세요..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  rows={4}
                />
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl hover:from-blue-700 hover:to-indigo-600 transition-all shadow-sm text-sm font-medium">
                평가 제출
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-200">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1.5 text-sm">평가할 팀원을 선택해주세요</h3>
              <p className="text-slate-400 text-sm">왼쪽 목록에서 팀원을 선택하면 평가를 시작할 수 있습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
