import React, { useState } from 'react';
import { Download, FileText, Eye, CheckCircle, AlertTriangle, BarChart3, Users, Calendar, Database, Table, BookOpen, Clock } from 'lucide-react';
import { GeneratedSpec, ProtocolData, AnalysisResult } from '../App';
import * as XLSX from 'xlsx';

interface DashboardProps {
  specification: GeneratedSpec;
  protocol: ProtocolData | null;
  analysis: AnalysisResult | null;
  onReset: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  specification, 
  protocol, 
  analysis, 
  onReset 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'forms' | 'fields' | 'schedule' | 'dictionaries' | 'export'>('overview');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExportPDF = async () => {
    setIsExporting('pdf');
    try {
      // Dynamic import for jsPDF to avoid SSR issues
      const { default: jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      
      const doc = new jsPDF();
      
      // Title Page
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Clinical Trial Specification Document', 20, 30);
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text(specification.title, 20, 50);
      
      doc.setFontSize(12);
      doc.text(`Generated: ${specification.metadata.generatedAt.toLocaleDateString()}`, 20, 70);
      doc.text(`Protocol Version: ${specification.metadata.protocolVersion}`, 20, 80);
      doc.text(`CDASH Version: ${specification.metadata.cdashVersion}`, 20, 90);
      doc.text(`CDISC Version: ${specification.metadata.cdiscVersion}`, 20, 100);
      
      if (analysis) {
        doc.text(`CDASH Compliance: ${analysis.cdashCompliance}%`, 20, 110);
        doc.text(`Total Fields: ${analysis.fields}`, 20, 120);
        doc.text(`Study Visits: ${analysis.visits}`, 20, 130);
        doc.text(`Subjects: ${analysis.subjects}`, 20, 140);
      }

      // Add new page for forms overview
      doc.addPage();
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Study Forms Overview', 20, 30);
      
      let yPosition = 50;
      specification.forms.forEach((form, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 30;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${form.name}`, 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const splitDescription = doc.splitTextToSize(form.description, 170);
        doc.text(splitDescription, 25, yPosition);
        yPosition += splitDescription.length * 5 + 5;
        
        doc.text(`Category: ${form.category}`, 25, yPosition);
        yPosition += 5;
        doc.text(`OID: ${form.oid}`, 25, yPosition);
        yPosition += 5;
        doc.text(`Fields: ${form.fields.length}`, 25, yPosition);
        yPosition += 15;
      });

      // Schedule of Events
      doc.addPage();
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Schedule of Events', 20, 30);

      const scheduleData = specification.scheduleOfEvents.map(event => [
        event.visitNumber.toString(),
        event.visitName,
        event.visitWindow,
        event.timepoint,
        event.forms.length.toString()
      ]);

      (doc as any).autoTable({
        head: [['Visit #', 'Visit Name', 'Window', 'Timepoint', 'Forms']],
        body: scheduleData,
        startY: 40,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });

      // Field Mappings Table
      doc.addPage();
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Field Mappings', 20, 30);

      const tableData = specification.forms.flatMap(form =>
        form.fields.map(field => [
          form.name,
          field.name,
          field.label,
          field.type,
          field.cdashVariable,
          field.required ? 'Yes' : 'No',
          field.dataDictionary || 'N/A',
          field.rangeCheck || 'N/A'
        ])
      );

      (doc as any).autoTable({
        head: [['Form', 'Field', 'Label', 'Type', 'CDASH', 'Required', 'Dictionary', 'Range Check']],
        body: tableData,
        startY: 40,
        styles: { fontSize: 6, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 18 },
          2: { cellWidth: 30 },
          3: { cellWidth: 12 },
          4: { cellWidth: 15 },
          5: { cellWidth: 12 },
          6: { cellWidth: 15 },
          7: { cellWidth: 18 }
        }
      });

      // Data Dictionaries
      if (specification.dataDictionaries.length > 0) {
        doc.addPage();
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Data Dictionaries', 20, 30);

        let dictYPosition = 50;
        specification.dataDictionaries.forEach((dict, index) => {
          if (dictYPosition > 200) {
            doc.addPage();
            dictYPosition = 30;
          }

          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(`${dict.name} (${dict.id})`, 20, dictYPosition);
          dictYPosition += 10;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(dict.description, 20, dictYPosition);
          dictYPosition += 15;

          const dictData = dict.values.map(value => [value.code, value.decode, value.description || '']);
          
          (doc as any).autoTable({
            head: [['Code', 'Decode', 'Description']],
            body: dictData,
            startY: dictYPosition,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [34, 197, 94], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [240, 253, 244] },
            margin: { left: 20, right: 20 }
          });

          dictYPosition = (doc as any).lastAutoTable.finalY + 20;
        });
      }

      // Save the PDF
      doc.save(`${specification.title.replace(/[^a-z0-9]/gi, '_')}_specification.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting('excel');
    try {
      const workbook = XLSX.utils.book_new();

      // Overview Sheet
      const overviewData = [
        ['Specification Title', specification.title],
        ['Generated Date', specification.metadata.generatedAt.toLocaleDateString()],
        ['Protocol Version', specification.metadata.protocolVersion],
        ['Specification Version', specification.metadata.specVersion],
        ['CDASH Version', specification.metadata.cdashVersion],
        ['CDISC Version', specification.metadata.cdiscVersion],
        [''],
        ['Analysis Summary', ''],
        ['Total Forms', specification.forms.length],
        ['Total Fields', analysis?.fields || 0],
        ['Study Visits', analysis?.visits || 0],
        ['Subjects', analysis?.subjects || 0],
        ['CDASH Compliance', `${analysis?.cdashCompliance || 0}%`],
        ['Data Dictionaries', specification.dataDictionaries.length]
      ];

      const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');

      // Forms Sheet
      const formsData = [
        ['Form Name', 'Form OID', 'Description', 'Category', 'Field Count']
      ];
      specification.forms.forEach(form => {
        formsData.push([
          form.name,
          form.oid,
          form.description,
          form.category,
          form.fields.length
        ]);
      });

      const formsSheet = XLSX.utils.aoa_to_sheet(formsData);
      XLSX.utils.book_append_sheet(workbook, formsSheet, 'Forms');

      // Enhanced Field Mappings Sheet with new columns
      const fieldsData = [
        [
          'Form Name', 'Form OID', 'Field Name', 'Field OID', 'Field Label', 'Data Type', 
          'CDASH Variable', 'Required', 'Data Dictionary', 'Description', 'Length', 
          'Format', 'Range Check', 'Default Value', 'Is Visible', 'SAS Label', 
          'SAS Format', 'SAS Length'
        ]
      ];

      specification.forms.forEach(form => {
        form.fields.forEach(field => {
          fieldsData.push([
            form.name,
            form.oid,
            field.name,
            field.oid,
            field.label,
            field.type,
            field.cdashVariable,
            field.required ? 'Yes' : 'No',
            field.dataDictionary || '',
            field.description || '',
            field.length?.toString() || '',
            field.format || '',
            field.rangeCheck || '',
            field.defaultValue || '',
            field.isVisible !== undefined ? (field.isVisible ? 'Yes' : 'No') : 'Yes',
            field.sasLabel || '',
            field.sasFormat || '',
            field.sasLength?.toString() || ''
          ]);
        });
      });

      const fieldsSheet = XLSX.utils.aoa_to_sheet(fieldsData);
      
      // Enhanced column widths for new columns
      const colWidths = [
        { wch: 25 }, // Form Name
        { wch: 15 }, // Form OID
        { wch: 15 }, // Field Name
        { wch: 15 }, // Field OID
        { wch: 30 }, // Field Label
        { wch: 12 }, // Data Type
        { wch: 15 }, // CDASH Variable
        { wch: 10 }, // Required
        { wch: 15 }, // Data Dictionary
        { wch: 40 }, // Description
        { wch: 8 },  // Length
        { wch: 12 }, // Format
        { wch: 20 }, // Range Check
        { wch: 15 }, // Default Value
        { wch: 10 }, // Is Visible
        { wch: 25 }, // SAS Label
        { wch: 15 }, // SAS Format
        { wch: 12 }  // SAS Length
      ];
      fieldsSheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, fieldsSheet, 'Field Mappings');

      // Schedule of Events Sheet
      const scheduleData = [
        ['Visit Number', 'Visit Name', 'Visit Window', 'Timepoint', 'Forms']
      ];

      specification.scheduleOfEvents.forEach(event => {
        scheduleData.push([
          event.visitNumber,
          event.visitName,
          event.visitWindow,
          event.timepoint,
          event.forms.join('; ')
        ]);
      });

      const scheduleSheet = XLSX.utils.aoa_to_sheet(scheduleData);
      scheduleSheet['!cols'] = [
        { wch: 12 }, // Visit Number
        { wch: 20 }, // Visit Name
        { wch: 15 }, // Visit Window
        { wch: 15 }, // Timepoint
        { wch: 80 }  // Forms
      ];
      XLSX.utils.book_append_sheet(workbook, scheduleSheet, 'Schedule of Events');

      // Data Dictionaries Sheet
      const dictData = [
        ['Dictionary ID', 'Dictionary Name', 'Description', 'Code', 'Decode', 'Code Description']
      ];

      specification.dataDictionaries.forEach(dict => {
        dict.values.forEach(value => {
          dictData.push([
            dict.id,
            dict.name,
            dict.description,
            value.code,
            value.decode,
            value.description || ''
          ]);
        });
      });

      const dictSheet = XLSX.utils.aoa_to_sheet(dictData);
      dictSheet['!cols'] = [
        { wch: 15 }, // Dictionary ID
        { wch: 20 }, // Dictionary Name
        { wch: 40 }, // Description
        { wch: 15 }, // Code
        { wch: 25 }, // Decode
        { wch: 40 }  // Code Description
      ];
      XLSX.utils.book_append_sheet(workbook, dictSheet, 'Data Dictionaries');

      // Compliance Sheet
      const complianceData = [
        ['Compliance Metric', 'Value', 'Status'],
        ['CDASH Compliance', `${analysis?.cdashCompliance || 0}%`, analysis && analysis.cdashCompliance >= 90 ? 'Good' : 'Needs Review'],
        ['CDISC Version', analysis?.cdisc || 'N/A', 'Compliant'],
        ['Total Fields Mapped', analysis?.fields || 0, 'Complete'],
        ['Forms Identified', specification.forms.length, 'Complete'],
        ['Data Dictionaries Created', specification.dataDictionaries.length, 'Complete'],
        ['Schedule of Events', specification.scheduleOfEvents.length + ' visits', 'Complete']
      ];

      const complianceSheet = XLSX.utils.aoa_to_sheet(complianceData);
      XLSX.utils.book_append_sheet(workbook, complianceSheet, 'Compliance');

      // Save the Excel file
      XLSX.writeFile(workbook, `${specification.title.replace(/[^a-z0-9]/gi, '_')}_clinical_specification.xlsx`);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Error generating Excel file. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportJSON = () => {
    setIsExporting('json');
    try {
      const data = {
        specification,
        protocol,
        analysis,
        exportedAt: new Date().toISOString(),
        exportVersion: '2.0'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${specification.title.replace(/[^a-z0-9]/gi, '_')}_data.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating JSON:', error);
      alert('Error generating JSON file. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExport = (format: 'pdf' | 'excel' | 'json') => {
    switch (format) {
      case 'pdf':
        handleExportPDF();
        break;
      case 'excel':
        handleExportExcel();
        break;
      case 'json':
        handleExportJSON();
        break;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {specification.title}
            </h1>
            <p className="text-slate-600">
              Generated on {specification.metadata.generatedAt.toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm text-slate-500">CDASH Compliance</div>
              <div className="text-2xl font-bold text-green-600">{analysis?.cdashCompliance}%</div>
            </div>
            <button
              onClick={onReset}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              New Protocol
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">{specification.forms.length}</div>
              <div className="text-sm text-slate-600">Forms</div>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">{analysis?.fields}</div>
              <div className="text-sm text-slate-600">Fields</div>
            </div>
            <BarChart3 className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">{analysis?.visits}</div>
              <div className="text-sm text-slate-600">Study Visits</div>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">{specification.dataDictionaries.length}</div>
              <div className="text-sm text-slate-600">Dictionaries</div>
            </div>
            <BookOpen className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-slate-900">{analysis?.subjects}</div>
              <div className="text-sm text-slate-600">Subjects</div>
            </div>
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'forms', label: 'Forms', icon: FileText },
              { id: 'fields', label: 'Fields', icon: BarChart3 },
              { id: 'schedule', label: 'Schedule', icon: Clock },
              { id: 'dictionaries', label: 'Dictionaries', icon: BookOpen },
              { id: 'export', label: 'Export', icon: Download }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Specification Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 mb-3">Metadata</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Protocol Version</span>
                        <span className="font-medium">{specification.metadata.protocolVersion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Spec Version</span>
                        <span className="font-medium">{specification.metadata.specVersion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">CDASH Version</span>
                        <span className="font-medium">{specification.metadata.cdashVersion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">CDISC Version</span>
                        <span className="font-medium">{specification.metadata.cdiscVersion}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 mb-3">Compliance Status</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-slate-600">CDASH Fields Mapped</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-slate-600">CDISC SDTM Compliant</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-slate-600">Data Dictionaries Created</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-slate-600">Schedule of Events Mapped</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'forms' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Study Forms</h3>
              <div className="space-y-4">
                {specification.forms.map((form, index) => (
                  <div key={index} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-900">{form.name}</h4>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-slate-600">{form.category}</span>
                        <span className="text-sm text-slate-600">{form.fields.length} fields</span>
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className="text-xs text-slate-500">OID: {form.oid}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{form.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {form.fields.slice(0, 6).map((field, fIndex) => (
                        <span key={fIndex} className="px-2 py-1 bg-white rounded text-xs text-slate-600">
                          {field.name}
                        </span>
                      ))}
                      {form.fields.length > 6 && (
                        <span className="px-2 py-1 bg-white rounded text-xs text-slate-600">
                          +{form.fields.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'fields' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Field Mappings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-3 text-left font-medium text-slate-900">Form</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-900">Field</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-900">Label</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-900">Type</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-900">CDASH</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-900">Required</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-900">Dictionary</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-900">Range Check</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-900">Default</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-900">Visible</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {specification.forms.flatMap(form => 
                      form.fields.map((field, index) => (
                        <tr key={`${form.oid}-${index}`} className="hover:bg-slate-50">
                          <td className="px-3 py-3 font-medium text-slate-900">{form.name}</td>
                          <td className="px-3 py-3 text-slate-600">{field.name}</td>
                          <td className="px-3 py-3 text-slate-600">{field.label}</td>
                          <td className="px-3 py-3 text-slate-600">{field.type}</td>
                          <td className="px-3 py-3 text-slate-600">{field.cdashVariable}</td>
                          <td className="px-3 py-3">
                            {field.required ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <div className="w-4 h-4 border border-slate-300 rounded" />
                            )}
                          </td>
                          <td className="px-3 py-3 text-slate-600">{field.dataDictionary || '-'}</td>
                          <td className="px-3 py-3 text-slate-600">{field.rangeCheck || '-'}</td>
                          <td className="px-3 py-3 text-slate-600">{field.defaultValue || '-'}</td>
                          <td className="px-3 py-3">
                            {field.isVisible !== false ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <div className="w-4 h-4 border border-slate-300 rounded" />
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Schedule of Events</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-900">Visit #</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-900">Visit Name</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-900">Window</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-900">Timepoint</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-900">Forms</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {specification.scheduleOfEvents.map((event, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{event.visitNumber}</td>
                        <td className="px-4 py-3 text-slate-600">{event.visitName}</td>
                        <td className="px-4 py-3 text-slate-600">{event.visitWindow}</td>
                        <td className="px-4 py-3 text-slate-600">{event.timepoint}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {event.forms.slice(0, 3).map((form, fIndex) => (
                              <span key={fIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {form.replace(/\s*\([^)]*\)/, '')}
                              </span>
                            ))}
                            {event.forms.length > 3 && (
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                                +{event.forms.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'dictionaries' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Data Dictionaries</h3>
              <div className="space-y-6">
                {specification.dataDictionaries.map((dict, index) => (
                  <div key={index} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-900">{dict.name}</h4>
                      <span className="text-sm text-slate-600">{dict.id}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{dict.description}</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-slate-900">Code</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-900">Decode</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-900">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {dict.values.map((value, vIndex) => (
                            <tr key={vIndex} className="hover:bg-white">
                              <td className="px-3 py-2 font-medium text-slate-900">{value.code}</td>
                              <td className="px-3 py-2 text-slate-600">{value.decode}</td>
                              <td className="px-3 py-2 text-slate-600">{value.description || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Export Options</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting === 'pdf'}
                    className="flex items-center space-x-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText className="w-8 h-8 text-red-600" />
                    <div className="text-left">
                      <div className="font-medium text-red-900">
                        {isExporting === 'pdf' ? 'Generating...' : 'PDF Document'}
                      </div>
                      <div className="text-sm text-red-600">Complete specification with forms, fields, schedule, and dictionaries</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleExport('excel')}
                    disabled={isExporting === 'excel'}
                    className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Table className="w-8 h-8 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium text-green-900">
                        {isExporting === 'excel' ? 'Generating...' : 'Excel Workbook'}
                      </div>
                      <div className="text-sm text-green-600">Enhanced multi-sheet workbook with all field details</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleExport('json')}
                    disabled={isExporting === 'json'}
                    className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Database className="w-8 h-8 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium text-blue-900">
                        {isExporting === 'json' ? 'Generating...' : 'JSON Data'}
                      </div>
                      <div className="text-sm text-blue-600">Structured format for system integration</div>
                    </div>
                  </button>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 mt-6">
                  <h4 className="font-medium text-blue-900 mb-2">Enhanced Export Details</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>PDF:</strong> Complete specification document with forms, fields, schedule of events, and data dictionaries</p>
                    <p><strong>Excel:</strong> Enhanced multi-sheet workbook with separate Form Name/OID columns, Field Name/OID columns, Range Check, Default Value, Visibility, and SAS details</p>
                    <p><strong>JSON:</strong> Raw structured data for integration with other clinical systems and databases</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};