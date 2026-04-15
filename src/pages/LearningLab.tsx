import { User } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { BookOpen, Search, Target, List, HelpCircle, Brain } from 'lucide-react';
import { useState } from 'react';

export default function LearningLab({ user }: { user: User | null }) {
  const [topic, setTopic] = useState('');

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const tools = [
    {
      title: "Learn Anything in 20 Hours",
      icon: <Target className="w-5 h-5 text-blue-400" />,
      desc: "Build me a 20-hour plan focused on the 20% that drives 80% of results."
    },
    {
      title: "One-Page Cheat Sheet",
      icon: <BookOpen className="w-5 h-5 text-emerald-400" />,
      desc: "Summarize key concepts on a single page using bullet points and diagrams."
    },
    {
      title: "Quiz Me Until I Break",
      icon: <HelpCircle className="w-5 h-5 text-red-400" />,
      desc: "10 progressively harder questions. Grade me and explain what I missed."
    },
    {
      title: "Build a Learning Ladder",
      icon: <List className="w-5 h-5 text-purple-400" />,
      desc: "Break topic into 5 difficulty levels with a clear milestone at each step."
    },
    {
      title: "Find the Best Resources",
      icon: <Search className="w-5 h-5 text-amber-400" />,
      desc: "List the top 5 resources and explain why each is worth my time."
    },
    {
      title: "Feynman Technique",
      icon: <Brain className="w-5 h-5 text-cyan-400" />,
      desc: "Explain in simplest terms, have me re-explain, point out gaps."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Learning Lab</h1>
      <p className="text-slate-400 mb-8">Master new skills for your target roles with AI-powered learning frameworks.</p>
      
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-8 flex gap-4">
        <Input 
          placeholder="What do you want to learn? (e.g., System Design, React Server Components)" 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="bg-slate-950 border-slate-700 text-lg h-14"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, i) => (
          <Card key={i} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-slate-950 group-hover:scale-110 transition-transform">
                  {tool.icon}
                </div>
                {tool.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">{tool.desc}</p>
              <Button variant="ghost" className="w-full mt-4 text-slate-300 hover:text-white hover:bg-slate-800">
                Generate Plan
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
