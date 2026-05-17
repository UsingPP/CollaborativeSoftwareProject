import { Link } from "react-router";
import { ArrowLeft, Mail, MapPin, BookOpen, IdCard, Star } from "lucide-react";

export function Profile() {
  const evaluations = [
    { category: "참여도", rating: 4.5 },
    { category: "책임감", rating: 4.8 },
    { category: "소통",   rating: 5.0 },
    { category: "협업",   rating: 4.3 },
    { category: "창의성", rating: 4.6 },
  ];

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= Math.floor(rating)
              ? "fill-amber-400 text-amber-400"
              : star - 0.5 <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          }`}
        />
      ))}
      <span className="ml-1.5 text-sm font-semibold text-slate-700">{rating.toFixed(1)}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto p-8">
        <Link to="/team" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />돌아가기
        </Link>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
          {/* Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 h-28" />

          {/* Content */}
          <div className="px-8 pb-8">
            {/* Avatar + Name */}
            <div className="flex flex-col items-center -mt-14 mb-6">
              <div className="w-28 h-28 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center mb-3">
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white text-4xl">
                  🐻
                </div>
              </div>
              <h1 className="text-xl font-bold text-slate-900">박미소</h1>
            </div>

            {/* Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>miso.park@khu.ac.kr</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>컴퓨터공학과</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <IdCard className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>2024123456</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>경기도 용인시</span>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">자기소개</h2>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-slate-700 text-sm leading-relaxed">
                  안녕하세요! 웹 개발에 관심이 많은 컴퓨터공학과 3학년 박미소입니다.
                  프론트엔드 개발과 UI/UX 디자인에 특히 관심이 있으며, React와
                  TypeScript를 활용한 프로젝트 경험이 있습니다. 팀워크를 중시하며
                  적극적으로 소통하는 편입니다.
                </p>
              </div>
            </div>

            {/* Evaluations */}
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">평가</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {evaluations.map((ev, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 mb-1.5">{ev.category}</p>
                    {renderStars(ev.rating)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
