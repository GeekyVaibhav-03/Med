import { useState } from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  const [activeTab, setActiveTab] = useState('mission');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const teamMembers = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Medical Officer',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
      bio: 'Leading infectious disease expert with 15+ years experience',
      specialization: 'Infectious Diseases',
      credentials: 'MD, PhD'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Head of Technology',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
      bio: 'Healthcare IT specialist revolutionizing patient care',
      specialization: 'Health Informatics',
      credentials: 'PhD, MSc'
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Epidemiologist',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
      bio: 'Expert in disease surveillance and outbreak management',
      specialization: 'Epidemiology',
      credentials: 'MD, MPH'
    },
    {
      name: 'James Williams',
      role: 'Lead Developer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      bio: 'Full-stack engineer specializing in healthcare solutions',
      specialization: 'Software Engineering',
      credentials: 'BSc Computer Science'
    },
    {
      name: 'Dr. Priya Sharma',
      role: 'Clinical Advisor',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
      bio: 'Hospital administration and infection control specialist',
      specialization: 'Hospital Management',
      credentials: 'MD, MBA'
    },
    {
      name: 'David Thompson',
      role: 'Data Scientist',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      bio: 'AI and machine learning expert in healthcare analytics',
      specialization: 'Data Science',
      credentials: 'PhD Data Science'
    }
  ];

  const features = [
    {
      icon: 'ri-shield-check-line',
      title: 'Advanced Security',
      description: 'Bank-level encryption and HIPAA compliance ensuring patient data protection'
    },
    {
      icon: 'ri-time-line',
      title: 'Real-Time Tracking',
      description: 'Instant RFID-based location monitoring and contact tracing capabilities'
    },
    {
      icon: 'ri-line-chart-line',
      title: 'Predictive Analytics',
      description: 'AI-powered insights to prevent outbreaks before they spread'
    },
    {
      icon: 'ri-team-line',
      title: 'Collaborative Platform',
      description: 'Seamless communication between healthcare teams and departments'
    },
    {
      icon: 'ri-notification-3-line',
      title: 'Smart Alerts',
      description: 'Automated notifications for high-risk contacts and critical events'
    },
    {
      icon: 'ri-dashboard-line',
      title: 'Comprehensive Dashboard',
      description: 'Intuitive interface providing actionable insights at a glance'
    }
  ];

  const stats = [
    { value: '50+', label: 'Healthcare Facilities', icon: 'ri-hospital-line' },
    { value: '10K+', label: 'Daily Trackings', icon: 'ri-map-pin-line' },
    { value: '99.9%', label: 'Uptime', icon: 'ri-time-line' },
    { value: '24/7', label: 'Support', icon: 'ri-customer-service-2-line' }
  ];

  const milestones = [
    { year: '2020', title: 'Founded', description: 'MedWatch was established to combat MDR infections' },
    { year: '2021', title: 'First Deployment', description: 'Launched in 5 major hospitals across the country' },
    { year: '2022', title: 'AI Integration', description: 'Introduced machine learning for outbreak prediction' },
    { year: '2023', title: 'National Recognition', description: 'Awarded Best Healthcare Innovation by Ministry of Health' },
    { year: '2024', title: 'Global Expansion', description: 'Extended services to 10 countries worldwide' },
    { year: '2025', title: 'Next Generation', description: 'Launching MedWatch 2.0 with advanced features' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50">
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
              <Link to="/" className="text-gray-600 hover:text-[#0E8B86] transition">Home</Link>
              <Link to="/about" className="text-[#0E8B86] font-semibold">About</Link>
              <a href="/#services" className="text-gray-600 hover:text-[#0E8B86] transition">Our Services</a>
              <a href="/#faq" className="text-gray-600 hover:text-[#0E8B86] transition">FAQ</a>
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
              <Link to="/" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">Home</Link>
              <Link to="/about" className="block px-4 py-2 bg-teal-50 text-[#0E8B86] font-semibold rounded-lg">About</Link>
              <a href="/#services" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">Our Services</a>
              <a href="/#faq" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">FAQ</a>
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

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#064e4a] via-[#0a6b66] to-[#064e4a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About <span className="text-[#FBBF24]">MedWatch</span>
            </h1>
            <p className="text-xl md:text-2xl text-teal-100 max-w-3xl mx-auto mb-8">
              Revolutionizing healthcare with advanced MDR contact tracing and real-time monitoring solutions
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/login"
                className="bg-[#FBBF24] hover:bg-[#FCD34D] text-gray-900 font-bold px-8 py-3 rounded-full transition-all transform hover:scale-105"
              >
                Get Started
              </Link>
              <a
                href="#contact"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold px-8 py-3 rounded-full border border-white/20 transition-all"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0E8B86] to-[#28B99A] rounded-full flex items-center justify-center mb-4">
                  <i className={`${stat.icon} text-3xl text-white`}></i>
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600 font-semibold">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission, Vision, Values Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {['mission', 'vision', 'values'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-full font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-[#0E8B86] to-[#28B99A] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="transition-all duration-300">
            {activeTab === 'mission' && (
              <div className="text-center max-w-4xl mx-auto">
                <i className="ri-rocket-line text-6xl text-[#0E8B86] mb-6 block"></i>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To empower healthcare facilities worldwide with cutting-edge technology that prevents the spread 
                  of Multi-Drug Resistant (MDR) infections through intelligent contact tracing, real-time monitoring, 
                  and predictive analytics. We are committed to saving lives by enabling rapid response to potential 
                  outbreaks and ensuring the safety of both patients and healthcare workers.
                </p>
              </div>
            )}

            {activeTab === 'vision' && (
              <div className="text-center max-w-4xl mx-auto">
                <i className="ri-eye-line text-6xl text-[#0E8B86] mb-6 block"></i>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Vision</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To become the global standard for infection control and contact tracing in healthcare facilities, 
                  creating a world where MDR infections are detected, tracked, and contained before they can spread. 
                  We envision a future where every hospital is equipped with intelligent systems that protect vulnerable 
                  patients and enable healthcare professionals to focus on what they do best - providing excellent care.
                </p>
              </div>
            )}

            {activeTab === 'values' && (
              <div className="max-w-4xl mx-auto">
                <i className="ri-heart-pulse-line text-6xl text-[#0E8B86] mb-6 block text-center"></i>
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Core Values</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { title: 'Patient Safety First', desc: 'Every decision prioritizes patient wellbeing and safety' },
                    { title: 'Innovation', desc: 'Continuously improving through technology and research' },
                    { title: 'Data Privacy', desc: 'Unwavering commitment to protecting sensitive health information' },
                    { title: 'Collaboration', desc: 'Working together with healthcare professionals globally' },
                    { title: 'Excellence', desc: 'Maintaining the highest standards in everything we do' },
                    { title: 'Accessibility', desc: 'Making advanced healthcare technology available to all' }
                  ].map((value, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#0E8B86] to-[#28B99A] rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="ri-checkbox-circle-line text-2xl text-white"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 mb-1">{value.title}</h3>
                        <p className="text-sm text-gray-600">{value.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-br from-gray-100 to-teal-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose MedWatch?</h2>
            <p className="text-xl text-gray-600">Advanced features designed for modern healthcare</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#0E8B86] to-[#28B99A] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className={`${feature.icon} text-3xl text-white`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Journey</h2>
          <p className="text-xl text-gray-600">Milestones that shaped MedWatch</p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#0E8B86] to-[#28B99A]"></div>

          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`flex items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className="flex-1 md:text-right">
                  {index % 2 === 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                      <div className="text-3xl font-bold text-[#0E8B86] mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  )}
                </div>

                <div className="hidden md:flex w-12 h-12 bg-gradient-to-br from-[#0E8B86] to-[#28B99A] rounded-full items-center justify-center shadow-lg z-10 flex-shrink-0">
                  <i className="ri-checkbox-circle-fill text-2xl text-white"></i>
                </div>

                <div className="flex-1">
                  {index % 2 !== 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                      <div className="text-3xl font-bold text-[#0E8B86] mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gradient-to-br from-gray-100 to-teal-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">Experts dedicated to revolutionizing healthcare</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all group"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-white font-bold text-xl mb-1">{member.name}</div>
                    <div className="text-[#FBBF24] font-semibold">{member.credentials}</div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#0E8B86] to-[#28B99A] rounded-lg flex items-center justify-center">
                      <i className="ri-briefcase-line text-white"></i>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Role</div>
                      <div className="font-bold text-gray-800">{member.role}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">{member.bio}</div>
                  <div className="flex items-center gap-2 text-sm">
                    <i className="ri-award-line text-[#0E8B86]"></i>
                    <span className="text-gray-600">{member.specialization}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-[#064e4a] via-[#0a6b66] to-[#064e4a] rounded-2xl p-12 text-white text-center">
          <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Ready to transform your healthcare facility? Contact us today for a demo.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
              <i className="ri-mail-line text-2xl text-[#FBBF24]"></i>
              <span>contact@medwatch.com</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
              <i className="ri-phone-line text-2xl text-[#FBBF24]"></i>
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
              <i className="ri-map-pin-line text-2xl text-[#FBBF24]"></i>
              <span>Healthcare Innovation Hub, USA</span>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="bg-[#FBBF24] hover:bg-[#FCD34D] text-gray-900 font-bold px-8 py-3 rounded-full transition-all transform hover:scale-105"
            >
              Schedule Demo
            </Link>
            <a
              href="mailto:contact@medwatch.com"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold px-8 py-3 rounded-full border border-white/20 transition-all"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
