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
              <h1 className="text-xl font-bold text-slate-900"> {info.name}</h1>
            </div>

            {/* Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              <div className="space-y-3">
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
                </div>
              </div>
            </div>

            {/* About */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">자기소개</h2>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-slate-700 text-sm leading-relaxed">
                  {info.intro}
                </p>
              </div>
            </div>

            {/* Evaluations */}
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
              </div>
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