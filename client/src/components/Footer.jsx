import React from 'react';
import { Hotel, Heart, ShieldCheck, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                <Hotel className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Hotel<span className="text-sky-400">Pro</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              World-class hospitality management and real-time room reservations. Engineered with production-grade MERN architecture.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Explore Suites
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/?type=Single" className="hover:text-white transition-colors">Single Cozy Rooms</Link></li>
              <li><Link to="/?type=Double" className="hover:text-white transition-colors">Double City View</Link></li>
              <li><Link to="/?type=Deluxe" className="hover:text-white transition-colors">Oceanfront Deluxe</Link></li>
              <li><Link to="/?type=Executive Suite" className="hover:text-white transition-colors">Executive Club Suites</Link></li>
              <li><Link to="/?type=Presidential Suite" className="hover:text-white transition-colors">Presidential Penthouse</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Platform Guarantees
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Zero Double-Booking Guarantee
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                Real-Time Availability Engine
              </li>
              <li className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Instant Confirmation & Keys
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Contact & Concierge
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              777 Grand Boulevard, Marina Bay
            </p>
            <p className="text-xs text-slate-400">concierge@hotelpro.com</p>
            <p className="text-xs text-slate-400">+1 (800) 555-HOTEL</p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} HotelPro Management Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> by HotelPro Engineering
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
