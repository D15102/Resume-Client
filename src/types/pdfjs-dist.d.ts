declare module 'pdfjs-dist/build/pdf';
declare module 'pdfjs-dist/build/pdf.worker.entry';
declare module 'mammoth';

// Add global types
interface Window {
  pdfjsLib: any;
  mammoth: any;
}
