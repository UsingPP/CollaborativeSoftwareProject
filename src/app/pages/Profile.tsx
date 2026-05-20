<<<<<<< HEAD
import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Mail, MapPin, BookOpen, IdCard, Star } from "lucide-react";
import api from "../store/api";
import { BASE_API_URL, PORT,  } from "../types/tpyes";


/*------------------------------
API 구현부
-------------------------------*/ 
 const getMyPageInfo = async ( ) => {
  try {
    const res = await api.get(`/api/users/me`);
    const data = res.data;

    if (data.department === "" || data.department === undefined) {
      data.department = "Nothing";
    }
    if (data.student_id === "" || data.student_id === undefined) {
      data.student_id = "0000000000";
    }
      
    if (data.profile_image_url === "" || data.profile_image_url === undefined )  {
      data.profile_image_url = "🐻";
    }
    if (data.residence === "" || data.residence === undefined ) {
      data.residence = "미상";
    }
    if (data.intro === "" || data.intro === undefined ) {
      data.intro = "아직 자기소개를 작성하지 않았어요";
    }
    //console.log(data);
    return data;
  } catch (err) {
    return {};
  }

  return {};
  
 };

 const patchMyPageInfo = async ( info : any) => {
  //const res = await axios.patch(`${BASE_API_URL}:${PORT}/api/users/me`);
  try {
    const res = await api.patch(`/api/users/me`);
  } catch( err ) {

  }
 }

 interface UserProfileFormat {
  "id"?: string,
  "email"?: string,
  "name"?: string,
  "department"?: string,
  "student_id"?: string,
  "profile_image_url"?: string,
  "residence"?: string,
  "intro"?: string,
  "created_at"? : string,
  "avg_participation"?: number,
  "avg_responsibility"?: number,
  "avg_communication"?: number,
  "avg_collaboration"?: number,
  "avg_creativity"?: number,
  "total_evaluations"?:number,
 }

export function Profile() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [ info, setInfo ] = useState({  id : "",
                                        email : "",
                                        name : "",
                                        department : "",
                                        student_id : "",
                                        profile_image_url : "",
                                        residence : "",
                                        intro : "",
                                        created_at : "",
                                        avg_participation : "",
                                        avg_responsibility : "",
                                        avg_communication : "",
                                        avg_collaboration : "",
                                        avg_creativity : "",
                                        total_evaluations : "",
                                        });
  const catagoryMap = {
    avg_participation : "참여도",
    avg_responsibility : "책임감",
    avg_communication : "소통",
    avg_collaboration : "협업",
    avg_creativity : "창의성",
    total_evaluations : "총합",
  }

  const [editForm, setEditForm] = useState(info);

  const handleOpenModal = () => {
    setEditForm(info); // 모달 열 때 현재 info 데이터로 초기화
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await patchMyPageInfo(editForm); 
    setInfo(editForm);
    setIsModalOpen(false); 
  };

  useEffect( (() => {
    const getProfile = async () => {
      const data = await getMyPageInfo();
      if ( Object.keys(data).length != 0) {
        setInfo(data);
        //console.log(data);
      }
    }
    getProfile();
  }), [] );

  const renderStars = (srating: string) => {
    const rating = parseFloat(srating);
    return(
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
  );}

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex justify-between items-center mb-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />돌아가기
          </button>

          {/* 수정하기 버튼 */}
          <button 
            type="button"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm mr-4"
            onClick={() => {
              handleOpenModal();
            }}
          >
           프로필 수정
          </button>
        </div>
=======
import { Link } from "react-router";
import { ArrowLeft, Mail, MapPin, Calendar, Star, Upload, Edit3 } from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Profile() {
  const [showScheduleUpload, setShowScheduleUpload] = useState(false);
  
  const skills = [
    "React",
    "TypeScript",
    "Node.js",
    "Python",
    "Figma",
    "UI/UX Design",
  ];

  const evaluations = [
    { category: "협업 능력", rating: 4.5 },
    { category: "의사소통", rating: 5.0 },
    { category: "책임감", rating: 4.8 },
    { category: "전문성", rating: 4.3 },
    { category: "창의성", rating: 4.6 },
  ];

  const schedule = [
    { day: "월", time: "11-12", subject: "영어회화2", code: "16502", color: "bg-red-300" },
    { day: "화", time: "9-11", subject: "행정과 사회", code: "16416", color: "bg-yellow-200" },
    { day: "수", time: "9-11", subject: "에삭이론", code: "24209", color: "bg-cyan-200" },
    { day: "수", time: "13-16", subject: "거시조직론", code: "19416", color: "bg-lime-300" },
    { day: "수", time: "16-18", subject: "진로멘토링", code: "19416", color: "bg-blue-300" },
    { day: "목", time: "9-11", subject: "행정학개론", code: "19416", color: "bg-orange-200" },
    { day: "목", time: "12-15", subject: "학술지탐구", code: "22221", color: "bg-purple-400" },
    { day: "토", time: "10-13", subject: "한국의역사와문화", code: "", color: "bg-green-300" },
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= Math.floor(rating)
                ? "fill-amber-500 text-amber-500"
                : star - 0.5 <= rating
                ? "fill-amber-500 text-amber-500"
                : "fill-gray-200 text-gray-200"
            }`}
            style={
              star - 0.5 === rating
                ? {
                    clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
                  }
                : undefined
            }
          />
        ))}
        <span className="ml-2 text-sm font-semibold text-gray-700">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Back Button */}
        <Link
          to="/team"
          className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          돌아가기
        </Link>
>>>>>>> origin/123

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-amber-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 h-32" />

          {/* Profile Content */}
          <div className="px-8 pb-8">
            <div className="flex flex-col items-center -mt-16 mb-6">
              <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center mb-4">
                <div className="w-full h-full bg-gradient-to-br from-amber-600 to-orange-500 rounded-full flex items-center justify-center text-white text-5xl">
                  🐻
                </div>
              </div>
<<<<<<< HEAD
              <h1 className="text-xl font-bold text-slate-900"> {info.name}</h1>
=======
              <h1 className="text-2xl font-bold text-gray-900">박미소</h1>
              <p className="text-gray-600 mt-1">컴퓨터공학과 · 3학년</p>
>>>>>>> origin/123
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Contact Info */}
              <div className="space-y-3">
<<<<<<< HEAD
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                  <span> { info.email } </span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                  <span> {info.department} </span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <IdCard className="w-4 h-4 text-blue-500 shrink-0" />
                  <span> {info.student_id}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 text-sm">
                  <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                  <span> {info.residence} </span>
=======
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="w-5 h-5 text-amber-700" />
                  <span>miso.park@khu.ac.kr</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-amber-700" />
                  <span>경기도 용인시</span>
>>>>>>> origin/123
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar className="w-5 h-5 text-amber-700" />
                  <span>2024년 입학</span>
                </div>
              </div>

              {/* Role */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                  선호 역할
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full text-sm">
                    백엔드 개발
                  </span>
                  <span className="px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full text-sm">
                    보안관리
                  </span>
                </div>
              </div>
            </div>

            {/* About Me */}
            <div className="mb-8">
<<<<<<< HEAD
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">자기소개</h2>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-slate-700 text-sm leading-relaxed">
                  {info.intro}
=======
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                자기소개
              </h2>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
                <p className="text-gray-700 leading-relaxed">
                  안녕하세요! 웹 개발에 관심이 많은 컴퓨터공학과 3학년 박미소입니다.
                  프론트엔드 개발과 UI/UX 디자인에 특히 관심이 있으며, React와
                  TypeScript를 활용한 프로젝트 경험이 있습니다. 팀워크를 중시하며
                  적극적으로 소통하는 편입니다. 함께 좋은 결과를 만들어가고 싶습니다!
>>>>>>> origin/123
                </p>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                기술 스택
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-white border border-amber-200 rounded-full text-gray-700 hover:border-amber-400 hover:bg-amber-50 transition-all"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Evaluations */}
<<<<<<< HEAD
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">평가</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(catagoryMap).map(([engKey, korLabel]) => {
                  // info 객체에서 영어 키(engKey)로 점수를 찾아옵니다.
                  const rating = info[engKey as keyof typeof info];
                  
                  // 해당 항목의 점수가 없으면 렌더링하지 않고 넘어갑니다.
                  if (rating === undefined || rating === null) return null;

                  return (
                    <div key={engKey} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      {/* 화면에는 한글 이름(korLabel)을 출력합니다. */}
                      <p className="text-xs font-semibold text-slate-500 mb-1.5">{korLabel}</p>
                      {renderStars(rating)}
                    </div>
                  );
                })}
=======
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                평가
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evaluations.map((evaluation, index) => (
                  <div key={index} className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">
                      {evaluation.category}
                    </h3>
                    {renderStars(evaluation.rating)}
                  </div>
                ))}
>>>>>>> origin/123
              </div>
            </div>

            {/* Schedule */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-900">시간표</h2>
                <button
                  onClick={() => setShowScheduleUpload(!showScheduleUpload)}
                  className="flex items-center gap-2 px-4 py-2 text-amber-700 hover:bg-amber-50 rounded-full transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  {showScheduleUpload ? "취소" : "수정"}
                </button>
              </div>

              {showScheduleUpload ? (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                    <p className="text-gray-700 mb-4">
                      에브리타임에서 시간표 이미지를 업로드해주세요
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="schedule-upload"
                    />
                    <label
                      htmlFor="schedule-upload"
                      className="inline-block px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-full hover:from-amber-700 hover:to-orange-600 transition-all cursor-pointer shadow-md"
                    >
                      파일 선택
                    </label>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden shadow-sm">
                  {/* Timetable Grid */}
                  <div className="grid grid-cols-7 text-center text-sm">
                    {/* Header */}
                    <div className="bg-amber-50 border-b border-r border-amber-100 p-2 font-semibold text-amber-900">
                      시간
                    </div>
                    {["월", "화", "수", "목", "금", "토"].map((day) => (
                      <div
                        key={day}
                        className="bg-amber-50 border-b border-r border-amber-100 p-2 font-semibold text-amber-900 last:border-r-0"
                      >
                        {day}
                      </div>
                    ))}

                    {/* Time Rows */}
                    {[9, 10, 11, 12, 1, 2, 3, 4].map((hour) => (
                      <>
                        <div
                          key={hour}
                          className="bg-amber-50 border-b border-r border-amber-100 p-2 text-gray-700 font-medium"
                        >
                          {hour}
                        </div>
                        {["월", "화", "수", "목", "금", "토"].map((day) => {
                          const classes = schedule.filter(
                            (item) =>
                              item.day === day &&
                              ((hour >= 9 && hour <= 12 && item.time.includes(`${hour}`)) ||
                                (hour >= 1 && hour <= 4 && item.time.includes(`${hour}`)))
                          );

                          return (
                            <div
                              key={`${day}-${hour}`}
                              className="border-b border-r border-amber-100 p-1 last:border-r-0 relative min-h-[60px]"
                            >
                              {classes.map((cls, idx) => {
                                const [start, end] = cls.time.split("-").map(Number);
                                const isStart =
                                  (hour >= 9 && hour <= 12 && hour === start) ||
                                  (hour >= 1 && hour <= 4 && hour === start);

                                if (!isStart) return null;

                                const duration = end - start;
                                return (
                                  <div
                                    key={idx}
                                    className={`${cls.color} rounded-lg p-2 text-xs text-gray-800 font-medium absolute inset-0 m-1 overflow-hidden`}
                                    style={{
                                      height: `${duration * 60 - 8}px`,
                                    }}
                                  >
                                    <div className="font-semibold">{cls.subject}</div>
                                    {cls.code && (
                                      <div className="text-[10px] mt-1">{cls.code}</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    
    {/* 💡 모달 (Modal) UI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">프로필 수정</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
              </button>
            </div>

            {/* 모달 바디 (입력 폼) */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">이름</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">학과</label>
                <input
                  type="text"
                  name="department"
                  value={editForm.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">학번</label>
                <input
                  type="text"
                  name="student_id"
                  value={editForm.student_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">거주지</label>
                <input
                  type="text"
                  name="residence"
                  value={editForm.residence}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">자기소개</label>
                <textarea
                  name="intro"
                  rows={4}
                  value={editForm.intro}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {/* 모달 푸터 (버튼 영역) */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {handleSave();}}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>


  );
}