import { useState } from "react";
import { Star } from "lucide-react";

export function Evaluation() {
  const [selectedMember, setSelectedMember] = useState<number | null>(null);

  const teamMembers = [
    {
      id: 1,
      name: "송희경",
      role: "백엔드 개발",
      avatar: "송",
    },
    {
      id: 2,
      name: "고명주",
      role: "프론트엔드 개발",
      avatar: "고",
    },
    {
      id: 3,
      name: "오소원",
      role: "백엔드 개발",
      avatar: "오",
    },
    {
      id: 4,
      name: "민지원",
      role: "데이터베이스 관리",
      avatar: "민",
    },
    {
      id: 5,
      name: "이채현",
      role: "UI/UX 디자인",
      avatar: "이",
    },
  ];

  const evaluationCriteria = [
    { id: 1, name: "참여도", description: "팀 활동에 얼마나 적극적으로 참여했는가" },
    { id: 2, name: "책임감", description: "맡은 업무를 성실하게 수행했는가" },
    { id: 3, name: "소통", description: "팀원들과 원활하게 소통했는가" },
  ];

  const [ratings, setRatings] = useState<{ [key: number]: number }>({
    1: 0,
    2: 0,
    3: 0,
  });

  const [comment, setComment] = useState("");

  const handleStarClick = (criteriaId: number, rating: number) => {
    setRatings({ ...ratings, [criteriaId]: rating });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">⭐</span>
          <h1 className="text-3xl font-bold text-gray-900">상호 평가</h1>
        </div>
        <p className="text-gray-600 mt-1">팀원들의 기여도를 평가해주세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members List */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            평가할 팀원
          </h2>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member.id)}
                className={`bg-white rounded-3xl shadow-md p-4 cursor-pointer transition-all border ${
                  selectedMember === member.id
                    ? "ring-2 ring-amber-500 shadow-lg border-amber-200"
                    : "hover:shadow-lg border-amber-100"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-500 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-md">
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {member.name}
                    </h3>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                </div>
                <button
                  className={`w-full px-4 py-2 rounded-full transition-all ${
                    selectedMember === member.id
                      ? "bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-md"
                      : "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 hover:from-amber-100 hover:to-orange-100"
                  }`}
                >
                  평가하기
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation Form */}
        <div className="lg:col-span-2">
          {selectedMember ? (
            <div className="bg-white rounded-3xl shadow-md p-6 border border-amber-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {teamMembers.find((m) => m.id === selectedMember)?.name} 평가
              </h2>

              {/* Rating Criteria */}
              <div className="space-y-6 mb-6">
                {evaluationCriteria.map((criteria) => (
                  <div key={criteria.id} className="pb-6 border-b border-amber-100 last:border-0">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {criteria.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {criteria.description}
                    </p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleStarClick(criteria.id, rating)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              rating <= (ratings[criteria.id] || 0)
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-amber-700 font-medium self-center">
                        {ratings[criteria.id] || 0} / 5
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  추가 의견 (선택사항)
                </h3>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="팀원에게 전하고 싶은 의견을 작성해주세요..."
                  className="w-full px-4 py-3 border border-amber-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <button className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-full hover:from-amber-700 hover:to-orange-600 transition-all shadow-md">
                평가 제출
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-md p-12 text-center border border-amber-100">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                평가할 팀원을 선택해주세요
              </h3>
              <p className="text-gray-600">
                왼쪽 목록에서 팀원을 선택하면 평가를 시작할 수 있습니다
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}