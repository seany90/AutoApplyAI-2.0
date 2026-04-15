import { User } from 'firebase/auth';
import { Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function Onboarding({ user }: { user: User | null }) {
  const [step, setStep] = useState(1);
  const [resumeText, setResumeText] = useState('');
  const [roles, setRoles] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleComplete = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        resumeText,
        targetRoles: roles,
        onboardingComplete: true,
        createdAt: new Date()
      }, { merge: true });
      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving onboarding data:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-slate-400 mb-2">
          <span>Step {step} of 2</span>
          <span>{step === 1 ? 'Resume' : 'Preferences'}</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-blue-500 h-full transition-all duration-300" 
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Upload Your Resume</h1>
            <p className="text-slate-400">Paste your resume text below. We'll use this to generate your tailored applications.</p>
          </div>
          
          <Textarea 
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your full resume here..."
            className="min-h-[300px] bg-slate-900 border-slate-700"
          />
          
          <Button 
            onClick={() => setStep(2)} 
            disabled={!resumeText.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Target Roles</h1>
            <p className="text-slate-400">What kind of jobs are you looking for?</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label>Dream Roles (comma separated)</Label>
              <Input 
                value={roles}
                onChange={(e) => setRoles(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer, Full Stack Developer"
                className="bg-slate-900 border-slate-700 mt-1"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep(1)} className="w-full border-slate-700">Back</Button>
            <Button 
              onClick={handleComplete} 
              disabled={saving || !roles.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {saving ? 'Saving...' : 'Complete Setup'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
