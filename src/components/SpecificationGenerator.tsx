import React, { useState, useEffect } from 'react';
import { FileText, Zap, Settings, CheckCircle } from 'lucide-react';
import { ProtocolData, AnalysisResult, GeneratedSpec, DataDictionary, ScheduleEvent } from '../App';

interface SpecificationGeneratorProps {
  protocol: ProtocolData;
  analysis: AnalysisResult;
  onComplete: (spec: GeneratedSpec) => void;
}

export const SpecificationGenerator: React.FC<SpecificationGeneratorProps> = ({ 
  protocol, 
  analysis, 
  onComplete 
}) => {
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [completed, setCompleted] = useState(false);

  const generationSteps = [
    { task: 'Creating form specifications with OIDs', duration: 1500 },
    { task: 'Mapping CDASH fields and variables with enhanced attributes', duration: 2000 },
    { task: 'Generating data dictionaries and controlled terminology', duration: 1800 },
    { task: 'Building schedule of events matrix', duration: 1500 },
    { task: 'Creating enhanced CRF field mappings with range checks and SAS details', duration: 1200 },
    { task: 'Validating specifications and finalizing documentation', duration: 1000 }
  ];

  useEffect(() => {
    let currentStep = 0;
    let currentProgress = 0;

    const runGeneration = () => {
      if (currentStep < generationSteps.length) {
        const step = generationSteps[currentStep];
        setCurrentTask(step.task);
        
        const stepProgress = 100 / generationSteps.length;
        const interval = setInterval(() => {
          currentProgress += stepProgress / (step.duration / 100);
          setProgress(Math.min(currentProgress, (currentStep + 1) * stepProgress));
        }, 100);

        setTimeout(() => {
          clearInterval(interval);
          currentStep++;
          if (currentStep < generationSteps.length) {
            runGeneration();
          } else {
            setCompleted(true);
            setCurrentTask('Specification generation complete');
            setTimeout(() => {
              // Create comprehensive data dictionaries
              const dataDictionaries: DataDictionary[] = [
                {
                  id: 'DD_SEX',
                  name: 'Sex',
                  description: 'Subject sex/gender classification',
                  values: [
                    { code: 'M', decode: 'Male', description: 'Male subject' },
                    { code: 'F', decode: 'Female', description: 'Female subject' },
                    { code: 'U', decode: 'Unknown', description: 'Sex unknown or not reported' }
                  ]
                },
                {
                  id: 'DD_RACE',
                  name: 'Race',
                  description: 'Subject racial classification',
                  values: [
                    { code: 'WHITE', decode: 'White', description: 'White or Caucasian' },
                    { code: 'BLACK', decode: 'Black or African American', description: 'Black or African American' },
                    { code: 'ASIAN', decode: 'Asian', description: 'Asian' },
                    { code: 'NATIVE', decode: 'American Indian or Alaska Native', description: 'American Indian or Alaska Native' },
                    { code: 'PACIFIC', decode: 'Native Hawaiian or Other Pacific Islander', description: 'Native Hawaiian or Other Pacific Islander' },
                    { code: 'OTHER', decode: 'Other', description: 'Other race' },
                    { code: 'MULTIPLE', decode: 'Multiple', description: 'Multiple races' },
                    { code: 'UNKNOWN', decode: 'Unknown', description: 'Race unknown or not reported' }
                  ]
                },
                {
                  id: 'DD_ETHNIC',
                  name: 'Ethnicity',
                  description: 'Subject ethnicity classification',
                  values: [
                    { code: 'HISPANIC', decode: 'Hispanic or Latino', description: 'Hispanic or Latino ethnicity' },
                    { code: 'NOT HISPANIC', decode: 'Not Hispanic or Latino', description: 'Not Hispanic or Latino ethnicity' },
                    { code: 'UNKNOWN', decode: 'Unknown', description: 'Ethnicity unknown or not reported' }
                  ]
                },
                {
                  id: 'DD_YESNO',
                  name: 'Yes/No',
                  description: 'Standard Yes/No response',
                  values: [
                    { code: 'Y', decode: 'Yes', description: 'Yes response' },
                    { code: 'N', decode: 'No', description: 'No response' }
                  ]
                },
                {
                  id: 'DD_SEVERITY',
                  name: 'Severity/Intensity',
                  description: 'Adverse event severity classification',
                  values: [
                    { code: 'MILD', decode: 'Mild', description: 'Mild severity - does not interfere with usual activities' },
                    { code: 'MODERATE', decode: 'Moderate', description: 'Moderate severity - interferes somewhat with usual activities' },
                    { code: 'SEVERE', decode: 'Severe', description: 'Severe - interferes significantly with usual activities' }
                  ]
                },
                {
                  id: 'DD_CAUSALITY',
                  name: 'Causality Assessment',
                  description: 'Relationship to study treatment',
                  values: [
                    { code: 'RELATED', decode: 'Related', description: 'Related to study treatment' },
                    { code: 'NOT RELATED', decode: 'Not Related', description: 'Not related to study treatment' },
                    { code: 'POSSIBLY RELATED', decode: 'Possibly Related', description: 'Possibly related to study treatment' },
                    { code: 'PROBABLY RELATED', decode: 'Probably Related', description: 'Probably related to study treatment' },
                    { code: 'UNKNOWN', decode: 'Unknown', description: 'Relationship unknown' }
                  ]
                },
                {
                  id: 'DD_OUTCOME',
                  name: 'AE Outcome',
                  description: 'Adverse event outcome',
                  values: [
                    { code: 'RECOVERED', decode: 'Recovered/Resolved', description: 'Completely recovered or resolved' },
                    { code: 'RECOVERING', decode: 'Recovering/Resolving', description: 'Recovering or resolving' },
                    { code: 'NOT RECOVERED', decode: 'Not Recovered/Not Resolved', description: 'Not recovered or not resolved' },
                    { code: 'RECOVERED WITH SEQUELAE', decode: 'Recovered/Resolved with Sequelae', description: 'Recovered with sequelae' },
                    { code: 'FATAL', decode: 'Fatal', description: 'Fatal outcome' },
                    { code: 'UNKNOWN', decode: 'Unknown', description: 'Outcome unknown' }
                  ]
                },
                {
                  id: 'DD_POSITION',
                  name: 'Subject Position',
                  description: 'Position of subject during assessment',
                  values: [
                    { code: 'SUPINE', decode: 'Supine', description: 'Lying on back' },
                    { code: 'SITTING', decode: 'Sitting', description: 'Sitting position' },
                    { code: 'STANDING', decode: 'Standing', description: 'Standing position' },
                    { code: 'SEMI-RECUMBENT', decode: 'Semi-recumbent', description: 'Semi-recumbent position' }
                  ]
                },
                {
                  id: 'DD_UNITS_TEMP',
                  name: 'Temperature Units',
                  description: 'Units for temperature measurement',
                  values: [
                    { code: 'C', decode: 'Celsius', description: 'Degrees Celsius' },
                    { code: 'F', decode: 'Fahrenheit', description: 'Degrees Fahrenheit' }
                  ]
                },
                {
                  id: 'DD_UNITS_WEIGHT',
                  name: 'Weight Units',
                  description: 'Units for weight measurement',
                  values: [
                    { code: 'kg', decode: 'Kilograms', description: 'Kilograms' },
                    { code: 'lb', decode: 'Pounds', description: 'Pounds' }
                  ]
                }
              ];

              // Create schedule of events
              const scheduleOfEvents: ScheduleEvent[] = [
                {
                  visitNumber: 1,
                  visitName: 'Screening',
                  visitWindow: 'Day -28 to -1',
                  timepoint: 'Screening',
                  forms: ['Demographics', 'Informed Consent', 'Medical History', 'Physical Examination', 'Vital Signs', 'Laboratory Test Results', 'Electrocardiogram', 'Substance Use']
                },
                {
                  visitNumber: 2,
                  visitName: 'Baseline',
                  visitWindow: 'Day 1',
                  timepoint: 'Baseline',
                  forms: ['Vital Signs', 'Laboratory Test Results', 'Physical Examination', 'Electrocardiogram', 'Questionnaires', 'Adverse Events', 'Concomitant Medications']
                },
                {
                  visitNumber: 3,
                  visitName: 'Week 2',
                  visitWindow: 'Day 14 ± 2',
                  timepoint: 'Week 2',
                  forms: ['Vital Signs', 'Laboratory Test Results', 'Adverse Events', 'Concomitant Medications', 'Questionnaires']
                },
                {
                  visitNumber: 4,
                  visitName: 'Week 4',
                  visitWindow: 'Day 28 ± 3',
                  timepoint: 'Week 4',
                  forms: ['Vital Signs', 'Laboratory Test Results', 'Physical Examination', 'Electrocardiogram', 'Adverse Events', 'Concomitant Medications', 'Questionnaires']
                },
                {
                  visitNumber: 5,
                  visitName: 'Week 8',
                  visitWindow: 'Day 56 ± 3',
                  timepoint: 'Week 8',
                  forms: ['Vital Signs', 'Laboratory Test Results', 'Adverse Events', 'Concomitant Medications', 'Questionnaires']
                },
                {
                  visitNumber: 6,
                  visitName: 'Week 12',
                  visitWindow: 'Day 84 ± 3',
                  timepoint: 'Week 12',
                  forms: ['Vital Signs', 'Laboratory Test Results', 'Physical Examination', 'Electrocardiogram', 'Adverse Events', 'Concomitant Medications', 'Questionnaires']
                },
                {
                  visitNumber: 7,
                  visitName: 'End of Treatment',
                  visitWindow: 'Day 168 ± 7',
                  timepoint: 'End of Treatment',
                  forms: ['Vital Signs', 'Laboratory Test Results', 'Physical Examination', 'Electrocardiogram', 'Adverse Events', 'Concomitant Medications', 'Questionnaires', 'Disposition']
                },
                {
                  visitNumber: 8,
                  visitName: 'Follow-up',
                  visitWindow: 'Day 198 ± 7',
                  timepoint: 'Follow-up',
                  forms: ['Adverse Events', 'Concomitant Medications', 'Disposition']
                }
              ];

              const generatedSpec: GeneratedSpec = {
                id: `spec-${Date.now()}`,
                title: `${protocol.title} - CDASH Specification`,
                forms: [
                  {
                    name: 'Demographics',
                    oid: 'DM',
                    description: 'Subject demographic information including age, sex, race, ethnicity, and other baseline characteristics',
                    category: 'Special Purpose',
                    fields: [
                      { 
                        name: 'SUBJID', 
                        oid: 'DM.SUBJID', 
                        label: 'Subject Identifier', 
                        type: 'Text', 
                        cdashVariable: 'SUBJID', 
                        required: true, 
                        description: 'Unique subject identifier', 
                        length: 20,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Subject Identifier',
                        sasFormat: '$20.',
                        sasLength: 20
                      },
                      { 
                        name: 'AGE', 
                        oid: 'DM.AGE', 
                        label: 'Age', 
                        type: 'Numeric', 
                        cdashVariable: 'AGE', 
                        required: true, 
                        description: 'Age of subject', 
                        length: 3,
                        rangeCheck: '18 <= AGE <= 85',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Age',
                        sasFormat: '3.',
                        sasLength: 3
                      },
                      { 
                        name: 'AGEU', 
                        oid: 'DM.AGEU', 
                        label: 'Age Units', 
                        type: 'Text', 
                        cdashVariable: 'AGEU', 
                        required: true, 
                        description: 'Units for age (YEARS)', 
                        length: 10,
                        rangeCheck: 'AGEU = "YEARS"',
                        defaultValue: 'YEARS',
                        isVisible: false,
                        sasLabel: 'Age Units',
                        sasFormat: '$10.',
                        sasLength: 10
                      },
                      { 
                        name: 'SEX', 
                        oid: 'DM.SEX', 
                        label: 'Sex', 
                        type: 'Text', 
                        cdashVariable: 'SEX', 
                        required: true, 
                        dataDictionary: 'DD_SEX', 
                        description: 'Sex of the subject', 
                        length: 1,
                        rangeCheck: 'SEX in ("M", "F", "U")',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Sex',
                        sasFormat: '$1.',
                        sasLength: 1
                      },
                      { 
                        name: 'RACE', 
                        oid: 'DM.RACE', 
                        label: 'Race', 
                        type: 'Text', 
                        cdashVariable: 'RACE', 
                        required: false, 
                        dataDictionary: 'DD_RACE', 
                        description: 'Race of the subject', 
                        length: 50,
                        rangeCheck: 'RACE in DD_RACE codes',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Race',
                        sasFormat: '$50.',
                        sasLength: 50
                      },
                      { 
                        name: 'ETHNIC', 
                        oid: 'DM.ETHNIC', 
                        label: 'Ethnicity', 
                        type: 'Text', 
                        cdashVariable: 'ETHNIC', 
                        required: false, 
                        dataDictionary: 'DD_ETHNIC', 
                        description: 'Ethnicity of the subject', 
                        length: 50,
                        rangeCheck: 'ETHNIC in DD_ETHNIC codes',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Ethnicity',
                        sasFormat: '$50.',
                        sasLength: 50
                      },
                      { 
                        name: 'ARMCD', 
                        oid: 'DM.ARMCD', 
                        label: 'Planned Arm Code', 
                        type: 'Text', 
                        cdashVariable: 'ARMCD', 
                        required: true, 
                        description: 'Planned arm code', 
                        length: 20,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Planned Arm Code',
                        sasFormat: '$20.',
                        sasLength: 20
                      },
                      { 
                        name: 'ARM', 
                        oid: 'DM.ARM', 
                        label: 'Description of Planned Arm', 
                        type: 'Text', 
                        cdashVariable: 'ARM', 
                        required: true, 
                        description: 'Description of planned arm', 
                        length: 200,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Description of Planned Arm',
                        sasFormat: '$200.',
                        sasLength: 200
                      }
                    ]
                  },
                  {
                    name: 'Informed Consent',
                    oid: 'IC',
                    description: 'Documentation of informed consent process and subject consent status',
                    category: 'Special Purpose',
                    fields: [
                      { 
                        name: 'ICYN', 
                        oid: 'IC.ICYN', 
                        label: 'Informed Consent Obtained', 
                        type: 'Text', 
                        cdashVariable: 'ICYN', 
                        required: true, 
                        dataDictionary: 'DD_YESNO', 
                        description: 'Was informed consent obtained?', 
                        length: 1,
                        rangeCheck: 'ICYN in ("Y", "N")',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Informed Consent Obtained',
                        sasFormat: '$1.',
                        sasLength: 1
                      },
                      { 
                        name: 'ICDTC', 
                        oid: 'IC.ICDTC', 
                        label: 'Date/Time of Informed Consent', 
                        type: 'DateTime', 
                        cdashVariable: 'ICDTC', 
                        required: true, 
                        description: 'Date/time when informed consent was obtained', 
                        format: 'ISO8601',
                        rangeCheck: 'Valid ISO8601 datetime',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Date/Time of Informed Consent',
                        sasFormat: 'DATETIME20.',
                        sasLength: 20
                      },
                      { 
                        name: 'ICVER', 
                        oid: 'IC.ICVER', 
                        label: 'Informed Consent Version', 
                        type: 'Text', 
                        cdashVariable: 'ICVER', 
                        required: true, 
                        description: 'Version of informed consent form', 
                        length: 20,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Informed Consent Version',
                        sasFormat: '$20.',
                        sasLength: 20
                      },
                      { 
                        name: 'ICFORM', 
                        oid: 'IC.ICFORM', 
                        label: 'Informed Consent Form Type', 
                        type: 'Text', 
                        cdashVariable: 'ICFORM', 
                        required: false, 
                        description: 'Type of informed consent form', 
                        length: 50,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Informed Consent Form Type',
                        sasFormat: '$50.',
                        sasLength: 50
                      }
                    ]
                  },
                  {
                    name: 'Medical History',
                    oid: 'MH',
                    description: 'Subject medical history including past and current medical conditions',
                    category: 'Events',
                    fields: [
                      { 
                        name: 'MHTERM', 
                        oid: 'MH.MHTERM', 
                        label: 'Medical History Term', 
                        type: 'Text', 
                        cdashVariable: 'MHTERM', 
                        required: true, 
                        description: 'Medical history term as reported', 
                        length: 200,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Medical History Term',
                        sasFormat: '$200.',
                        sasLength: 200
                      },
                      { 
                        name: 'MHCAT', 
                        oid: 'MH.MHCAT', 
                        label: 'Category for Medical History', 
                        type: 'Text', 
                        cdashVariable: 'MHCAT', 
                        required: false, 
                        description: 'Category for medical history', 
                        length: 50,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Category for Medical History',
                        sasFormat: '$50.',
                        sasLength: 50
                      },
                      { 
                        name: 'MHSCAT', 
                        oid: 'MH.MHSCAT', 
                        label: 'Subcategory for Medical History', 
                        type: 'Text', 
                        cdashVariable: 'MHSCAT', 
                        required: false, 
                        description: 'Subcategory for medical history', 
                        length: 50,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Subcategory for Medical History',
                        sasFormat: '$50.',
                        sasLength: 50
                      },
                      { 
                        name: 'MHSTDTC', 
                        oid: 'MH.MHSTDTC', 
                        label: 'Start Date/Time of Medical History', 
                        type: 'DateTime', 
                        cdashVariable: 'MHSTDTC', 
                        required: false, 
                        description: 'Start date/time of medical history event', 
                        format: 'ISO8601',
                        rangeCheck: 'Valid ISO8601 datetime or partial',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Start Date/Time of Medical History',
                        sasFormat: 'DATETIME20.',
                        sasLength: 20
                      },
                      { 
                        name: 'MHENDTC', 
                        oid: 'MH.MHENDTC', 
                        label: 'End Date/Time of Medical History', 
                        type: 'DateTime', 
                        cdashVariable: 'MHENDTC', 
                        required: false, 
                        description: 'End date/time of medical history event', 
                        format: 'ISO8601',
                        rangeCheck: 'Valid ISO8601 datetime or partial',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'End Date/Time of Medical History',
                        sasFormat: 'DATETIME20.',
                        sasLength: 20
                      },
                      { 
                        name: 'MHONGO', 
                        oid: 'MH.MHONGO', 
                        label: 'Ongoing Medical History', 
                        type: 'Text', 
                        cdashVariable: 'MHONGO', 
                        required: false, 
                        dataDictionary: 'DD_YESNO', 
                        description: 'Is the medical history ongoing?', 
                        length: 1,
                        rangeCheck: 'MHONGO in ("Y", "N")',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Ongoing Medical History',
                        sasFormat: '$1.',
                        sasLength: 1
                      }
                    ]
                  },
                  {
                    name: 'Vital Signs',
                    oid: 'VS',
                    description: 'Vital signs measurements including blood pressure, heart rate, temperature, and respiratory rate',
                    category: 'Findings',
                    fields: [
                      { 
                        name: 'VSTEST', 
                        oid: 'VS.VSTEST', 
                        label: 'Vital Signs Test Name', 
                        type: 'Text', 
                        cdashVariable: 'VSTEST', 
                        required: true, 
                        description: 'Name of the vital signs test', 
                        length: 40,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Vital Signs Test Name',
                        sasFormat: '$40.',
                        sasLength: 40
                      },
                      { 
                        name: 'VSTESTCD', 
                        oid: 'VS.VSTESTCD', 
                        label: 'Vital Signs Test Short Name', 
                        type: 'Text', 
                        cdashVariable: 'VSTESTCD', 
                        required: true, 
                        description: 'Short name of vital signs test', 
                        length: 8,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Vital Signs Test Short Name',
                        sasFormat: '$8.',
                        sasLength: 8
                      },
                      { 
                        name: 'VSORRES', 
                        oid: 'VS.VSORRES', 
                        label: 'Result or Finding in Original Units', 
                        type: 'Text', 
                        cdashVariable: 'VSORRES', 
                        required: true, 
                        description: 'Result in original units', 
                        length: 200,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Result or Finding in Original Units',
                        sasFormat: '$200.',
                        sasLength: 200
                      },
                      { 
                        name: 'VSORRESU', 
                        oid: 'VS.VSORRESU', 
                        label: 'Original Units', 
                        type: 'Text', 
                        cdashVariable: 'VSORRESU', 
                        required: true, 
                        description: 'Original units of measurement', 
                        length: 40,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Original Units',
                        sasFormat: '$40.',
                        sasLength: 40
                      },
                      { 
                        name: 'VSPOS', 
                        oid: 'VS.VSPOS', 
                        label: 'Vital Signs Position of Subject', 
                        type: 'Text', 
                        cdashVariable: 'VSPOS', 
                        required: false, 
                        dataDictionary: 'DD_POSITION', 
                        description: 'Position of subject during measurement', 
                        length: 20,
                        rangeCheck: 'VSPOS in DD_POSITION codes',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Vital Signs Position of Subject',
                        sasFormat: '$20.',
                        sasLength: 20
                      },
                      { 
                        name: 'VSLOC', 
                        oid: 'VS.VSLOC', 
                        label: 'Location of Vital Signs Measurement', 
                        type: 'Text', 
                        cdashVariable: 'VSLOC', 
                        required: false, 
                        description: 'Anatomical location of measurement', 
                        length: 20,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Location of Vital Signs Measurement',
                        sasFormat: '$20.',
                        sasLength: 20
                      },
                      { 
                        name: 'VSDTC', 
                        oid: 'VS.VSDTC', 
                        label: 'Date/Time of Collection', 
                        type: 'DateTime', 
                        cdashVariable: 'VSDTC', 
                        required: true, 
                        description: 'Date/time of vital signs collection', 
                        format: 'ISO8601',
                        rangeCheck: 'Valid ISO8601 datetime',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Date/Time of Collection',
                        sasFormat: 'DATETIME20.',
                        sasLength: 20
                      }
                    ]
                  },
                  {
                    name: 'Laboratory Test Results',
                    oid: 'LB',
                    description: 'Laboratory test results including chemistry, hematology, and urinalysis',
                    category: 'Findings',
                    fields: [
                      { 
                        name: 'LBTEST', 
                        oid: 'LB.LBTEST', 
                        label: 'Lab Test or Examination Name', 
                        type: 'Text', 
                        cdashVariable: 'LBTEST', 
                        required: true, 
                        description: 'Name of the laboratory test', 
                        length: 40,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Lab Test or Examination Name',
                        sasFormat: '$40.',
                        sasLength: 40
                      },
                      { 
                        name: 'LBTESTCD', 
                        oid: 'LB.LBTESTCD', 
                        label: 'Lab Test or Examination Short Name', 
                        type: 'Text', 
                        cdashVariable: 'LBTESTCD', 
                        required: true, 
                        description: 'Short name of laboratory test', 
                        length: 8,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Lab Test or Examination Short Name',
                        sasFormat: '$8.',
                        sasLength: 8
                      },
                      { 
                        name: 'LBORRES', 
                        oid: 'LB.LBORRES', 
                        label: 'Result or Finding in Original Units', 
                        type: 'Text', 
                        cdashVariable: 'LBORRES', 
                        required: true, 
                        description: 'Result in original units', 
                        length: 200,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Result or Finding in Original Units',
                        sasFormat: '$200.',
                        sasLength: 200
                      },
                      { 
                        name: 'LBORRESU', 
                        oid: 'LB.LBORRESU', 
                        label: 'Original Units', 
                        type: 'Text', 
                        cdashVariable: 'LBORRESU', 
                        required: true, 
                        description: 'Original units of measurement', 
                        length: 40,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Original Units',
                        sasFormat: '$40.',
                        sasLength: 40
                      },
                      { 
                        name: 'LBORNRLO', 
                        oid: 'LB.LBORNRLO', 
                        label: 'Reference Range Lower Limit in Orig Unit', 
                        type: 'Text', 
                        cdashVariable: 'LBORNRLO', 
                        required: false, 
                        description: 'Lower limit of reference range', 
                        length: 200,
                        rangeCheck: 'Numeric or empty',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Reference Range Lower Limit in Orig Unit',
                        sasFormat: '$200.',
                        sasLength: 200
                      },
                      { 
                        name: 'LBORNRHI', 
                        oid: 'LB.LBORNRHI', 
                        label: 'Reference Range Upper Limit in Orig Unit', 
                        type: 'Text', 
                        cdashVariable: 'LBORNRHI', 
                        required: false, 
                        description: 'Upper limit of reference range', 
                        length: 200,
                        rangeCheck: 'Numeric or empty',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Reference Range Upper Limit in Orig Unit',
                        sasFormat: '$200.',
                        sasLength: 200
                      },
                      { 
                        name: 'LBDTC', 
                        oid: 'LB.LBDTC', 
                        label: 'Date/Time of Specimen Collection', 
                        type: 'DateTime', 
                        cdashVariable: 'LBDTC', 
                        required: true, 
                        description: 'Date/time of specimen collection', 
                        format: 'ISO8601',
                        rangeCheck: 'Valid ISO8601 datetime',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Date/Time of Specimen Collection',
                        sasFormat: 'DATETIME20.',
                        sasLength: 20
                      },
                      { 
                        name: 'LBFAST', 
                        oid: 'LB.LBFAST', 
                        label: 'Fasting Status', 
                        type: 'Text', 
                        cdashVariable: 'LBFAST', 
                        required: false, 
                        dataDictionary: 'DD_YESNO', 
                        description: 'Fasting status of subject', 
                        length: 1,
                        rangeCheck: 'LBFAST in ("Y", "N")',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Fasting Status',
                        sasFormat: '$1.',
                        sasLength: 1
                      }
                    ]
                  },
                  {
                    name: 'Adverse Events',
                    oid: 'AE',
                    description: 'Adverse events and serious adverse events occurring during the study',
                    category: 'Events',
                    fields: [
                      { 
                        name: 'AETERM', 
                        oid: 'AE.AETERM', 
                        label: 'Reported Term for the Adverse Event', 
                        type: 'Text', 
                        cdashVariable: 'AETERM', 
                        required: true, 
                        description: 'Adverse event term as reported', 
                        length: 200,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Reported Term for the Adverse Event',
                        sasFormat: '$200.',
                        sasLength: 200
                      },
                      { 
                        name: 'AESTDTC', 
                        oid: 'AE.AESTDTC', 
                        label: 'Start Date/Time of Adverse Event', 
                        type: 'DateTime', 
                        cdashVariable: 'AESTDTC', 
                        required: true, 
                        description: 'Start date/time of adverse event', 
                        format: 'ISO8601',
                        rangeCheck: 'Valid ISO8601 datetime',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Start Date/Time of Adverse Event',
                        sasFormat: 'DATETIME20.',
                        sasLength: 20
                      },
                      { 
                        name: 'AEENDTC', 
                        oid: 'AE.AEENDTC', 
                        label: 'End Date/Time of Adverse Event', 
                        type: 'DateTime', 
                        cdashVariable: 'AEENDTC', 
                        required: false, 
                        description: 'End date/time of adverse event', 
                        format: 'ISO8601',
                        rangeCheck: 'Valid ISO8601 datetime or empty',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'End Date/Time of Adverse Event',
                        sasFormat: 'DATETIME20.',
                        sasLength: 20
                      },
                      { 
                        name: 'AEONGO', 
                        oid: 'AE.AEONGO', 
                        label: 'Ongoing Adverse Event', 
                        type: 'Text', 
                        cdashVariable: 'AEONGO', 
                        required: false, 
                        dataDictionary: 'DD_YESNO', 
                        description: 'Is the adverse event ongoing?', 
                        length: 1,
                        rangeCheck: 'AEONGO in ("Y", "N")',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Ongoing Adverse Event',
                        sasFormat: '$1.',
                        sasLength: 1
                      },
                      { 
                        name: 'AESEV', 
                        oid: 'AE.AESEV', 
                        label: 'Severity/Intensity', 
                        type: 'Text', 
                        cdashVariable: 'AESEV', 
                        required: true, 
                        dataDictionary: 'DD_SEVERITY', 
                        description: 'Severity of adverse event', 
                        length: 20,
                        rangeCheck: 'AESEV in DD_SEVERITY codes',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Severity/Intensity',
                        sasFormat: '$20.',
                        sasLength: 20
                      },
                      { 
                        name: 'AESER', 
                        oid: 'AE.AESER', 
                        label: 'Serious Event', 
                        type: 'Text', 
                        cdashVariable: 'AESER', 
                        required: true, 
                        dataDictionary: 'DD_YESNO', 
                        description: 'Is this a serious adverse event?', 
                        length: 1,
                        rangeCheck: 'AESER in ("Y", "N")',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Serious Event',
                        sasFormat: '$1.',
                        sasLength: 1
                      },
                      { 
                        name: 'AEREL', 
                        oid: 'AE.AEREL', 
                        label: 'Causality', 
                        type: 'Text', 
                        cdashVariable: 'AEREL', 
                        required: true, 
                        dataDictionary: 'DD_CAUSALITY', 
                        description: 'Relationship to study treatment', 
                        length: 20,
                        rangeCheck: 'AEREL in DD_CAUSALITY codes',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Causality',
                        sasFormat: '$20.',
                        sasLength: 20
                      },
                      { 
                        name: 'AEACN', 
                        oid: 'AE.AEACN', 
                        label: 'Action Taken with Study Treatment', 
                        type: 'Text', 
                        cdashVariable: 'AEACN', 
                        required: false, 
                        description: 'Action taken with study treatment', 
                        length: 50,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Action Taken with Study Treatment',
                        sasFormat: '$50.',
                        sasLength: 50
                      },
                      { 
                        name: 'AEOUT', 
                        oid: 'AE.AEOUT', 
                        label: 'Outcome of Adverse Event', 
                        type: 'Text', 
                        cdashVariable: 'AEOUT', 
                        required: false, 
                        dataDictionary: 'DD_OUTCOME', 
                        description: 'Outcome of adverse event', 
                        length: 50,
                        rangeCheck: 'AEOUT in DD_OUTCOME codes',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Outcome of Adverse Event',
                        sasFormat: '$50.',
                        sasLength: 50
                      }
                    ]
                  },
                  {
                    name: 'Concomitant Medications',
                    oid: 'CM',
                    description: 'Concomitant and prior medications taken by the subject',
                    category: 'Interventions',
                    fields: [
                      { 
                        name: 'CMTRT', 
                        oid: 'CM.CMTRT', 
                        label: 'Reported Name of Drug, Med, or Therapy', 
                        type: 'Text', 
                        cdashVariable: 'CMTRT', 
                        required: true, 
                        description: 'Name of concomitant medication', 
                        length: 200,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Reported Name of Drug, Med, or Therapy',
                        sasFormat: '$200.',
                        sasLength: 200
                      },
                      { 
                        name: 'CMCAT', 
                        oid: 'CM.CMCAT', 
                        label: 'Category for Medication', 
                        type: 'Text', 
                        cdashVariable: 'CMCAT', 
                        required: false, 
                        description: 'Category for medication', 
                        length: 50,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Category for Medication',
                        sasFormat: '$50.',
                        sasLength: 50
                      },
                      { 
                        name: 'CMINDC', 
                        oid: 'CM.CMINDC', 
                        label: 'Indication', 
                        type: 'Text', 
                        cdashVariable: 'CMINDC', 
                        required: false, 
                        description: 'Indication for medication', 
                        length: 200,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Indication',
                        sasFormat: '$200.',
                        sasLength: 200
                      },
                      { 
                        name: 'CMDOSE', 
                        oid: 'CM.CMDOSE', 
                        label: 'Dose per Administration', 
                        type: 'Text', 
                        cdashVariable: 'CMDOSE', 
                        required: false, 
                        description: 'Dose per administration', 
                        length: 200,
                        rangeCheck: 'Numeric or empty',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Dose per Administration',
                        sasFormat: '$200.',
                        sasLength: 200
                      },
                      { 
                        name: 'CMDOSU', 
                        oid: 'CM.CMDOSU', 
                        label: 'Dose Units', 
                        type: 'Text', 
                        cdashVariable: 'CMDOSU', 
                        required: false, 
                        description: 'Units for dose', 
                        length: 40,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Dose Units',
                        sasFormat: '$40.',
                        sasLength: 40
                      },
                      { 
                        name: 'CMDOSFRM', 
                        oid: 'CM.CMDOSFRM', 
                        label: 'Dose Form', 
                        type: 'Text', 
                        cdashVariable: 'CMDOSFRM', 
                        required: false, 
                        description: 'Pharmaceutical dose form', 
                        length: 50,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Dose Form',
                        sasFormat: '$50.',
                        sasLength: 50
                      },
                      { 
                        name: 'CMROUTE', 
                        oid: 'CM.CMROUTE', 
                        label: 'Route of Administration', 
                        type: 'Text', 
                        cdashVariable: 'CMROUTE', 
                        required: false, 
                        description: 'Route of administration', 
                        length: 50,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Route of Administration',
                        sasFormat: '$50.',
                        sasLength: 50
                      },
                      { 
                        name: 'CMSTDTC', 
                        oid: 'CM.CMSTDTC', 
                        label: 'Start Date/Time of Medication', 
                        type: 'DateTime', 
                        cdashVariable: 'CMSTDTC', 
                        required: false, 
                        description: 'Start date/time of medication', 
                        format: 'ISO8601',
                        rangeCheck: 'Valid ISO8601 datetime or partial',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Start Date/Time of Medication',
                        sasFormat: 'DATETIME20.',
                        sasLength: 20
                      },
                      { 
                        name: 'CMENDTC', 
                        oid: 'CM.CMENDTC', 
                        label: 'End Date/Time of Medication', 
                        type: 'DateTime', 
                        cdashVariable: 'CMENDTC', 
                        required: false, 
                        description: 'End date/time of medication', 
                        format: 'ISO8601',
                        rangeCheck: 'Valid ISO8601 datetime or partial',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'End Date/Time of Medication',
                        sasFormat: 'DATETIME20.',
                        sasLength: 20
                      }
                    ]
                  },
                  {
                    name: 'Physical Examination',
                    oid: 'PE',
                    description: 'Physical examination findings and assessments',
                    category: 'Findings',
                    fields: [
                      { 
                        name: 'PETEST', 
                        oid: 'PE.PETEST', 
                        label: 'Physical Examination Test Name', 
                        type: 'Text', 
                        cdashVariable: 'PETEST', 
                        required: true, 
                        description: 'Name of physical examination test', 
                        length: 40,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Physical Examination Test Name',
                        sasFormat: '$40.',
                        sasLength: 40
                      },
                      { 
                        name: 'PETESTCD', 
                        oid: 'PE.PETESTCD', 
                        label: 'Physical Examination Test Short Name', 
                        type: 'Text', 
                        cdashVariable: 'PETESTCD', 
                        required: true, 
                        description: 'Short name of physical examination test', 
                        length: 8,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Physical Examination Test Short Name',
                        sasFormat: '$8.',
                        sasLength: 8
                      },
                      { 
                        name: 'PEORRES', 
                        oid: 'PE.PEORRES', 
                        label: 'Result or Finding in Original Units', 
                        type: 'Text', 
                        cdashVariable: 'PEORRES', 
                        required: true, 
                        description: 'Physical examination result', 
                        length: 200,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Result or Finding in Original Units',
                        sasFormat: '$200.',
                        sasLength: 200
                      },
                      { 
                        name: 'PECAT', 
                        oid: 'PE.PECAT', 
                        label: 'Category for Physical Exam', 
                        type: 'Text', 
                        cdashVariable: 'PECAT', 
                        required: false, 
                        description: 'Category for physical examination', 
                        length: 50,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Category for Physical Exam',
                        sasFormat: '$50.',
                        sasLength: 50
                      },
                      { 
                        name: 'PESCAT', 
                        oid: 'PE.PESCAT', 
                        label: 'Subcategory for Physical Exam', 
                        type: 'Text', 
                        cdashVariable: 'PESCAT', 
                        required: false, 
                        description: 'Subcategory for physical examination', 
                        length: 50,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Subcategory for Physical Exam',
                        sasFormat: '$50.',
                        sasLength: 50
                      },
                      { 
                        name: 'PELOC', 
                        oid: 'PE.PELOC', 
                        label: 'Location of the Finding', 
                        type: 'Text', 
                        cdashVariable: 'PELOC', 
                        required: false, 
                        description: 'Anatomical location of finding', 
                        length: 20,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Location of the Finding',
                        sasFormat: '$20.',
                        sasLength: 20
                      },
                      { 
                        name: 'PEDTC', 
                        oid: 'PE.PEDTC', 
                        label: 'Date/Time of Collection', 
                        type: 'DateTime', 
                        cdashVariable: 'PEDTC', 
                        required: true, 
                        description: 'Date/time of physical examination', 
                        format: 'ISO8601',
                        rangeCheck: 'Valid ISO8601 datetime',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Date/Time of Collection',
                        sasFormat: 'DATETIME20.',
                        sasLength: 20
                      }
                    ]
                  },
                  {
                    name: 'Electrocardiogram',
                    oid: 'EG',
                    description: 'Electrocardiogram test results and interpretations',
                    category: 'Findings',
                    fields: [
                      { 
                        name: 'EGTEST', 
                        oid: 'EG.EGTEST', 
                        label: 'ECG Test Name', 
                        type: 'Text', 
                        cdashVariable: 'EGTEST', 
                        required: true, 
                        description: 'Name of ECG test', 
                        length: 40,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'ECG Test Name',
                        sasFormat: '$40.',
                        sasLength: 40
                      },
                      { 
                        name: 'EGTESTCD', 
                        oid: 'EG.EGTESTCD', 
                        label: 'ECG Test Short Name', 
                        type: 'Text', 
                        cdashVariable: 'EGTESTCD', 
                        required: true, 
                        description: 'Short name of ECG test', 
                        length: 8,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'ECG Test Short Name',
                        sasFormat: '$8.',
                        sasLength: 8
                      },
                      { 
                        name: 'EGORRES', 
                        oid: 'EG.EGORRES', 
                        label: 'Result or Finding in Original Units', 
                        type: 'Text', 
                        cdashVariable: 'EGORRES', 
                        required: true, 
                        description: 'ECG result in original units', 
                        length: 200,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Result or Finding in Original Units',
                        sasFormat: '$200.',
                        sasLength: 200
                      },
                      { 
                        name: 'EGORRESU', 
                        oid: 'EG.EGORRESU', 
                        label: 'Original Units', 
                        type: 'Text', 
                        cdashVariable: 'EGORRESU', 
                        required: false, 
                        description: 'Original units of ECG measurement', 
                        length: 40,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Original Units',
                        sasFormat: '$40.',
                        sasLength: 40
                      },
                      { 
                        name: 'EGPOS', 
                        oid: 'EG.EGPOS', 
                        label: 'ECG Position of Subject', 
                        type: 'Text', 
                        cdashVariable: 'EGPOS', 
                        required: false, 
                        dataDictionary: 'DD_POSITION', 
                        description: 'Position of subject during ECG', 
                        length: 20,
                        rangeCheck: 'EGPOS in DD_POSITION codes',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'ECG Position of Subject',
                        sasFormat: '$20.',
                        sasLength: 20
                      },
                      { 
                        name: 'EGMETHOD', 
                        oid: 'EG.EGMETHOD', 
                        label: 'Method of ECG Test', 
                        type: 'Text', 
                        cdashVariable: 'EGMETHOD', 
                        required: false, 
                        description: 'Method used for ECG test', 
                        length: 50,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Method of ECG Test',
                        sasFormat: '$50.',
                        sasLength: 50
                      },
                      { 
                        name: 'EGDTC', 
                        oid: 'EG.EGDTC', 
                        label: 'Date/Time of ECG', 
                        type: 'DateTime', 
                        cdashVariable: 'EGDTC', 
                        required: true, 
                        description: 'Date/time of ECG', 
                        format: 'ISO8601',
                        rangeCheck: 'Valid ISO8601 datetime',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Date/Time of ECG',
                        sasFormat: 'DATETIME20.',
                        sasLength: 20
                      }
                    ]
                  },
                  {
                    name: 'Questionnaires',
                    oid: 'QS',
                    description: 'Questionnaire data including patient-reported outcomes and quality of life assessments',
                    category: 'Findings',
                    fields: [
                      { 
                        name: 'QSTEST', 
                        oid: 'QS.QSTEST', 
                        label: 'Questionnaire Test Name', 
                        type: 'Text', 
                        cdashVariable: 'QSTEST', 
                        required: true, 
                        description: 'Name of questionnaire test', 
                        length: 40,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Questionnaire Test Name',
                        sasFormat: '$40.',
                        sasLength: 40
                      },
                      { 
                        name: 'QSTESTCD', 
                        oid: 'QS.QSTESTCD', 
                        label: 'Questionnaire Test Short Name', 
                        type: 'Text', 
                        cdashVariable: 'QSTESTCD', 
                        required: true, 
                        description: 'Short name of questionnaire test', 
                        length: 8,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Questionnaire Test Short Name',
                        sasFormat: '$8.',
                        sasLength: 8
                      },
                      { 
                        name: 'QSORRES', 
                        oid: 'QS.QSORRES', 
                        label: 'Result or Finding in Original Units', 
                        type: 'Text', 
                        cdashVariable: 'QSORRES', 
                        required: true, 
                        description: 'Questionnaire response', 
                        length: 200,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Result or Finding in Original Units',
                        sasFormat: '$200.',
                        sasLength: 200
                      },
                      { 
                        name: 'QSCAT', 
                        oid: 'QS.QSCAT', 
                        label: 'Category for Questionnaire', 
                        type: 'Text', 
                        cdashVariable: 'QSCAT', 
                        required: false, 
                        description: 'Category for questionnaire', 
                        length: 50,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Category for Questionnaire',
                        sasFormat: '$50.',
                        sasLength: 50
                      },
                      { 
                        name: 'QSSCAT', 
                        oid: 'QS.QSSCAT', 
                        label: 'Subcategory for Questionnaire', 
                        type: 'Text', 
                        cdashVariable: 'QSSCAT', 
                        required: false, 
                        description: 'Subcategory for questionnaire', 
                        length: 50,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Subcategory for Questionnaire',
                        sasFormat: '$50.',
                        sasLength: 50
                      },
                      { 
                        name: 'QSDTC', 
                        oid: 'QS.QSDTC', 
                        label: 'Date/Time of Collection', 
                        type: 'DateTime', 
                        cdashVariable: 'QSDTC', 
                        required: true, 
                        description: 'Date/time of questionnaire completion', 
                        format: 'ISO8601',
                        rangeCheck: 'Valid ISO8601 datetime',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Date/Time of Collection',
                        sasFormat: 'DATETIME20.',
                        sasLength: 20
                      }
                    ]
                  },
                  {
                    name: 'Substance Use',
                    oid: 'SU',
                    description: 'Substance use history including alcohol, tobacco, and drug use',
                    category: 'Events',
                    fields: [
                      { 
                        name: 'SUTRT', 
                        oid: 'SU.SUTRT', 
                        label: 'Reported Name of Substance', 
                        type: 'Text', 
                        cdashVariable: 'SUTRT', 
                        required: true, 
                        description: 'Name of substance used', 
                        length: 200,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Reported Name of Substance',
                        sasFormat: '$200.',
                        sasLength: 200
                      },
                      { 
                        name: 'SUCAT', 
                        oid: 'SU.SUCAT', 
                        label: 'Category for Substance Use', 
                        type: 'Text', 
                        cdashVariable: 'SUCAT', 
                        required: true, 
                        description: 'Category of substance use', 
                        length: 50,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Category for Substance Use',
                        sasFormat: '$50.',
                        sasLength: 50
                      },
                      { 
                        name: 'SUSCAT', 
                        oid: 'SU.SUSCAT', 
                        label: 'Subcategory for Substance Use', 
                        type: 'Text', 
                        cdashVariable: 'SUSCAT', 
                        required: false, 
                        description: 'Subcategory of substance use', 
                        length: 50,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Subcategory for Substance Use',
                        sasFormat: '$50.',
                        sasLength: 50
                      },
                      { 
                        name: 'SUDOSE', 
                        oid: 'SU.SUDOSE', 
                        label: 'Daily Consumption', 
                        type: 'Text', 
                        cdashVariable: 'SUDOSE', 
                        required: false, 
                        description: 'Daily consumption amount', 
                        length: 200,
                        rangeCheck: 'Numeric or empty',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Daily Consumption',
                        sasFormat: '$200.',
                        sasLength: 200
                      },
                      { 
                        name: 'SUDOSU', 
                        oid: 'SU.SUDOSU', 
                        label: 'Daily Consumption Units', 
                        type: 'Text', 
                        cdashVariable: 'SUDOSU', 
                        required: false, 
                        description: 'Units for daily consumption', 
                        length: 40,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Daily Consumption Units',
                        sasFormat: '$40.',
                        sasLength: 40
                      },
                      { 
                        name: 'SUSTDTC', 
                        oid: 'SU.SUSTDTC', 
                        label: 'Start Date/Time of Substance Use', 
                        type: 'DateTime', 
                        cdashVariable: 'SUSTDTC', 
                        required: false, 
                        description: 'Start date/time of substance use', 
                        format: 'ISO8601',
                        rangeCheck: 'Valid ISO8601 datetime or partial',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Start Date/Time of Substance Use',
                        sasFormat: 'DATETIME20.',
                        sasLength: 20
                      },
                      { 
                        name: 'SUENDTC', 
                        oid: 'SU.SUENDTC', 
                        label: 'End Date/Time of Substance Use', 
                        type: 'DateTime', 
                        cdashVariable: 'SUENDTC', 
                        required: false, 
                        description: 'End date/time of substance use', 
                        format: 'ISO8601',
                        rangeCheck: 'Valid ISO8601 datetime or partial',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'End Date/Time of Substance Use',
                        sasFormat: 'DATETIME20.',
                        sasLength: 20
                      }
                    ]
                  },
                  {
                    name: 'Disposition',
                    oid: 'DS',
                    description: 'Subject disposition and study completion status',
                    category: 'Events',
                    fields: [
                      { 
                        name: 'DSTERM', 
                        oid: 'DS.DSTERM', 
                        label: 'Reported Term for the Disposition Event', 
                        type: 'Text', 
                        cdashVariable: 'DSTERM', 
                        required: true, 
                        description: 'Disposition event term', 
                        length: 200,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Reported Term for the Disposition Event',
                        sasFormat: '$200.',
                        sasLength: 200
                      },
                      { 
                        name: 'DSCAT', 
                        oid: 'DS.DSCAT', 
                        label: 'Category for Disposition Event', 
                        type: 'Text', 
                        cdashVariable: 'DSCAT', 
                        required: true, 
                        description: 'Category for disposition event', 
                        length: 50,
                        rangeCheck: 'Length >= 1',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Category for Disposition Event',
                        sasFormat: '$50.',
                        sasLength: 50
                      },
                      { 
                        name: 'DSSCAT', 
                        oid: 'DS.DSSCAT', 
                        label: 'Subcategory for Disposition Event', 
                        type: 'Text', 
                        cdashVariable: 'DSSCAT', 
                        required: false, 
                        description: 'Subcategory for disposition event', 
                        length: 50,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Subcategory for Disposition Event',
                        sasFormat: '$50.',
                        sasLength: 50
                      },
                      { 
                        name: 'DSDECOD', 
                        oid: 'DS.DSDECOD', 
                        label: 'Standardized Disposition Term', 
                        type: 'Text', 
                        cdashVariable: 'DSDECOD', 
                        required: false, 
                        description: 'Standardized disposition term', 
                        length: 200,
                        rangeCheck: '',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Standardized Disposition Term',
                        sasFormat: '$200.',
                        sasLength: 200
                      },
                      { 
                        name: 'DSSTDTC', 
                        oid: 'DS.DSSTDTC', 
                        label: 'Start Date/Time of Disposition Event', 
                        type: 'DateTime', 
                        cdashVariable: 'DSSTDTC', 
                        required: true, 
                        description: 'Date/time of disposition event', 
                        format: 'ISO8601',
                        rangeCheck: 'Valid ISO8601 datetime',
                        defaultValue: '',
                        isVisible: true,
                        sasLabel: 'Start Date/Time of Disposition Event',
                        sasFormat: 'DATETIME20.',
                        sasLength: 20
                      }
                    ]
                  }
                ],
                scheduleOfEvents,
                dataDictionaries,
                metadata: {
                  protocolVersion: '1.0',
                  specVersion: '1.0',
                  generatedAt: new Date(),
                  cdashVersion: '1.1',
                  cdiscVersion: '2.1'
                }
              };
              onComplete(generatedSpec);
            }, 1000);
          }
        }, step.duration);
      }
    };

    runGeneration();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Generating Enhanced Specification
        </h2>
        <p className="text-lg text-slate-600">
          Creating CDASH/CDISC compliant specification documents with enhanced field attributes, range checks, and SAS details
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Enhanced Specification Generation</h3>
              <p className="text-sm text-slate-600">Based on {analysis.forms.length} identified forms with OIDs and enhanced attributes</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{Math.round(progress)}%</div>
            <div className="text-sm text-slate-500">Complete</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            {completed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Settings className="w-5 h-5 text-green-500 animate-spin" />
            )}
            <span className="text-sm font-medium text-slate-700">{currentTask}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Enhanced Generation Progress</h4>
            {generationSteps.map((step, index) => (
              <div key={index} className="flex items-center space-x-3">
                {progress > (index + 1) * (100 / generationSteps.length) ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : progress > index * (100 / generationSteps.length) ? (
                  <Settings className="w-4 h-4 text-green-500 animate-spin" />
                ) : (
                  <div className="w-4 h-4 border-2 border-slate-300 rounded-full" />
                )}
                <span className={`text-sm ${
                  progress > (index + 1) * (100 / generationSteps.length)
                    ? 'text-green-600'
                    : progress > index * (100 / generationSteps.length)
                    ? 'text-green-600'
                    : 'text-slate-500'
                }`}>
                  {step.task}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-3">Enhanced Features</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Forms with OIDs</span>
                <span className="text-sm font-medium text-slate-900">{analysis.forms.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Fields with OIDs</span>
                <span className="text-sm font-medium text-slate-900">{analysis.fields}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Range Checks</span>
                <span className="text-sm font-medium text-slate-900">{analysis.fields}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">SAS Attributes</span>
                <span className="text-sm font-medium text-slate-900">{analysis.fields}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Data Dictionaries</span>
                <span className="text-sm font-medium text-slate-900">10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">CDASH Compliance</span>
                <span className="text-sm font-medium text-green-600">{analysis.cdashCompliance}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};