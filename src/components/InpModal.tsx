import React, { useState } from 'react';
import { X, Upload, Download, Copy, Check, FileText } from 'lucide-react';
import { EpanetProject } from '../types/epanet';
import { parseInpFile, exportToInpFile } from '../engine/inpParser';

interface InpModalProps {
  project: EpanetProject;
  isOpen: boolean;
  onClose: () => void;
  onImportProject: (importedProject: EpanetProject) => void;
}

export const InpModal: React.FC<InpModalProps> = ({
  project,
  isOpen,
  onClose,
  onImportProject
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [inpText, setInpText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInpText(content);
      setError(null);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = () => {
    try {
      if (!inpText.trim()) {
        setError('Please paste or upload .INP file content.');
        return;
      }
      const parsed = parseInpFile(inpText);
      if (parsed.junctions.length === 0 && parsed.pipes.length === 0) {
        setError('Could not find any junctions or pipes in the provided .INP text.');
        return;
      }
      onImportProject(parsed);
      onClose();
    } catch (err: any) {
      setError(`Failed to parse .INP file: ${err.message || 'Syntax error'}`);
    }
  };

  const exportedInp = exportToInpFile(project);

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportedInp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadInp = () => {
    const blob = new Blob([exportedInp], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.inp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-[700px] max-w-[95vw] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span className="font-semibold text-slate-100 text-sm">EPANET .INP Input / Output</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 pt-2">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import .INP File</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to .INP</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'import' ? (
            <>
              <p className="text-xs text-slate-400">
                Upload or paste the text of an EPANET .INP file. Supports standard sections including
                [JUNCTIONS], [RESERVOIRS], [TANKS], [PIPES], [PUMPS], [VALVES], [PATTERNS], [CURVES], and [COORDINATES].
              </p>

              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer border border-slate-700 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Choose .INP File</span>
                  <input
                    type="file"
                    accept=".inp,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-slate-500">or paste content directly below:</span>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
                  {error}
                </div>
              )}

              <textarea
                value={inpText}
                onChange={(e) => setInpText(e.target.value)}
                placeholder="[TITLE]&#10;My Water System&#10;&#10;[JUNCTIONS]&#10;..."
                className="w-full h-64 bg-slate-950 font-mono text-xs text-slate-200 p-3 rounded-lg border border-slate-800 focus:border-cyan-500 outline-none resize-none"
              />

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportSubmit}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-950/40"
                >
                  Import Model
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-400">
                Export current network model directly into standard EPANET .INP format compatible with EPA EPANET 2.2, WaterGEMS, InfoWater, or QGIS.
              </p>

              <textarea
                readOnly
                value={exportedInp}
                className="w-full h-72 bg-slate-950 font-mono text-xs text-slate-300 p-3 rounded-lg border border-slate-800 outline-none resize-none"
              />

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={handleCopyExport}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy All'}</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleDownloadInp}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .INP File</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
