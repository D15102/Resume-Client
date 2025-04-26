import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph } from "docx";
import PDFViewer from "./PDFViewer";
import {motion} from 'framer-motion'

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

  useEffect(() => {
    if (!resumeData) return;

    if (resumeData.format === "docx" && resumeData.content) {
      import("mammoth").then((mammoth) => {
        mammoth
          .convertToHtml({ arrayBuffer: resumeData.content })
          .then((result) => setDocxContent(result.value))
          .catch(() => setDocxContent("<p>Failed to load .docx content.</p>"));
      });
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

  const handleExport = async () => {
    if (resumeData.format === "docx") {
      if (!editorRef.current) return;
      const text = editorRef.current.innerText;
      const lines = text.split("\n").map((line) => new Paragraph(line));

      const doc = new Document({
        sections: [
          {
            children: lines,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, "edited_resume.docx");
    } else if (resumeData.format === "text") {
      const blob = new Blob([textContent], {
        type: "text/plain;charset=utf-8",
      });
      saveAs(blob, "edited_resume.txt");
    }
  };

  if (!resumeData)
    return (
      <motion.div 
      className="w-full min-h-[calc(100vh-4.1rem)] bg-[#424242] flex items-center flex-col justify-center cursor-default select-none"
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
        <h1 className="text-4xl text-indigo-500 mt-10 text-center font-semibold font-mono">
          Resume Is Not Uploaded Yet..
        </h1>
        <p className="mt-3 text-center text-[18px] font-semibold text-lime-300 font-mono tracking-wide">Go To Dashboard From Navigation 😁</p>
        </div>
      </motion.div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Edit Resume</h1>
      <h2 className="text-xl font-medium mb-4">{resumeData.name}</h2>

      {resumeData.format === "pdf" && pdfUrl ? (
        <PDFViewer fileUrl={pdfUrl} />
      ) : resumeData.format === "docx" ? (
        <>
          <div
            ref={editorRef}
            contentEditable
            dangerouslySetInnerHTML={{ __html: docxContent }}
            className="border p-4 rounded bg-white text-sm min-h-[300px] whitespace-pre-wrap"
            style={{ outline: "none" }}
          />
          <button
            onClick={handleExport}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Save as DOCX
          </button>
          <Link to={"/dashboard"} className="mt-4 ml-4 px-4 py-2 bg-green-600 text-white rounded text-[18px] hover:bg-green-700 transition">Dashboard</Link>
        </>
      ) : resumeData.format === "text" ? (
        <>
          <textarea
            className="w-full h-96 p-4 border rounded-lg font-mono text-sm"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
          />
          <button
            onClick={handleExport}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Save as TXT
          </button>
          <Link to={"/dashboard"} className="mt-4 ml-4 px-4 py-2 bg-green-600 text-white rounded text-[18px] hover:bg-green-700 transition">Dashboard</Link>
        </>
      ) : (
        <p>Unsupported format.</p>
      )}
    </div>
  );
};

export default EditResume;
