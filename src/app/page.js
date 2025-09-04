"use client";
import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X, Users, Calendar, MessageCircle, Upload, BarChart3, Bot, Bell, GraduationCap, Star, Check, Mail, ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import Link from 'next/link';

export default function CampusConnectLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
    setIsMenuOpen(false);
  };

  const features = [
    { icon: Bell, title: 'View Announcements', description: 'Stay updated with important campus announcements' },
    { icon: Upload, title: 'Upload Files', description: 'Share documents and resources seamlessly' },
    { icon: MessageCircle, title: 'Open Chat', description: 'Connect with your campus community' },
    { icon: Users, title: 'Private Chat', description: 'Have private conversations with peers' },
    { icon: Calendar, title: 'View Events', description: 'Never miss important campus events' },
    { icon: BarChart3, title: 'Participate in Polls', description: 'Voice your opinion on campus matters' },
    { icon: GraduationCap, title: 'Campus Threads', description: 'Join academic discussions' },
    { icon: Bot, title: 'CampusAI Assistant', description: 'Get instant help with AI-powered support' }
  ];

  const benefits = [
    { icon: Zap, title: 'Instant Connection', description: 'Connect with your entire campus community in real-time' },
    { icon: Shield, title: 'Secure & Private', description: 'Your data is protected with enterprise-grade security' },
    { icon: Clock, title: '24/7 Availability', description: 'Access your campus network anytime, anywhere' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-purple-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">C</span>
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Campus Connect
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-purple-600 transition-colors">
                Home
              </button>
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-purple-600 transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('benefits')} className="text-gray-700 hover:text-purple-600 transition-colors">
                What You will Get
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-purple-600 transition-colors">
                Pricing
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-purple-600 transition-colors">
                Contact
              </button>
              <Link
                href="/login"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Login
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6 text-purple-600" /> : <Menu className="w-6 h-6 text-purple-600" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 bg-white/95 backdrop-blur-lg rounded-b-lg">
              <div className="flex flex-col space-y-3">
                <button onClick={() => scrollToSection('home')} className="text-left px-4 py-2 text-gray-700 hover:text-purple-600">
                  Home
                </button>
                <button onClick={() => scrollToSection('features')} className="text-left px-4 py-2 text-gray-700 hover:text-purple-600">
                  Features
                </button>
                <button onClick={() => scrollToSection('benefits')} className="text-left px-4 py-2 text-gray-700 hover:text-purple-600">
                  What You will Get
                </button>
                <button onClick={() => scrollToSection('pricing')} className="text-left px-4 py-2 text-gray-700 hover:text-purple-600">
                  Pricing
                </button>
                <button onClick={() => scrollToSection('contact')} className="text-left px-4 py-2 text-gray-700 hover:text-purple-600">
                  Contact
                </button>
                <div className="px-4">
                  <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full">
                    <Link href="/login">
                      Login
                    </Link>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-20 sm:pt-24 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 animate-pulse">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Transforming Campus Communication
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
              Connect Your Campus
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block">
                Like Never Before
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              The ultimate platform for campus communication. Streamline announcements, events,
              discussions, and community engagement all in one powerful app.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 sm:mb-16 px-4">
              <button
                onClick={() => scrollToSection('contact')}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                Get Started <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="w-full sm:w-auto border-2 border-purple-600 text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300 flex items-center justify-center"
              >
                Explore Features
              </button>
            </div>

            {/* Hero Image/Dashboard Preview */}
            <div className="relative max-w-4xl mx-auto px-2">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 border border-purple-100">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 hover:scale-105 transition-transform duration-300">
                      <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-xs sm:text-sm text-gray-800">{feature.title}</h3>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-2">
              Powerful Features for
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block">
                Modern Campuses
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Everything your campus needs to stay connected, informed, and engaged
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll Get Section */}
      <section id="benefits" className="py-12 sm:py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 sm:mb-6 px-2">
              What You will get
            </h2>
            <p className="text-lg sm:text-xl text-purple-100 max-w-3xl mx-auto px-4">
              Transform your campus experience with these incredible benefits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-lg hover:bg-white/20 transition-all duration-300">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <benefit.icon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">{benefit.title}</h3>
                <p className="text-sm sm:text-base text-purple-100 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 sm:mt-16 text-center">
            <div className="inline-block bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl max-w-4xl mx-4">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Complete Campus Solution</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">8+</div>
                  <div className="text-sm sm:text-base text-gray-600">Core Features</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">24/7</div>
                  <div className="text-sm sm:text-base text-gray-600">Availability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">100%</div>
                  <div className="text-sm sm:text-base text-gray-600">Secure</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">∞</div>
                  <div className="text-sm sm:text-base text-gray-600">Possibilities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-2">
              Simple, Transparent
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block">
                Pricing
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Get your entire campus connected for less than the cost of a coffee per student per month
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="relative p-6 sm:p-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl sm:rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-300 mx-4">
              <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-yellow-400 text-yellow-900 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Most Popular
                </div>
              </div>

              <div className="text-center text-white">
                <h3 className="text-xl sm:text-2xl font-bold mb-4">Campus Connect Pro</h3>
                <div className="mb-6">
                  <span className="text-4xl sm:text-5xl font-bold">₹499</span>
                  <span className="text-lg sm:text-xl opacity-80">/month</span>
                </div>
                <p className="text-purple-100 mb-6 sm:mb-8 text-sm sm:text-base">
                  Complete campus communication solution for your organization
                </p>

                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {[
                    'All 8 Core Features',
                    'Unlimited Users',
                    'Real-time Messaging',
                    'Event Management',
                    'File Sharing',
                    'Polls & Surveys',
                    'AI Assistant',
                    '24/7 Support',
                    'Custom Branding',
                    'Analytics Dashboard'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center text-sm sm:text-base">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-300 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => scrollToSection('contact')}
                  className="w-full bg-white text-purple-600 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center"
                >
                  Get Started Now <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 sm:mt-12 px-4">
            <p className="text-sm sm:text-base text-gray-600">
              🎓 Special launch pricing • No setup fees • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-2">
              Ready to Transform
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block">
                Your Campus?
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Get access to the admin portal and explore all features before making a decision
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 mx-4">
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Get Admin Access</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                  Send us an email to get instant access to the admin portal where you can explore all features,
                  customize settings, and see how Campus Connect can transform your organization.
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="flex items-center justify-center mb-3 sm:mb-4">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mr-3" />
                  <span className="text-base sm:text-lg font-semibold text-gray-900">Contact Email</span>
                </div>
                <div className="text-center">
                  <a
                    href="mailto:adityaaman.codex@gmail.com?subject=Campus Connect - Admin Portal Access Request&body=Hi, I'm interested in exploring Campus Connect for my organization. Please provide me access to the admin portal."
                    className="text-lg sm:text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors break-all"
                  >
                    adityaaman.codex@gmail.com
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg sm:rounded-xl">
                  <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">1</div>
                  <div className="text-xs sm:text-sm text-gray-600">Send Email</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">2</div>
                  <div className="text-xs sm:text-sm text-gray-600">Get Portal Access</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg sm:rounded-xl">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">3</div>
                  <div className="text-xs sm:text-sm text-gray-600">Explore Features</div>
                </div>
              </div>

              <a
                href="mailto:adityaaman.codex@gmail.com?subject=Campus Connect - Admin Portal Access Request&body=Hi, I'm interested in exploring Campus Connect for my organization. Please provide me access to the admin portal."
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                Request Admin Access <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">C</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Campus Connect
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Transforming campus communication, one connection at a time.
              Built with ❤️ for educational institutions everywhere.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-6 sm:mb-8">
              <button onClick={() => scrollToSection('features')} className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
                Features
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
                Pricing
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
                Contact
              </button>
            </div>
            <div className="border-t border-gray-800 pt-6 sm:pt-8">
              <p className="text-xs sm:text-base text-gray-400 px-4">
                © 2025 Campus Connect. Made with passion for better campus communication.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}