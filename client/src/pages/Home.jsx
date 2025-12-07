// src/pages/Home.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);

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
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      title: "Cardiology",
      description: "Track heart health metrics, monitor cardiac patients, and manage cardiology department workflows efficiently.",
      color: "from-pink-50 to-pink-100",
      textColor: "text-pink-600"
    },
    {
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
      title: "Check Up",
      description: "Regular health check-ups and preventive care tracking with automated reminders and screening schedules.",
      color: "from-[#0E8B86] to-[#28B99A]",
      textColor: "text-white",
      featured: true
    },
    {
      icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
      title: "Dental Care",
      description: "Whether you need a routine checkup or specialized dental care, our team is here for you.",
      color: "from-gray-50 to-gray-100",
      textColor: "text-gray-600"
    },
    {
      icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
      title: "Optimal Health",
      description: "Get insights into what might matter most to you with our optimal wellness assessments.",
      color: "from-blue-50 to-blue-100",
      textColor: "text-blue-600"
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
              <a href="#about" className="text-gray-600 hover:text-[#0E8B86] transition">About</a>
              <a href="#services" className="text-gray-600 hover:text-[#0E8B86] transition">Our Services</a>
              <a href="#doctors" className="text-gray-600 hover:text-[#0E8B86] transition">Doctor</a>
              <a href="#faq" className="text-gray-600 hover:text-[#0E8B86] transition">FAQ</a>
              <Link to="/login" className="bg-gradient-to-r from-[#0E8B86] to-[#28B99A] text-white px-6 py-2 rounded-lg hover:shadow-lg transition">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0E8B86] to-[#28B99A] text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2 mb-6">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Reduce Healthcare Risks</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Healthcare<br />
                <span className="text-yellow-300">Monitoring</span>
              </h1>
              
              <div className="flex items-center space-x-8 mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm">Replace Healthcare</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm">No More Medications</span>
                </div>
              </div>
              
              <p className="text-xl mb-8 text-teal-50">
                WHETHER YOU'RE LOOKING FOR<br />
                PREVENTIVE CARE, MANAGING A<br />
                CHRONIC CONDITION.
              </p>
              
              <Link 
                to="/signup"
                className="inline-flex items-center space-x-2 bg-yellow-400 text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-yellow-300 transition transform hover:scale-105 shadow-xl"
              >
                <span>Book Consultation</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&h=700&fit=crop" 
                alt="Healthcare Professional"
                className="rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-16 -mt-20 relative z-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Instant Video Consultation */}
            <div className="bg-gradient-to-br from-pink-400 to-pink-500 rounded-3xl p-8 text-white relative overflow-hidden transform hover:scale-105 transition">
              <div className="absolute right-0 bottom-0 opacity-10">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Instant Video</h3>
              <h3 className="text-2xl font-bold mb-4">Consultation</h3>
              <p className="text-pink-100 mb-6">Connect within 60 seconds</p>
              <button className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            {/* Instant Video Consultation 2 */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 text-white relative overflow-hidden transform hover:scale-105 transition">
              <div className="absolute right-0 bottom-0 opacity-10">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Instant Video</h3>
              <h3 className="text-2xl font-bold mb-4">Consultation</h3>
              <p className="text-orange-100 mb-6">Connect within 60 seconds</p>
              <button className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            {/* Live Health Consultation */}
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-3xl p-8 text-white relative overflow-hidden transform hover:scale-105 transition">
              <div className="absolute right-0 bottom-0 opacity-10">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Live Health</h3>
              <h3 className="text-2xl font-bold mb-4">Consultation</h3>
              <p className="text-blue-100 mb-6">Connect with top doctors</p>
              <button className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-4xl font-bold mb-4">Frequently</h2>
              <h2 className="text-4xl font-bold mb-6">Ask Questions</h2>
              <p className="text-gray-600 mb-8">
                Find Answers to Common<br />
                Questions About Our Services.
              </p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
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
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Services For Your Health</h2>
            <p className="text-gray-600">Your Health, Our Priority – Access Trusted Services Anytime</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div 
                key={index}
                className={`rounded-3xl p-8 ${service.featured ? 'bg-gradient-to-br ' + service.color : 'bg-gradient-to-br ' + service.color} transform hover:scale-105 transition shadow-lg`}
              >
                <div className={`w-16 h-16 ${service.featured ? 'bg-white bg-opacity-20' : 'bg-white'} rounded-2xl flex items-center justify-center mb-6`}>
                  <svg className={`w-8 h-8 ${service.featured ? 'text-white' : service.textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={service.icon} />
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold mb-3 ${service.featured ? 'text-white' : 'text-gray-800'}`}>{service.title}</h3>
                <p className={`mb-6 ${service.featured ? 'text-white text-opacity-90' : 'text-gray-600'}`}>{service.description}</p>
                <button className={`font-semibold ${service.featured ? 'text-white' : service.textColor} hover:underline`}>
                  Explore Now →
                </button>
              </div>
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
