import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { storage } from "../services/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL, listAll, deleteObject } from "firebase/storage";

export default function DocumentsVault() {
  const { user } = useUser();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadFiles = async () => {
    if (!user?.uid) return;
    try {
      const docsRef = storageRef(storage, `users/${user.uid}/documents`);
      const res = await listAll(docsRef);
      const urls = await Promise.all(res.items.map(async (item) => {
        const url = await getDownloadURL(item);
        return { name: item.name, fullPath: item.fullPath, url };
      }));
      setFiles(urls);
    } catch (err) {
      console.error("Load files error:", err);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [user?.uid]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid) return;
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const fileRef = storageRef(storage, `users/${user.uid}/documents/${file.name}`);
      await uploadBytes(fileRef, file);
      setSuccess("Uploaded successfully");
      loadFiles();
    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (fullPath) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await deleteObject(storageRef(storage, fullPath));
      setFiles((prev) => prev.filter((f) => f.fullPath !== fullPath));
    } catch (err) {
      console.error("Delete error:", err);
      setError("Delete failed");
    }
  };

  const isGuest = user?.isAnonymous;

  return (
    <div className="min-h-screen bg-[#F8FAF7] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-[#1B4332] mb-6">Documents Vault</h1>

        <div className="bg-[#F1F7F3] border border-[#2D6A4F]/20 rounded-xl p-6 shadow-sm">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#1B4332] mb-2">Upload Document</label>
            <div className="flex gap-3">
              <input
                type="file"
                onChange={handleUpload}
                disabled={uploading || isGuest}
                className="flex-1 px-4 py-2 border border-[#2D6A4F]/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 disabled:bg-gray-100"
              />
              <button
                disabled={uploading || isGuest}
                className="px-5 py-2 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-[#2D6A4F] text-white hover:bg-[#1B4332]"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>}

          {isGuest && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              Guest mode: uploads not persisted. <a href="/onboarding" className="font-semibold underline">Create account</a> to save documents.
            </p>
          )}

          <div className="border-t border-[#2D6A4F]/20 pt-4">
            <h2 className="text-lg font-semibold text-[#1B4332] mb-3">Uploaded Files</h2>
            {files.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No documents uploaded yet</p>
            ) : (
              <ul className="space-y-2">
                {files.map((file) => (
                  <li key={file.fullPath} className="flex items-center justify-between bg-white border border-[#2D6A4F]/10 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-[#2D6A4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#2D6A4F] font-semibold hover:underline">View</a>
                      <button
                        onClick={() => handleDelete(file.fullPath)}
                        className="text-sm text-red-600 font-semibold hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}