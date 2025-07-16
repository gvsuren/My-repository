import React, { useState, useRef, useEffect } from 'react';
import { Eye, Download, Trash2, ZoomIn, ZoomOut, RotateCcw, Maximize2, X, ArrowLeftRight, BarChart3, Info } from 'lucide-react';

interface ProcessedImage {
  id: string;
  original: File;
  result?: {
    compressedFile: File;
    compressionRatio: number;
    originalFormat: string;
    outputFormat: string;
    originalDimensions: { width: number; height: number };
    compressedDimensions: { width: number; height: number };
  };
  preview?: string;
  isProcessing?: boolean;
  isCompressed?: boolean;
}

interface ImagePreviewProps {
  image: ProcessedImage;
  onDownload: () => void;
  onRemove: () => void;
}

interface QualityMetrics {
  sharpness: number;
  contrast: number;
  brightness: number;
  colorfulness: number;
  overallQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, onDownload, onRemove }) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay' | 'single'>('side-by-side');
  const [showModal, setShowModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showStats, setShowStats] = useState(false);
  const [originalPreview, setOriginalPreview] = useState<string>('');
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create preview for original image
    if (image.original) {
      const url = URL.createObjectURL(image.original);
      setOriginalPreview(url);
      
      return () => URL.revokeObjectURL(url);
    }
  }, [image.original]);

  useEffect(() => {
    // Analyze image quality when compressed
    if (image.isCompressed && image.result && image.preview) {
      analyzeImageQuality();
    }
  }, [image.isCompressed, image.result, image.preview]);

  const analyzeImageQuality = async () => {
    if (!image.result || !image.preview) return;
    
    setIsAnalyzing(true);
    
    try {
      const metrics = await calculateQualityMetrics(image.preview);
      setQualityMetrics(metrics);
    } catch (error) {
      console.error('Quality analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateQualityMetrics = (imageUrl: string): Promise<QualityMetrics> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Calculate basic quality metrics
        const sharpness = calculateSharpness(data, canvas.width, canvas.height);
        const contrast = calculateContrast(data);
        const brightness = calculateBrightness(data);
        const colorfulness = calculateColorfulness(data);
        
        // Determine overall quality
        const avgScore = (sharpness + contrast + brightness + colorfulness) / 4;
        let overallQuality: QualityMetrics['overallQuality'];
        
        if (avgScore >= 80) overallQuality = 'Excellent';
        else if (avgScore >= 65) overallQuality = 'Good';
        else if (avgScore >= 50) overallQuality = 'Fair';
        else overallQuality = 'Poor';
        
        resolve({
          sharpness,
          contrast,
          brightness,
          colorfulness,
          overallQuality
        });
      };
      img.src = imageUrl;
    });
  };

  const calculateSharpness = (data: Uint8ClampedArray, width: number, height: number): number => {
    let sharpness = 0;
    let count = 0;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        
        const grayRight = data[i + 4] * 0.299 + data[i + 5] * 0.587 + data[i + 6] * 0.114;
        const grayDown = data[i + width * 4] * 0.299 + data[i + width * 4 + 1] * 0.587 + data[i + width * 4 + 2] * 0.114;
        
        const gradientX = Math.abs(gray - grayRight);
        const gradientY = Math.abs(gray - grayDown);
        const gradient = Math.sqrt(gradientX * gradientX + gradientY * gradientY);
        
        sharpness += gradient;
        count++;
      }
    }
    
    return Math.min(100, (sharpness / count) * 2);
  };

  const calculateContrast = (data: Uint8ClampedArray): number => {
    let min = 255, max = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      min = Math.min(min, gray);
      max = Math.max(max, gray);
    }
    
    return Math.min(100, ((max - min) / 255) * 100);
  };

  const calculateBrightness = (data: Uint8ClampedArray): number => {
    let total = 0;
    const pixels = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      total += gray;
    }
    
    const avgBrightness = total / pixels;
    // Optimal brightness is around 128, so calculate how close we are
    return Math.max(0, 100 - Math.abs(avgBrightness - 128) * 0.78);
  };

  const calculateColorfulness = (data: Uint8ClampedArray): number => {
    let rVariance = 0, gVariance = 0, bVariance = 0;
    let rMean = 0, gMean = 0, bMean = 0;
    const pixels = data.length / 4;
    
    // Calculate means
    for (let i = 0; i < data.length; i += 4) {
      rMean += data[i];
      gMean += data[i + 1];
      bMean += data[i + 2];
    }
    rMean /= pixels;
    gMean /= pixels;
    bMean /= pixels;
    
    // Calculate variances
    for (let i = 0; i < data.length; i += 4) {
      rVariance += Math.pow(data[i] - rMean, 2);
      gVariance += Math.pow(data[i + 1] - gMean, 2);
      bVariance += Math.pow(data[i + 2] - bMean, 2);
    }
    
    const colorfulness = Math.sqrt((rVariance + gVariance + bVariance) / (3 * pixels));
    return Math.min(100, colorfulness * 0.5);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getQualityColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOverallQualityColor = (quality: string): string => {
    switch (quality) {
      case 'Excellent': return 'text-green-600 bg-green-50';
      case 'Good': return 'text-blue-600 bg-blue-50';
      case 'Fair': return 'text-yellow-600 bg-yellow-50';
      case 'Poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderComparisonView = () => {
    if (!image.isCompressed || !image.result) {
      return (
        <div className="aspect-video bg-gray-100 relative">
          {image.isProcessing ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : originalPreview ? (
            <img
              src={originalPreview}
              alt="Original"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Eye className="w-12 h-12" />
            </div>
          )}
        </div>
      );
    }

    if (viewMode === 'side-by-side') {
      return (
        <div className="aspect-video bg-gray-100 relative flex">
          <div className="w-1/2 relative border-r border-gray-300">
            <img
              src={originalPreview}
              alt="Original"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
              Original
            </div>
          </div>
          <div className="w-1/2 relative">
            <img
              src={image.preview}
              alt="Compressed"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
              Compressed
            </div>
          </div>
        </div>
      );
    }

    if (viewMode === 'overlay') {
      return (
        <div className="aspect-video bg-gray-100 relative">
          <img
            src={originalPreview}
            alt="Original"
            className="w-full h-full object-cover"
          />
          <div 
            className="absolute top-0 left-0 w-1/2 h-full overflow-hidden"
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          >
            <img
              src={image.preview}
              alt="Compressed"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <ArrowLeftRight className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
            Original (Right) | Compressed (Left)
          </div>
        </div>
      );
    }

    return (
      <div className="aspect-video bg-gray-100 relative">
        <img
          src={image.preview}
          alt="Compressed"
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
        <div ref={modalRef} className="bg-white rounded-lg max-w-6xl max-h-full overflow-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Image Preview - {image.original.name}</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(Math.min(4, zoom + 0.25))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
              {renderComparisonView()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {renderComparisonView()}
        
        {/* Status Badge */}
        {image.isProcessing && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
            Processing...
          </div>
        )}
        {!image.isCompressed && !image.isProcessing && (
          <div className="absolute top-2 right-2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium">
            Ready to compress
          </div>
        )}
        {image.isCompressed && !image.isProcessing && (
          <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
            Compressed
          </div>
        )}

        {/* View Mode Controls */}
        {image.isCompressed && image.result && (
          <div className="absolute top-2 left-2 flex space-x-1">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'side-by-side' 
                  ? 'bg-white text-gray-800' 
                  : 'bg-black bg-opacity-50 text-white hover:bg-opacity-75'
              }`}
            >
              Side by Side
            </button>
            <button
              onClick={() => setViewMode('overlay')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'overlay' 
                  ? 'bg-white text-gray-800' 
                  : 'bg-black bg-opacity-50 text-white hover:bg-opacity-75'
              }`}
            >
              Overlay
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'single' 
                  ? 'bg-white text-gray-800' 
                  : 'bg-black bg-opacity-50 text-white hover:bg-opacity-75'
              }`}
            >
              Single
            </button>
          </div>
        )}

        <div className="p-4">
          <h3 className="font-medium text-gray-800 truncate mb-3">
            {image.original.name}
          </h3>

          {/* File Size Statistics */}
          {image.isCompressed && image.result && !image.isProcessing && (
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-gray-600 text-xs uppercase tracking-wide mb-1">Original</div>
                  <div className="font-semibold text-gray-800">{formatFileSize(image.original.size)}</div>
                  <div className="text-xs text-gray-500">
                    {image.result.originalDimensions.width}×{image.result.originalDimensions.height}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-green-600 text-xs uppercase tracking-wide mb-1">Compressed</div>
                  <div className="font-semibold text-green-800">{formatFileSize(image.result.compressedFile.size)}</div>
                  <div className="text-xs text-green-600">
                    {image.result.compressedDimensions.width}×{image.result.compressedDimensions.height}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-600 text-xs uppercase tracking-wide">Savings</span>
                  <span className="text-blue-800 font-bold text-lg">
                    {image.result.compressionRatio.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, image.result.compressionRatio)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Saved {formatFileSize(image.original.size - image.result.compressedFile.size)}
                </div>
              </div>

              {/* Quality Assessment */}
              {qualityMetrics && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-xs uppercase tracking-wide">Visual Quality</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getOverallQualityColor(qualityMetrics.overallQuality)}`}>
                      {qualityMetrics.overallQuality}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Sharpness:</span>
                      <span className={`font-medium ${getQualityColor(qualityMetrics.sharpness)}`}>
                        {qualityMetrics.sharpness.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contrast:</span>
                      <span className={`font-medium ${getQualityColor(qualityMetrics.contrast)}`}>
                        {qualityMetrics.contrast.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Brightness:</span>
                      <span className={`font-medium ${getQualityColor(qualityMetrics.brightness)}`}>
                        {qualityMetrics.brightness.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Color:</span>
                      <span className={`font-medium ${getQualityColor(qualityMetrics.colorfulness)}`}>
                        {qualityMetrics.colorfulness.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-center text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Analyzing image quality...
                  </div>
                </div>
              )}
            </div>
          )}

          {!image.isCompressed && !image.isProcessing && (
            <div className="text-sm text-gray-600 mb-4">
              <div className="flex justify-between mb-2">
                <span>Size:</span>
                <span>{formatFileSize(image.original.size)}</span>
              </div>
              <div className="text-orange-600 font-medium">
                Waiting for compression...
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            >
              <Maximize2 className="w-4 h-4 mr-1" />
              Preview
            </button>
            <button
              onClick={onDownload}
              disabled={image.isProcessing || !image.isCompressed}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </button>
            <button
              onClick={onRemove}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {renderModal()}
    </>
  );
};

export default ImagePreview;