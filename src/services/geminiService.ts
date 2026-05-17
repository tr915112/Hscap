/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { RegistrationData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function extractDocumentData(base64Image: string): Promise<Partial<RegistrationData>> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are an expert OCR and data extraction system for HSCAP (Higher Secondary Admission) documents.
    Access the provided image of a 4-column tabular document common in HSCAP Kerala admission forms.
    The layout usually follows a parallel 4-column structure: [Col 1: Label | Col 2: Value | Col 3: Label | Col 4: Value].
    Labels and values are often separated by a colon (:) or structured clearly in cells.
    
    Extract the following fields accurately. If a field is missing or not found, return "N/A".
    
    1. Application Number
    2. Register Number
    3. Name
    4. Phone Number
    5. Date of Birth
    6. Sex
    7. Aadhar Number
    8. Father Name
    9. Mother Name
    10. Guardian Name
    11. Religion
    12. Caste
    13. Category Name
    14. OEC
    15. Communication Address
    16. Permanent Address
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            applicationNumber: { type: Type.STRING },
            registerNumber: { type: Type.STRING },
            name: { type: Type.STRING },
            phoneNumber: { type: Type.STRING },
            dateOfBirth: { type: Type.STRING },
            sex: { type: Type.STRING },
            aadharNumber: { type: Type.STRING },
            fatherName: { type: Type.STRING },
            motherName: { type: Type.STRING },
            guardianName: { type: Type.STRING },
            religion: { type: Type.STRING },
            caste: { type: Type.STRING },
            categoryName: { type: Type.STRING },
            oec: { type: Type.STRING },
            communicationAddress: { type: Type.STRING },
            permanentAddress: { type: Type.STRING },
          },
          required: [
            "applicationNumber", "registerNumber", "name", "phoneNumber", 
            "dateOfBirth", "sex", "aadharNumber", "fatherName", 
            "motherName", "guardianName", "religion", "caste", 
            "categoryName", "oec", "communicationAddress", "permanentAddress"
          ],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data extracted from image");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
}
