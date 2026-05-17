'use client';

import { API_URL } from '@/lib/api';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, Zap, FileText, MessageSquare, Loader2, Copy, Check, Lightbulb, Target, PenTool, Clock, Trash2, X } from 'lucide-react';

type Tool = 'campaign' | 'caption' | 'outreach' | 'strategy';

const tools: { id: Tool; label: string; desc: string; icon: React.ElementType; color: string; placeholder: string }[] = [
  { id: 'campaign', label: 'Campaign Brief', desc: 'AI-powered campaign briefs', icon: Target, color: 'from-purple-500 to-blue-500', placeholder: 'e.g. Summer fashion launch for Gen Z audience on Instagram and TikTok with ₹5L budget' },
  { id: 'caption', label: 'Caption Generator', desc: 'Viral captions with hashtags', icon: PenTool, color: 'from-pink-500 to-rose-500', placeholder: 'e.g. A flatlay of our new skincare line on marble background for Instagram' },
  { id: 'outreach', label: 'Influencer Outreach', desc: 'Personalized DMs and email pitches', icon: MessageSquare, color: 'from-blue-500 to-cyan-500', placeholder: 'e.g. Reach out to a fitness influencer (200K followers) for a protein supplement brand collab' },
  { id: 'strategy', label: 'Strategy Advisor', desc: 'Data-backed strategy recommendations', icon: Lightbulb, color: 'from-amber-500 to-orange-500', placeholder: 'e.g. We run performance marketing for a D2C skincare brand with 3L monthly ad budget. Suggest an influencer strategy.' },
];

interface ChatRecord {
  id: string;
  tool: string;
  prompt: string;
  result: string;
  createdAt: string;
}

export default function AIToolsPage() {
  const [activeTool, setActiveTool] = useState<Tool>('campaign');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<ChatRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem('adrex_token');
      const res = await fetch(`${API_URL}/api/ai/history`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setHistory(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const currentTool = tools.find(t => t.id === activeTool)!;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const token = localStorage.getItem('adrex_token');
      const endpointMap: Record<Tool, string> = {
        campaign: '/api/ai/campaign-idea',
        caption: '/api/ai/caption',
        outreach: '/api/ai/outreach',
        strategy: '/api/ai/strategy',
      };
      const res = await fetch(`${API_URL}${endpointMap[activeTool]}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ prompt, brief: prompt, context: prompt }),
      });
      const data = await res.json();

      if (!res.ok) {
        setResult(`⚠️ ${data.error || 'AI generation failed. Please try again.'}`);
        return;
      }

      setResult(data.result || 'No response generated.');
      await fetchHistory();
    } catch (err: any) {
      setResult('⚠️ Failed to connect to AI. Make sure the backend is running and GROQ_API_KEY is set.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      const token = localStorage.getItem('adrex_token');
      await fetch(`${API_URL}/api/ai/history/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toolIcon: Record<string, React.ElementType> = {
    campaign: Target, caption: PenTool, outreach: MessageSquare, strategy: Lightbulb, chat: Sparkles,
  };

  const toolColors: Record<string, string> = {
    campaign: 'bg-purple-500/20 text-purple-400',
    caption: 'bg-pink-500/20 text-pink-400',
    outreach: 'bg-blue-500/20 text-blue-400',
    strategy: 'bg-amber-500/20 text-amber-400',
    chat: 'bg-zinc-500/20 text-zinc-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </span>
            AI Tools
          </h1>
          <p className="text-muted-foreground mt-1 ml-12">Powered by Groq AI — generate campaigns, captions, outreach & strategy in seconds.</p>
        </div>
        <button onClick={() => setShowHistory(p => !p)} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
          <Clock size={16} /> History ({history.length})
        </button>
      </div>

      {/* Tool Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => { setActiveTool(tool.id); setResult(''); setPrompt(''); }}
              className={`p-5 rounded-2xl border text-left transition-all ${isActive ? 'border-purple-500/50 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]' : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/5'}`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3`}>
                <Icon size={18} className="text-white" />
              </div>
              <p className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-zinc-300'}`}>{tool.label}</p>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{tool.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Input */}
        <div className="glassmorphism rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentTool.color} flex items-center justify-center`}>
              <currentTool.icon size={15} className="text-white" />
            </div>
            <h3 className="font-semibold text-white">{currentTool.label}</h3>
          </div>
          <label className="block text-xs text-zinc-400 mb-2">Describe what you need</label>
          <textarea
            rows={8}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={currentTool.placeholder}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-all resize-none"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Zap size={16} /> Generate with AI</>}
          </button>
        </div>

        {/* Output */}
        <div className="glassmorphism rounded-2xl p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-zinc-400" />
              <h3 className="font-semibold text-white">AI Output</h3>
            </div>
            {result && (
              <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-zinc-400 hover:text-white transition-all">
                {copied ? <><Check size={12} className="text-emerald-400" /> Copied!</> : <><Copy size={12} /> Copy</>}
              </button>
            )}
          </div>

          <div className="min-h-[260px] bg-black/30 border border-white/10 rounded-xl p-4 overflow-y-auto max-h-[500px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center animate-pulse">
                  <Sparkles size={22} className="text-purple-400" />
                </div>
                <p className="text-sm text-zinc-500 animate-pulse">AI is thinking...</p>
              </div>
            ) : result ? (
              <pre className={`text-sm whitespace-pre-wrap font-sans leading-relaxed ${result.startsWith('⚠️') ? 'text-red-400' : 'text-zinc-200'}`}>{result}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-center opacity-50">
                <Sparkles size={32} className="text-zinc-700" />
                <p className="text-sm text-zinc-600">Your AI-generated content will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowHistory(false)} />
          <div className="relative z-10 w-full max-w-md bg-zinc-950 border-l border-white/10 h-full overflow-y-auto animate-in slide-in-from-right">
            <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">AI Chat History</h2>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/5 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8">No chat history yet.</p>
              ) : (
                history.map((chat) => {
                  const Icon = toolIcon[chat.tool] || Sparkles;
                  return (
                    <div key={chat.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${toolColors[chat.tool] || 'bg-zinc-500/20 text-zinc-400'}`}>
                            <Icon size={13} />
                          </div>
                          <span className="text-xs font-medium text-zinc-300 capitalize">{chat.tool}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-zinc-600">{new Date(chat.createdAt).toLocaleDateString()}</span>
                          <button onClick={() => handleDeleteHistory(chat.id)} className="p-1 hover:bg-red-500/20 rounded text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 truncate mb-2">{chat.prompt}</p>
                      <details className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                        <summary className="cursor-pointer text-zinc-500 hover:text-zinc-300 transition-colors">Show result</summary>
                        <pre className="mt-2 whitespace-pre-wrap font-sans">{chat.result}</pre>
                      </details>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
