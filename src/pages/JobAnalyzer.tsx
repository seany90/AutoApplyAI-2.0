import { User } from 'firebase/auth';
import { Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Briefcase, CheckCircle2, AlertCircle, FileText, Download, Save, Loader2, ArrowRight } from 'lucide-react';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { GoogleGenAI } from '@google/genai';
import { jsPDF } from 'jspdf';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function JobAnalyzer({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [originalResume, setOriginalResume] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchResume = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().resumeText) {
        setOriginalResume(docSnap.data().resumeText);
      }
    };
    fetchResume();
  }, [user]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleAnalyze = async () => {
    if (!jobUrl && !jobDescription) return;
    if (!originalResume) {
      alert("Please save your original resume in the 'My Resume' tab first.");
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const prompt = `
        You are an expert ATS (Applicant Tracking System) and technical recruiter.
        Analyze the following user's resume against the provided job description.
        
        User's Resume:
        ${originalResume}
        
        Job Description:
        ${jobDescription || `Job URL: ${jobUrl} (Please infer the likely requirements if URL is provided without description, but prefer the description if available)`}
        
        Provide a JSON response with the following structure exactly (no markdown formatting, just raw JSON):
        {
          "matchScore": <number between 0 and 100 representing the match percentage>,
          "strengths": [<array of 3-5 strings highlighting matching skills/experience based STRICTLY on the user's actual resume>],
          "gaps": [<array of 3-5 strings highlighting missing skills or weak points>],
          "tailoredResume": "<string containing the user's resume tailored to this specific job, optimizing keywords without lying about years of experience>",
          "coverLetter": "<string containing a professional, tailored cover letter>"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const resultText = response.text;
      if (resultText) {
        const parsedResult = JSON.parse(resultText);
        setAnalysisResult(parsedResult);
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (error) {
      console.error("Error analyzing job:", error);
      alert("Failed to analyze job. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveTailoredResume = async () => {
    if (!analysisResult || !user) return;
    
    setIsSaving(true);
    try {
      const resumesRef = collection(db, 'users', user.uid, 'tailoredResumes');
      await addDoc(resumesRef, {
        jobTitle: jobUrl ? `Job from ${new URL(jobUrl).hostname}` : 'Custom Job Description',
        jobUrl: jobUrl || null,
        matchScore: analysisResult.matchScore,
        content: analysisResult.tailoredResume,
        coverLetter: analysisResult.coverLetter,
        createdAt: serverTimestamp()
      });
      
      navigate('/resume?tab=generated');
    } catch (error) {
      console.error("Error saving tailored resume:", error);
      alert("Failed to save tailored resume.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = (content: string, title: string) => {
    const doc = new jsPDF();
    doc.setFontSize(11);
    
    const margin = 15;
    const pageHeight = doc.internal.pageSize.height;
    const maxLineWidth = doc.internal.pageSize.width - margin * 2;
    
    const splitText = doc.splitTextToSize(content, maxLineWidth);
    
    let cursorY = margin;
    const lineHeight = 5;
    
    for (let i = 0; i < splitText.length; i++) {
      if (cursorY > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(splitText[i], margin, cursorY);
      cursorY += lineHeight;
    }
    
    doc.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Job Analyzer</h1>
        <p className="text-slate-400">Paste a job URL or description to generate a tailored resume and cover letter.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">Job Details</CardTitle>
              <CardDescription>Provide the job posting details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Job URL (Optional)</label>
                <Input 
                  placeholder="https://linkedin.com/jobs/..." 
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-50 placeholder:text-slate-500"
                />
              </div>
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase">OR</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Raw Job Description</label>
                <Textarea 
                  placeholder="Paste the full job description here..." 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[200px] bg-slate-950 border-slate-800 text-slate-50 placeholder:text-slate-500"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || (!jobUrl && !jobDescription)} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Match...
                  </>
                ) : (
                  <>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Analyze & Tailor Resume
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          {!analysisResult && !isAnalyzing && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/50">
              <Briefcase className="w-12 h-12 mb-4 opacity-20" />
              <p>Enter job details and click Analyze to see your match score</p>
              <p className="text-sm mt-2">and generate a tailored application package.</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 border border-slate-800 rounded-xl bg-slate-900">
              <Loader2 className="w-12 h-12 mb-4 animate-spin text-blue-500" />
              <p className="text-lg font-medium text-white mb-2">AI is analyzing the job...</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Extracting key requirements</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Comparing against your base resume</li>
                <li className="flex items-center gap-2 animate-pulse"><ArrowRight className="w-4 h-4 text-blue-500" /> Tailoring bullet points for ATS</li>
              </ul>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Match Score Card */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Match Analysis</CardTitle>
                      <CardDescription>How well your profile fits this role</CardDescription>
                    </div>
                    <div className="text-right">
                      <span className={`text-3xl font-bold ${analysisResult.matchScore >= 75 ? 'text-green-500' : analysisResult.matchScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {analysisResult.matchScore}%
                      </span>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Match Score</p>
                    </div>
                  </div>
                  <Progress value={analysisResult.matchScore} className="h-2 mt-4" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4" /> Strengths
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.strengths.map((strength: string, i: number) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">•</span> {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-400 flex items-center gap-2 mb-3">
                      <AlertCircle className="w-4 h-4" /> Missing / Weak Gaps
                    </h4>
                    <ul className="space-y-2">
                      {analysisResult.gaps.map((gap: string, i: number) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-yellow-500 mt-0.5">•</span> {gap}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Generated Content Tabs */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Tailored Application Package</CardTitle>
                      <CardDescription>Optimized for ATS and humanized for recruiters</CardDescription>
                    </div>
                    <Button onClick={handleSaveTailoredResume} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                      {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save to My Resumes
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="resume" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-950">
                      <TabsTrigger value="resume" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 hover:text-slate-200 transition-colors">Tailored Resume</TabsTrigger>
                      <TabsTrigger value="coverletter" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 hover:text-slate-200 transition-colors">Cover Letter</TabsTrigger>
                    </TabsList>
                    <TabsContent value="resume" className="space-y-4">
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDownloadPdf(analysisResult.tailoredResume, 'tailored_resume')}
                          className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-50 hover:text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Resume PDF
                        </Button>
                      </div>
                      <Textarea 
                        readOnly 
                        value={analysisResult.tailoredResume} 
                        className="min-h-[400px] font-mono text-sm bg-slate-950 border-slate-800 text-slate-50"
                      />
                    </TabsContent>
                    <TabsContent value="coverletter" className="space-y-4">
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDownloadPdf(analysisResult.coverLetter, 'cover_letter')}
                          className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-50 hover:text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Cover Letter PDF
                        </Button>
                      </div>
                      <Textarea 
                        readOnly 
                        value={analysisResult.coverLetter} 
                        className="min-h-[400px] font-mono text-sm bg-slate-950 border-slate-800 text-slate-50"
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
