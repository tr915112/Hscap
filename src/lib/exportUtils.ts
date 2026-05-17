/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  Document, 
  Packer, 
  Paragraph, 
  Table, 
  TableCell, 
  TableRow, 
  WidthType, 
  BorderStyle, 
  AlignmentType,
  VerticalAlign,
  HeadingLevel,
  TextRun
} from "docx";
import { RegistrationData, EXTRACTION_FIELDS } from "../types";

export const exportToPDF = (data: RegistrationData[]) => {
  const doc = new jsPDF('l', 'mm', 'a4');
  
  doc.setFontSize(18);
  doc.text("HSCAP SCANNER - Extracted Data Report", 14, 22);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

  const head = [EXTRACTION_FIELDS.map(f => f.label)];
  const body = data.map(row => EXTRACTION_FIELDS.map(f => (row as any)[f.key]));

  autoTable(doc, {
    startY: 35,
    head: head,
    body: body,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    didParseCell: (data) => {
    },
    headStyles: { fillColor: [40, 116, 240], textColor: 255 }, // Flipkart Blue
  });

  doc.save("HSCAP_SCANNER_Export.pdf");
};

export const exportToDOCX = async (data: RegistrationData[]) => {
  const commonBorder = { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" };

  const headerRow = new TableRow({
    children: EXTRACTION_FIELDS.map(f => new TableCell({
      children: [new Paragraph({ 
        children: [new TextRun({ text: f.label, bold: true, color: "FFFFFF", size: 16 })], // Size 8pt (16 half-points)
        alignment: AlignmentType.CENTER
      })],
      shading: { fill: "2874F0" },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      borders: { top: commonBorder, bottom: commonBorder, left: commonBorder, right: commonBorder }
    })),
  });

  const dataRows = data.map(row => new TableRow({
    children: EXTRACTION_FIELDS.map(f => new TableCell({
      children: [new Paragraph({ 
        children: [new TextRun({ text: String((row as any)[f.key] || "N/A"), size: 14 })], // Size 7pt
        alignment: AlignmentType.CENTER
      })],
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      borders: { top: commonBorder, bottom: commonBorder, left: commonBorder, right: commonBorder }
    })),
  }));

  const table = new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            orientation: "landscape" as any,
          }
        }
      },
      children: [
        new Paragraph({ 
          text: "HSCAP SCANNER - EXTRACTED DATA", 
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({ 
          text: `Report Generated: ${new Date().toLocaleString()}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        table
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "HSCAP_SCANNER_Export.docx";
  link.click();
  URL.revokeObjectURL(url);
};
