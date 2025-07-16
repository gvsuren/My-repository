import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, Image as ImageIcon, Settings, Zap, FileImage, Trash2, Eye, EyeOff } from 'lucide-react';
import { 
  compressImage, 
  compressBatch, 
  CompressionOptions, 
  CompressionResult, 
  WEB_PRESETS,
  getSupportedFormats,
  getFormatRecommendations,
  CompressionQueue
} from './components/ImageCompressor';

interface ProcessedImage {
  id: string;
  original: File;
  result: CompressionResult;
  preview?: string;
}

const App: React.FC = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionOptions, setCompressionOptions] = useState<CompressionOptions>({
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    format: '',
    progressive: false,
    optimizeForWeb: true
  });
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof WEB_PRESETS>('medium');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ completed: 0, total: 0, currentFile: '' });
  const [previewMode, setPreviewMode] = useState<'grid' | 'list'>('grid');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const compressionQueue = useRef(new CompressionQueue());

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const supportedFormats = getSupportedFormats();
    const validFiles = fileArray.filter(file => 
      supportedFormats.includes(file.type)
    );

    if (validFiles.length === 0) {
      alert('Please select valid image files (JPEG, PNG, WebP, GIF, BMP, TIFF)');
      return;
    }

    setIsProcessing(true);
    setBatchProgress({ completed: 0, total: validFiles.length, currentFile: '' });

    try {
      const results = await compressBatch(
        validFiles,
        compressionOptions,
        (completed, total, currentFile) => {
          setBatchProgress({ completed, total, currentFile: currentFile || '' });
        }
      );

      const processedImages: ProcessedImage[] = results.map((result, index) => ({
        id: `${Date.now()}-${index}`,
        original: validFiles[index],
        result,
        preview: URL.createObjectURL(result.compressedFile)
      }));

      setImages(prev => [...prev, ...processedImages]);
    } catch (error) {
      console.error('Batch compression failed:', error);
      alert('Some images failed to compress. Please try again.');
    } finally {
      setIsProcessing(false);
      setBatchProgress({ completed: 0, total: 0, currentFile: '' });
    }
  }, [compressionOptions]);

  const handlePresetChange = (preset: keyof typeof WEB_PRESETS) => {
    setSelectedPreset(preset);
    if (preset !== 'custom') {
      setCompressionOptions(prev => ({
        ...prev,
        ...WEB_PRESETS[preset]
      }));
    }
  };

  const downloadImage = (image: ProcessedImage) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(image.result.compressedFile);
    link.download = image.result.compressedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    images.forEach(image => downloadImage(image));
  };

  const clearAll = () => {
    images.forEach(image => {
      if (image.preview) {
        URL.revokeObjectURL(image.preview);
      }
    });
    setImages([]);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalOriginalSize = images.reduce((sum, img) => sum + img.original.size, 0);
  const totalCompressedSize = images.reduce((sum, img) => sum + img.result.compressedFile.size, 0);
  const totalSavings = totalOriginalSize > 0 ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ImageIcon className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Image Compressor Pro</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Compress your images with advanced options and batch processing
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Drop images here or click to browse
            </h3>
            <p className="text-gray-500 mb-4">
              Supports JPEG, PNG, WebP, GIF, BMP, and TIFF formats
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Select Images'}
            </button>
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Processing: {batchProgress.currentFile}
                </span>
                <span className="text-sm text-gray-500">
                  {batchProgress.completed} / {batchProgress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(batchProgress.completed / batchProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Compression Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Compression Settings
            </h2>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              {showAdvanced ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </button>
          </div>

          {/* Presets */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {Object.entries(WEB_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handlePresetChange(key as keyof typeof WEB_PRESETS)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPreset === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality: {Math.round(compressionOptions.quality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={compressionOptions.quality}
                  onChange={(e) => setCompressionOptions(prev => ({
                    ...prev,
                    quality: parseFloat(e.target.value)
                  }))}
                  className="slider w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Width (px)
                </label>
                <input
                  type="number"
                  value={compressionOptions.maxWidth}
                  onChange={(e) => setCompressionOptions(prev => ({
                    ...prev,
                    maxWidth: parseInt(e.target.value) || 1920
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Height (px)
                </label>
                <input
                  type="number"
                  value={compressionOptions.maxHeight}
                  onChange={(e) => setCompressionOptions(prev => ({
                    ...prev,
                    maxHeight: parseInt(e.target.value) || 1080
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output Format
                </label>
                <select
                  value={compressionOptions.format}
                  onChange={(e) => setCompressionOptions(prev => ({
                    ...prev,
                    format: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Keep Original</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="progressive"
                  checked={compressionOptions.progressive}
                  onChange={(e) => setCompressionOptions(prev => ({
                    ...prev,
                    progressive: e.target.checked
                  }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="progressive" className="ml-2 text-sm font-medium text-gray-700">
                  Progressive JPEG
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="webOptimized"
                  checked={compressionOptions.optimizeForWeb}
                  onChange={(e) => setCompressionOptions(prev => ({
                    ...prev,
                    optimizeForWeb: e.target.checked
                  }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="webOptimized" className="ml-2 text-sm font-medium text-gray-700">
                  Optimize for Web
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {images.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FileImage className="w-5 h-5 mr-2" />
                Compressed Images ({images.length})
              </h2>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Total Savings:</span> {formatFileSize(totalOriginalSize - totalCompressedSize)} ({totalSavings.toFixed(1)}%)
                </div>
                <button
                  onClick={downloadAll}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </button>
                <button
                  onClick={clearAll}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-100 relative">
                    {image.preview && (
                      <img
                        src={image.preview}
                        alt="Compressed"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 truncate mb-2">
                      {image.original.name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Original:</span>
                        <span>{formatFileSize(image.original.size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Compressed:</span>
                        <span>{formatFileSize(image.result.compressedFile.size)}</span>
                      </div>
                      <div className="flex justify-between font-medium text-green-600">
                        <span>Saved:</span>
                        <span>{image.result.compressionRatio.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dimensions:</span>
                        <span>
                          {image.result.compressedDimensions.width}×{image.result.compressedDimensions.height}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => downloadImage(image)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                      <button
                        onClick={() => removeImage(image.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p className="flex items-center justify-center">
            <Zap className="w-4 h-4 mr-1" />
            Powered by advanced image compression algorithms
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;