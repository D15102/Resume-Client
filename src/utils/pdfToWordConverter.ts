import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType,
  HeadingLevel,
  UnderlineType,
  ShadingType
} from "docx";

/**
 * Interface for text item with position information
 */
interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  fontName?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
}

/**
 * Converts a PDF file to a Word document with preserved formatting
 * @param pdfUrl URL of the PDF file to convert
 * @returns Promise that resolves to a base64-encoded Word document
 */
export const convertPdfToWord = async (pdfUrl: string): Promise<{
  base64Content: string;
  fileName: string;
  success: boolean;
  error?: string;
}> => {
  try {
    // Fetch the PDF file
    const response = await fetch(pdfUrl);
    const pdfBuffer = await response.arrayBuffer();

    // Use the PDF.js library from CDN
    const pdfjsLib = (window as any).pdfjsLib;

    if (!pdfjsLib) {
      throw new Error("PDF.js library not loaded. Please make sure the PDF.js script is included.");
    }

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument(pdfBuffer);
    const pdf = await loadingTask.promise;

    // Get document metadata
    const metadata = await pdf.getMetadata().catch(() => ({}));
    const title = metadata?.info?.Title || "Converted Document";

    // Create document sections for each page
    const docChildren: (Paragraph | Table)[] = [];

    // Process each page - using a hybrid approach for better formatting
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.0 });

      // Get page dimensions
      const pageWidth = viewport.width;
      const pageHeight = viewport.height;

      // Extract text content with position information
      const textContent = await page.getTextContent();

      // Group text items by their y-position to identify lines
      const lineMap = new Map<number, TextItem[]>();

      // Process text items and extract style information
      textContent.items.forEach((item: any) => {
        const y = Math.round(item.transform[5]); // y-position

        // Create enhanced text item with style information
        const textItem: TextItem = {
          str: item.str,
          transform: item.transform,
          width: item.width || 0,
          height: item.height || 12,
          fontName: item.fontName,
          // Try to extract style information if available
          bold: item.fontName?.toLowerCase().includes('bold') || false,
          italic: item.fontName?.toLowerCase().includes('italic') || false,
        };

        if (!lineMap.has(y)) {
          lineMap.set(y, []);
        }
        lineMap.get(y)?.push(textItem);
      });

      // Sort lines by y-position (top to bottom)
      const sortedLines = Array.from(lineMap.entries())
        .sort((a, b) => b[0] - a[0]); // Reverse order because PDF coordinates start from bottom

      // Detect tables by analyzing the structure
      const tableData = detectTables(sortedLines, pageWidth);

      if (tableData.length > 0) {
        // Process tables
        for (const table of tableData) {
          const wordTable = createWordTable(table.rows, table.columns);
          docChildren.push(wordTable);
        }
      }

      // Process remaining text content (non-table)
      const processedTableLines = new Set<number>();
      tableData.forEach(table => {
        table.rows.forEach(row => {
          processedTableLines.add(row[0]); // Add y-position of each row
        });
      });

      // Process each line that's not part of a table
      sortedLines.forEach(([yPos, items]) => {
        if (!processedTableLines.has(yPos)) {
          // Sort items within a line by x-position (left to right)
          items.sort((a, b) => a.transform[4] - b.transform[4]);

          // Extract text from the line
          const lineText = items.map(item => item.str).join(" ");

          if (lineText.trim()) {
            // Analyze text properties to determine formatting
            const fontSize = items[0].height ? Math.round(items[0].height) : 12;
            const isHeading = fontSize > 14; // Simple heuristic for headings

            // Determine alignment based on x position
            let alignment: AlignmentType = AlignmentType.LEFT;
            const xPos = items[0].transform[4];
            if (xPos > pageWidth / 2 + 50) {
              alignment = AlignmentType.RIGHT;
            } else if (Math.abs(xPos - pageWidth / 2) < 50) {
              alignment = AlignmentType.CENTER;
            }

            // Create paragraph with appropriate styling
            const paragraph = new Paragraph({
              alignment,
              heading: isHeading ? HeadingLevel.HEADING_1 : undefined,
              children: [
                new TextRun({
                  text: lineText.trim(),
                  bold: items[0].bold || isHeading,
                  italics: items[0].italic,
                  size: fontSize * 2, // Convert to Word font size
                  underline: items[0].fontName?.toLowerCase().includes('underline')
                    ? { type: UnderlineType.SINGLE }
                    : undefined,
                }),
              ],
              spacing: {
                after: 120, // Add some spacing between paragraphs
              },
            });

            docChildren.push(paragraph);
          }
        }
      });

      // We're skipping the image rendering to focus on text content only

      // Add a page break between pages (except for the last page)
      if (i < pdf.numPages) {
        docChildren.push(
          new Paragraph({
            children: [],
            pageBreakBefore: true,
          })
        );
      }
    }

    // Create the Word document with all content and styling
    const doc = new Document({
      creator: "PDF to Word Converter",
      title: title,
      description: "Converted from PDF with preserved formatting",
      styles: {
        paragraphStyles: [
          {
            id: "Normal",
            name: "Normal",
            basedOn: "Normal",
            next: "Normal",
            run: {
              size: 24, // 12pt font
              font: "Calibri",
            },
            paragraph: {
              spacing: {
                line: 276, // 1.15 line spacing
              },
            },
          },
          {
            id: "Heading1",
            name: "Heading 1",
            basedOn: "Normal",
            next: "Normal",
            run: {
              size: 36, // 18pt font
              bold: true,
              font: "Calibri",
            },
            paragraph: {
              spacing: {
                before: 240, // 12pt spacing before
                after: 120, // 6pt spacing after
              },
            },
          },
          {
            id: "Heading2",
            name: "Heading 2",
            basedOn: "Normal",
            next: "Normal",
            run: {
              size: 28, // 14pt font
              bold: true,
              font: "Calibri",
            },
            paragraph: {
              spacing: {
                before: 240, // 12pt spacing before
                after: 120, // 6pt spacing after
              },
            },
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720, // 0.5 inch
                right: 720, // 0.5 inch
                bottom: 720, // 0.5 inch
                left: 720, // 0.5 inch
              },
            },
          },
          children: docChildren,
        },
      ],
    });

    // Generate the Word document as a blob
    const blob = await Packer.toBlob(doc);

    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function() {
        const base64data = reader.result as string;
        resolve({
          base64Content: base64data.split(',')[1], // Remove the data URL prefix
          fileName: title ? `${title}.docx` : "Converted Resume.docx",
          success: true
        });
      };
      reader.onerror = function() {
        reject({
          base64Content: "",
          fileName: "",
          success: false,
          error: "Failed to read converted document"
        });
      };
    });
  } catch (error) {
    console.error("Error converting PDF to Word:", error);
    return {
      base64Content: "",
      fileName: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

/**
 * Detects tables in the PDF content
 */
function detectTables(lines: [number, TextItem[]][], pageWidth: number) {
  const tables: { rows: [number, TextItem[]][]; columns: number[] }[] = [];

  // Need at least 3 lines for a potential table
  if (lines.length < 3) return tables;

  // Find consecutive lines with similar structure (potential tables)
  let tableStart = -1;
  let tableEnd = -1;
  let potentialColumns: number[] = [];

  for (let i = 0; i < lines.length - 2; i++) {
    const [y1, items1] = lines[i];
    const [y2, items2] = lines[i + 1];
    const [y3, items3] = lines[i + 2];

    // Get x-positions for each line
    const xPositions1 = items1.map(item => Math.round(item.transform[4] / 10) * 10);
    const xPositions2 = items2.map(item => Math.round(item.transform[4] / 10) * 10);
    const xPositions3 = items3.map(item => Math.round(item.transform[4] / 10) * 10);

    // Check if there are at least 2 common x-positions across all three lines
    const commonPositions = xPositions1.filter(x =>
      xPositions2.some(x2 => Math.abs(x - x2) < 20) &&
      xPositions3.some(x3 => Math.abs(x - x3) < 20)
    );

    if (commonPositions.length >= 2) {
      // This could be a table
      if (tableStart === -1) {
        tableStart = i;
        potentialColumns = commonPositions;
      }
      tableEnd = i + 2;
    } else if (tableStart !== -1) {
      // End of a potential table
      if (tableEnd - tableStart >= 2) { // At least 3 rows
        tables.push({
          rows: lines.slice(tableStart, tableEnd + 1),
          columns: potentialColumns.sort((a, b) => a - b)
        });
      }
      tableStart = -1;
      tableEnd = -1;
      potentialColumns = [];
    }
  }

  // Check if we have an unfinished table at the end
  if (tableStart !== -1 && tableEnd - tableStart >= 2) {
    tables.push({
      rows: lines.slice(tableStart, tableEnd + 1),
      columns: potentialColumns.sort((a, b) => a - b)
    });
  }

  return tables;
}

/**
 * Creates a Word table from the detected table data
 */
function createWordTable(rows: [number, TextItem[]][], columns: number[]): Table {
  const tableRows: TableRow[] = [];

  // Process each row
  rows.forEach(([_, items]) => {
    // Sort items by x-position
    items.sort((a, b) => a.transform[4] - b.transform[4]);

    // Group items by column
    const cellContents: string[] = [];

    // Initialize cells for each column
    for (let i = 0; i < columns.length; i++) {
      cellContents.push("");
    }

    // Assign text items to the appropriate column
    items.forEach(item => {
      const itemX = Math.round(item.transform[4] / 10) * 10;
      // Find which column this item belongs to
      for (let i = 0; i < columns.length; i++) {
        const colX = columns[i];
        const nextColX = columns[i + 1] || Number.MAX_VALUE;

        if (Math.abs(itemX - colX) < 20 || (itemX > colX && itemX < nextColX)) {
          cellContents[i] += item.str + " ";
          break;
        }
      }
    });

    // Create table cells
    const cells = cellContents.map(text =>
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun(text.trim())],
          }),
        ],
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        },
      })
    );

    // Add the row
    tableRows.push(new TableRow({ children: cells }));
  });

  // Create the table
  return new Table({
    rows: tableRows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  });
}
