import React from 'react';
import { FileText, Bot, Shield } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Clinical AI Spec Generator</h1>
                <p className="text-sm text-slate-600">CDASH/CDISC Compliant Document Generation</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Shield className="w-4 h-4" />
              <span>CDISC v2.1 | CDASH v1.1</span>
            </div>
            <button
              onClick={onReset}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>New Protocol</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};