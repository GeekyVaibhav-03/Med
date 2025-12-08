import { useState, useEffect } from 'react';

const DoctorCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&h=700&fit=crop",
      title: "System Status Update",
      badge: {
        icon: "ri-shield-check-line",
        label: "System Status",
        value: "All Active",
        color: "bg-green-100 text-green-600"
      },
      news: [
        { icon: "ri-database-2-line", text: "Database connectivity: 100%", time: "2 mins ago" },
        { icon: "ri-wifi-line", text: "RFID system online", time: "5 mins ago" },
        { icon: "ri-shield-check-line", text: "Security protocols active", time: "10 mins ago" }
      ]
    },
    {
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=700&fit=crop",
      title: "Healthcare Team Update",
      badge: {
        icon: "ri-user-heart-line",
        label: "Active Doctors",
        value: "24/7 Available",
        color: "bg-blue-100 text-blue-600"
      },
      news: [
        { icon: "ri-user-add-line", text: "Dr. Smith joined shift - Ward A", time: "15 mins ago" },
        { icon: "ri-stethoscope-line", text: "New consultation started", time: "20 mins ago" },
        { icon: "ri-calendar-check-line", text: "5 appointments scheduled today", time: "30 mins ago" }
      ]
    },
    {
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&h=700&fit=crop",
      title: "MDR Tracking Alert",
      badge: {
        icon: "ri-heart-pulse-line",
        label: "MDR Monitoring",
        value: "Active Tracking",
        color: "bg-teal-100 text-teal-600"
      },
      news: [
        { icon: "ri-alert-line", text: "New MDR case detected - Room 305", time: "Just now", urgent: true },
        { icon: "ri-map-pin-line", text: "Contact tracing initiated", time: "3 mins ago" },
        { icon: "ri-user-follow-line", text: "12 contacts identified", time: "8 mins ago" }
      ]
    },
    {
      image: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=600&h=700&fit=crop",
      title: "Emergency Services",
      badge: {
        icon: "ri-hospital-line",
        label: "Emergency Care",
        value: "Ready",
        color: "bg-red-100 text-red-600"
      },
      news: [
        { icon: "ri-ambulance-line", text: "Emergency room at 70% capacity", time: "1 min ago" },
        { icon: "ri-first-aid-kit-line", text: "All equipment sterilized", time: "12 mins ago" },
        { icon: "ri-nurse-line", text: "Staff briefing completed", time: "25 mins ago" }
      ]
    },
    {
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=700&fit=crop",
      title: "Patient Updates",
      badge: {
        icon: "ri-user-heart-line",
        label: "Patient Care",
        value: "Monitoring",
        color: "bg-purple-100 text-purple-600"
      },
      news: [
        { icon: "ri-checkbox-circle-line", text: "3 patients discharged successfully", time: "18 mins ago" },
        { icon: "ri-file-text-line", text: "New patient records imported", time: "35 mins ago" },
        { icon: "ri-heart-pulse-line", text: "Vital signs monitoring active", time: "40 mins ago" }
      ]
    }
  ];

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full max-w-4xl">
      {/* Main Carousel Container */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white">
        {/* Slides */}
        <div 
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="min-w-full relative">
              {/* Image with Overlay */}
              <div className="relative h-[800px]">
                <img 
                  src={slide.image}
                  alt={`Healthcare professional ${index + 1}`}
                  className="w-full h-[800px] object-cover"
                />
                
                {/* Gradient Overlay - Full Height */}
                <div className="absolute inset-0 h-[800px] bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-4">{slide.title}</h3>
                  
                  {/* Real-time Clock */}
                  <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Current Time</p>
                        <p className="text-2xl font-bold">{formatTime(currentTime)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-90">{formatDate(currentTime)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* News Feed */}
                  <div className="space-y-2">
                    {slide.news.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`bg-white/20 backdrop-blur-md rounded-xl p-3 flex items-start gap-3 ${
                          item.urgent ? 'border-2 border-red-400 animate-pulse' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 ${item.urgent ? 'bg-red-500' : 'bg-white/30'} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <i className={`${item.icon} ${item.urgent ? 'text-white' : ''}`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.text}</p>
                          <p className="text-xs opacity-75 flex items-center gap-1 mt-1">
                            <i className="ri-time-line"></i>
                            {item.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Badge Overlay - Top Right */}
              <div className="absolute top-4 right-4 bg-white rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 ${slide.badge.color} rounded-full flex items-center justify-center`}>
                    <i className={`${slide.badge.icon} text-3xl`}></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{slide.badge.label}</p>
                    <p className="font-bold text-gray-800 text-lg">{slide.badge.value}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10"
        >
          <i className="ri-arrow-left-line text-2xl text-gray-800"></i>
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10"
        >
          <i className="ri-arrow-right-line text-2xl text-gray-800"></i>
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center gap-3 mt-6">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              currentSlide === index 
                ? 'w-10 h-3 bg-[#0E8B86]' 
                : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Info */}
      <div className="flex items-center justify-between mt-3">
        <p className="text-sm text-gray-600 font-medium">
          {slides[currentSlide].title}
        </p>
        <p className="text-sm text-gray-600 font-medium">
          {currentSlide + 1} / {slides.length}
        </p>
      </div>
    </div>
  );
};

export default DoctorCarousel;
