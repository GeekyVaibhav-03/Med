// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const statsRef = useRef([]);
  const ctaRef = useRef(null);
  const floatingIconsRef = useRef([]);
  const featuresRef = useRef(null);

  useEffect(() => {
    // Hero animations on load
    const ctx = gsap.context(() => {
      // Title animation with split text effect
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 100,
        duration: 1.2,
        ease: "power4.out"
      });

      // Subtitle fade and slide
      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: 0.3,
        ease: "power3.out"
      });

      // Stats cards stagger animation
      statsRef.current.forEach((stat, index) => {
        gsap.from(stat, {
          opacity: 0,
          scale: 0.5,
          duration: 0.8,
          delay: 0.6 + index * 0.1,
          ease: "back.out(1.7)"
        });
      });

      // CTA buttons
      gsap.from(ctaRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 1,
        ease: "power2.out"
      });

      // Features pills
      gsap.from(featuresRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 1.2,
        ease: "power2.out"
      });

      // Floating icons continuous animation
      floatingIconsRef.current.forEach((icon, index) => {
        if (icon) {
          gsap.to(icon, {
            y: -20,
            duration: 2 + index * 0.5,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            delay: index * 0.3
          });
        }
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const faqs = [
    {
      question: "How do I create an account on MedWatch?",
      answer: "Click on 'Get Started' or 'Sign Up' button and fill in your medical facility details including hospital affiliation and role (Doctor/Admin). Our system supports multi-facility healthcare networks."
    },
    {
      question: "What types of health services?",
      answer: "MedWatch provides comprehensive MDR contact tracing, real-time patient monitoring, staff tracking, infection control alerts, and detailed analytics for healthcare facilities."
    },
    {
      question: "How to cancel a booking?",
      answer: "Contact tracing sessions and monitoring can be paused or stopped from your dashboard. Navigate to Settings > Active Sessions to manage your facility's tracking activities."
    },
    {
      question: "What is the payment process?",
      answer: "MedWatch offers flexible pricing based on facility size. Choose from monthly or annual plans. All major payment methods accepted with enterprise billing available for hospital networks."
    }
  ];

  const services = [
    {
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
      title: "MDR Contact Tracing",
      description: "Real-time tracking of Multi-Drug Resistant organism exposure and automated contact identification using RFID technology.",
      color: "from-[#0E8B86] to-[#28B99A]",
      textColor: "text-white",
      featured: true,
      link: "/doctor/map"
    },
    {
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      title: "Patient Network Graph",
      description: "Visualize contact networks and exposure chains to identify potential risk groups and transmission patterns.",
      color: "from-blue-50 to-blue-100",
      textColor: "text-blue-600",
      link: "/doctor/network"
    },
    {
      icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
      title: "Real-Time Map",
      description: "Live location tracking of patients and staff on hospital floor plans with instant exposure alerts.",
      color: "from-purple-50 to-purple-100",
      textColor: "text-purple-600",
      link: "/doctor/map"
    },
    {
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      title: "MDR Checklist",
      description: "Comprehensive screening protocols and infection control checklists for healthcare providers.",
      color: "from-pink-50 to-pink-100",
      textColor: "text-pink-600",
      link: "/doctor/checklist"
    }
  ];

  const doctors = [
    {
      name: "Dr. Sarah Johnson",
      specialty: "Infectious Disease Specialist",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
      rating: 4.9
    },
    {
      name: "Dr. Michael Chen",
      specialty: "Hospital Administrator",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
      rating: 4.8
    },
    {
      name: "Dr. Emily Rodriguez",
      specialty: "Epidemiologist",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop",
      rating: 5.0
    }
  ];

  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0E8B86] to-[#28B99A] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-800">MedWatch</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/about" className="text-gray-600 hover:text-[#0E8B86] transition">About</Link>
              <a href="#services" className="text-gray-600 hover:text-[#0E8B86] transition">Our Services</a>
              <a href="#doctors" className="text-gray-600 hover:text-[#0E8B86] transition">Doctor</a>
              <a href="#faq" className="text-gray-600 hover:text-[#0E8B86] transition">FAQ</a>
              <Link to="/login" className="text-gray-600 hover:text-[#0E8B86] transition font-medium">
                Sign In
              </Link>
              <Link to="/signup" className="bg-gradient-to-r from-[#0E8B86] to-[#28B99A] text-white px-6 py-2 rounded-lg hover:shadow-lg transition">
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3">
              <Link to="/about" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">About</Link>
              <a href="#services" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">Our Services</a>
              <a href="#doctors" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">Doctor</a>
              <a href="#faq" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">FAQ</a>
              <Link to="/login" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition font-medium">
                Sign In
              </Link>
              <Link to="/signup" className="block px-4 py-2 bg-gradient-to-r from-[#0E8B86] to-[#28B99A] text-white text-center rounded-lg hover:shadow-lg transition">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Animated Hero Section */}
      <section 
        ref={heroRef}
        className="relative bg-gradient-to-br from-[#064e4a] via-[#0a6b66] to-[#064e4a] h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Doctor Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&h=1080&fit=crop"
            alt="Healthcare Professional"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#064e4a]/90 via-[#0a6b66]/85 to-[#064e4a]/90"></div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient Orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#28B99A] opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FBBF24] opacity-15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s', animationDuration: '3s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white opacity-5 rounded-full blur-3xl"></div>
          
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(#FFFFFF 1px, transparent 1px), linear-gradient(90deg, #FFFFFF 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}></div>
          </div>
          
          {/* Medical Cross Icons Pattern */}
          <div className="absolute top-10 left-1/4 opacity-10">
            <i className="ri-add-line text-4xl text-white"></i>
          </div>
          <div className="absolute bottom-20 right-1/3 opacity-10">
            <i className="ri-add-line text-5xl text-white"></i>
          </div>
          <div className="absolute top-1/3 right-10 opacity-10">
            <i className="ri-add-line text-3xl text-white"></i>
          </div>
          
          {/* Floating Medical Icons with GSAP Animation */}
          <div 
            ref={el => floatingIconsRef.current[0] = el}
            className="absolute top-32 right-1/4 hidden xl:block"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-[#28B99A]/20 to-[#0E8B86]/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-xl">
              <i className="ri-stethoscope-line text-2xl text-[#FBBF24]"></i>
            </div>
          </div>
          <div 
            ref={el => floatingIconsRef.current[1] = el}
            className="absolute bottom-32 left-1/4 hidden xl:block"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-[#28B99A]/20 to-[#0E8B86]/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-xl">
              <i className="ri-heart-pulse-line text-2xl text-[#FBBF24]"></i>
            </div>
          </div>
          <div 
            ref={el => floatingIconsRef.current[2] = el}
            className="absolute top-1/2 right-16 hidden xl:block"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-[#28B99A]/20 to-[#0E8B86]/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-xl">
              <i className="ri-shield-cross-line text-2xl text-[#FBBF24]"></i>
            </div>
          </div>
          <div 
            ref={el => floatingIconsRef.current[3] = el}
            className="absolute top-40 left-20 hidden xl:block"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#28B99A]/20 to-[#0E8B86]/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-xl">
              <i className="ri-microscope-line text-xl text-[#FBBF24]"></i>
            </div>
          </div>
          <div 
            ref={el => floatingIconsRef.current[4] = el}
            className="absolute bottom-40 right-32 hidden xl:block"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#28B99A]/20 to-[#0E8B86]/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-xl">
              <i className="ri-syringe-line text-xl text-[#FBBF24]"></i>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="container mx-auto px-4 relative z-10 max-w-7xl h-full flex items-center justify-center py-20">
          <div className="max-w-5xl mx-auto text-center text-white w-full">
            {/* Main Title with Gradient Text */}
            <div ref={titleRef} className="mb-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-3 leading-none">
                <span className="block bg-gradient-to-r from-white via-teal-100 to-white bg-clip-text text-transparent">Healthcare</span>
                <span className="block bg-gradient-to-r from-[#FBBF24] via-[#FCD34D] to-[#FBBF24] bg-clip-text text-transparent drop-shadow-2xl">MedWatch</span>
              </h1>
              <div className="relative">
                <div className="h-1.5 w-20 sm:w-24 md:w-28 bg-gradient-to-r from-transparent via-[#FBBF24] to-transparent mx-auto rounded-full"></div>
                <div className="absolute inset-0 h-1.5 w-20 sm:w-24 md:w-28 bg-[#FBBF24] mx-auto rounded-full blur-sm"></div>
              </div>
            </div>

            {/* Subtitle with Enhanced Typography */}
            <div ref={subtitleRef} className="mb-6">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-light mb-2 text-teal-50 tracking-wider">
                TRACK MULTI-DRUG RESISTANT ORGANISMS
              </p>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-teal-100 flex items-center justify-center flex-wrap gap-2 sm:gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#FBBF24] rounded-full animate-pulse"></span>
                  Real-Time Contact Tracing
                </span>
                <span className="hidden sm:inline text-teal-300">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5  bg-[#FBBF24] rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></span>
                  Instant Alerts
                </span>
                <span className="hidden sm:inline text-teal-300">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#FBBF24] rounded-full animate-pulse" style={{animationDelay: '1s'}}></span>
                  Advanced Analytics
                </span>
              </p>
            </div>

            {/* Enhanced Stats Grid with Hover Effects */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6 max-w-4xl mx-auto">
              <div 
                ref={el => statsRef.current[0] = el}
                className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-3 sm:p-4 md:p-5 border border-white/20 hover:border-[#FBBF24]/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#FBBF24]/20 cursor-pointer"
              >
                <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-br from-[#FBBF24] to-[#FCD34D] bg-clip-text text-transparent group-hover:scale-110 transition-transform">24/7</div>
                <div className="text-xs sm:text-sm text-teal-100 group-hover:text-white transition-colors">Monitoring</div>
              </div>
              <div 
                ref={el => statsRef.current[1] = el}
                className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-3 sm:p-4 md:p-5 border border-white/20 hover:border-[#FBBF24]/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#FBBF24]/20 cursor-pointer"
              >
                <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-br from-[#FBBF24] to-[#FCD34D] bg-clip-text text-transparent group-hover:scale-110 transition-transform">100%</div>
                <div className="text-xs sm:text-sm text-teal-100 group-hover:text-white transition-colors">Accuracy</div>
              </div>
              <div 
                ref={el => statsRef.current[2] = el}
                className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-3 sm:p-4 md:p-5 border border-white/20 hover:border-[#FBBF24]/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#FBBF24]/20 cursor-pointer"
              >
                <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-br from-[#FBBF24] to-[#FCD34D] bg-clip-text text-transparent group-hover:scale-110 transition-transform">&lt;1s</div>
                <div className="text-xs sm:text-sm text-teal-100 group-hover:text-white transition-colors">Response</div>
              </div>
              <div 
                ref={el => statsRef.current[3] = el}
                className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-3 sm:p-4 md:p-5 border border-white/20 hover:border-[#FBBF24]/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#FBBF24]/20 cursor-pointer"
              >
                <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-br from-[#FBBF24] to-[#FCD34D] bg-clip-text text-transparent group-hover:scale-110 transition-transform">RFID</div>
                <div className="text-xs sm:text-sm text-teal-100 group-hover:text-white transition-colors">Technology</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <Link 
                to="/login"
                className="group relative px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-[#FBBF24] to-[#FCD34D] text-gray-900 rounded-full font-bold text-xs sm:text-sm md:text-base hover:from-[#FCD34D] hover:to-[#FBBF24] transition-all transform hover:scale-105 shadow-2xl hover:shadow-[#FBBF24]/50 flex items-center space-x-2 w-full sm:w-auto justify-center overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></span>
                <span className="relative z-10">Access Dashboard</span>
                <i className="relative z-10 ri-arrow-right-line text-sm sm:text-base md:text-lg group-hover:translate-x-1 transition-transform"></i>
              </Link>
              <Link 
                to="/signup"
                className="group relative px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white/10 backdrop-blur-lg text-white rounded-full font-bold text-xs sm:text-sm md:text-base border-2 border-white/30 hover:bg-white/20 hover:border-[#FBBF24]/50 transition-all transform hover:scale-105 shadow-xl w-full sm:w-auto text-center overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#FBBF24]/0 via-[#FBBF24]/20 to-[#FBBF24]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="relative z-10">Sign Up Free</span>
              </Link>
            </div>

            {/* Features Pills */}
            <div ref={featuresRef} className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:gap-3 px-2">
              <div className="group flex items-center space-x-1.5 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 hover:border-[#FBBF24]/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                <i className="ri-map-pin-line text-xs sm:text-sm md:text-base text-[#FBBF24] group-hover:scale-110 transition-transform"></i>
                <span className="text-[10px] sm:text-xs md:text-sm font-medium group-hover:text-white transition-colors">Live Tracking</span>
              </div>
              <div className="group flex items-center space-x-1.5 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 hover:border-[#FBBF24]/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                <i className="ri-notification-badge-line text-xs sm:text-sm md:text-base text-[#FBBF24] group-hover:scale-110 transition-transform"></i>
                <span className="text-[10px] sm:text-xs md:text-sm font-medium group-hover:text-white transition-colors">Instant Alerts</span>
              </div>
              <div className="group flex items-center space-x-1.5 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 hover:border-[#FBBF24]/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                <i className="ri-line-chart-line text-xs sm:text-sm md:text-base text-[#FBBF24] group-hover:scale-110 transition-transform"></i>
                <span className="text-[10px] sm:text-xs md:text-sm font-medium group-hover:text-white transition-colors">Analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 hidden md:block">
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs text-teal-200 tracking-wider">SCROLL DOWN</span>
            <div className="w-5 h-8 border-2 border-white/50 rounded-full flex items-start justify-center p-1.5 hover:border-[#FBBF24] transition-colors cursor-pointer">
              <div className="w-1 h-1.5 bg-[#FBBF24] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      

     

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Services For MDR Contact Tracing</h2>
            <p className="text-gray-600">Advanced Real-Time Monitoring – Track MDR Exposure Anytime</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Link 
                key={index}
                to={service.link || "/login"}
                className={`rounded-3xl p-8 ${service.featured ? 'bg-gradient-to-br ' + service.color : 'bg-gradient-to-br ' + service.color} transform hover:scale-105 transition shadow-lg block`}
              >
                <div className={`w-16 h-16 ${service.featured ? 'bg-white bg-opacity-20' : 'bg-white'} rounded-2xl flex items-center justify-center mb-6`}>
                  <svg className={`w-8 h-8 ${service.featured ? 'text-white' : service.textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={service.icon} />
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold mb-3 ${service.featured ? 'text-white' : 'text-gray-800'}`}>{service.title}</h3>
                <p className={`mb-6 ${service.featured ? 'text-white text-opacity-90' : 'text-gray-600'}`}>{service.description}</p>
                <span className={`font-semibold ${service.featured ? 'text-white' : service.textColor} hover:underline`}>
                  Explore Now →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Meet Our Expert <span className="text-[#0E8B86]">Doctors</span></h2>
            <p className="text-gray-600">Experienced healthcare professionals dedicated to your wellbeing</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {doctors.map((doctor, index) => (
              <div 
                key={index}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2"
              >
                <div className="h-64 overflow-hidden">
                  <img 
                    src={doctor.image} 
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{doctor.name}</h3>
                  <p className="text-gray-600 mb-4">{doctor.specialty}</p>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(doctor.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-gray-600">{doctor.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

       {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          {/* Centered Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-lg">
              Find Answers to Common Questions About Our Services
            </p>
          </div>
          
          {/* FAQ Items */}
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-800">{faq.question}</span>
                  <svg 
                    className={`w-5 h-5 text-[#0E8B86] transform transition ${openFaq === index ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Plans For Your Growth</h2>
            <p className="text-gray-600">Stay Connected</p>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-[#0E8B86] to-[#28B99A] rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition">
              <h3 className="text-2xl font-bold mb-6">Get All Access</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold">$590</span>
                <span className="text-xl">/per month</span>
              </div>
              <p className="text-teal-100 mb-8">Basic features for up to 20 users</p>
              
              <Link
                to="/signup"
                className="block w-full bg-white text-[#0E8B86] text-center py-4 rounded-xl font-bold hover:bg-gray-100 transition mb-8"
              >
                Get Started
              </Link>
              
              <div className="space-y-4">
                <h4 className="font-bold mb-4">FEATURES</h4>
                {[
                  "Unlimited Doctor Visits",
                  "Get Specialized Referrals",
                  "Priority Health Tests",
                  "Mental Health Support",
                  "Personalized Health Insights"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#0E8B86] to-[#28B99A] text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">MedWatch</h3>
              <p className="text-teal-100">Advanced MDR Contact Tracing & Healthcare Management System</p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <div className="space-y-2 text-teal-100">
                <p>Email: support@medwatch.com</p>
                <p>Phone: +1 234 567 8900</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/login" className="block text-teal-100 hover:text-white transition">Login</Link>
                <Link to="/signup" className="block text-teal-100 hover:text-white transition">Sign Up</Link>
                <a href="#services" className="block text-teal-100 hover:text-white transition">Services</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="block text-teal-100 hover:text-white transition">Privacy Policy</a>
                <a href="#" className="block text-teal-100 hover:text-white transition">Terms of Service</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white border-opacity-20 pt-8 text-center text-teal-100">
            <p>© 2025-2026. All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
