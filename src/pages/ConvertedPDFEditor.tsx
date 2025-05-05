import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { motion } from 'framer-motion';
import WordEditor from "../components/WordEditor";
import { FaDownload, FaHome } from 'react-icons/fa';
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Helper function to safely convert base64 to ArrayBuffer
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  try {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error) {
    console.error("Error converting base64 to ArrayBuffer:", error);
    throw new Error("Failed to process document content");
  }
};

const ConvertedPDFEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLight } = useTheme();
  const [docxContent, setDocxContent] = useState<string>("");
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [documentData, setDocumentData] = useState<any>(null);

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

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      
      // Check for data from location state
      if (location.state && location.state.format === "converted-docx") {
        const convertedData = location.state;
        console.log("Using converted PDF data");
        setDocumentData(convertedData);
        
        // Process the converted document
        try {
          if (typeof convertedData.content === "string") {
            const arrayBuffer = base64ToArrayBuffer(convertedData.content);
            
            // Use mammoth to convert to HTML
            if (window.mammoth) {
              try {
                const result = await window.mammoth.convertToHtml({ arrayBuffer });
                const cleanedHtml = cleanHtmlContent(result.value);
                setDocxContent(cleanedHtml);
                toast.success("PDF successfully converted to editable format");
              } catch (error) {
                console.error("Error converting DOCX to HTML:", error);
                setDocxContent("<p>Failed to load converted content.</p>");
                toast.error("Error processing the converted document");
              }
            } else {
              console.error("Mammoth.js library not loaded");
              setDocxContent("<p>Error: Document conversion library not available.</p>");
              toast.error("Document conversion library not available");
            }
          } else {
            console.error("Invalid content format");
            setDocxContent("<p>Invalid document format.</p>");
            toast.error("Invalid document format");
          }
        } catch (error) {
          console.error("Error processing converted document:", error);
          setDocxContent("<p>Error processing the converted document.</p>");
          toast.error("Error processing the converted document");
        }
      } else {
        // No valid data, redirect to dashboard
        toast.error("No converted document found");
        navigate('/dashboard');
      }
      
      setIsLoading(false);
    };
    
    initializeData();
  }, [location.state, navigate]);

  const handleExport = async () => {
    if (!documentData || !editorRef.current) return;

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
    const fileName = documentData.name || "converted_resume.docx";
    saveAs(blob, fileName);
    toast.success("Document saved successfully");
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={`w-full min-h-screen ${isLight ? 'bg-gray-50' : 'bg-gray-900'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-white">Edit Converted PDF</h1>
          {documentData && (
            <h2 className="text-xl font-medium mt-2 text-white opacity-90">{documentData.name}</h2>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className={`${isLight ? 'bg-white' : 'bg-gray-800'} rounded-lg shadow-lg overflow-hidden mb-6`}>
          <div className="p-6">
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
              <span>Your PDF has been converted to an editable format. Use the toolbar above the editor to format your text. Changes are saved automatically when you export.</span>
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
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ConvertedPDFEditor;
