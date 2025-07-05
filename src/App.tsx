import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ProtocolAnalysis } from './components/ProtocolAnalysis';
import { SpecificationGenerator } from './components/SpecificationGenerator';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';

export type Step = 'upload' | 'analysis' | 'generation' | 'review';

export interface ProtocolData {
  title: string;
  content: string;
  fileName?: string;
  uploadedAt: Date;
}

export interface AnalysisResult {
  forms: string[];
  fields: number;
  visits: number;
  subjects: number;
  cdashCompliance: number;
  cdisc: string;
}

export interface DataDictionary {
  id: string;
  name: string;
  description: string;
  values: Array<{
    code: string;
    decode: string;
    description?: string;
  }>;
}

export interface ScheduleEvent {
  visitNumber: number;
  visitName: string;
  visitWindow: string;
  timepoint: string;
  forms: string[];
}

export interface GeneratedSpec {
  id: string;
  title: string;
  forms: Array<{
    name: string;
    oid: string;
    description: string;
    category: string;
    fields: Array<{
      name: string;
      oid: string;
      label: string;
      type: string;
      cdashVariable: string;
      required: boolean;
      dataDictionary?: string;
      description?: string;
      length?: number;
      format?: string;
      rangeCheck?: string;
      defaultValue?: string;
      isVisible?: boolean;
      sasLabel?: string;
      sasFormat?: string;
      sasLength?: number;
    }>;
  }>;
  scheduleOfEvents: ScheduleEvent[];
  dataDictionaries: DataDictionary[];
  metadata: {
    protocolVersion: string;
    specVersion: string;
    generatedAt: Date;
    cdashVersion: string;
    cdiscVersion: string;
  };
}

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [protocolData, setProtocolData] = useState<ProtocolData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [generatedSpec, setGeneratedSpec] = useState<GeneratedSpec | null>(null);

  const handleProtocolUpload = (data: ProtocolData) => {
    setProtocolData(data);
    setCurrentStep('analysis');
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setCurrentStep('generation');
  };

  const handleSpecGenerated = (spec: GeneratedSpec) => {
    setGeneratedSpec(spec);
    setCurrentStep('review');
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setProtocolData(null);
    setAnalysisResult(null);
    setGeneratedSpec(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header onReset={handleReset} />
      
      <main className="container mx-auto px-4 py-8">
        {currentStep === 'upload' && (
          <FileUpload onUpload={handleProtocolUpload} />
        )}
        
        {currentStep === 'analysis' && protocolData && (
          <ProtocolAnalysis
            protocol={protocolData}
            onComplete={handleAnalysisComplete}
          />
        )}
        
        {currentStep === 'generation' && protocolData && analysisResult && (
          <SpecificationGenerator
            protocol={protocolData}
            analysis={analysisResult}
            onComplete={handleSpecGenerated}
          />
        )}
        
        {currentStep === 'review' && generatedSpec && (
          <Dashboard 
            specification={generatedSpec}
            protocol={protocolData}
            analysis={analysisResult}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}

export default App;