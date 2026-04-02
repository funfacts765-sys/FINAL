import React, { useState, useEffect } from 'react';
import { Github, BookOpen, Layout, LogOut, Search, Clock } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState("");

  // Check login status on load
  useEffect(() => {
    fetch('/api/user/github').then(res => res.json()).then(data => setUser(data));

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
        fetch('/api/user/github').then(res => res.json()).then(data => setUser(data));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const loginWithGithub = async () => {
    const res = await fetch('/api/auth/github/url');
    const { url } = await res.json();
    window.open(url, 'GitHub Login', 'width=600,height=700');
  };

  const logout = () => {
    fetch('/api/auth/github/logout', { method: 'POST' }).then(() => setUser(null));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-500" />
          <span className="text-xl font-bold tracking-tight">VISTAS Learning</span>
        </div>
        
        {user ? (
          <div className="flex items-center gap-4">
            <img src={user.avatar_url} className="w-8 h-8 rounded-full border border-blue-500" />
            <button onClick={logout} className="flex items-center gap-2 text-red-400 hover:text-red-300">
              <LogOut size={18} /> Logout
            </button>
          </div>
        ) : (
          <button onClick={loginWithGithub} className="bg-white text-black px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-200 transition">
            <Github size={18} /> Login with GitHub
          </button>
        )}
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto p-8 text-center mt-20">
        <h1 className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Master Your BCA Resources
        </h1>
        <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto">
          Manage your materials, track your progress, and secure your learning journey with VISTAS.
        </p>

        {/* Search & Features */}
        <div className="relative max-w-xl mx-auto mb-20">
          <Search className="absolute left-4 top-3.5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search for Python, Deep Learning, or MERN stacks..." 
            className="w-full bg-slate-800 border border-slate-700 py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-blue-500 transition">
            <Clock className="text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Study Tracker</h3>
            <p className="text-slate-400">Keep track of your BCA final year project milestones.</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-emerald-500 transition">
            <Layout className="text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Resource Library</h3>
            <p className="text-slate-400">Access curated materials for MERN, Python, and Forensic Security.</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-purple-500 transition">
            <Github className="text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">GitHub Sync</h3>
            <p className="text-slate-400">Log in safely using your GitHub developer account.</p>
          </div>
        </div>
      </main>
    </div>
  );
}