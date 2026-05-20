import { useEffect, useState, useRef, useCallback } from "react";
import { Upload, Download, FileText, Presentation, File, Trash2, X } from "lucide-react";

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

export function FileStorage({ teamId = "3" }: FileStorageProps) {
  // 로컬 환경 기준 설정
  const BASE_URL = "http://127.0.0.1:8000"; 
  
  // 임시 Bearer 토큰
  const ACCESS_TOKEN = "your_actual_bearer_token_here";

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<ReferenceFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 공통 인증 헤더 구성 함수 (useCallback으로 메모이제이션하여 안정성 확보)
  const getAuthHeaders = useCallback((contentType?: string) => {
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${ACCESS_TOKEN}`,
    };
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    return headers;
  }, [ACCESS_TOKEN]);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pptx": case "ppt":
        return <Presentation className="w-8 h-8 text-orange-600" />;
      case "pdf": case "docx": case "doc": case "txt":
        return <FileText className="w-8 h-8 text-blue-600" />;
      case "png": case "jpg": case "jpeg": case "gif":
        return <File className="w-8 h-8 text-red-600" />;
      default:
        return <FileText className="w-8 h-8 text-gray-600" />;
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
      {/* 상단 헤더 영역 */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📁</span>
            <h1 className="text-3xl font-bold text-gray-900">자료실 (References)</h1>
          </div>
          <p className="text-gray-600 mt-1">팀 자료를 업로드하고 관리하세요</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-full hover:from-amber-700 hover:to-orange-600 transition-all flex items-center gap-2 shadow-md font-medium"
        >
          <Upload className="w-4 h-4" />
          파일 업로드
        </button>
      </div>

      {/* 메인 리스트 */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">자료를 불러오는 중입니다...</div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-amber-100 rounded-3xl bg-gray-50/30">
            업로드된 자료가 없습니다. 첫 번째 파일을 공유해보세요!
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="bg-white rounded-3xl shadow-md p-6 hover:shadow-lg transition-all border border-amber-100"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">{getFileIcon(file.name)}</div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {file.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                    <span>{file.uploader || "익명"}</span>
                    <span>·</span>
                    <span>{file.date || "날짜 정보 없음"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full hover:from-amber-200 hover:to-orange-200 transition-all flex items-center gap-2 text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    다운로드
                  </a>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="p-2 text-gray-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
                    title="파일 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 모달 창 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-gray-100 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-xl hover:bg-gray-50 transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-amber-50 text-amber-800 rounded-2xl">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">새 자료 업로드</h3>
            </div>

            <div className="space-y-4 mb-6">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              
              {!selectedFile ? (
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-amber-200 hover:border-amber-400 rounded-2xl p-8 text-center cursor-pointer bg-amber-50/30 hover:bg-amber-50/60 transition-all group">
                  <FileText className="w-10 h-10 text-amber-600/60 group-hover:text-amber-600 mx-auto mb-2 transition-colors" />
                  <p className="text-sm font-medium text-gray-700">클릭하여 파일 선택</p>
                </div>
              ) : (
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {getFileIcon(selectedFile.name)}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-xs text-rose-600 hover:underline px-2 py-1">변경</button>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={closeModal} disabled={isUploading} className="px-4 py-2.5 rounded-2xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">취소</button>
              <button onClick={handleFileUploadSubmit} disabled={!selectedFile || isUploading} className="px-5 py-2.5 rounded-2xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:opacity-95 disabled:opacity-40">
                {isUploading ? "등록 중..." : "전송하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}