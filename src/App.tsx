import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Download, Image as ImageIcon, Settings, Zap, FileImage, Trash2, Eye, EyeOff, RefreshCw, BarChart3 } from 'lucide-react';
import { supabase } from './lib/supabase';
import { isSupabaseConfigured } from './lib/supabase';
import type { User } from './lib/supabase';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import Header from './components/Header';
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
import ImagePreview from './components/ImagePreview';

interface ProcessedImage {
  id: string;
  original: File;
  result?: CompressionResult;
  preview?: string;
  isProcessing?: boolean;
  isCompressed?: boolean;
}

interface QueueStatus {
  isActive: boolean;
  isPaused: boolean;
  totalJobs: number;
  completedJobs: number;
  activeJobs: number;
  queueLength: number;
  currentFile?: string;
  estimatedTimeRemaining?: number;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [originalFiles, setOriginalFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCompressed, setHasCompressed] = useState(false);
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
  const [queueStatus, setQueueStatus] = useState<QueueStatus>({
    isActive: false,
    isPaused: false,
    totalJobs: 0,
    completedJobs: 0,
    activeJobs: 0,
    queueLength: 0
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const compressionQueue = useRef(new CompressionQueue());
  const processingStartTime = useRef<number>(0);

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at
          });
          setShowLanding(false);
        }
      } catch (error) {
        console.error('Failed to initialize auth session:', error);
        // Continue without authentication if Supabase is unreachable
      }
      setLoading(false);
    };

    initAuth();

    if (!isSupabaseConfigured) {
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at
        });
        setShowLanding(false);
      } else {
        setUser(null);
        setShowLanding(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Enhanced queue status monitoring
  useEffect(() => {
    const updateQueueStatus = () => {
      const queue = compressionQueue.current;
      const activeJobs = queue.getActiveJobs();
      const queueLength = queue.getQueueLength();
      const totalJobs = images.length;
      const completedJobs = images.filter(img => img.isCompressed && !img.isProcessing).length;
      
      // Calculate estimated time remaining
      let estimatedTimeRemaining: number | undefined;
      if (processingStartTime.current && completedJobs > 0) {
        const elapsed = Date.now() - processingStartTime.current;
        const avgTimePerImage = elapsed / completedJobs;
        const remainingImages = totalJobs - completedJobs;
        estimatedTimeRemaining = Math.round((avgTimePerImage * remainingImages) / 1000); // in seconds
      }

      setQueueStatus({
        isActive: activeJobs > 0 || queueLength > 0,
        isPaused: false, // We'll implement pause functionality
        totalJobs,
        completedJobs,
        activeJobs,
        queueLength,
        estimatedTimeRemaining
      });
    };

    const interval = setInterval(updateQueueStatus, 500);
    return () => clearInterval(interval);
  }, [images]);

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowLanding(false);
  };

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

    // Store original files for processing
    setOriginalFiles(prev => [...prev, ...validFiles]);

    // Create uncompressed entries for immediate UI feedback
    const uncompressedImages: ProcessedImage[] = validFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      original: file,
      preview: URL.createObjectURL(file),
      isProcessing: false,
      isCompressed: false
    }));

    setImages(prev => [...prev, ...uncompressedImages]);
  }, []);

  const startCompression = async () => {
    const uncompressedImages = images.filter(img => !img.isCompressed);
    if (uncompressedImages.length === 0) return;

    const filesToProcess = uncompressedImages.map(img => img.original);
    
    // Mark images as processing
    setImages(prev => prev.map(img => 
      !img.isCompressed ? { ...img, isProcessing: true } : img
    ));

    await processImages(filesToProcess, uncompressedImages);
  };

  const processImages = async (files: File[], placeholderImages: ProcessedImage[]) => {
    setIsProcessing(true);
    processingStartTime.current = Date.now();
    setBatchProgress({ completed: 0, total: files.length, currentFile: '' });

    try {
      const results = await compressBatch(
        files,
        compressionOptions,
        (completed, total, currentFile) => {
          setBatchProgress({ completed, total, currentFile: currentFile || '' });
        }
      );

      // Update images with actual results
      const processedImages: ProcessedImage[] = results.map((result, index) => ({
        ...placeholderImages[index],
        result,
        preview: URL.createObjectURL(result.compressedFile),
        isProcessing: false,
        isCompressed: true
      }));

      setImages(prev => {
        const updated = [...prev];
        placeholderImages.forEach((placeholder, index) => {
          const imgIndex = updated.findIndex(img => img.id === placeholder.id);
          if (imgIndex !== -1) {
            // Clean up old preview URL
            if (updated[imgIndex].preview && updated[imgIndex].preview !== placeholder.preview) {
              URL.revokeObjectURL(updated[imgIndex].preview!);
            }
            updated[imgIndex] = processedImages[index];
          }
        });
        return updated;
      });

      setHasCompressed(true);

    } catch (error) {
      console.error('Batch compression failed:', error);
      alert('Some images failed to compress. Please try again.');
      
      // Reset failed processing images
      setImages(prev => prev.map(img => 
        placeholderImages.some(p => p.id === img.id) 
          ? { ...img, isProcessing: false }
          : img
      ));
    } finally {
      setIsProcessing(false);
      setBatchProgress({ completed: 0, total: 0, currentFile: '' });
    }
  };

  const reprocessAllImages = async () => {
    if (originalFiles.length === 0) return;

    // Clear existing compressed previews
    images.forEach(image => {
      if (image.preview && image.isCompressed) {
        URL.revokeObjectURL(image.preview);
      }
    });

    // Reset all images to uncompressed state with original previews
    const resetImages = images.map((img, index) => ({
      ...img,
      result: undefined,
      preview: URL.createObjectURL(originalFiles[index]),
      isProcessing: false,
      isCompressed: false
    }));

    setImages(resetImages);
    setHasCompressed(false);

    // Start reprocessing
    await processImages(originalFiles, resetImages);
  };

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
    if (!image.result) return;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(image.result.compressedFile);
    link.download = image.result.compressedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    const compressedImages = images.filter(img => img.isCompressed && img.result);
    compressedImages.forEach(image => downloadImage(image));
  };

  const clearAll = () => {
    images.forEach(image => {
      if (image.preview) {
        URL.revokeObjectURL(image.preview);
      }
    });
    setImages([]);
    setOriginalFiles([]);
    setHasCompressed(false);
    compressionQueue.current.clear();
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
    
    // Also remove from original files if needed
    const imageIndex = images.findIndex(img => img.id === id);
    if (imageIndex !== -1) {
      setOriginalFiles(prev => prev.filter((_, index) => index !== imageIndex));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showLanding) {
    return (
      <>
        <LandingPage onGetStarted={handleGetStarted} />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  const compressedImages = images.filter(img => img.isCompressed && img.result);
  const uncompressedImages = images.filter(img => !img.isCompressed);
  const totalOriginalSize = compressedImages.reduce((sum, img) => sum + img.original.size, 0);
  const totalCompressedSize = compressedImages.reduce((sum, img) => sum + (img.result?.compressedFile.size || 0), 0);
  const totalSavings = totalOriginalSize > 0 ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header user={user} onAuthClick={() => setShowAuthModal(true)} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ImageIcon className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Image Compressor Pro</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Upload images, adjust settings, then compress with advanced batch processing
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

          {/* Compression Control */}
          {images.length > 0 && (
            <div className="mt-6 flex items-center justify-center space-x-4">
              {uncompressedImages.length > 0 && !isProcessing && (
                <button
                  onClick={startCompression}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center text-lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Compress Images ({uncompressedImages.length})
                </button>
              )}
              
              {hasCompressed && !isProcessing && compressedImages.length > 0 && (
                <button
                  onClick={reprocessAllImages}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reprocess All
                </button>
              )}
            </div>
          )}

          {/* Queue Status */}
          {queueStatus.isActive && (
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-blue-900">Batch Processing Queue</h4>
                <div className="flex items-center space-x-2">
                  {queueStatus.estimatedTimeRemaining && (
                    <span className="text-sm text-blue-700">
                      ~{formatTime(queueStatus.estimatedTimeRemaining)} remaining
                    </span>
                  )}
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-blue-700">
                      {queueStatus.activeJobs} active, {queueStatus.queueLength} queued
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">
                  Progress: {queueStatus.completedJobs} / {queueStatus.totalJobs}
                </span>
                <span className="text-sm text-blue-600">
                  {batchProgress.currentFile && `Processing: ${batchProgress.currentFile}`}
                </span>
              </div>
              
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                  style={{ width: `${queueStatus.totalJobs > 0 ? (queueStatus.completedJobs / queueStatus.totalJobs) * 100 : 0}%` }}
                >
                  <span className="text-xs text-white font-medium">
                    {queueStatus.totalJobs > 0 ? Math.round((queueStatus.completedJobs / queueStatus.totalJobs) * 100) : 0}%
                  </span>
                </div>
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
            {/* Enhanced Statistics Header */}
            {compressedImages.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Compression Summary</h3>
                      <p className="text-sm text-gray-600">
                        {compressedImages.length} of {images.length} images processed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {totalSavings.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Total Savings</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-sm text-gray-600">Original Size</div>
                    <div className="text-lg font-semibold text-gray-800">
                      {formatFileSize(totalOriginalSize)}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-sm text-gray-600">Compressed Size</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {formatFileSize(totalCompressedSize)}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-sm text-gray-600">Space Saved</div>
                    <div className="text-lg font-semibold text-green-600">
                      {formatFileSize(totalOriginalSize - totalCompressedSize)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FileImage className="w-5 h-5 mr-2" />
                Images ({compressedImages.length} compressed / {images.length} total)
              </h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={downloadAll}
                  disabled={compressedImages.length === 0}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All ({compressedImages.length})
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
                <ImagePreview
                  key={image.id}
                  image={image}
                  onDownload={() => downloadImage(image)}
                  onRemove={() => removeImage(image.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p className="flex items-center justify-center">
            <Zap className="w-4 h-4 mr-1" />
            Advanced image compression with before/after comparison and visual quality assessment
          </p>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default App;