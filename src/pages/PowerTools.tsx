import { User } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Linkedin, Globe, DollarSign, Lock } from 'lucide-react';

export default function PowerTools({ user }: { user: User | null }) {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Power Tools</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-blue-500" />
              LinkedIn to Resume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-sm mb-4">
              One-click import and optimization of your LinkedIn profile into a professional ATS-friendly resume.
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Connect LinkedIn</Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-500" />
              Resume Translator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-sm mb-4">
              Translate your resume into 50+ languages while perfectly preserving the original formatting.
            </p>
            <Button variant="outline" className="w-full border-slate-700">Select Language</Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Salary Negotiation Coach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-sm mb-4">
              Role-play salary negotiations with an AI trained on current market data and proven negotiation tactics.
            </p>
            <Button variant="outline" className="w-full border-slate-700">Start Session</Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-400" />
              Privacy Vault
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-sm mb-4">
              Manage your AES-256 encrypted data. View what we store, export your data, or delete your account.
            </p>
            <Button variant="outline" className="w-full border-slate-700 text-red-400 hover:text-red-300 hover:bg-red-950/30">Manage Data</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
