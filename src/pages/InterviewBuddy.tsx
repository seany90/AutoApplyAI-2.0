import { User } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Mic, MessageSquare, PlayCircle } from 'lucide-react';

export default function InterviewBuddy({ user }: { user: User | null }) {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Interview Buddy 2.0</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-400" />
              Live Interview Coaching
            </CardTitle>
            <CardDescription>
              Real-time voice or text coaching during live interviews via browser extension layer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-slate-950 rounded-lg flex items-center justify-center border border-slate-800 mb-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Mic className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-slate-400 font-medium">Ready to listen</p>
              </div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Live Session</Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PlayCircle className="w-5 h-5 text-purple-400" />
                Mock Interviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4">
                AI simulates specific hiring managers based on company/role data.
              </p>
              <Button variant="outline" className="w-full border-slate-700">Configure Mock Interview</Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                Follow-up Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4">
                Context-aware follow-up email generator based on your latest interview.
              </p>
              <Button variant="outline" className="w-full border-slate-700">Generate Email</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
