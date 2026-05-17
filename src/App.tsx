/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Trash2, 
  Database,
  CheckCircle2,
  Table as TableIcon,
  Info,
  Youtube,
  Camera
} from 'lucide-react';
import Lottie from 'lottie-react';
import { RegistrationData, EXTRACTION_FIELDS } from './types';
import { extractDocumentData } from './services/geminiService';
import { exportToPDF, exportToDOCX } from './lib/exportUtils';

// Simple Remote Lottie Component
const SCAN_ANIM = "https://assets5.lottiefiles.com/packages/lf20_re0m9itv.json";
const SUCCESS_ANIM = "https://assets9.lottiefiles.com/packages/lf20_w51pcehl.json";

const RemoteLottie = ({ path, loop = true, className = "" }: { path: string, loop?: boolean, className?: string }) => {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    fetch(path)
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        }
        // If it's not JSON, it might be a redirect or error page
        throw new Error("Invalid content type: " + contentType);
      })
      .then(data => {
        if (isMounted) setAnimationData(data);
      })
      .catch(err => {
        console.warn("Lottie Load Error (Suppressed):", err.message);
      });
    return () => { isMounted = false; };
  }, [path]);

  if (!animationData) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-[#2874F0]/20"
        >
          <Database size={64} />
        </motion.div>
      </div>
    );
  }
  return <Lottie animationData={animationData} loop={loop} className={className} />;
};

export default function App() {
  const [dataList, setDataList] = useState<RegistrationData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
      });
      reader.readAsDataURL(file);
      const base64 = await base64Promise;

      const extracted = await extractDocumentData(base64);
      
      const newEntry: RegistrationData = {
        id: crypto.randomUUID(),
        applicationNumber: extracted.applicationNumber || 'N/A',
        registerNumber: extracted.registerNumber || 'N/A',
        name: extracted.name || 'N/A',
        phoneNumber: extracted.phoneNumber || 'N/A',
        dateOfBirth: extracted.dateOfBirth || 'N/A',
        sex: extracted.sex || 'N/A',
        aadharNumber: extracted.aadharNumber || 'N/A',
        fatherName: extracted.fatherName || 'N/A',
        motherName: extracted.motherName || 'N/A',
        guardianName: extracted.guardianName || 'N/A',
        religion: extracted.religion || 'N/A',
        caste: extracted.caste || 'N/A',
        categoryName: extracted.categoryName || 'N/A',
        oec: extracted.oec || 'N/A',
        communicationAddress: extracted.communicationAddress || 'N/A',
        permanentAddress: extracted.permanentAddress || 'N/A',
      };

      setDataList(prev => [...prev, newEntry]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      setError("Failed to extract data. Please check image quality.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeEntry = (id: string) => {
    setDataList(prev => prev.filter(item => item.id !== id));
  };

  const clearAll = () => {
    setDataList([]);
  };

  return (
    <div className="min-h-screen md:h-screen flex flex-col bg-[#F1F3F6] font-sans text-[#212121] overflow-x-hidden md:overflow-hidden">
      {/* Refined Minimal Header */}
      <header className="bg-[#2874F0] h-[64px] px-8 flex items-center justify-between shadow-md z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-inner">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2874F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight italic">HSCAP SCANNER</h1>
            <p className="text-[#BBDAFF] text-[10px] font-bold uppercase tracking-widest">Extract Allotment Slip</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end text-right hidden md:flex">
            <span className="text-white text-sm font-semibold">Nikhil Vinayak</span>
            <span className="text-[#BBDAFF] text-[10px] uppercase font-bold tracking-tighter">Teachbook.in</span>
          </div>
          <div className="w-10 h-10 bg-[#FF9F00] rounded-full flex items-center justify-center font-bold text-white shadow-sm border-2 border-white/20">
            NV
          </div>
        </div>
      </header>

      {/* Main Layout: 1/3 and 2/3 Split */}
      <main className="flex-1 flex flex-col md:flex-row gap-6 p-4 md:p-6 md:overflow-hidden">
        
        {/* Left Column (1/3) */}
        <section className="w-full md:w-1/3 flex flex-col gap-6 md:overflow-y-auto pr-0 md:pr-1">
          {/* Upload Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center border border-gray-100 flex-1 min-h-[300px]">
            <div className="w-32 h-32 mb-6 text-[#2874F0] flex items-center justify-center">
               <motion.div animate={isProcessing ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}} transition={{ repeat: Infinity, duration: 2 }}>
                <svg width="80" height="80" viewBox="0 0 120 120" fill="none">
                  <path d="M20 40V20H40" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                  <path d="M100 40V20H80" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                  <path d="M20 80V100H40" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                  <path d="M100 80V100H80" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                  <rect x="40" y="40" width="40" height="40" rx="4" stroke="currentColor" strokeWidth="4"/>
                  <path d="M30 60H90" stroke="#FB641B" strokeWidth="2" strokeDasharray="4 4" opacity="0.5"/>
                </svg>
              </motion.div>
            </div>
            <h2 className="text-xl font-bold mb-2">Upload HSCAP Image</h2>
            <p className="text-gray-500 text-sm mb-8 px-4">Select tabular documents from your gallery to extract student data.</p>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="w-full flex flex-col gap-3">
              <button 
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture');
                    fileInputRef.current.click();
                  }
                }}
                disabled={isProcessing}
                className="w-full bg-[#FB641B] hover:bg-[#e65c19] active:scale-[0.98] text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 uppercase tracking-wide text-sm disabled:opacity-50"
              >
                {isProcessing ? (
                  <Database size={20} className="animate-spin" />
                ) : (
                  <Upload size={20} strokeWidth={3} />
                )}
                {isProcessing ? "Processing..." : "Select Image"}
              </button>

              <button 
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.setAttribute('capture', 'environment');
                    fileInputRef.current.click();
                  }
                }}
                disabled={isProcessing}
                className="w-full bg-white border-2 border-[#FB641B] text-[#FB641B] hover:bg-orange-50 active:scale-[0.98] font-bold py-4 rounded-xl shadow transition-all flex items-center justify-center gap-3 uppercase tracking-wide text-sm disabled:opacity-50"
              >
                <Camera size={20} strokeWidth={3} />
                Capture Camera
              </button>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-xs text-red-500 font-bold bg-red-50 p-2 rounded w-full border border-red-100">
                {error}
              </motion.p>
            )}
          </div>

          {/* Batch Progress Card */}
          <div className="bg-[#E3F2FD] rounded-2xl p-6 flex flex-col border border-blue-100 shrink-0">
            <h3 className="text-[#2874F0] font-bold text-sm uppercase mb-4 tracking-widest flex items-center gap-2">
              <TableIcon size={14} /> Batch Progress
            </h3>
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-black text-[#2874F0]">{dataList.length.toString().padStart(2, '0')}</span>
              <span className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-tighter">Images In Session</span>
            </div>
            <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
              <motion.div 
                className="bg-[#2874F0] h-full" 
                initial={{ width: 0 }} 
                animate={{ width: `${Math.min(dataList.length * 10, 100)}%` }}
              />
            </div>
          </div>
        </section>

        {/* Right Column (2/3) */}
        <section className="w-full md:w-2/3 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden md:h-full">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center shrink-0">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Database size={20} className="text-[#2874F0]" />
              Consolidated Master Table
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={clearAll}
                disabled={dataList.length === 0}
                className="px-4 py-2 bg-[#F1F3F6] text-[#2874F0] hover:bg-red-50 hover:text-red-600 text-xs font-bold rounded-lg border border-blue-100 transition-colors disabled:opacity-30"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-auto relative min-h-[300px]">
            <div className="md:hidden p-4 bg-blue-50/50 text-[#2874F0] text-[10px] font-bold text-center uppercase tracking-widest border-b border-blue-100 italic">
              ← Swipe horizontally to view all fields →
            </div>
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="bg-[#F9FAFB] text-[10px] uppercase font-bold text-gray-400 border-y border-gray-50 sticky top-0 z-10">
                <tr>
                  {EXTRACTION_FIELDS.map(field => (
                    <th key={field.key} className="px-6 py-4 whitespace-nowrap">
                      {field.label}
                    </th>
                  ))}
                  <th className="px-6 py-4 sticky right-0 bg-[#F9FAFB]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dataList.length === 0 ? (
                  <tr>
                    <td colSpan={EXTRACTION_FIELDS.length + 1} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <TableIcon size={48} className="mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">No Records Found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  dataList.map((row) => (
                    <tr 
                      key={row.id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {EXTRACTION_FIELDS.map(field => (
                        <td key={field.key} className={`px-6 py-4 text-sm whitespace-nowrap ${field.key === 'applicationNumber' ? 'font-mono text-[#2874F0] font-bold' : 'text-gray-700'}`}>
                          {(row as any)[field.key]}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-right sticky right-0 bg-white group-hover:bg-blue-50/30">
                        <button onClick={() => removeEntry(row.id)} className="text-gray-300 hover:text-red-500 p-1 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Export Block */}
          <div className="p-6 bg-gray-50 flex flex-col md:flex-row items-center justify-between border-t border-gray-100 shrink-0 gap-4">
            <div className="flex items-center gap-4">
              <p className="text-xs text-gray-400 font-medium italic">
                {dataList.length > 0 ? "Selected data ready for consolidation." : "Please upload a document to begin extraction."}
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={() => exportToPDF(dataList)}
                disabled={dataList.length === 0}
                className="flex-1 md:flex-none bg-white border border-gray-200 text-[#212121] px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF0000" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Export PDF
              </button>
              <button 
                onClick={() => exportToDOCX(dataList)}
                disabled={dataList.length === 0}
                className="flex-1 md:flex-none bg-white border border-gray-200 text-[#212121] px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Export DOCX
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Simplified Footer */}
      <footer className="h-[48px] bg-white border-t border-gray-200 px-8 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
        <div className="hidden sm:flex gap-6">
          <span className="flex items-center gap-1"><Info size={12} /> Ghss Kolery</span>
          <a href="https://teachbook.in" target="_blank" rel="noreferrer" className="hover:text-[#2874F0] transition-colors">Teachbook.in</a>
          <a href="https://hsslove.in" target="_blank" rel="noreferrer" className="hover:text-[#2874F0] transition-colors">Hsslove.in</a>
        </div>
        <div className="flex-1 text-center sm:text-right flex items-center justify-center sm:justify-end gap-4 overflow-hidden">
          <span className="truncate">&copy; 2026 Nikhil Vinayak &bull; HSCAP SCANNER v2.1</span>
          <a href="https://youtube.com/@hsslove" target="_blank" rel="noreferrer" className="text-[#2874F0] hover:underline flex items-center gap-1 shrink-0">
            <Youtube size={14} /> youtube.com/@hsslove
          </a>
        </div>
      </footer>

      {/* Status Modals */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-white/95 z-[100] flex flex-col items-center justify-center p-6">
            <div className="w-64 h-64">
              <RemoteLottie path={SCAN_ANIM} />
            </div>
            <h2 className="text-2xl font-black mt-8 text-[#2874F0] text-center italic tracking-tight">AI EXTRACTION ACTIVE</h2>
            <p className="text-gray-400 mt-2 font-bold uppercase tracking-widest text-[10px]">Parsing 4-column document architecture...</p>
          </motion.div>
        )}
        
        {showSuccess && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 flex items-center justify-center z-[110] pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center border-4 border-green-500/20">
              <div className="w-24 h-24 mb-2">
                <RemoteLottie path={SUCCESS_ANIM} loop={false} />
              </div>
              <h3 className="text-xl font-black text-green-600 flex items-center gap-2 italic">
                <CheckCircle2 size={24} />
                DATA CONSOLIDATED
              </h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
