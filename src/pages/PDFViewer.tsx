import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Link } from "react-router-dom";

const PDFViewer = ({ fileUrl }: { fileUrl: string }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div>
      <div style={{ height: "600px" }} className="mb-5">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer fileUrl={fileUrl} plugins={[defaultLayoutPluginInstance]} />
        </Worker>
      </div>
      <Link
        to={"/dashboard"}
        className=" ml-4 px-4 py-2 bg-green-600 text-white rounded text-[18px] hover:bg-green-700 transition"
      >
        Dashboard
      </Link>
    </div>
  );
};

export default PDFViewer;
