import { useEffect, useState, useRef, useCallback } from "react";
import { Upload, Download, FileText, Presentation, File, Trash2, X } from "lucide-react";
import { useParams } from "react-router"; 

// 자료실 파일 개체 데이터 세부 사양 인터페이스
interface ReferenceFile {
  id: number;
  name: string;
  url: string;
  uploader: string;
  date: string;
}

interface FileStorageProps {
  teamId?: string;
}

export function FileStorage({ teamId: propsTeamId }: FileStorageProps) {
  // 2. URL 파라미터에서 team_id를 추출 (다른 컴포넌트 구조와 동기화)
  const { team_id: routeTeamId } = useParams<{ team_id: string }>();
  
  // Props로 전달받은 값이 있으면 그것을 쓰고, 없으면 URL 파라미터를 사용 (기본값 "3")
  const teamId = propsTeamId || routeTeamId || "3";

  // 환경 변수(.env)에서 엔드포인트 URL 동적 주입
  const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL as string) || "http://localhost:8000";
  
  // 백엔드 요청 인가 처리를 위한 액세스 토큰 선언
  const ACCESS_TOKEN = "your_actual_bearer_token_here";

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 컴포넌트 내 주요 내부 상태 배열 관리자 정의
  const [files, setFiles] = useState<ReferenceFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 네트워크 인가 공통 요청 헤더 정의 맵핑 함수 생성 (useCallback 구조 설계)
  const getAuthHeaders = useCallback((contentType?: string) => {
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${ACCESS_TOKEN}`,
    };
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    return headers;
  }, [ACCESS_TOKEN]);

  // 업로드된 파일 확장자 종류를 스캔하여 해당하는 테마 디자인 아이콘을 반환하는 유틸 함수
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf" || ext === "docx" || ext === "txt") {
      return <FileText className="w-8 h-8 text-rose-500 shrink-0" />;
    }
    if (ext === "pptx" || ext === "ppt") {
      return <Presentation className="w-8 h-8 text-amber-500 shrink-0" />;
    }
    return <File className="w-8 h-8 text-blue-500 shrink-0" />;
  };

  // 백엔드 파일 라우터로부터 저장 문서 레코드 로드 기능 수행 (GET)
  const fetchUploadedFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/teams/${teamId}/files`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("스토리지 인덱스 응답 오류 발생");
      const data = await res.json();
      setFiles(data);
    } catch (error) {
      console.error("클라우드 공유 파일 목록 패치 실패 에러:", error);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, teamId, getAuthHeaders]);

  useEffect(() => {
    fetchUploadedFiles();
  }, [fetchUploadedFiles]);

  // 대화상자 모달 폼 소거 처리 및 선택 초기화
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 로컬 파일 피кер 로딩 유효성 수신 검사
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 멀티파트 형식 데이터셋 전송 파일 영구 인가 핸들러 (POST)
  const handleFileUploadSubmit = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setIsUploading(true);
      const res = await fetch(`${API_BASE_URL}/api/teams/${teamId}/files`, {
        method: "POST",
        headers: getAuthHeaders(), // 브라우저가 boundary값을 수동 계산하도록 강제 처리하기 위해 컨텐츠 타입 미지정
        body: formData,
      });

      if (!res.ok) throw new Error("엔드포인트 미승인 응답 발생");
      
      alert("파일이 성공적으로 클라우드에 업로드되었습니다!");
      closeModal();
      fetchUploadedFiles();
    } catch (error) {
      console.error("서버 데이터 파싱 스트림 장애 디버그:", error);
      alert("파일 업로드 도중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  // 기존 등록 리소스 영구 파기 수행 요청 통신 핸들러 (DELETE)
  const handleFileResourceDelete = async (fileId: number) => {
    if (!window.confirm("선택한 보관 파일을 스토리지에서 영구히 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("삭제 쿼리 프로세스 가동 실패");
      
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      alert("리소스가 스토리지에서 완벽히 삭제되었습니다.");
    } catch (error) {
      console.error("파일 무결성 인가 파기 제어 장애 발생:", error);
      alert("파일 삭제 요청 중 에러가 발생했습니다.");
    }
  };

  // 1. 자료 목록 조회 (GET) - useCallback 적용으로 무한 루프 방지
  const fetchReferences = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/api/teams/${teamId}/references`, {
        method: "GET",
        headers: getAuthHeaders(),
        signal,
      });
      if (!response.ok) throw new Error("자료 목록을 불러오지 못했습니다.");

      const data = await response.json();
      setFiles(data);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error fetching references:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [BASE_URL, teamId, getAuthHeaders]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      setSelectedFile(fileList[0]);
    }
  };

  // 2. 자료 업로드 제출 (POST)
  const handleFileUploadSubmit = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);

      const requestBody = {
        file_name: selectedFile.name,
        file_url: `https://supabase-storage-url.com/v1/obj/public/refs/${encodeURIComponent(selectedFile.name)}`
      };

      const response = await fetch(`${BASE_URL}/api/teams/${teamId}/references`, {
        method: "POST",
        headers: getAuthHeaders("application/json"),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error("파일 업로드에 실패했습니다.");

      alert("파일이 성공적으로 업로드되었습니다.");
      closeModal();
      fetchReferences(); 
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 3. 자료 삭제 (DELETE)
  const handleDeleteFile = async (refId: number) => {
    if (!confirm("정말 이 자료를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`${BASE_URL}/api/references/${refId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        alert("자료가 성공적으로 삭제되었습니다.");
        setFiles((prev) => prev.filter((file) => file.id !== refId));
      } else {
        alert("삭제 권한이 없거나 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error deleting reference:", error);
      alert("삭제 요청 중 오류가 발생했습니다.");
    }
  };

  // 의존성 배열에 fetchReferences를 안전하게 주입하여 불필요한 재호출 및 린트 에러 방지
  useEffect(() => {
    const controller = new AbortController();
    fetchReferences(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchReferences]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📂</span>
            <h1 className="text-3xl font-bold text-gray-900">자료실 (File Storage)</h1>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl shadow-md hover:opacity-95 transition-all text-sm"
        >
          <Upload className="w-4 h-4" />
          파일 업로드
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-500 font-medium">원격 클라우드 저장소 파일 동기화 중...</div>
      ) : files.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-amber-200 p-16 text-center shadow-sm">
          <File className="w-12 h-12 text-amber-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">자료실에 등록된 파일이 없습니다.</p>
          <p className="text-xs text-gray-400 mt-1">우측 상단 버튼을 통해 첫 번째 공유 파일을 업로드해보세요.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-md border border-amber-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-50/50 border-b border-amber-100 text-gray-700 font-semibold text-sm">
                  <th className="p-4 pl-6">파일명</th>
                  <th className="p-4">올린 이</th>
                  <th className="p-4">등록 일자</th>
                  <th className="p-4 pr-6 text-right">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50 text-gray-700 text-sm">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="p-4 pl-6 font-medium text-gray-900">
                      <div className="flex items-center gap-3 max-w-md">
                        {getFileIcon(file.name)}
                        <span className="truncate" title={file.name}>{file.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium">{file.uploader}</td>
                    <td className="p-4 text-gray-500">{file.date}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={file.url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                          title="다운로드"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleFileResourceDelete(file.id)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-100 relative">
            <button onClick={closeModal} disabled={isUploading} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-600" />
              공유 파일 업로드
            </h2>
            <p className="text-xs text-gray-500 mb-6">팀원들과 원격으로 영구 공유할 프로젝트 파일을 로컬 디바이스에서 선택하세요.</p>

            <div className="mb-6">
              {!selectedFile ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-amber-200 hover:border-amber-400 rounded-2xl p-8 text-center cursor-pointer bg-amber-50/20 hover:bg-amber-50/40 transition-all group"
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  <Upload className="w-8 h-8 text-amber-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-semibold text-amber-800">클릭하여 파일 탐색기 열기</p>
                  <p className="text-xs text-gray-400 mt-1">파일의 단일 업로드 용량 제한은 최대 50MB입니다.</p>
                </div>
              ) : (
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {getFileIcon(selectedFile.name)}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate" title={selectedFile.name}>{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-xs text-rose-600 hover:underline px-2 py-1">변경</button>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={closeModal} disabled={isUploading} className="px-4 py-2.5 rounded-2xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">취소</button>
              <button onClick={handleFileUploadSubmit} disabled={!selectedFile || isUploading} className="px-5 py-2.5 rounded-2xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:opacity-95 disabled:opacity-40 transition-all">{isUploading ? "업로드 중..." : "파일 제출"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}