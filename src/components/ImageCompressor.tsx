export interface CompressionOptions {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  format?: string;
  progressive?: boolean;
  optimizeForWeb?: boolean;
}

export interface CompressionResult {
  compressedFile: File;
  compressionRatio: number;
  originalFormat: string;
  outputFormat: string;
  originalDimensions: { width: number; height: number };
  compressedDimensions: { width: number; height: number };
}

// Format-specific compression settings
const FORMAT_SETTINGS = {
  'image/jpeg': {
    quality: { min: 0.1, max: 1.0, default: 0.85 },
    supportsProgressive: true,
    webOptimized: true,
    maxDimensions: { width: 1920, height: 1080 }
  },
  'image/png': {
    quality: { min: 0.1, max: 1.0, default: 0.9 },
    supportsProgressive: false,
    webOptimized: true,
    maxDimensions: { width: 1920, height: 1080 }
  },
  'image/webp': {
    quality: { min: 0.1, max: 1.0, default: 0.8 },
    supportsProgressive: false,
    webOptimized: true,
    maxDimensions: { width: 1920, height: 1080 }
  },
  'image/gif': {
    quality: { min: 0.1, max: 1.0, default: 0.8 },
    supportsProgressive: false,
    webOptimized: false,
    maxDimensions: { width: 800, height: 600 }
  },
  'image/bmp': {
    quality: { min: 0.1, max: 1.0, default: 0.9 },
    supportsProgressive: false,
    webOptimized: false,
    maxDimensions: { width: 1200, height: 900 }
  },
  'image/tiff': {
    quality: { min: 0.1, max: 1.0, default: 0.9 },
    supportsProgressive: false,
    webOptimized: false,
    maxDimensions: { width: 1200, height: 900 }
  }
};

// Web optimization presets
export const WEB_PRESETS = {
  thumbnail: { maxWidth: 150, maxHeight: 150, quality: 0.7 },
  small: { maxWidth: 400, maxHeight: 400, quality: 0.8 },
  medium: { maxWidth: 800, maxHeight: 600, quality: 0.85 },
  large: { maxWidth: 1200, maxHeight: 900, quality: 0.85 },
  fullHD: { maxWidth: 1920, maxHeight: 1080, quality: 0.9 },
  custom: { maxWidth: 1920, maxHeight: 1080, quality: 0.8 }
};

// Advanced image processing utilities
const createImageBitmap = (file: File): Promise<ImageBitmap> => {
  return new Promise((resolve, reject) => {
    if (window.createImageBitmap) {
      window.createImageBitmap(file)
        .then(resolve)
        .catch(reject);
    } else {
      // Fallback for browsers without createImageBitmap
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(canvas as any);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    }
  });
};

// Calculate optimal dimensions based on format and web optimization
const calculateOptimalDimensions = (
  originalWidth: number,
  originalHeight: number,
  format: string,
  options: CompressionOptions
): { width: number; height: number } => {
  const formatSettings = FORMAT_SETTINGS[format as keyof typeof FORMAT_SETTINGS];
  const maxWidth = Math.min(options.maxWidth, formatSettings?.maxDimensions.width || options.maxWidth);
  const maxHeight = Math.min(options.maxHeight, formatSettings?.maxDimensions.height || options.maxHeight);

  let { width, height } = { width: originalWidth, height: originalHeight };

  // Apply web optimization constraints
  if (options.optimizeForWeb) {
    // For web, we want to be more aggressive with large images
    const webMaxWidth = Math.min(maxWidth, 1920);
    const webMaxHeight = Math.min(maxHeight, 1080);
    
    if (width > webMaxWidth || height > webMaxHeight) {
      const aspectRatio = width / height;
      
      if (width > height) {
        width = webMaxWidth;
        height = width / aspectRatio;
      } else {
        height = webMaxHeight;
        width = height * aspectRatio;
      }
    }
  } else {
    // Standard resizing
    if (width > maxWidth || height > maxHeight) {
      const aspectRatio = width / height;
      
      if (width > height) {
        width = maxWidth;
        height = width / aspectRatio;
      } else {
        height = maxHeight;
        width = height * aspectRatio;
      }
    }
  }

  return {
    width: Math.round(width),
    height: Math.round(height)
  };
};

// Enhanced compression with format-specific optimizations
export const compressImage = (
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      const originalDimensions = { width: img.width, height: img.height };
      
      // Calculate optimal dimensions based on format and settings
      const optimalDimensions = calculateOptimalDimensions(
        img.width,
        img.height,
        file.type,
        options
      );

      canvas.width = optimalDimensions.width;
      canvas.height = optimalDimensions.height;

      // Apply format-specific optimizations
      const formatSettings = FORMAT_SETTINGS[file.type as keyof typeof FORMAT_SETTINGS];
      
      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // For web optimization, apply additional canvas optimizations
      if (options.optimizeForWeb) {
        // Use better interpolation for web images
        ctx.globalCompositeOperation = 'source-over';
      }

      // Draw the image with optimized settings
      ctx.drawImage(img, 0, 0, optimalDimensions.width, optimalDimensions.height);

      // Determine output format
      let outputFormat = options.format || file.type;
      
      // Auto-convert formats for better web compatibility
      if (options.optimizeForWeb) {
        if (file.type === 'image/bmp' || file.type === 'image/tiff') {
          outputFormat = 'image/jpeg'; // Convert to JPEG for better web support
        }
        if (file.type === 'image/gif' && !isAnimatedGif(file)) {
          outputFormat = 'image/png'; // Convert static GIFs to PNG for better quality
        }
      }

      // Apply format-specific quality settings
      let finalQuality = options.quality;
      if (formatSettings) {
        finalQuality = Math.max(
          formatSettings.quality.min,
          Math.min(formatSettings.quality.max, options.quality)
        );
      }

      // Handle different output formats
      const compressionCallback = (blob: Blob | null) => {
        if (blob) {
          const compressedFile = new File([blob], getOptimizedFileName(file.name, outputFormat), {
            type: outputFormat,
            lastModified: Date.now(),
          });
          
          const compressionRatio = ((file.size - compressedFile.size) / file.size) * 100;
          
          resolve({
            compressedFile,
            compressionRatio: Math.max(0, compressionRatio), // Ensure non-negative
            originalFormat: file.type,
            outputFormat,
            originalDimensions,
            compressedDimensions: optimalDimensions
          });
        } else {
          reject(new Error('Compression failed'));
        }
      };

      // Apply progressive JPEG if supported and enabled
      if (outputFormat === 'image/jpeg' && options.progressive && formatSettings?.supportsProgressive) {
        // Note: Canvas API doesn't directly support progressive JPEG
        // This would require additional libraries in a production environment
        canvas.toBlob(compressionCallback, outputFormat, finalQuality);
      } else {
        canvas.toBlob(compressionCallback, outputFormat, finalQuality);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

// Utility function to detect animated GIFs
const isAnimatedGif = (file: File): boolean => {
  // This is a simplified check - in production, you'd want to parse the GIF header
  return file.type === 'image/gif' && file.size > 50000; // Rough heuristic
};

// Generate optimized filename based on output format
const getOptimizedFileName = (originalName: string, outputFormat: string): string => {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const extension = outputFormat.split('/')[1];
  return `compressed_${nameWithoutExt}.${extension}`;
};

// Batch compression with progress tracking
export const compressBatch = async (
  files: File[],
  options: CompressionOptions,
  onProgress?: (completed: number, total: number, currentFile?: string) => void
): Promise<CompressionResult[]> => {
  const results: CompressionResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      onProgress?.(i, files.length, files[i].name);
      const result = await compressImage(files[i], options);
      results.push(result);
      onProgress?.(i + 1, files.length, files[i].name);
    } catch (error) {
      console.error(`Failed to compress ${files[i].name}:`, error);
      // Continue with other files even if one fails
    }
  }
  
  return results;
};

// Queue management for batch processing
export class CompressionQueue {
  private queue: Array<{
    file: File;
    options: CompressionOptions;
    resolve: (result: CompressionResult) => void;
    reject: (error: Error) => void;
    priority?: number;
  }> = [];
  
  private processing = false;
  private maxConcurrent = 4; // Process up to 4 images simultaneously for better performance
  private activeJobs = 0;
  private isPaused = false;
  private completedJobs = 0;
  private totalJobs = 0;
  
  async add(file: File, options: CompressionOptions, priority: number = 0): Promise<CompressionResult> {
    return new Promise((resolve, reject) => {
      // Insert based on priority (higher priority first)
      const job = { file, options, resolve, reject, priority };
      const insertIndex = this.queue.findIndex(item => (item.priority || 0) < priority);
      
      if (insertIndex === -1) {
        this.queue.push(job);
      } else {
        this.queue.splice(insertIndex, 0, job);
      }
      
      this.totalJobs++;
      this.processNext();
    });
  }
  
  private async processNext() {
    if (this.isPaused || this.activeJobs >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    const job = this.queue.shift();
    if (!job) return;
    
    this.activeJobs++;
    
    try {
      const result = await compressImage(job.file, job.options);
      job.resolve(result);
      this.completedJobs++;
    } catch (error) {
      job.reject(error as Error);
    } finally {
      this.activeJobs--;
      this.processNext(); // Process next item in queue
    }
  }
  
  clear() {
    // Reject all pending jobs
    this.queue.forEach(job => {
      job.reject(new Error('Queue cleared'));
    });
    this.queue.length = 0;
    this.completedJobs = 0;
    this.totalJobs = 0;
  }
  
  pause() {
    this.isPaused = true;
  }
  
  resume() {
    this.isPaused = false;
    // Resume processing
    for (let i = 0; i < this.maxConcurrent - this.activeJobs; i++) {
      this.processNext();
    }
  }
  
  isPausedState(): boolean {
    return this.isPaused;
  }
  
  getQueueLength(): number {
    return this.queue.length;
  }
  
  getActiveJobs(): number {
    return this.activeJobs;
  }
  
  getCompletedJobs(): number {
    return this.completedJobs;
  }
  
  getTotalJobs(): number {
    return this.totalJobs;
  }
  
  getProgress(): number {
    return this.totalJobs > 0 ? (this.completedJobs / this.totalJobs) * 100 : 0;
  }
}
// Format validation and support detection
export const getSupportedFormats = (): string[] => {
  return Object.keys(FORMAT_SETTINGS);
};

export const isFormatSupported = (mimeType: string): boolean => {
  return mimeType in FORMAT_SETTINGS;
};

// Get format-specific recommendations
export const getFormatRecommendations = (file: File): {
  recommendedQuality: number;
  recommendedFormat: string;
  webOptimized: boolean;
} => {
  const formatSettings = FORMAT_SETTINGS[file.type as keyof typeof FORMAT_SETTINGS];
  
  if (!formatSettings) {
    return {
      recommendedQuality: 0.8,
      recommendedFormat: 'image/jpeg',
      webOptimized: true
    };
  }
  
  return {
    recommendedQuality: formatSettings.quality.default,
    recommendedFormat: formatSettings.webOptimized ? file.type : 'image/jpeg',
    webOptimized: formatSettings.webOptimized
  };
};