import { useEffect, useState } from "react";
import { Link, FileText, Presentation, File, Trash2, X, Plus } from "lucide-react";
import { useParams } from "react-router";
import api from "../store/api";

interface ReferenceFile {
  id: number;
  file_name: string;
  file_url: string;
  uploader_name?: string;
  created_at: string;
}

interface FileStorageProps {
  teamId?: string;
}

export function FileStorage({ teamId: propsTeamId }: FileStorageProps) {
  const { teamId: routeTeamId } = useParams<{ teamId: string }>();
  const teamId = propsTeamId || routeTeamId || "3";

  const [files, setFiles] = useState<ReferenceFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "pdf" || ext === "docx" || ext === "txt") return <FileText className="w-8 h-8 text-rose-500 shrink-0" />;
    if (ext === "pptx" || ext === "ppt") return <Presentation className="w-8 h-8 text-amber-500 shrink-0" />;
    return <File className="w-8 h-8 text-blue-500 shrink-0" />;
  };

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/api/teams/${teamId}/references`);
      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("자료 목록 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, [teamId]);

  const closeModal = () => {
    setIsModalOpen(false);
    setFileName("");
    setFileUrl("");
  };

  const handleSubmit = async () => {
    if (!fileName.trim() || !fileUrl.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post(`/api/teams/${teamId}/references`, { file_name: fileName.trim(), file_url: fileUrl.trim() });
      closeModal();
      fetchFiles();
    } catch (error) {
      console.error("자료 등록 실패:", error);
      alert("자료 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (fileId: number) => {
    if (!window.confirm("선택한 자료를 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/references/${fileId}`);
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      console.error("자료 삭제 실패:", error);
      alert("자료 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📂</span>
          <h1 className="text-3xl font-bold text-gray-900">자료실</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl shadow-md hover:opacity-95 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />자료 등록
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-500 font-medium">자료 목록을 불러오는 중...</div>
      ) : files.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-amber-200 p-16 text-center shadow-sm">
          <File className="w-12 h-12 text-amber-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">등록된 자료가 없습니다.</p>
          <p className="text-xs text-gray-400 mt-1">우측 상단 버튼을 통해 첫 번째 자료를 등록해보세요.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-md border border-amber-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-50/50 border-b border-amber-100 text-gray-700 font-semibold text-sm">
                  <th className="p-4 pl-6">파일명</th>
                  <th className="p-4">올린이</th>
                  <th className="p-4">등록 일자</th>
                  <th className="p-4 pr-6 text-right">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50 text-gray-700 text-sm">
                {files.map(file => (
                  <tr key={file.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="p-4 pl-6 font-medium text-gray-900">
                      <div className="flex items-center gap-3 max-w-md">
                        {getFileIcon(file.file_name)}
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer"
                          className="truncate hover:text-amber-700 hover:underline" title={file.file_name}>
                          {file.file_name}
                        </a>
                      </div>
                    </td>
                    <td className="p-4 font-medium">{file.uploader_name ?? "-"}</td>
                    <td className="p-4 text-gray-500">{new Date(file.created_at).toLocaleDateString()}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer"
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors" title="열기">
                          <Link className="w-4 h-4" />
                        </a>
                        <button onClick={() => handleDelete(file.id)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors" title="삭제">
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
            <button onClick={closeModal} disabled={isSubmitting}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-600" />자료 등록
            </h2>
            <p className="text-xs text-gray-500 mb-6">파일 이름과 공유 URL을 입력하세요. (Google Drive, GitHub 등)</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">파일 이름</label>
                <input type="text" value={fileName} onChange={e => setFileName(e.target.value)}
                  placeholder="예: 최종 발표자료.pptx"
                  className="w-full px-4 py-2.5 border border-amber-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">파일 URL</label>
                <input type="url" value={fileUrl} onChange={e => setFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-2.5 border border-amber-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={closeModal} disabled={isSubmitting}
                className="px-4 py-2.5 rounded-2xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                취소
              </button>
              <button onClick={handleSubmit} disabled={!fileName.trim() || !fileUrl.trim() || isSubmitting}
                className="px-5 py-2.5 rounded-2xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:opacity-95 disabled:opacity-40 transition-all">
                {isSubmitting ? "등록 중..." : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
