import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { convertPdfToWord } from "../utils/pdfToWordConverter";
import { FaHome, FaFileWord } from 'react-icons/fa';
import toast from "react-hot-toast";

/**
 * PDFViewer component for displaying PDF files and providing conversion options
 */
const PDFViewer = ({ fileUrl }: { fileUrl: string }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [isConverting, setIsConverting] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Handles the conversion of PDF to Word
   */
  const handleConvertToWord = async () => {
    try {
      setIsConverting(true);
      setConversionStatus("Starting conversion...");

      // Show a message to the user
      const toastConverting = toast.loading("Converting PDF to Word. This may take a moment...",{removeDelay : 800})
      setConversionStatus("Processing PDF...");

      // Use the utility function to convert PDF to Word
      const result = await convertPdfToWord(fileUrl);

      if (result.success) {
        toast.success("Successfully Converted..",{
          id:toastConverting
        })
        setConversionStatus("Conversion successful! Redirecting to editor...");

        // Navigate to the dedicated ConvertedPDFEditor with the converted document
        navigate('/convertedPDF', {
          state: {
            format: "converted-docx",
            name: result.fileName,
            content: result.base64Content,
          }
        });
      } else {
        setConversionStatus(`Conversion failed: ${result.error}`);
        alert(`Failed to convert PDF to Word: ${result.error}`);
      }
    } catch (error) {
      console.error("Error in conversion process:", error);
      setConversionStatus("Conversion failed due to an unexpected error");
      alert("Failed to convert PDF to Word. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div>
      <div style={{ height: "600px" }} className="mb-5">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer fileUrl={fileUrl} plugins={[defaultLayoutPluginInstance]} />
        </Worker>
      </div>

      <div className="flex flex-col gap-2">
        {conversionStatus && (
          <div className="text-sm text-gray-600 italic mb-2">
            Status: {conversionStatus}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleConvertToWord}
            disabled={isConverting}
            className={`px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2 shadow-sm ${
              isConverting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            <FaFileWord />
            {isConverting ? "Converting..." : "Convert to Word"}
          </button>
          <Link
            to={"/dashboard"}
            className="px-5 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
          >
            <FaHome />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
