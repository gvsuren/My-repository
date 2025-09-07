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
  const [showLanding, setShowLanding] = useState(false);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Header user={user} onAuthClick={() => setShowAuthModal(true)} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-20"></div>
              <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-2xl">
                <ImageIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent ml-4">
              Image Compressor Pro
            </h1>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Professional image compression with real-time quality assessment and advanced batch processing
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-8 mb-8">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-300 group">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <Upload className="w-16 h-16 text-slate-400 group-hover:text-indigo-500 mx-auto mb-6 transition-colors duration-300" />
            <h3 className="text-2xl font-semibold text-slate-800 mb-3">
              Drop images here or click to browse
            </h3>
            <p className="text-slate-500 mb-6 text-lg">
              Supports JPEG, PNG, WebP, GIF, BMP, and TIFF formats
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Compress Images ({uncompressedImages.length})
                </button>
              )}
              
              {hasCompressed && !isProcessing && compressedImages.length > 0 && (
                <button
                  onClick={reprocessAllImages}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reprocess All
                </button>
              )}
            </div>
          )}

          {/* Queue Status */}
          {queueStatus.isActive && (
            <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-800">Batch Processing Queue</h4>
                <div className="flex items-center space-x-2">
                  {queueStatus.estimatedTimeRemaining && (
                    <span className="text-sm text-slate-600 font-medium">
                      ~{formatTime(queueStatus.estimatedTimeRemaining)} remaining
                    </span>
                  )}
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-600 font-medium">
                      {queueStatus.activeJobs} active, {queueStatus.queueLength} queued
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">
                  Progress: {queueStatus.completedJobs} / {queueStatus.totalJobs}
                </span>
                <span className="text-sm text-slate-600">
                  {batchProgress.currentFile && `Processing: ${batchProgress.currentFile}`}
                </span>
              </div>
              
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
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
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
              <Settings className="w-6 h-6 mr-3 text-indigo-600" />
              Compression Settings
            </h2>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors font-medium"
            >
              {showAdvanced ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </button>
          </div>

          {/* Presets */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {Object.entries(WEB_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handlePresetChange(key as keyof typeof WEB_PRESETS)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPreset === key
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                  className="slider w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Max Width (px)
                </label>
                <input
                  type="number"
                  value={compressionOptions.maxWidth}
                  onChange={(e) => setCompressionOptions(prev => ({
                    ...prev,
                    maxWidth: parseInt(e.target.value) || 1920
                  }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Max Height (px)
                </label>
                <input
                  type="number"
                  value={compressionOptions.maxHeight}
                  onChange={(e) => setCompressionOptions(prev => ({
                    ...prev,
                    maxHeight: parseInt(e.target.value) || 1080
                  }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Output Format
                </label>
                <select
                  value={compressionOptions.format}
                  onChange={(e) => setCompressionOptions(prev => ({
                    ...prev,
                    format: e.target.value
                  }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
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
                  className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="progressive" className="ml-2 text-sm font-semibold text-slate-700">
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
                  className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="webOptimized" className="ml-2 text-sm font-semibold text-slate-700">
                  Optimize for Web
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {images.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-8">
            {/* Enhanced Statistics Header */}
            {compressedImages.length > 0 && (
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-emerald-50 rounded-xl p-6 mb-8 border border-indigo-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="w-7 h-7 text-indigo-600 mr-4" />
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Compression Summary</h3>
                      <p className="text-sm text-slate-600">
                        {compressedImages.length} of {images.length} images processed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {totalSavings.toFixed(1)}%
                    </div>
                    <div className="text-sm text-slate-600 font-medium">Total Savings</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
                    <div className="text-sm text-slate-600 font-medium">Original Size</div>
                    <div className="text-lg font-bold text-slate-800">
                      {formatFileSize(totalOriginalSize)}
                    </div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
                    <div className="text-sm text-slate-600 font-medium">Compressed Size</div>
                    <div className="text-lg font-bold text-indigo-600">
                      {formatFileSize(totalCompressedSize)}
                    </div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50">
                    <div className="text-sm text-slate-600 font-medium">Space Saved</div>
                    <div className="text-lg font-bold text-emerald-600">
                      {formatFileSize(totalOriginalSize - totalCompressedSize)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                <FileImage className="w-6 h-6 mr-3 text-indigo-600" />
                Images ({compressedImages.length} compressed / {images.length} total)
              </h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={downloadAll}
                  disabled={compressedImages.length === 0}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All ({compressedImages.length})
                </button>
                <button
                  onClick={clearAll}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
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

        {/* Footer Content */}
        <div className="text-center mt-16 text-slate-500">
          <p className="flex items-center justify-center text-lg">
            <Zap className="w-4 h-4 mr-1" />
            Professional image compression with real-time quality assessment
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