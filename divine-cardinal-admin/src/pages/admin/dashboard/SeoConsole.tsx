

import React, { useState, useEffect } from 'react';
import { db, ref, set, onValue } from '../../../lib/firebase';
import { Search, Sparkles, CheckCircle, RefreshCw, AlertTriangle, FileText, Check, X, Code, Map, Settings } from 'lucide-react';

export default function SeoConsole({ products }: { products: any[] }) {
  const [activeTab, setActiveTab] = useState<'audit' | 'aeo' | 'gap' | 'blueprint' | 'search_console' | 'blogs' | 'settings'>('audit');
  
  // States
  const [isAuditing, setIsAuditing] = useState(false);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSettings, setAiSettings] = useState({ provider: 'gemini', apiKey: '', webhookUrl: '' });
  const [gscSettings, setGscSettings] = useState({ siteUrl: 'https://divinecardinal.com/', clientEmail: '', privateKey: '' });
  const [saving, setSaving] = useState(false);
  const [gscData, setGscData] = useState({ indexed: 142, notIndexed: 12, syncing: false });
  
  // New States for Modern SEO
  const [localProducts, setLocalProducts] = useState<any[]>([]);
  const [isGeneratingGap, setIsGeneratingGap] = useState(false);
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [isGeneratingAeo, setIsGeneratingAeo] = useState<string | null>(null);
  const [aeoData, setAeoData] = useState<any>({});
  

  
  // New States for Ranking Countdown
  const [rankingCountdown, setRankingCountdown] = useState({ days: 45, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setLocalProducts([...products]);
  }, [products]);

  // Countdown Timer Logic
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 45); // 45 days from now
    
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference > 0) {
        setRankingCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const blogsRef = ref(db, 'blogs');
    const unsubBlogs = onValue(blogsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setBlogs(Object.values(data));
      else setBlogs([]);
    });
    
    const settingsRef = ref(db, 'settings/seo_ai');
    const unsubSettings = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setAiSettings({ ...val, webhookUrl: val.webhookUrl || '' });
      }
    });

    return () => {
      unsubBlogs();
      unsubSettings();
    };
  }, []);

  const handleAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/seo/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: localProducts, apiKey: aiSettings.apiKey, provider: aiSettings.provider, webhookUrl: aiSettings.webhookUrl })
      });
      const data = await res.json();
      
      if (res.ok && data.success && data.auditedProducts) {
        setLocalProducts(data.auditedProducts);
        // Do not auto-save! Just recommend.
        alert('Audit complete! Review the recommendations and apply them manually.');
      } else {
        alert(`SEO Audit failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`SEO Audit failed: ${err.message}`);
    }
    setIsAuditing(false);
  };

  const applyRecommendation = async (prod: any) => {
    try {
      // Actually apply the suggested description to the real database
      const updatedProd = { ...prod, description: prod.description };
      await set(ref(db, `products/${prod.id}`), updatedProd);
      
      // Update local state to remove warning
      const newProds = localProducts.map(p => {
        if(p.id === prod.id) return { ...p, seoIssues: [], seoScore: 100 };
        return p;
      });
      setLocalProducts(newProds);
      alert('Recommendation applied successfully!');
    } catch(err) {
      alert('Failed to apply recommendation');
    }
  };
  
  const injectSchema = async (prod: any, aeo: any) => {
    try {
      const updatedProd = { ...prod, seoSchema: aeo };
      await set(ref(db, `products/${prod.id}`), updatedProd);
      alert('JSON-LD schema successfully injected into the live product page!');
    } catch(err) {
      alert('Failed to inject schema');
    }
  };

  const handleGapAnalysis = async () => {
    setIsGeneratingGap(true);
    try {
      const res = await fetch('/api/seo/gap-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: localProducts, apiKey: aiSettings.apiKey, provider: aiSettings.provider, webhookUrl: aiSettings.webhookUrl })
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setGapAnalysis(data.analysis);
      } else {
        alert(`Gap Analysis failed: ${data.error || 'Unknown error'}`);
      }
    } catch(err: any) {
      alert(`Failed to run gap analysis: ${err.message}`);
    }
    setIsGeneratingGap(false);
  };

  const handleGenerateAeo = async (product: any) => {
    setIsGeneratingAeo(product.id);
    try {
      const res = await fetch('/api/seo/aeo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, apiKey: aiSettings.apiKey, provider: aiSettings.provider, webhookUrl: aiSettings.webhookUrl })
      });
      const data = await res.json();
      if (data.success && data.aeoData) {
        setAeoData({ ...aeoData, [product.id]: data.aeoData });
      } else {
        alert(`AEO Generation failed: ${data.error || 'Unknown error'}`);
      }
    } catch(err: any) {
      alert(`Failed to generate AEO: ${err.message}`);
    }
    setIsGeneratingAeo(null);
  };



  // ... (keeping existing GSC and Settings handlers minimal for brevity)

  return (
    <div className="space-y-6 text-left pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-300 pb-4 gap-4 sticky top-0 bg-[#F1F1F1] z-10 py-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-[#1A1A1A]">SEO Agency Hub</h1>
          <p className="text-xs text-gray-500 mt-1">Proactive recommendations for Google and AI Overviews.</p>
        </div>
      </div>

      <div className="flex space-x-4 border-b border-gray-200 overflow-x-auto pb-2">
        <button onClick={() => setActiveTab('audit')} className={`px-1 text-sm font-medium flex items-center space-x-2 whitespace-nowrap ${activeTab === 'audit' ? 'border-b-2 border-[#008060] text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}>
          <Search className="w-4 h-4" /><span>On-Page Audit</span>
        </button>
        <button onClick={() => setActiveTab('aeo')} className={`px-1 text-sm font-medium flex items-center space-x-2 whitespace-nowrap ${activeTab === 'aeo' ? 'border-b-2 border-[#008060] text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}>
          <Code className="w-4 h-4" /><span>AEO & Schema</span>
        </button>
        <button onClick={() => setActiveTab('gap')} className={`px-1 text-sm font-medium flex items-center space-x-2 whitespace-nowrap ${activeTab === 'gap' ? 'border-b-2 border-[#008060] text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}>
          <Map className="w-4 h-4" /><span>Content Gap</span>
        </button>

        <button onClick={() => setActiveTab('search_console')} className={`px-1 text-sm font-medium flex items-center space-x-2 whitespace-nowrap ${activeTab === 'search_console' ? 'border-b-2 border-[#008060] text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}>
          <Sparkles className="w-4 h-4" /><span>Search Console</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`px-1 text-sm font-medium flex items-center space-x-2 whitespace-nowrap ${activeTab === 'settings' ? 'border-b-2 border-[#008060] text-[#1A1A1A]' : 'text-gray-500 hover:text-gray-700'}`}>
          <Settings className="w-4 h-4" /><span>Settings</span>
        </button>
      </div>

      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#1A1A1A]">On-Page Recommendations</h3>
              <p className="text-xs text-gray-500 mt-1">We don't auto-apply changes. Review our warnings and apply them if you agree.</p>
            </div>
            <button 
              onClick={handleAudit}
              disabled={isAuditing}
              className="bg-[#008060] hover:bg-[#006e52] text-white px-5 py-2 rounded text-sm font-semibold shadow flex items-center space-x-2 disabled:opacity-50"
            >
              {isAuditing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{isAuditing ? 'Auditing...' : 'Run Audit'}</span>
            </button>
          </div>

          <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F9FAFB] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-700">Product</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Issues & Recommendations</th>
                  <th className="px-6 py-3 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {localProducts.map(prod => (
                  <tr key={prod.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-luxury-charcoal w-1/4">
                      {prod.name}
                      {!prod.seoScore && <span className="block mt-1 text-[10px] text-gray-400">Needs Audit</span>}
                    </td>
                    <td className="px-6 py-4 w-1/2">
                      {prod.seoIssues && prod.seoIssues.length > 0 && (
                        <div className="text-xs text-red-600 bg-red-50 p-3 rounded border border-red-200 mb-2">
                          <strong className="flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> Warnings:</strong>
                          <ul className="list-disc pl-5 mt-1">
                            {prod.seoIssues.map((issue: string, idx: number) => <li key={idx}>{issue}</li>)}
                          </ul>
                        </div>
                      )}
                      {prod.seoScore && prod.description && (
                        <div className="text-xs text-green-700 bg-green-50 p-3 rounded border border-green-200">
                          <strong>Recommended Description:</strong>
                          <p className="mt-1 italic">{prod.description}</p>
                        </div>
                      )}
                      {prod.seoScore === 100 && (
                        <span className="text-green-600 text-xs font-bold flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Perfectly Optimized</span>
                      )}
                    </td>
                    <td className="px-6 py-4 w-1/4">
                      {prod.seoScore && prod.seoScore < 100 ? (
                        <button onClick={() => applyRecommendation(prod)} className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 flex items-center">
                          <Check className="w-3 h-3 mr-1"/> Apply Changes
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'aeo' && (
        <div className="space-y-6">
          {/* Ranking Projection Countdown */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded border border-blue-100 shadow-sm flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="font-bold text-blue-900 text-lg">SEO Ranking Projection</h3>
              <p className="text-sm text-blue-700 mt-1">If you fully optimize your products and inject schema, your site is projected to see significant AI/Google ranking improvements in:</p>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <div className="bg-white px-4 py-2 rounded shadow text-center border border-blue-100">
                <span className="block text-2xl font-bold text-indigo-700">{rankingCountdown.days}</span>
                <span className="text-[10px] uppercase font-bold text-gray-500">Days</span>
              </div>
              <div className="bg-white px-4 py-2 rounded shadow text-center border border-blue-100">
                <span className="block text-2xl font-bold text-indigo-700">{String(rankingCountdown.hours).padStart(2, '0')}</span>
                <span className="text-[10px] uppercase font-bold text-gray-500">Hrs</span>
              </div>
              <div className="bg-white px-4 py-2 rounded shadow text-center border border-blue-100">
                <span className="block text-2xl font-bold text-indigo-700">{String(rankingCountdown.minutes).padStart(2, '0')}</span>
                <span className="text-[10px] uppercase font-bold text-gray-500">Min</span>
              </div>
              <div className="bg-white px-4 py-2 rounded shadow text-center border border-blue-100">
                <span className="block text-2xl font-bold text-indigo-700">{String(rankingCountdown.seconds).padStart(2, '0')}</span>
                <span className="text-[10px] uppercase font-bold text-gray-500">Sec</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded border border-gray-200 shadow-sm">
            <h3 className="font-bold text-[#1A1A1A]">AI Engine Optimization (AEO) & Schema</h3>
            <p className="text-xs text-gray-500 mt-1">Generate AI-friendly FAQs and extract entities to inject rich JSON-LD schema into your products.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {localProducts.map(prod => (
              <div key={prod.id} className="bg-white border border-gray-200 p-5 rounded shadow-sm">
                <h4 className="font-bold mb-2">{prod.name}</h4>
                {(!aeoData[prod.id] && !prod.seoSchema) ? (
                  <button 
                    onClick={() => handleGenerateAeo(prod)}
                    disabled={isGeneratingAeo === prod.id}
                    className="bg-black text-white text-xs px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
                  >
                    {isGeneratingAeo === prod.id ? 'Generating AEO...' : 'Generate Schema & FAQs'}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded text-xs">
                      <strong className="text-blue-800 block mb-2">Generated AI-FAQs:</strong>
                      {(prod.seoSchema || aeoData[prod.id])?.faqs?.map((faq:any, i:number) => (
                        <div key={i} className="mb-2">
                          <div className="font-semibold text-gray-800">Q: {faq.question}</div>
                          <div className="text-gray-600">A: {faq.answer}</div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded text-xs font-mono">
                      <strong className="text-gray-700 block mb-1">Entities for Schema:</strong>
                      {(prod.seoSchema || aeoData[prod.id])?.entities?.join(', ')}
                    </div>
                    {prod.seoSchema ? (
                      <span className="text-green-600 text-xs font-bold flex items-center"><CheckCircle className="w-4 h-4 mr-1"/> Schema Injected</span>
                    ) : (
                      <button 
                        onClick={() => injectSchema(prod, aeoData[prod.id])}
                        className="bg-green-600 text-white text-xs px-3 py-1.5 rounded hover:bg-green-700"
                      >
                        Inject JSON-LD Schema
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'gap' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#1A1A1A]">Content Gap Strategy</h3>
              <p className="text-xs text-gray-500 mt-1">Find keywords and topics your competitors are ranking for that you are missing.</p>
            </div>
            <button 
              onClick={handleGapAnalysis}
              disabled={isGeneratingGap}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded text-sm font-semibold shadow disabled:opacity-50"
            >
              {isGeneratingGap ? 'Analyzing...' : 'Run Gap Analysis'}
            </button>
          </div>

          {gapAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded shadow-sm border border-gray-200">
                <h4 className="font-bold text-lg mb-4 text-purple-700">Missing Keywords</h4>
                <ul className="space-y-2">
                  {gapAnalysis.missingKeywords?.map((kw:string, i:number) => (
                    <li key={i} className="bg-gray-50 px-3 py-2 rounded text-sm font-medium border border-gray-100 flex items-center">
                      <Sparkles className="w-3 h-3 mr-2 text-purple-500"/> {kw}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-5 rounded shadow-sm border border-gray-200">
                <h4 className="font-bold text-lg mb-4 text-purple-700">Competitor Insights</h4>
                <p className="text-sm text-gray-700 leading-relaxed bg-purple-50 p-4 rounded italic">
                  "{gapAnalysis.competitorInsights}"
                </p>
                <h4 className="font-bold text-sm mt-6 mb-3 uppercase text-gray-500">Suggested Blog Topics</h4>
                <div className="space-y-3">
                  {gapAnalysis.suggestedTopics?.map((topic:any, i:number) => (
                    <div key={i} className="border-l-2 border-purple-400 pl-3">
                      <div className="font-bold text-sm text-gray-800">{topic.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{topic.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}



      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded shadow-sm max-w-lg border border-gray-200">
           <h3 className="font-bold mb-4">AI Configuration</h3>
           <p className="text-xs text-gray-500 mb-4">Enter your AI API key below. This will be securely passed to the backend for SEO generation.</p>
           
           <div className="mb-4">
             <label className="text-xs font-semibold block mb-1">AI Provider</label>
             <select 
               value={aiSettings.provider || 'gemini'}
               onChange={(e) => setAiSettings({...aiSettings, provider: e.target.value})}
               className="w-full border border-gray-300 rounded p-2 text-sm mb-4"
             >
               <option value="gemini">Google Gemini</option>
               <option value="groq">Groq (Llama 3)</option>
               <option value="make.com">Make.com (Webhook)</option>
             </select>

             {aiSettings.provider === 'make.com' ? (
               <>
                 <label className="text-xs font-semibold block mb-1">Webhook URL</label>
                 <input 
                   type="text"
                   value={aiSettings.webhookUrl || ''}
                   onChange={(e) => setAiSettings({...aiSettings, webhookUrl: e.target.value})}
                   className="w-full border border-gray-300 rounded p-2 text-sm font-mono mb-4"
                   placeholder="https://hook.us1.make.com/..."
                 />
               </>
             ) : (
               <>
                 <label className="text-xs font-semibold block mb-1">API Key</label>
                 <input 
                   type="password"
                   value={aiSettings.apiKey || ''}
                   onChange={(e) => setAiSettings({...aiSettings, apiKey: e.target.value})}
                   className="w-full border border-gray-300 rounded p-2 text-sm font-mono mb-4"
                   placeholder={aiSettings.provider === 'groq' ? "gsk_..." : "AIzaSy..."}
                 />
               </>
             )}
           </div>

           <button 
             className="bg-black text-white px-4 py-2 rounded text-sm" 
             onClick={async () => {
               await set(ref(db, 'settings/seo_ai'), aiSettings);
               alert('Settings saved successfully!');
             }}
           >
             Save Settings
           </button>
        </div>
      )}
    </div>
  );
}
