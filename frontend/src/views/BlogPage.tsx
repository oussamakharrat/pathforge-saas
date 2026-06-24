'use client';

import { useState } from "react";
import { useNavigate } from "@/lib/router";
import { ArrowRight, Clock, Search } from "lucide-react";
import { FLAME, CARBON, ALABASTER } from "../lib/constants";
import { Card } from "../components/Card";
import { Btn } from "../components/Btn";
import { Chip } from "../components/Chip";
import { BrandLogo } from "../components/BrandLogo";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  role: string;
  avatar: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  featured: boolean;
}

const POSTS: BlogPost[] = [
  {
    id: 1, title: "The Ultimate Senior Engineer Interview Prep Guide (2026)", excerpt: "A comprehensive walkthrough of system design, behavioral, and technical interviews — with practice frameworks that actually work.",
    author: "Sarah K.", role: "Senior Engineer at Stripe", avatar: "SK", date: "Jun 18", readTime: "12 min", category: "Interviews",
    tags: ["system design", "behavioral", "preparation"], featured: true,
  },
  {
    id: 2, title: "How I Negotiated $45k More in 3 Days Using AI", excerpt: "Step-by-step breakdown of the salary negotiation process, from market research to the final counter-offer call.",
    author: "Marcus T.", role: "Staff Engineer at Linear", avatar: "MT", date: "Jun 14", readTime: "8 min", category: "Negotiation",
    tags: ["salary", "negotiation", "offers"], featured: true,
  },
  {
    id: 3, title: "Why Your Resume Isn't Getting Past ATS — And How to Fix It", excerpt: "Most resumes get filtered out before a human sees them. Here's exactly what the algorithms look for.",
    author: "Priya M.", role: "Tech Lead at Notion", avatar: "PM", date: "Jun 10", readTime: "6 min", category: "Resume",
    tags: ["ATS", "resume", "keywords"], featured: false,
  },
  {
    id: 4, title: "From Help Desk to Software Engineer: One Year Later", excerpt: "A career pivot story with concrete milestones, setbacks, and lessons learned along the way.",
    author: "Alex R.", role: "SWE at Brex", avatar: "AR", date: "Jun 5", readTime: "10 min", category: "Career",
    tags: ["career change", "pivot", "journey"], featured: false,
  },
  {
    id: 5, title: "The 5 Skills That Will Get You Hired in 2026", excerpt: "We analyzed 10,000 job descriptions to find the skills with the highest correlation to interview callbacks.",
    author: "CareerGrowth Team", role: "Editorial", avatar: "CG", date: "May 28", readTime: "7 min", category: "Skills",
    tags: ["trends", "skills", "hiring"], featured: false,
  },
  {
    id: 6, title: "Building in Public: How We Built CareerGrowth AI", excerpt: "Behind the scenes of building an AI-powered career platform — architecture, failures, and lessons.",
    author: "Founding Team", role: "Engineering", avatar: "FT", date: "May 20", readTime: "15 min", category: "Engineering",
    tags: ["startup", "building", "AI"], featured: true,
  },
];

const CATEGORIES = ["All", "Interviews", "Negotiation", "Resume", "Career", "Skills", "Engineering"];

export default function BlogPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = POSTS.filter(p => {
    const catMatch = category === "All" || p.category === category;
    const searchMatch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  const featured = POSTS.filter(p => p.featured);
  const rest = filtered.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <BrandLogo />
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/careers")} className="text-[12px] font-bold hover:underline hidden sm:inline" style={{ color: CARBON }}>Careers</button>
            <button onClick={() => navigate("/login")} className="text-[12px] font-bold hover:underline" style={{ color: CARBON }}>Sign in</button>
            <Btn size="sm" onClick={() => navigate("/register")}>Get Started</Btn>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2" style={{ color: CARBON }}>Blog</h1>
          <p className="text-[14px] text-muted-foreground">Career strategies, engineering insights, and success stories.</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            style={{ backgroundColor: ALABASTER }} />
        </div>

        {/* Categories */}
        <div className="flex gap-1.5 mb-8 overflow-x-auto pb-1 justify-center">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="px-3.5 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all"
              style={{ backgroundColor: category === cat ? FLAME : ALABASTER, color: category === cat ? "white" : CARBON }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Featured posts */}
        {featured.length > 0 && category === "All" && (
          <div className="mb-10">
            <h2 className="text-[14px] font-black mb-4 flex items-center gap-2" style={{ color: CARBON }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: FLAME }} /> Featured
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {featured.map(post => (
                <Card key={post.id} className="p-0 overflow-hidden" hover onClick={() => navigate("/register")}>
                  <div className="h-32 flex items-center justify-center text-2xl font-black text-white" style={{ background: `linear-gradient(135deg, ${FLAME}, #FF9B6A)` }}>
                    {post.category}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Chip variant="flame">{post.category}</Chip>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                    </div>
                    <h3 className="text-[16px] font-black mb-2 leading-snug" style={{ color: CARBON }}>{post.title}</h3>
                    <p className="text-[13px] text-muted-foreground mb-3 leading-relaxed">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black text-white" style={{ backgroundColor: FLAME }}>{post.avatar}</div>
                        <div>
                          <p className="text-[11px] font-bold" style={{ color: CARBON }}>{post.author}</p>
                          <p className="text-[9px] text-muted-foreground">{post.date}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All posts */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="sm:col-span-3 text-center py-10">
              <p className="text-[14px] text-muted-foreground">No articles found. Try a different search.</p>
            </div>
          ) : rest.concat(featured).map(post => (
            <Card key={post.id} className="p-0 overflow-hidden" hover onClick={() => navigate("/register")}>
              <div className="h-20 flex items-center justify-center text-sm font-black text-white" style={{ background: `linear-gradient(135deg, #374151, #6B7280)` }}>
                {post.category}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: ALABASTER, color: CARBON }}>{post.category}</span>
                  <span className="text-[10px] text-muted-foreground">{post.readTime}</span>
                </div>
                <h3 className="text-[13px] font-black mb-1.5 leading-snug" style={{ color: CARBON }}>{post.title}</h3>
                <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-[7px] font-black text-white" style={{ backgroundColor: FLAME }}>{post.avatar}</div>
                    <span className="text-[10px] font-bold" style={{ color: CARBON }}>{post.author}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground">{post.date}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Newsletter */}
        <Card className="p-6 mt-10 text-center" hover={false} style={{ borderColor: "rgba(241,80,37,0.2)" }}>
          <h3 className="text-[16px] font-black mb-1" style={{ color: CARBON }}>Get the latest in your inbox</h3>
          <p className="text-[13px] text-muted-foreground mb-4">Weekly career strategies, no spam.</p>
          <div className="flex items-center gap-2 max-w-sm mx-auto">
            <input placeholder="you@example.com" className="flex-1 h-10 px-4 rounded-xl border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-ring" style={{ backgroundColor: ALABASTER }} />
            <Btn size="sm">Subscribe</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}
