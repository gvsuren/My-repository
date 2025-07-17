import React, { useState } from 'react';
import { 
  ImageIcon, 
  Zap, 
  Shield, 
  Download, 
  BarChart3, 
  Eye, 
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [email, setEmail] = useState('');

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Compress multiple images simultaneously with advanced batch processing"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Visual Quality Control",
      description: "Before/after comparison with detailed quality assessment metrics"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Smart Analytics",
      description: "Real-time compression statistics and file size reduction tracking"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy First",
      description: "All processing happens in your browser - your images never leave your device"
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Multiple Formats",
      description: "Support for JPEG, PNG, WebP, GIF, BMP, and TIFF with format conversion"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Web Optimized",
      description: "Intelligent presets and settings optimized for web performance"
    }
  ];

  const stats = [
    { number: "10M+", label: "Images Compressed" },
    { number: "50K+", label: "Happy Users" },
    { number: "85%", label: "Average Savings" },
    { number: "99.9%", label: "Uptime" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Web Developer",
      content: "This tool has revolutionized my workflow. The batch processing and quality assessment features are incredible!",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Digital Marketer",
      content: "Perfect for optimizing images for our campaigns. The before/after comparison helps ensure quality.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "Photographer",
      content: "Love the privacy-first approach. All processing happens locally, so my client photos stay secure.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <ImageIcon className="w-16 h-16 text-blue-600" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Compress Images
              <span className="block text-blue-600">Like a Pro</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Advanced image compression with visual quality assessment, batch processing, 
              and detailed analytics. All processing happens in your browser for maximum privacy.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={onGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              
              <div className="flex items-center text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>No signup required • Process unlimited images</span>
              </div>
            </div>

            {/* Quick Demo */}
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Upload Images</h3>
                  <p className="text-gray-600 text-sm">Drag & drop or select multiple images</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Adjust Settings</h3>
                  <p className="text-gray-600 text-sm">Choose quality, format, and dimensions</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-green-600 font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Download</h3>
                  <p className="text-gray-600 text-sm">Get optimized images with quality reports</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Every Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional-grade image compression tools designed for developers, 
              designers, and content creators.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Professionals
            </h2>
            <p className="text-xl text-gray-600">
              See what our users have to say about their experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-800">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Optimize Your Images?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust our platform for their image compression needs.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center"
            >
              Start Compressing Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            
            <div className="flex items-center text-blue-100">
              <Users className="w-5 h-5 mr-2" />
              <span>Join 50,000+ users</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <ImageIcon className="w-8 h-8 text-blue-400 mr-3" />
              <span className="text-white font-semibold text-lg">Image Compressor Pro</span>
            </div>
            
            <div className="flex items-center space-x-6 text-gray-400">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                <span className="text-sm">Privacy First</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm">Always Free</span>
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                <span className="text-sm">Lightning Fast</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Image Compressor Pro. All rights reserved. Built with ❤️ for creators.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;