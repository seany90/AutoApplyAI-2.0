import { User } from 'firebase/auth';
import { Navigate, useSearchParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { FileText, Upload, Download, Trash2, Loader2, Calendar, CheckCircle2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function MyResume({ user }: { user: User | null }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'original';
  
  const [resumeText, setResumeText] = useState('');
  const [tailoredResumes, setTailoredResumes] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchOriginalResume = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().resumeText) {
          setResumeText(docSnap.data().resumeText);
        }
      } catch (error) {
        console.error("Error fetching resume:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTailoredResumes = async () => {
      try {
        const q = query(collection(db, 'users', user.uid, 'tailoredResumes'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const resumes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        setTailoredResumes(resumes);
      } catch (error) {
        console.error("Error fetching tailored resumes:", error);
      } finally {
        setLoadingResumes(false);
      }
    };

    fetchOriginalResume();
    fetchTailoredResumes();
  }, [user]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await setDoc(doc(db, 'users', user.uid), { resumeText }, { merge: true });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving resume:", error);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: string) => {
    setResumeToDelete(id);
  };

  const handleDeleteTailored = async () => {
    if (!resumeToDelete) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'tailoredResumes', resumeToDelete));
      setTailoredResumes(prev => prev.filter(r => r.id !== resumeToDelete));
    } catch (error) {
      console.error("Error deleting resume:", error);
    } finally {
      setResumeToDelete(null);
    }
  };

  const handleDownload = (content: string, title: string) => {
    const doc = new jsPDF();
    doc.setFontSize(11);
    
    const margin = 15;
    const pageHeight = doc.internal.pageSize.height;
    const maxLineWidth = doc.internal.pageSize.width - margin * 2;
    
    // Split text to fit within page width
    const splitText = doc.splitTextToSize(content, maxLineWidth);
    
    let cursorY = margin;
    const lineHeight = 5; // approx 5mm for 11pt font
    
    for (let i = 0; i < splitText.length; i++) {
      if (cursorY > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(splitText[i], margin, cursorY);
      cursorY += lineHeight;
    }
    
    // Save the PDF
    doc.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_resume.pdf`);
  };

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      
      setResumeText(fullText.trim());
    } catch (error) {
      console.error("Error parsing PDF:", error);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Resume</h1>

      <Tabs value={defaultTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-900">
          <TabsTrigger value="original" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 hover:text-slate-200 transition-colors">Original Resume</TabsTrigger>
          <TabsTrigger value="generated" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 hover:text-slate-200 transition-colors">AI-Generated ATS Resumes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="original">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Source of Truth</CardTitle>
              <CardDescription>
                Paste your resume text here. The AI will use this as the foundation for all applications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
                </div>
              ) : (
                <div className="space-y-4">
                  <Textarea 
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your full resume text here..."
                    className="min-h-[400px] bg-slate-950 border-slate-800 font-mono text-sm text-slate-50 placeholder:text-slate-500"
                  />
                  <div className="flex justify-end gap-4">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                    />
                    <Button 
                      variant="outline" 
                      className="border-slate-700" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isImporting}
                    >
                      {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      {isImporting ? 'Importing...' : 'Import PDF'}
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                      {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : saveSuccess ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Saved!</> : 'Save Resume'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="generated">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Tailored Resumes</CardTitle>
              <CardDescription>
                Resumes generated specifically for each job application via the Job Analyzer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingResumes ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading generated resumes...
                </div>
              ) : tailoredResumes.length === 0 ? (
                <div className="text-center py-12 text-slate-400 border border-dashed border-slate-800 rounded-lg">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No generated resumes yet.</p>
                  <p className="text-sm mt-2">Use the Job Analyzer to tailor your resume for a specific role.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {tailoredResumes.map((resume) => (
                    <Card key={resume.id} className="bg-slate-950 border-slate-800 overflow-hidden">
                      <CardHeader className="pb-3 border-b border-slate-800/50 bg-slate-900/30">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-blue-400">{resume.jobTitle}</CardTitle>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {resume.createdAt.toLocaleDateString()}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full font-medium ${resume.matchScore >= 75 ? 'bg-green-500/10 text-green-400' : resume.matchScore >= 50 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
                                {resume.matchScore}% Match
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="max-h-60 overflow-y-auto p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap bg-slate-950/50">
                          {resume.content}
                        </div>
                      </CardContent>
                      <CardFooter className="bg-slate-900/50 border-t border-slate-800 p-3 flex justify-end gap-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDownload(resume.content, resume.jobTitle)}
                          className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-50 hover:text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => confirmDelete(resume.id)}
                          className="bg-red-900/50 text-red-400 hover:bg-red-900/80 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!resumeToDelete} onOpenChange={(open) => !open && setResumeToDelete(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle>Delete Tailored Resume</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete this tailored resume? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setResumeToDelete(null)} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTailored} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
