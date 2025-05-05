import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import PDFViewer from "./PDFViewer";
import { motion } from 'framer-motion';
import WordEditor from "../components/WordEditor";
import { FaDownload, FaHome } from 'react-icons/fa';
import { useTheme } from "../context/ThemeContext";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const EditResume = () => {
  const location = useLocation();
  const resumeData = location.state;
  const [docxContent, setDocxContent] = useState<string>("");
  const [textContent, setTextContent] = useState<string>("");
  const editorRef = useRef<HTMLDivElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const { isLight } = useTheme();

  // Check if user has a resume in localStorage
  const [hasResume, setHasResume] = useState<boolean>(false);

  useEffect(() => {
    // If user came from navbar (no resumeData), check localStorage for resume
    if (!resumeData) {
      // We'll show the 404 page by default
      setHasResume(false);
      return;
    }

    // If we have resumeData, we know the user has a resume
    setHasResume(true);

    if ((resumeData.format === "docx" || resumeData.format === "converted-docx") && resumeData.content) {
      // For Word files, we need to convert the content to HTML for editing

      // If it's an ArrayBuffer (from direct file upload)
      if (resumeData.content instanceof ArrayBuffer) {
        // Use the global mammoth instance
        if (window.mammoth) {
          window.mammoth
            .convertToHtml({ arrayBuffer: resumeData.content })
            .then((result: any) => {
              // Clean up the HTML to remove any embedded images
              const cleanedHtml = cleanHtmlContent(result.value);
              setDocxContent(cleanedHtml);
            })
            .catch(() => setDocxContent("<p>Failed to load .docx content.</p>"));
        } else {
          console.error("Mammoth.js library not loaded");
          setDocxContent("<p>Error: Document conversion library not available.</p>");
        }
      }
      // If it's a base64 string (from converted PDF)
      else if (typeof resumeData.content === "string") {
        // Convert base64 content to ArrayBuffer
        const binaryString = window.atob(resumeData.content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const arrayBuffer = bytes.buffer;

        // Use the global mammoth instance
        if (window.mammoth) {
          window.mammoth
            .convertToHtml({ arrayBuffer })
            .then((result: any) => {
              // Clean up the HTML to remove any embedded images
              const cleanedHtml = cleanHtmlContent(result.value);
              setDocxContent(cleanedHtml);
            })
            .catch(() => setDocxContent("<p>Failed to load .docx content.</p>"));
        } else {
          console.error("Mammoth.js library not loaded");
          setDocxContent("<p>Error: Document conversion library not available.</p>");
        }
      }
    } else if (resumeData.format === "text") {
      setTextContent(resumeData.content || "");
    } else if (resumeData.format === "pdf" && resumeData.content) {
      // If it's already a data URL (base64), use it directly
      const content = resumeData.content;
      const hasPrefix = typeof content === "string" && content.startsWith("data:application/pdf");

      const pdfDataUrl = hasPrefix ? content : `data:application/pdf;base64,${content}`;
      setPdfUrl(pdfDataUrl);
    }
  }, [resumeData]);

  // Helper function to clean HTML content by removing embedded images
  const cleanHtmlContent = (html: string): string => {
    // Create a temporary DOM element to manipulate the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove all img tags
    const imgTags = tempDiv.querySelectorAll('img');
    imgTags.forEach(img => img.remove());

    // Remove any background images in style attributes
    const elementsWithStyle = tempDiv.querySelectorAll('[style*="background"]');
    elementsWithStyle.forEach(el => {
      const element = el as HTMLElement;
      if (element.style.backgroundImage) {
        element.style.backgroundImage = 'none';
      }
    });

    return tempDiv.innerHTML;
  };

  const handleExport = async () => {
    if (resumeData.format === "docx" || resumeData.format === "converted-docx") {
      if (!editorRef.current) return;

      // Get HTML content from the hidden div
      const htmlContent = editorRef.current.innerHTML;

      // Create a temporary element to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;

      // Extract text and formatting
      const paragraphs: Paragraph[] = [];

      // Process each element in the HTML
      Array.from(tempDiv.childNodes).forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;

          // Create a paragraph with appropriate styling
          const paragraph = new Paragraph({
            children: [
              new TextRun({
                text: element.textContent || "",
                bold: element.style.fontWeight === 'bold' || element.tagName === 'STRONG',
                italics: element.style.fontStyle === 'italic' || element.tagName === 'EM',
                underline: element.style.textDecoration === 'underline' ? {} : undefined,
                size: parseInt(element.style.fontSize) * 2 || 24, // Default to 12pt
                color: element.style.color || undefined,
              }),
            ],
            alignment: element.style.textAlign === 'center' ? 'center' :
                      element.style.textAlign === 'right' ? 'right' : 'left',
          });

          paragraphs.push(paragraph);
        } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
          // Handle plain text nodes
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: node.textContent.trim(),
                }),
              ],
            })
          );
        }
      });

      // Create the document
      const doc = new Document({
        sections: [
          {
            children: paragraphs.length > 0 ? paragraphs : [new Paragraph("")]
          },
        ],
      });

      // Generate and save the document
      const blob = await Packer.toBlob(doc);
      const fileName = resumeData.name || (resumeData.format === "converted-docx" ? "converted_resume.docx" : "edited_resume.docx");
      saveAs(blob, fileName);

    } else if (resumeData.format === "text") {
      const blob = new Blob([textContent], {
        type: "text/plain;charset=utf-8",
      });
      const fileName = resumeData.name || "edited_resume.txt";
      saveAs(blob, fileName);
    }
  };

  // Show 404 page if no resume data is available
  if (!resumeData || !hasResume)
    return (
      <motion.div
      className={`w-full min-h-screen ${isLight ? 'bg-gray-100' : 'bg-gray-900'} flex items-center flex-col justify-center cursor-default select-none`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.5 }}
      >
        <div className="mt-[10rem]">
        <div className="flex items-center justify-center w-full h-[15rem] font-[font6] text-[170px] text-wheat">
          <h1 className="text-shadow-red hover:text-shadow-white hover:rotate-[12deg] hover:scale-[2] transition-transform duration-300 mr-4 font-[font5] z-10 text-stroke-black">
            4
          </h1>
          <h1 className="font-[font3] text-[9.5rem] mb-[275px] transform rotate-[50deg] scale-[2] hover:scale-[3] z-0 text-stroke-black transition-transform duration-300">
            0
          </h1>
          <h1 className="text-shadow-red hover:text-shadow-white hover:rotate-[12deg] hover:scale-[2] transition-transform duration-300 ml-4 font-[font5] z-10 text-stroke-black">
            4
          </h1>
        </div>
        </div>
        <div className="select-none">
        <h1 className={`text-4xl ${isLight ? 'text-indigo-600' : 'text-indigo-400'} mt-10 text-center font-semibold font-mono`}>
          No Resume Available to Edit
        </h1>
        <p className={`mt-3 text-center text-[18px] font-semibold ${isLight ? 'text-green-600' : 'text-green-400'} font-mono tracking-wide`}>
          Please upload a resume from the Dashboard first 😁
        </p>
        <div className="mt-8 flex justify-center">
          <Link to="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2 shadow-md">
            <FaHome className="text-lg" /> Go to Dashboard
          </Link>
        </div>
        </div>
      </motion.div>
    );

  return (
    <motion.div
      className={`w-full min-h-screen ${isLight ? 'bg-gray-50' : 'bg-gray-900'}`}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className={`${isLight ? 'bg-blue-600' : 'bg-blue-800'} w-full py-6 px-4 md:px-8`}>
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-white">Edit Resume</h1>
          <h2 className="text-xl font-medium mt-2 text-white opacity-90">{resumeData.name}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className={`${isLight ? 'bg-white' : 'bg-gray-800'} rounded-lg shadow-lg overflow-hidden mb-6`}>
          <div className="p-6">
            {resumeData.format === "pdf" && pdfUrl ? (
              <PDFViewer fileUrl={pdfUrl} />
            ) : resumeData.format === "docx" || resumeData.format === "converted-docx" ? (
            <>
              <div className="mb-6 flex flex-wrap gap-3">
                <button
                  onClick={handleExport}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
                >
                  <FaDownload /> Save as DOCX
                </button>
                <Link
                  to={"/dashboard"}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
                >
                  <FaHome /> Dashboard
                </Link>
              </div>

              <div className={`${isLight ? 'bg-gray-50 text-gray-700 border-gray-200' : 'bg-gray-700 text-gray-200 border-gray-600'} p-4 rounded-lg mb-6 text-sm flex items-center border`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${isLight ? 'text-blue-500' : 'text-blue-400'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Use the toolbar above the editor to format your text. Changes are saved automatically when you export.</span>
              </div>

              {/* Enhanced Word Editor */}
              <WordEditor
                initialContent={docxContent}
                onContentChange={(newContent) => {
                  if (editorRef.current) {
                    editorRef.current.innerHTML = newContent;
                  }
                }}
              />

              {/* Hidden div to store the content for export */}
              <div
                ref={editorRef}
                className="hidden"
                dangerouslySetInnerHTML={{ __html: docxContent }}
              />
            </>
          ) : resumeData.format === "text" ? (
            <>
              <div className="mb-6 flex flex-wrap gap-3">
                <button
                  onClick={handleExport}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
                >
                  <FaDownload /> Save as TXT
                </button>
                <Link
                  to={"/dashboard"}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
                >
                  <FaHome /> Dashboard
                </Link>
              </div>

              <div className={`${isLight ? 'bg-gray-50 text-gray-700 border-gray-200' : 'bg-gray-700 text-gray-200 border-gray-600'} p-4 rounded-lg mb-6 text-sm flex items-center border`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${isLight ? 'text-green-500' : 'text-green-400'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Edit your text resume below. Changes are saved automatically when you export.</span>
              </div>

              <textarea
                className={`w-full h-96 p-4 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                  isLight
                    ? 'bg-white text-gray-800 border-gray-300'
                    : 'bg-gray-700 text-gray-100 border-gray-600'
                }`}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
            </>
          ) : (
            <div className="p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 mx-auto ${isLight ? 'text-red-500' : 'text-red-400'} mb-4`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className={`text-xl font-semibold ${isLight ? 'text-gray-800' : 'text-gray-100'}`}>Unsupported Format</p>
              <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} mt-2`}>The file format you're trying to edit is not supported.</p>
              <Link to="/dashboard" className="mt-6 inline-block px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                Return to Dashboard
              </Link>
            </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EditResume;
