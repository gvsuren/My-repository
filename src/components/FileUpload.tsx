import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { ProtocolData } from '../App';

interface FileUploadProps {
  onUpload: (data: ProtocolData) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onUpload({
        title: file.name.replace(/\.[^/.]+$/, ''),
        content,
        fileName: file.name,
        uploadedAt: new Date()
      });
    };
    reader.readAsText(file);
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onUpload({
        title: 'Protocol Text Input',
        content: textInput.trim(),
        uploadedAt: new Date()
      });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Upload Clinical Trial Protocol
        </h2>
        <p className="text-lg text-slate-600">
          Our AI will analyze your protocol and generate CDASH/CDISC compliant specification documents
        </p>
      </div>

      {/* Upload Mode Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg p-1 shadow-sm border border-slate-200">
          <button
            onClick={() => setUploadMode('file')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              uploadMode === 'file'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => setUploadMode('text')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              uploadMode === 'text'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paste Text
          </button>
        </div>
      </div>

      {uploadMode === 'file' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 hover:border-slate-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${
              dragActive ? 'text-blue-600' : 'text-slate-400'
            }`} />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Drop your protocol file here
            </h3>
            <p className="text-slate-600 mb-4">
              Or click to browse and select a file
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.doc,.docx,.pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>PDF, DOC, DOCX</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>TXT files</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Max 50MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Protocol Text
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your clinical trial protocol text here..."
              className="w-full h-64 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Process Protocol</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};