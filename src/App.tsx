/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

// Pages (to be created)
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MyResume from './pages/MyResume';
import JobAnalyzer from './pages/JobAnalyzer';
import InterviewBuddy from './pages/InterviewBuddy';
import LearningLab from './pages/LearningLab';
import PowerTools from './pages/PowerTools';
import Onboarding from './pages/Onboarding';

// Components
import Navbar from './components/Navbar';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30">
        <Navbar user={user} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/onboarding" element={<Onboarding user={user} />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/resume" element={<MyResume user={user} />} />
            <Route path="/analyzer" element={<JobAnalyzer user={user} />} />
            <Route path="/interview" element={<InterviewBuddy user={user} />} />
            <Route path="/learning" element={<LearningLab user={user} />} />
            <Route path="/tools" element={<PowerTools user={user} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

