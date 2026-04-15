import { User } from 'firebase/auth';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, CheckCircle2, Zap, Shield, BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home({ user }: { user: User | null }) {
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 flex flex-col items-center text-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl px-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-8 border border-blue-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            AutoApplyAI Copilot is now live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            The AI Copilot for your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              job search.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Apply smarter, not harder. Our AI analyzes job descriptions to instantly tailor your resume and craft personalized cover letters that highlight your best fit for the role.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-full w-full sm:w-auto">
              Start 7-Day Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors">
              See How It Works
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="w-full py-24 border-t border-slate-800/50">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Instant Job Analysis</h3>
            <p className="text-slate-400 leading-relaxed">
              Paste any job description or URL. Our AI instantly breaks down the requirements, scores your match, and identifies critical skill gaps.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
              <BrainCircuit className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">No Hallucinations</h3>
            <p className="text-slate-400 leading-relaxed">
              Powered by GPT-4o and Gemini, grounded strictly in your uploaded resume. Every cover letter sounds like you.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Format Preserved</h3>
            <p className="text-slate-400 leading-relaxed">
              We rewrite your bullet points for ATS optimization, but export the PDF/DOCX in your exact original format.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="w-full py-24 border-t border-slate-800/50 flex flex-col items-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center">Simple, flat pricing.</h2>
        <p className="text-slate-400 mb-12 text-center max-w-xl">No credits, no hidden fees. 30-day money-back guarantee.</p>
        
        <div className="w-full max-w-md p-8 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
            MOST POPULAR
          </div>
          <h3 className="text-2xl font-bold mb-2">Pro Copilot</h3>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-5xl font-extrabold">$29</span>
            <span className="text-slate-400">/month</span>
          </div>
          
          <ul className="space-y-4 mb-8">
            {['Unlimited AI Cover Letters', 'Advanced ATS Scoring', 'Format-Preserving Resume Export', 'Interview Buddy 2.0', 'Learning Lab Access'].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          <Button className="w-full h-12 text-lg bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-bold">
            Start 7-Day Trial
          </Button>
        </div>
      </section>
    </div>
  );
}
