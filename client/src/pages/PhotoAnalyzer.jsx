import React, { useState, useRef } from "react";
import API from "../services/api"; // axios instance with photoAnalyze helper
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faUpload,
  faMagic,
  faStar,
  faEye,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";

export default function PhotoAnalyzer() {
  const fileInputRef = useRef();
  const [imageSrc, setImageSrc] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const handleFile = (file) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target.result);
      setResults(null);
    };
    reader.readAsDataURL(file);
  };

  const onInputChange = (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const analyze = async () => {
    if (!imageFile) return;
    setAnalyzing(true);
    try {
      const { data } = await API.photoAnalyze(imageFile);
      setResults(data);
    } catch (err) {
      console.error("Analysis error:", err);
      if (!err.response) {
        alert("Analysis failed: network error. Please check your connection.");
      } else {
        const msg = err.response.data?.error || err.message;
        alert(`Analysis failed: ${msg}`);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImageSrc(null);
    setImageFile(null);
    setResults(null);
    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen px-6 py-8 bg-[#101010] text-white font-sans">
      <div className="text-center mb-8">
        <div className="inline-flex items-center bg-[#2a2a2a] text-purple-400 px-4 py-1 rounded-full mb-2">
          <FontAwesomeIcon icon={faMagic} className="mr-2" />
          <span>AI‑Powered Analysis</span>
        </div>
        <h1 className="text-4xl font-bold">Photo Beauty Analyzer</h1>
        <p className="text-gray-400 mt-2">
          Upload your photo and let our AI analyze beauty metrics, facial
          features, and personalized feedback
        </p>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Upload Panel */}
        <div className="flex-1 bg-[#1f1f1f] rounded-lg p-8 min-h-[28rem]">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <FontAwesomeIcon icon={faCamera} className="mr-2" /> Upload Photo
          </h2>
          <div
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={`relative flex flex-col items-center justify-center
              border-2 border-dashed rounded-lg p-10 text-center transition-colors
              duration-200 cursor-pointer ${
                dragActive
                  ? "border-purple-500 bg-[#2a2a2a]"
                  : "border-gray-600 hover:border-purple-500"
              }`}
          >
            {!imageSrc ? (
              <>
                <FontAwesomeIcon
                  icon={faCamera}
                  size="4x"
                  className="text-gray-500 mb-4"
                />
                <p className="text-gray-400 mb-4">
                  Drag & drop or click to upload
                </p>
                <button className="inline-flex items-center bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition">
                  <FontAwesomeIcon icon={faUpload} className="mr-2" />
                  Select Photo
                </button>
              </>
            ) : (
              <img
                src={imageSrc}
                alt="Preview"
                className="max-h-80 rounded-md"
              />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onInputChange}
            />
          </div>
          {imageSrc && (
            <div className="mt-6 flex justify-center items-center space-x-4">
              <button
                onClick={analyze}
                disabled={analyzing}
                className="flex-1 inline-flex justify-center items-center bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full transition disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faMagic} className="mr-2" />
                {analyzing ? "Analyzing..." : "Analyze Photo"}
              </button>
              <button
                onClick={reset}
                className="p-3 bg-[#2a2a2a] hover:bg-[#3b3b3b] rounded-full transition"
              >
                <FontAwesomeIcon icon={faUndo} />
              </button>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="flex-1 bg-[#1f1f1f] rounded-lg p-8 min-h-[28rem]">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <FontAwesomeIcon icon={faStar} className="mr-2" /> Analysis Results
          </h2>

          {!results ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <FontAwesomeIcon icon={faEye} size="4x" className="mb-4" />
              <p className="text-lg">No Analysis Yet</p>
              <p>Upload a photo to see detailed beauty analysis</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Score */}
              <div className="bg-purple-800 bg-opacity-40 rounded-lg p-6 text-center">
                <h3 className="text-5xl font-bold text-purple-400">
                  {results.beautyScore}
                </h3>
                <p className="text-gray-300 mt-1">Beauty Score</p>
                <p className="text-sm text-gray-400 mt-1">
                  {results.confidence} Confidence
                </p>
              </div>

              {/* Feature Bars */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Feature Analysis</h4>
                {Array.isArray(results.features) ? (
                  results.features.map(([label, val]) => (
                    <div key={label} className="mb-4">
                      <div className="flex justify-between mb-2 text-sm">
                        <span>{label}</span>
                        <span>{val.toFixed(1)}/10</span>
                      </div>
                      <div className="w-full h-3 bg-gray-700 rounded-full">
                        <div
                          className="h-3 bg-purple-400 rounded-full"
                          style={{ width: `${(val / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No feature data.</p>
                )}
              </div>

              {/* Mood & Recommendations */}
              <div className="space-y-6">
                <div className="bg-purple-900 bg-opacity-40 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Detected Mood</h4>
                  <p className="text-purple-300">{results.mood}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {results.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 flex space-x-4">
                <button className="flex-1 bg-[#2a2a2a] hover:bg-[#3b3b3b] text-white px-6 py-3 rounded-lg transition">
                  Save Results
                </button>
                <button className="flex-1 bg-[#2a2a2a] hover:bg-[#3b3b3b] text-white px-6 py-3 rounded-lg transition">
                  Share
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
