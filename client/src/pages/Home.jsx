import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, MapPin, Package, Trophy, Leaf, ArrowRight, CheckCircle } from 'lucide-react';

const FEATURES = [
  { icon: <Recycle size={22} className="text-green-400" />, title: 'Log E-Waste', desc: 'Categorize and track all your electronic waste items in one place.' },
  { icon: <Package size={22} className="text-blue-400" />, title: 'Schedule Pickups', desc: 'Book a free doorstep collection at your preferred time slot.' },
  { icon: <MapPin size={22} className="text-yellow-400" />, title: 'Find Centers', desc: 'Locate certified recycling centers near you on an interactive map.' },
  { icon: <Trophy size={22} className="text-purple-400" />, title: 'Earn Rewards', desc: 'Collect points for every item recycled and climb the leaderboard.' },
];

const STEPS = [
  { num: '01', title: 'Register for Free', desc: 'Create your account in under a minute.' },
  { num: '02', title: 'Add Your E-Waste', desc: 'Log items like laptops, phones, cables, and more.' },
  { num: '03', title: 'Schedule a Pickup', desc: 'We collect from your doorstep — no hassle.' },
  { num: '04', title: 'Earn & Track', desc: 'Get points, track your CO₂ impact, and level up.' },
];

const STATS = [
  { value: '48K+', label: 'Items Recycled' },
  { value: '320',  label: 'Partner Centers' },
  { value: '98t',  label: 'CO₂ Offset' },
  { value: '12K+', label: 'Happy Users' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-slate-900 to-slate-900 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6">
              <Leaf size={14} /> India's Smart E-Waste Platform
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              Recycle Smart.<br />
              <span className="text-green-400">Earn Green</span><br />
              Points.
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl mb-10 max-w-xl leading-relaxed">
              Connect with certified e-waste recycling centers near you.
              Schedule free pickups, track your environmental impact, and earn rewards.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary inline-flex items-center justify-center gap-2 py-3 px-8 text-base">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link to="/map" className="btn-secondary inline-flex items-center justify-center gap-2 py-3 px-8 text-base">
                <MapPin size={18} /> Find Centers
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-5">
              {['No credit card required', 'Free pickups', 'Earn real rewards'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-slate-400 text-sm">
                  <CheckCircle size={15} className="text-green-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-green-500 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-extrabold text-slate-900">{stat.value}</div>
                <div className="text-slate-900/70 text-sm mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Everything You Need</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">
              A complete platform for responsible e-waste disposal.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6 hover:border-slate-600 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-slate-700/50 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                <div className="text-5xl font-extrabold text-green-500/20 mb-4">{step.num}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-slate-700 -translate-x-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-5xl mb-6">🌍</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Join the E-Waste Revolution
          </h2>
          <p className="text-slate-300 mb-8 text-lg">
            Be part of India's growing community of responsible recyclers.
            Every device you recycle makes a difference.
          </p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 py-3 px-8 text-base">
            Start Recycling Today <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800/50 border-t border-slate-700/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            © 2025 e-Collect Go. Built to make India cleaner. 🇮🇳
          </p>
        </div>
      </footer>
    </div>
  );
}
