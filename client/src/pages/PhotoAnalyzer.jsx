import React, { useState, useRef, useContext } from "react";
import API from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faUpload,
  faMagic,
  faStar,
  faEye,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import ThemeContext from "../contexts/ThemeContext";

export default function PhotoAnalyzer() {
  const { dark } = useContext(ThemeContext);
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
      const msg = err.response?.data?.error || err.message;
      alert(`Analysis failed: ${msg}`);
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
    <div
      className={`${
        dark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      } min-h-screen px-6 py-8 font-sans`}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className={`${
            dark ? "bg-gray-800 text-purple-400" : "bg-gray-100 text-purple-600"
          } inline-flex items-center px-4 py-1 rounded-full mb-2`}
        >
          <FontAwesomeIcon icon={faMagic} className="mr-2" />
          <span>AI‑Powered Analysis</span>
        </div>
        <h1 className="text-4xl font-bold">Photo Beauty Analyzer</h1>
        <p className={`mt-2 ${dark ? "text-gray-400" : "text-gray-600"}`}>
          Upload your photo and let our AI analyze beauty metrics, facial
          features, and personalized feedback
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Upload Panel */}
        <div
          className={`${
            dark ? "bg-gray-800" : "bg-gray-100"
          } flex-1 rounded-lg p-8 min-h-[28rem]`}
        >
          <h2 className="mb-6 flex items-center text-2xl font-semibold">
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
            className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 text-center transition-colors duration-200 cursor-pointer ${
              dragActive
                ? "border-purple-500 bg-opacity-20 bg-purple-700"
                : dark
                ? "border-gray-600 hover:border-purple-500 bg-gray-800"
                : "border-gray-400 hover:border-purple-500 bg-gray-100"
            }`}
          >
            {!imageSrc ? (
              <>
                <FontAwesomeIcon
                  icon={faCamera}
                  size="4x"
                  className={`${dark ? "text-gray-500" : "text-gray-400"} mb-4`}
                />
                <p
                  className={`${dark ? "text-gray-400" : "text-gray-600"} mb-4`}
                >
                  Drag & drop or click to upload
                </p>
                <button
                  className={`${
                    dark
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  } inline-flex items-center px-5 py-2 rounded-full transition`}
                >
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
                className={`${
                  dark
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } p-3 rounded-full transition`}
              >
                <FontAwesomeIcon icon={faUndo} />
              </button>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div
          className={`${
            dark ? "bg-gray-800" : "bg-gray-100"
          } flex-1 rounded-lg p-8 min-h-[28rem]`}
        >
          <h2 className="mb-6 flex items-center text-2xl font-semibold">
            <FontAwesomeIcon icon={faStar} className="mr-2" /> Analysis Results
          </h2>

          {!results ? (
            <div className="flex h-full flex-col items-center justify-center text-gray-400">
              <FontAwesomeIcon icon={faEye} size="4x" className="mb-4" />
              <p className="text-lg">No Analysis Yet</p>
              <p>Upload a photo to see detailed beauty analysis</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Score */}
              <div
                className={`${
                  dark ? "bg-purple-900 bg-opacity-30" : "bg-purple-100"
                } rounded-lg p-6 text-center`}
              >
                <h3 className="text-5xl font-bold text-purple-400">
                  {results.beautyScore}
                </h3>
                <p className="mt-1 text-gray-400">Beauty Score</p>
                <p className="mt-1 text-sm text-gray-500">
                  {results.confidence} Confidence
                </p>
              </div>

              {/* Feature Bars */}
              <div>
                <h4 className="mb-4 text-lg font-semibold">Feature Analysis</h4>
                {Array.isArray(results.features) ? (
                  results.features.map(([label, val]) => (
                    <div key={label} className="mb-4">
                      <div className="mb-2 flex justify-between text-sm">
                        <span>{label}</span>
                        <span>{val.toFixed(1)}/10</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-gray-700">
                        <div
                          className="h-3 rounded-full bg-purple-400"
                          style={{ width: `${(val / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No feature data.</p>
                )}
              </div>

              {/* Mood & Recommendations */}
              <div className="space-y-6">
                <div
                  className={`${
                    dark ? "bg-purple-900 bg-opacity-30" : "bg-purple-100"
                  } rounded-lg p-4`}
                >
                  <h4 className="mb-2 font-semibold">Detected Mood</h4>
                  <p className="text-purple-300">{results.mood}</p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Recommendations</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-500">
                    {results.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 flex space-x-4">
                <button
                  className={`${
                    dark
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  } flex-1 px-6 py-3 rounded-lg transition text-center`}
                >
                  Save Results
                </button>
                <button
                  className={`${
                    dark
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  } flex-1 px-6 py-3 rounded-lg transition text-center`}
                >
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
