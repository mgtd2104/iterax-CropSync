import React, { useState, useRef, useEffect, useCallback } from "react";
import { useUser } from "../context/UserContext";

const DiseaseDetection = () => {
  const { user, profile } = useUser();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [diseaseUsedByGuest, setDiseaseUsedByGuest] = useState(() => localStorage.getItem("guest_disease_used") === "true");
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const isGuest = user?.isAnonymous || profile?.is_guest;
  const disabled = isGuest && diseaseUsedByGuest;

  const convertToBase64 = (selectedFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(selectedFile);
    });
  };

  const handleFileSelect = useCallback((selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("image/")) {
      setResult({ error: "Please select an image file" });
      return;
    }
    setFile(selectedFile);
    setResult(null);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  }, []);

  const handleFileChange = (e) => {
    handleFileSelect(e.target.files[0]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const blob = items[i].getAsFile();
        handleFileSelect(blob);
        break;
      }
    }
  }, [handleFileSelect]);

  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (dropZone) {
      dropZone.addEventListener("dragenter", handleDrag);
      dropZone.addEventListener("dragover", handleDrag);
      dropZone.addEventListener("dragleave", handleDrag);
      dropZone.addEventListener("drop", handleDrop);
      document.addEventListener("paste", handlePaste);
    }
    return () => {
      if (dropZone) {
        dropZone.removeEventListener("dragenter", handleDrag);
        dropZone.removeEventListener("dragover", handleDrag);
        dropZone.removeEventListener("dragleave", handleDrag);
        dropZone.removeEventListener("drop", handleDrop);
      }
      document.removeEventListener("paste", handlePaste);
    };
  }, [handleDrag, handleDrop, handlePaste]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleAnalyze = async () => {
    if (!file || disabled) return;
    setAnalyzing(true);
    try {
      const base64 = await convertToBase64(file);
      const response = await fetch("http://localhost:5000/api/disease-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 })
      });
      if (!response.ok) throw new Error("Failed to analyze");
      const data = await response.json();
      setResult(data);
      if (isGuest) {
        localStorage.setItem("guest_disease_used", "true");
        setDiseaseUsedByGuest(true);
      }
    } catch (err) {
      console.error("Disease detection error:", err);
      setResult({ error: "Analysis failed. Please try again." });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1B4332]">Disease Detection</h1>
          <p className="text-gray-600 mt-2">Upload a crop leaf photo for AI-powered disease analysis</p>
        </div>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Upload Card */}
          <div className="bg-white border border-[#2D6A4F]/20 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
            {/* Upload/Drop Zone Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                disabled={disabled}
                className="hidden"
                id="file-upload"
              />

              <div
                ref={dropZoneRef}
                className={`w-full max-w-md relative ${
                  dragActive ? "ring-2 ring-[#2D6A4F] ring-offset-2" : ""
                }`}
              >
                {previewUrl ? (
                  // Image Preview Mode
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#F1F7F3] border border-[#2D6A4F]/20">
                    <img
                      src={previewUrl}
                      alt="Crop preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={handleCameraCapture}
                        disabled={disabled || analyzing}
                        className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Retake / Change image"
                        aria-label="Retake photo"
                      >
                        <svg className="w-5 h-5 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={handleRemoveImage}
                        disabled={analyzing}
                        className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove image"
                        aria-label="Remove image"
                      >
                        <svg className="w-5 h-5 text-[#D64545]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  // Drop Zone / Upload Area
                  <div
                    className={`w-full aspect-[4/3] rounded-xl border-2 border-dashed transition-all duration-200 ${
                      dragActive
                        ? "border-[#2D6A4F] bg-[#2D6A4F]/5"
                        : "border-[#2D6A4F]/30 hover:border-[#2D6A4F]/60 hover:bg-[#F1F7F3]"
                    } flex flex-col items-center justify-center cursor-pointer`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCameraCapture()}
                    aria-label="Upload crop image"
                  >
                    <div className="text-center px-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F1F7F3] flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#2D6A4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-lg font-semibold text-[#1B4332] mb-1">Drag & drop a crop photo here</p>
                      <p className="text-sm text-gray-500 mb-3">or click to browse / paste from clipboard</p>
                      <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
                        <kbd className="px-2 py-0.5 bg-gray-100 rounded border border-gray-200">Ctrl+V</kbd>
                        <span>to paste</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">Camera capture supported</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hint text */}
              {!previewUrl && !disabled && (
                <p className="mt-4 text-xs text-gray-400 text-center max-w-md">
                  Tip: Take a clear photo of the affected leaf. Works best with good lighting.
                </p>
              )}
            </div>

            {/* Analyze Button */}
            <div className="border-t border-[#2D6A4F]/10 p-4 bg-[#F8FAF7]">
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !file || disabled}
                className={`w-full px-6 py-3 text-base font-semibold rounded-xl transition-colors ${
                  disabled
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : analyzing
                    ? "bg-[#2D6A4F] text-white cursor-wait"
                    : file
                    ? "bg-[#2D6A4F] text-white hover:bg-[#1B4332]"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {disabled ? "Login to use again" : analyzing ? "Analyzing..." : file ? "Analyze Disease" : "Upload an image first"}
              </button>
            </div>
          </div>

          {/* RIGHT: Results Card */}
          <div className="bg-white border border-[#2D6A4F]/20 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
            <div className="border-b border-[#2D6A4F]/10 px-6 py-4 bg-[#F8FAF7]">
              <h2 className="text-lg font-semibold text-[#1B4332] flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Analysis Result
              </h2>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {analyzing && (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-10 h-10 border-3 border-[#2D6A4F] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600 font-medium text-center">Analyzing leaf image with AI...</p>
                  <p className="text-xs text-gray-400 text-center">This may take a few seconds</p>
                </div>
              )}

              {result && !analyzing && (
                <div className="space-y-4">
                  {result.error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">Error</span>
                      </div>
                      <p className="text-sm">{result.error}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-[#F1F7F3] border border-[#2D6A4F]/10 rounded-xl p-4">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                          {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!analyzing && !result && (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                  <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-500">No analysis yet</p>
                  <p className="text-sm mt-1">Upload an image on the left and click "Analyze Disease"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Guest Notice */}
        {disabled && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm text-center">
            Guest mode allows 1 disease detection. <a href="/onboarding" className="font-semibold underline hover:text-amber-700">Create an account</a> for unlimited use.
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseDetection;
