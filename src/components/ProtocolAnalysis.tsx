import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { ProtocolData, AnalysisResult } from '../App';

interface ProtocolAnalysisProps {
  protocol: ProtocolData;
  onComplete: (result: AnalysisResult) => void;
}

export const ProtocolAnalysis: React.FC<ProtocolAnalysisProps> = ({ protocol, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [completed, setCompleted] = useState(false);

  const analysisSteps = [
    { task: 'Parsing protocol structure', duration: 1000 },
    { task: 'Identifying study forms and assessments', duration: 1500 },
    { task: 'Extracting visit schedules and timepoints', duration: 1200 },
    { task: 'Mapping CDASH fields and variables', duration: 2000 },
    { task: 'Creating data dictionaries from protocol values', duration: 1800 },
    { task: 'Validating CDISC compliance', duration: 1000 }
  ];

  useEffect(() => {
    let currentStep = 0;
    let currentProgress = 0;

    const runAnalysis = () => {
      if (currentStep < analysisSteps.length) {
        const step = analysisSteps[currentStep];
        setCurrentTask(step.task);
        
        const stepProgress = 100 / analysisSteps.length;
        const interval = setInterval(() => {
          currentProgress += stepProgress / (step.duration / 100);
          setProgress(Math.min(currentProgress, (currentStep + 1) * stepProgress));
        }, 100);

        setTimeout(() => {
          clearInterval(interval);
          currentStep++;
          if (currentStep < analysisSteps.length) {
            runAnalysis();
          } else {
            setCompleted(true);
            setCurrentTask('Analysis complete');
            setTimeout(() => {
              const result: AnalysisResult = {
                forms: ['Demographics', 'Informed Consent', 'Medical History', 'Vital Signs', 'Laboratory', 'Adverse Events', 'Concomitant Medications', 'Physical Examination', 'ECG', 'Questionnaires', 'Substance Use', 'Disposition'],
                fields: 156,
                visits: 8,
                subjects: 300,
                cdashCompliance: 94,
                cdisc: 'SDTM v1.7'
              };
              onComplete(result);
            }, 1000);
          }
        }, step.duration);
      }
    };

    runAnalysis();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Analyzing Protocol
        </h2>
        <p className="text-lg text-slate-600">
          Our AI is parsing your protocol and identifying CDASH/CDISC requirements, forms, and data dictionaries
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Protocol: {protocol.title}</h3>
              <p className="text-sm text-slate-600">Uploaded {protocol.uploadedAt.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
            <div className="text-sm text-slate-500">Complete</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            {completed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Clock className="w-5 h-5 text-blue-500 animate-spin" />
            )}
            <span className="text-sm font-medium text-slate-700">{currentTask}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Analysis Progress</h4>
            {analysisSteps.map((step, index) => (
              <div key={index} className="flex items-center space-x-3">
                {progress > (index + 1) * (100 / analysisSteps.length) ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : progress > index * (100 / analysisSteps.length) ? (
                  <Clock className="w-4 h-4 text-blue-500 animate-spin" />
                ) : (
                  <div className="w-4 h-4 border-2 border-slate-300 rounded-full" />
                )}
                <span className={`text-sm ${
                  progress > (index + 1) * (100 / analysisSteps.length)
                    ? 'text-green-600'
                    : progress > index * (100 / analysisSteps.length)
                    ? 'text-blue-600'
                    : 'text-slate-500'
                }`}>
                  {step.task}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-3">AI Insights</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-slate-600">Detected 12 clinical forms</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-slate-600">Schedule of events identified</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-slate-600">Data dictionaries extracted</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-slate-600">CDISC SDTM structure mapped</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};