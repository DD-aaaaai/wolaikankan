"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { DailyFeedData, FeedItem } from "@/lib/feedGenerator";

export default function AvatarPage() {
  const [feed, setFeed] = useState<DailyFeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"feed" | "timeline" | "chat">("feed");
  const [activeCat, setActiveCat] = useState(0);
  const [messages, setMessages] = useState<{ role: "user" | "avatar"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/feed")
      .then((r) => r.json())
      .then((d) => {
        setFeed(d.feed);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput("");
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setChatLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });
    const data = await res.json();
    setMessages((m) => [...m, { role: "avatar", text: data.reply }]);
    setChatLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-500 text-sm tracking-widest animate-pulse">
          分身正在整理昨日的一切...
        </p>
      </main>
    );
  }

  if (!feed) return null;

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100">
      {/* Nav */}
      <nav className="border-b border-stone-800 px-6 py-4 flex items-center justify-between">
        <span className="text-stone-400 text-xs tracking-widest">🪷 我来看看</span>
        <div className="flex gap-6 text-xs text-stone-500">
          <Link href="/avatar" className="text-stone-300">我的分身</Link>
          <Link href="/plaza" className="hover:text-stone-300 transition-colors">分身广场</Link>
        </div>
      </nav>

      {/* Avatar Header */}
      <div className="px-6 py-8 border-b border-stone-800">
        <p className="text-stone-500 text-xs tracking-widest mb-1">{feed.date}</p>
        <h2 className="text-2xl font-light text-stone-100">
          {feed.avatarName} 的昨日游历
        </h2>
        <p className="text-stone-500 text-sm mt-2 leading-relaxed max-w-lg">
          {feed.dailySummary}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-800 px-6">
        {[
          { key: "feed", label: "今日推荐" },
          { key: "timeline", label: "时序流程" },
          { key: "chat", label: "与分身对话" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as "feed" | "timeline" | "chat")}
            className={`py-3 mr-6 text-sm border-b-2 transition-colors ${
              activeTab === t.key
                ? "border-stone-300 text-stone-100"
                : "border-transparent text-stone-500 hover:text-stone-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Feed Tab */}
      {activeTab === "feed" && (
        <div className="px-6 py-6 max-w-4xl">
          {/* Top 3 */}
          <div className="mb-8">
            <p className="text-stone-500 text-xs tracking-widest mb-4">最关键的三件事</p>
            <div className="grid gap-3">
              {feed.topThree.map((item, i) => (
                <div key={i} className="bg-stone-900 p-4 flex gap-4">
                  <span className="text-stone-600 text-2xl font-light shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-stone-300 text-sm font-medium">{item.title}</p>
                    <p className="text-stone-500 text-xs mt-1 leading-relaxed">{item.summary}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-stone-600 text-xs">{item.category}</span>
                      {item.sourceUrl && (
                        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                          className="text-stone-600 text-xs hover:text-stone-400 transition-colors">
                          查看原文 →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {feed.categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setActiveCat(i)}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  activeCat === i
                    ? "bg-stone-100 text-stone-900"
                    : "border border-stone-700 text-stone-500 hover:border-stone-500"
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>

          {/* Category Detail */}
          <FeedCard item={feed.categories[activeCat]} avatarName={feed.avatarName} />
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === "timeline" && (
        <div className="px-6 py-6 max-w-2xl">
          <p className="text-stone-500 text-xs tracking-widest mb-6">昨日时序流程</p>
          <div className="space-y-4">
            {feed.timeline.map((event, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-stone-500 mt-1.5" />
                  {i < feed.timeline.length - 1 && (
                    <div className="w-px flex-1 bg-stone-800 mt-1" />
                  )}
                </div>
                <p className="text-stone-400 text-sm leading-relaxed pb-4">{event}</p>
              </div>
            ))}
            <div className="bg-stone-900 p-4 ml-6">
              <p className="text-stone-400 text-sm leading-relaxed">{feed.dailySummary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <div className="flex flex-col h-[calc(100vh-200px)] max-w-2xl px-6 py-6">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.length === 0 && (
              <p className="text-stone-600 text-sm text-center py-8">
                和你的分身说说话吧。告诉它你对今天内容的感受，或者任何想说的。
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-sm px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-stone-700 text-stone-100"
                      : "bg-stone-900 text-stone-300"
                  }`}
                >
                  {msg.role === "avatar" && (
                    <p className="text-stone-500 text-xs mb-1">
                      {feed.avatarName}
                    </p>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-stone-900 px-4 py-3 text-stone-500 text-sm animate-pulse">
                  {feed.avatarName} 正在思考...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="flex gap-3">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="说点什么..."
              className="flex-1 bg-stone-900 border border-stone-700 text-stone-100 placeholder:text-stone-600 px-4 py-3 text-sm focus:outline-none focus:border-stone-500 transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={!chatInput.trim() || chatLoading}
              className="px-6 py-3 bg-stone-100 text-stone-900 text-sm disabled:opacity-30 hover:bg-stone-200 transition-colors"
            >
              发送
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function FeedCard({ item, avatarName }: { item: FeedItem; avatarName: string }) {
  return (
    <div className="space-y-6">
      <div className="bg-stone-900 p-6 space-y-4">
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <p className="text-stone-500 text-xs tracking-widest">事情描述</p>
            {item.sourceUrl && (
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                className="text-stone-500 text-xs hover:text-stone-300 transition-colors border-b border-stone-700 hover:border-stone-500 shrink-0">
                来源：{item.sourceName || "原文"} →
              </a>
            )}
          </div>
          <h3 className="text-stone-100 text-lg font-light leading-relaxed">{item.title}</h3>
          <p className="text-stone-400 text-sm mt-2 leading-relaxed">{item.summary}</p>
          {item.sourceUrl && (
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="inline-block mt-3 px-3 py-1.5 border border-stone-700 text-stone-500 text-xs hover:border-stone-500 hover:text-stone-300 transition-colors">
              查看原文 →
            </a>
          )}
        </div>

        <div>
          <p className="text-stone-500 text-xs tracking-widest mb-3">维度评价</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(item.dimensions).map(([key, val]) => {
              const labels: Record<string, string> = {
                feeling: "感受", attraction: "吸引力",
                comfort: "舒适", desire: "欲望", resonance: "契合",
              };
              return (
                <span key={key} className="px-3 py-1 border border-stone-700 text-stone-400 text-xs">
                  {labels[key]}：{val}
                </span>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-stone-500 text-xs tracking-widest mb-2">{avatarName} 的体验</p>
          <p className="text-stone-400 text-sm leading-relaxed italic">
            &ldquo;{item.avatarExperience}&rdquo;
          </p>
        </div>
      </div>

      {item.moreItems.length > 0 && (
        <div>
          <p className="text-stone-500 text-xs tracking-widest mb-3">更多相关内容</p>
          <div className="space-y-2">
            {item.moreItems.map((more, i) => (
              <a key={i} href={typeof more === "string" ? "#" : more.url}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between bg-stone-900 px-4 py-3 text-stone-400 text-sm hover:bg-stone-800 hover:text-stone-300 transition-colors group">
                <span>{typeof more === "string" ? more : more.title}</span>
                <span className="text-stone-600 group-hover:text-stone-400 text-xs ml-3 shrink-0">→</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
