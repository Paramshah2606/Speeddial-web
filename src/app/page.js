"use client";
import React, { useState, useEffect } from 'react';
import { Phone, Video, Users, Zap, Shield, Clock, ArrowRight, PhoneCall, Monitor, Menu, X } from 'lucide-react';

export default function SpeedDialLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Animate elements on scroll
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 100;
        if (isVisible) {
          el.classList.add('animated');
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Instant Setup",
      description: "Sign up in seconds with just username and password"
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Quick Dialing",
      description: "Connect using simple 6-digit numbers"
    },
    {
      icon: <Video className="w-5 h-5" />,
      title: "Video & Audio",
      description: "Crystal-clear HD calls with seamless switching"
    },
    {
      icon: <Monitor className="w-5 h-5" />,
      title: "Screen Sharing",
      description: "Share your screen for collaboration"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Call History",
      description: "Track all your calls with comprehensive logs"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Secure & Private",
      description: "End-to-end encryption for all conversations"
    }
  ];

const technologies = [
  { 
    name: "Next.js", 
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" 
  },
  { 
    name: "Node.js", 
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" 
  },
  { 
    name: "Socket.io", 
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/socketio/socketio-original.svg" 
  },
  { 
    name: "Agora", 
    icon: "https://cdnjs.cloudflare.com/ajax/libs/simple-icons/15.16.0/agora.svg" 
  },
  { 
    name: "MySQL", 
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" 
  },
  { 
    name: "Sequelize", 
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sequelize/sequelize-original.svg" 
  },
  { 
    name: "Tailwind CSS", 
    icon: "/tailwind-logo-wbg.png"
  }
];

  const handleGetStarted = () => {
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <style>{`
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .animate-on-scroll.animated {
          opacity: 1;
          transform: translateY(0);
        }
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        .pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .slide-up {
          animation: slideUp 0.5s ease-out forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SpeedDial
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                How It Works
              </a>
              <a href="#technology" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                Technology
              </a>
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white text-gray-700"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 slide-up">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Features
              </a>
              <a href="#how-it-works" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                How It Works
              </a>
              <a href="#technology" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                Technology
              </a>
              <button
                onClick={handleGetStarted}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl float-animation"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl float-animation" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-6 animate-on-scroll animated">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Lightning Fast Communication</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight animate-on-scroll animated" style={{animationDelay: '0.1s'}}>
              Connect Instantly with
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                6-Digit Simplicity
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto animate-on-scroll animated" style={{animationDelay: '0.2s'}}>
              No phone numbers. No complications. Just seamless video and audio calls with anyone, anywhere.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-on-scroll animated" style={{animationDelay: '0.3s'}}>
              <button
                onClick={handleGetStarted}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                Start Calling Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 rounded-2xl text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
              >
                See How It Works
              </button>
            </div>

            {/* Hero Illustration */}
            <div className="mt-16 relative animate-on-scroll animated" style={{animationDelay: '0.4s'}}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl pulse-slow"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md mx-auto border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-transform duration-300">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 mb-6 border-2 border-gray-200 dark:border-gray-700">
                  <div className="text-4xl sm:text-5xl font-mono font-bold text-gray-800 dark:text-gray-100 tracking-wider">
                    123456
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Your Virtual Number</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <div
                      key={num}
                      className="aspect-square rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl font-semibold text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 hover:scale-110 hover:bg-blue-50 dark:hover:bg-gray-600 transition-all cursor-pointer"
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Everything You Need to Connect
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful features designed for effortless communication
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-on-scroll"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              From signup to your first call in under a minute
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: "01",
                title: "Sign Up Instantly",
                description: "Create your account with just a username and password. No email verification or phone number required.",
                icon: <Users className="w-8 h-8" />
              },
              {
                step: "02",
                title: "Get Your Number",
                description: "Receive your unique 6-digit virtual number immediately. Share it with anyone you want to connect with.",
                icon: <Phone className="w-8 h-8" />
              },
              {
                step: "03",
                title: "Start Calling",
                description: "Dial any 6-digit number and connect instantly. Enjoy HD video, audio, and screen sharing right away.",
                icon: <PhoneCall className="w-8 h-8" />
              }
            ].map((step, index) => (
              <div key={index} className="relative animate-on-scroll" style={{animationDelay: `${index * 0.15}s`}}>
                {index < 2 && (
                  <div className="hidden md:block absolute top-24 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 -translate-x-1/2 z-0"></div>
                )}
                <div className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:scale-105">
                  <div className='flex gap-10'>
                  <div className="text-5xl font-bold text-blue-500 dark:text-gray-200 mb-4">
                    {step.step}
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white mb-6 shadow-lg transform hover:rotate-12 transition-transform">
                    {step.icon}
                  </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Powered by industry-leading tools and frameworks
            </p>
          </div>

          {/* <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {technologies.map((tech, index) => (
              <div
                key={index}
                className="group animate-on-scroll"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`bg-gradient-to-br ${tech.color} p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300 cursor-pointer`}>
                  <div className="text-center">
                    <div className="mb-3 transform group-hover:scale-125 transition-transform flex justify-center">
                      {tech.icon}
                    </div>
                    <p className="text-white font-semibold text-sm">{tech.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div> */}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
  {technologies.map((tech, index) => (
    <div
      key={index}
      className="group animate-on-scroll"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div
        className="
          p-6 rounded-2xl 
          bg-white/10 dark:bg-white/5
          backdrop-blur-md
          border border-white/20 dark:border-white/10
          shadow-lg hover:shadow-xl
          transform hover:scale-105
          transition-all duration-300 cursor-pointer
        "
      >
        <div className="text-center">
          <img
            src={tech.icon}
            alt={tech.name}
            className="w-12 h-12 mx-auto mb-3 group-hover:scale-125 transition-transform "
          />

          <p className="text-gray-800 dark:text-gray-200 font-semibold text-sm">
            {tech.name}
          </p>
        </div>
      </div>
    </div>
  ))}
</div>


        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto animate-on-scroll">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-3xl p-12 sm:p-16 text-center shadow-2xl bg-[length:200%_100%] hover:bg-[position:100%_0] transition-all duration-1000">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Ready to Experience the Future of Calling?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of users enjoying seamless communication with SpeedDial.
              </p>
              <button
                onClick={handleGetStarted}
                className="group bg-white text-blue-600 px-10 py-5 rounded-2xl text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 inline-flex items-center gap-3"
              >
                Get Your Number Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SpeedDial
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              Lightning-fast communication made simple. Connect with anyone using just 6 digits.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              © 2024 SpeedDial. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}