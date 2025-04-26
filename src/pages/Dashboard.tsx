import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

// At top of your file
interface ResumeScore {
  atsScore: number;
  suggestions: string[];
  keywords: string[];
  strengths: string[];
  areaforImprovement: string[];
  specificSuggestions: string[];
  jobRole: string[];
}

const pageVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
};

const Dashboard = () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  const { isLight } = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [score, setScore] = useState<ResumeScore | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFile(file);
    analyzeResume(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
  });

  const analyzeResume = async (file: File) => {
    setAnalyzing(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${serverUrl}/api/resume/analyze`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        setScore(data);
        toast.success("Resume analyzed successfully!");
      } else {
        toast.error(data.message || "Failed to analyze resume");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("An error occurred while analyzing the resume");
    } finally {
      setAnalyzing(false);
    }
  };

  const navigate = useNavigate();

  const handleEditResume = () => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      // If it's PDF, we send a DataURL (base64) to preview as embedded viewer
      const isPDF = file.type === "application/pdf";
      const isDocx = file.type.includes("word");

      navigate("/editResume", {
        state: {
          name: file.name,
          type: file.type,
          content: result,
          format: isPDF ? "pdf" : isDocx ? "docx" : "text",
        },
      });
    };

    const isPDF = file.type === "application/pdf";
    const isDocx = file.type.includes("word");

    if (isPDF) {
      reader.readAsDataURL(file); // for previewing PDF
    } else if (isDocx) {
      reader.readAsArrayBuffer(file); // for converting DOCX later
    } else {
      reader.readAsText(file); // for txt, etc.
    }
  };

  return (
    
    <motion.div 
    className={`${isLight ? 'bg-gray-100' : 'bg-gray-900 text-white'} min-h-[calc(100vh-4.1rem)]`}
    variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
      {/* Background blur animation */}
      <motion.div
        initial={{ x: "-50%", y: "-50%", opacity: 0.5 }}
        animate={{ x: "180%", y: "160px", opacity: 0 }}
        transition={{ duration: 3,}}
        className="absolute w-[500px] h-[500px] bg-green-400 rounded-full filter blur-3xl opacity-30 z-0"
        style={{ top: "-10%", left: "-10%" }}
      />
      <div className="max-w-6xl mx-auto px-4 py-8 z-1111">
      <h1 className="text-4xl text-center font-semibold">Upload Your Resume</h1>
      <div className="mt-10 ">
        <div>
          <motion.div
          whileHover={{ scale : 1.1 }}
          transition={{ duration : 0.2 }}
          
            {...getRootProps()}
            className={`mb-10 border-2 border-dashed rounded-lg p-10 text-center select-none cursor-pointer ${
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 " />
            <p className="mt-4 text-lg text-gray-600">
              Drag & drop your resume here, or click to select
            </p>
            <p className="mt-2 text-sm text-gray-500  p-3">
              Supported formats: PDF, DOC, DOCX
            </p>
          </motion.div>

          {file && (
            <div className={`text-xl mt-4 p-4 rounded-lg shadow
            ${ isLight ? 'bg-white' : 'bg-zinc-600' }
            `}>
              <div className="flex items-center">
                <FileText className="h-7 w-7 text-blue-500 mr-2" />
                <span className={`
                  ${isLight ? 'text-gray-700' : 'text-white' }
                  `}>{file.name}</span>
              </div>
            </div>
          )}
        </div>

        {analyzing ? (
          <div className="mt-10 bg-white p-6 rounded-lg shadow animate-pulse space-y-6">
            <div>
              <div className="h-6 bg-gray-300 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>

            <div>
              <div className="h-5 bg-gray-300 rounded w-1/3 mb-2" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full" />
                ))}
              </div>
            </div>

            <div>
              <div className="h-5 bg-gray-300 rounded w-1/3 mb-2" />
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-3/4" />
                ))}
              </div>
            </div>

            <div>
              <div className="h-5 bg-gray-300 rounded w-1/3 mb-2" />
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-2/3" />
                ))}
              </div>
            </div>

            <div>
              <div className="h-5 bg-gray-300 rounded w-1/4 mb-2" />
              <div className="flex gap-2 flex-wrap">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-6 w-16 bg-gray-200 rounded-full" />
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <div className="h-10 w-32 bg-gray-300 rounded-lg" />
            </div>
          </div>
        ) : score ? (
          <motion.div className={`mt-10 p-6 rounded-lg shadow
            ${ isLight ? 'bg-white text-gray-600' : 'bg-zinc-600' }
            `}
          initial={{ opacity : 0 }}
          animate= {{ opacity : 1 }}
          transition={{ delay : 0.5 , ease : 'easeOut'}}
          >
            <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`font-semibold
                  ${isLight ? 'text-gray-600' : 'text-white' }
                  `}>ATS Score</span>
                <span className={`text-2xl font-bold
                  ${isLight ? 'text-blue-600' : 'text-green-500' }
                  `}>
                  {score.atsScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <motion.div
                initial = {{
                  width :  0
                }}
                animate = {{
                  width : `${score.atsScore}%`
                }}
                transition={{
                  duration : 1 ,
                  delay : 0.8,
                  ease :"easeOut"
                }}
                  className="bg-sunset-glow bg-400 animate-bg-move h-2.5 rounded-full"
                  style={{ width: `${score.atsScore}%` }}
                ></motion.div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Suggestions</h3>
              <ul className="space-y-2">
                {score.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className={`text-gray-700
                      ${isLight ? 'text-gray-600' : 'text-white' }
                      `}>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Strengths</h3>
              <ul className="space-y-2">
                {score.strengths.map((strengths, index) => (
                  <li key={index} className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className={`
                      ${isLight ? 'text-gray-600' : 'text-white' }
                      `}>{strengths}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">
                SpecificSuggestions
              </h3>
              <ul className="space-y-2">
                {score.specificSuggestions.map((specificSuggestions, index) => (
                  <li key={index} className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className={`
                      ${isLight ? 'text-gray-600' : 'text-white' }
                      `}>{specificSuggestions}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">JobRole</h3>
              <ul className="space-y-2">
                {score.jobRole.map((jobRole, index) => (
                  <li key={index} className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className={`
                      ${isLight ? 'text-gray-600' : 'text-white' }
                      `}>{jobRole}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Keywords Suggest</h3>
              <div className="flex flex-wrap gap-2">
                {score.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => handleEditResume()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Edit Resume
              </button>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
    </div>
    </motion.div>
  );
};

export default Dashboard;
