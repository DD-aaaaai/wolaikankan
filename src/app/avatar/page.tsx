"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { DailyFeedData, FeedItem } from "@/lib/feedGenerator";
interface ReportSection {
  title: string;
  content: string;
}

interface GameRecommendation {
  id: string;
  name: string;
  nameEn: string;
  genre: string[];
  platform: string;
  coverEmoji: string;
  shortDesc: string;
  detailDesc: string;
  whyForYou: string;
  matchTags: string[];
  links: { steam?: string; gamersky: string; threeDm: string };
  tags: string[];
}

interface GameItem {
  id: string;
  name: string;
  genre: string;
  coverEmoji: string;
  description: string;
  url: string;
  avatarReview: string;
  dimensions: { fun: string; challenge: string; engagement: string; time: string };
  tags: string[];
  report?: ReportSection[];
}

const CAT_ICONS: Record<string, string> = {
  工作: "💼", 成长: "🌱", 娱乐: "🎮", 健康: "💪", 关系: "💫", 其他: "✨",
};

const CAT_COLORS: Record<string, string> = {
  工作: "from-blue-500 to-indigo-600",
  成长: "from-emerald-500 to-teal-600",
  娱乐: "from-purple-500 to-pink-600",
  健康: "from-rose-500 to-orange-500",
  关系: "from-amber-500 to-yellow-500",
  其他: "from-sky-500 to-cyan-600",
};

export default function AvatarPage() {
  const [feed, setFeed] = useState<DailyFeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"feed" | "timeline" | "chat" | "games">("feed");
  const [activeCat, setActiveCat] = useState(0);
  const [messages, setMessages] = useState<{ role: "user" | "avatar"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [games, setGames] = useState<GameItem[]>([]);
  const [gamesAvatarName, setGamesAvatarName] = useState("分身");
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/feed")
      .then((r) => r.json())
      .then((d) => { setFeed(d.feed); setLoading(false); });
    fetch("/api/games")
      .then((r) => r.json())
      .then((d) => {
        setGames(d.games || []);
        setGamesAvatarName(d.avatarName || "分身");
        setRecommendations(d.recommendations || []);
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e0f2fe, #bae6fd, #f0f9ff)" }}>
        <div className="text-center space-y-4">
          <div className="text-5xl wave inline-block">🪷</div>
          <p className="text-sky-600 font-semibold">分身正在整理昨日的一切...</p>
          <div className="flex gap-1.5 justify-center">
            {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
          </div>
        </div>
      </div>
    );
  }
  if (!feed) return null;

  const currentCat = feed.categories[activeCat];
  const gradClass = CAT_COLORS[currentCat?.category] || "from-sky-500 to-blue-600";

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-sky-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🪷</span>
          <span className="text-sky-700 font-bold text-sm" style={{ fontFamily: "var(--font-syne)" }}>我来看看</span>
        </div>
        <div className="flex gap-1">
          {[
            { label: "我的分身", href: "/avatar", active: true },
            { label: "分身广场", href: "/plaza", active: false },
            { label: "设置分身", href: "/setup", active: false },
          ].map(({ label, href, active }) => (
            <Link key={label} href={href}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${active ? "bg-sky-500 text-white shadow-sm" : "text-sky-500 hover:bg-sky-50"}`}>
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Header */}
      <div className="px-6 pt-8 pb-6 max-w-4xl mx-auto">
        <p className="text-sky-400 text-xs font-medium tracking-widest mb-1 uppercase">
          {feed.date} · 昨日游历报告
        </p>
        <h1 className="text-3xl font-bold text-sky-900 mb-2" style={{ fontFamily: "var(--font-syne)" }}>
          {feed.avatarName} <span className="text-sky-400 font-normal text-xl">带回来了什么</span>
        </h1>
        <p className="text-sky-600/70 text-sm leading-relaxed max-w-xl">{feed.dailySummary}</p>
      </div>

      {/* Tabs */}
      <div className="px-6 max-w-4xl mx-auto mb-6">
        <div className="flex gap-1 bg-white/60 backdrop-blur-sm p-1 rounded-2xl border border-sky-100 w-fit">
          {[
            { key: "feed", label: "📋 今日推荐" },
            { key: "timeline", label: "⏱ 时序流程" },
            { key: "games", label: "🎮 游戏体验" },
            { key: "chat", label: "💬 与分身对话" },
          ].map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key as typeof activeTab)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === t.key ? "bg-sky-500 text-white shadow-sm" : "text-sky-500 hover:bg-sky-50"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Tab */}
      {activeTab === "feed" && (
        <div className="px-6 pb-12 max-w-4xl mx-auto space-y-6">
          {/* Top 3 */}
          <div>
            <h2 className="text-sky-700 font-bold text-sm mb-3 flex items-center gap-2">
              <span className="bg-amber-400 text-white text-xs px-2 py-0.5 rounded-full">TOP</span>
              最关键的三件事
            </h2>
            <div className="grid gap-3">
              {feed.topThree.map((item, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-sky-50 hover-lift flex gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${["from-amber-400 to-orange-500", "from-sky-400 to-blue-500", "from-emerald-400 to-teal-500"][i]} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    {item.sourceUrl ? (
                      <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                        className="group inline-flex items-start gap-1 hover:text-sky-600 transition-colors">
                        <span className="text-sky-900 text-sm font-semibold leading-snug group-hover:text-sky-600">{item.title}</span>
                        <span className="text-sky-300 text-xs mt-0.5 shrink-0">↗</span>
                      </a>
                    ) : (
                      <p className="text-sky-900 text-sm font-semibold leading-snug">{item.title}</p>
                    )}
                    <p className="text-sky-500/80 text-xs mt-1 leading-relaxed line-clamp-2">{item.summary}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="pill bg-sky-50 text-sky-500">{item.category}</span>
                      {item.sourceUrl && (
                        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                          className="text-sky-400 text-xs hover:text-sky-600 transition-colors font-medium">
                          查看原文 →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category selector */}
          <div>
            <h2 className="text-sky-700 font-bold text-sm mb-3">六个维度</h2>
            <div className="flex gap-2 flex-wrap">
              {feed.categories.map((cat, i) => (
                <button key={i} onClick={() => setActiveCat(i)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCat === i ? `bg-gradient-to-r ${CAT_COLORS[cat.category]} text-white shadow-md` : "bg-white/70 text-sky-600 hover:bg-white border border-sky-100"}`}>
                  <span>{CAT_ICONS[cat.category]}</span>
                  {cat.category}
                </button>
              ))}
            </div>
          </div>

          {/* Feed card */}
          {currentCat && <FeedCard item={currentCat} avatarName={feed.avatarName} gradClass={gradClass} />}
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === "timeline" && (
        <div className="px-6 pb-12 max-w-2xl mx-auto">
          <div className="space-y-0">
            {feed.timeline.map((event, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${["from-sky-400 to-blue-500", "from-emerald-400 to-teal-500", "from-purple-400 to-pink-500", "from-rose-400 to-orange-500", "from-amber-400 to-yellow-500", "from-cyan-400 to-sky-500"][i % 6]} mt-1.5 shrink-0`} />
                  {i < feed.timeline.length - 1 && <div className="w-0.5 flex-1 bg-sky-100 mt-1" />}
                </div>
                <div className="pb-5">
                  <p className="text-sky-800 text-sm leading-relaxed">{event}</p>
                </div>
              </div>
            ))}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-sky-100 ml-7 mt-2">
              <p className="text-sky-600 text-sm leading-relaxed">📊 {feed.dailySummary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Games Tab */}
      {activeTab === "games" && (
        <div className="px-6 pb-12 max-w-4xl mx-auto space-y-6">
          <div>
            <p className="text-sky-400 text-xs font-medium tracking-widest uppercase mb-1">分身游戏体验站</p>
            <h2 className="text-sky-900 font-bold text-xl mb-1" style={{ fontFamily: "var(--font-syne)" }}>
              {gamesAvatarName} 最近在玩这些 🎮
            </h2>
            <p className="text-sky-500/70 text-sm">分身亲身体验了这些热门 H5 小游戏，并留下了它的真实感受。</p>
          </div>

          {selectedGame ? (
            <GameDetail game={selectedGame} avatarName={gamesAvatarName} onBack={() => setSelectedGame(null)} />
          ) : (
            <>
              {/* H5 小游戏 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {games.map((game) => (
                  <GameCard key={game.id} game={game} onClick={() => setSelectedGame(game)} />
                ))}
              </div>

              {/* 大型 3D 游戏推荐 */}
              {recommendations.length > 0 ? (
                <div className="space-y-4 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-sky-100" />
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎯</span>
                      <p className="text-sky-700 font-bold text-sm">分身为你精选的大型 3D 游戏</p>
                      <span className="bg-sky-100 text-sky-500 text-xs px-2 py-0.5 rounded-full">基于你的人设</span>
                    </div>
                    <div className="flex-1 h-px bg-sky-100" />
                  </div>
                  <p className="text-sky-400 text-xs text-center">来自游民星空、3DM、Steam 的热门游戏，{gamesAvatarName} 根据你的性格和目标为你挑选</p>
                  <div className="space-y-4">
                    {recommendations.map((rec) => (
                      <BigGameCard
                        key={rec.id}
                        rec={rec}
                        expanded={expandedRec === rec.id}
                        onToggle={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
                        avatarName={gamesAvatarName}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-sky-400 text-sm">大型游戏推荐加载中…</div>
              )}
            </>
          )}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <div className="px-6 pb-6 max-w-2xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-sky-100 overflow-hidden shadow-lg">
            {/* Chat header */}
            <div className={`bg-gradient-to-r ${gradClass} px-5 py-4 flex items-center gap-3`}>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-lg">🪷</div>
              <div>
                <p className="text-white font-semibold text-sm">{feed.avatarName}</p>
                <p className="text-white/70 text-xs">你的AI分身 · 随时在线</p>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <span className="text-4xl">💬</span>
                  <p className="text-sky-400 text-sm">和你的分身聊聊吧<br />告诉它你对今天内容的感受</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                    ? "bg-sky-500 text-white rounded-br-sm"
                    : "bg-sky-50 text-sky-800 rounded-bl-sm border border-sky-100"}`}>
                    {msg.role === "avatar" && <p className="text-sky-400 text-xs mb-1 font-medium">{feed.avatarName}</p>}
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-sky-50 border border-sky-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5">
                    {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-sky-100 p-3 flex gap-2">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="说点什么..."
                className="flex-1 bg-sky-50 border border-sky-100 text-sky-900 placeholder:text-sky-300 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sky-300 transition-colors" />
              <button onClick={sendMessage} disabled={!chatInput.trim() || chatLoading}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
                style={{ background: chatInput.trim() ? "linear-gradient(135deg, #0ea5e9, #0284c7)" : "#bae6fd" }}>
                发送
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const GAME_GENRE_COLORS: Record<string, string> = {
  "益智休闲": "from-emerald-400 to-teal-500",
  "射击消除": "from-rose-400 to-red-500",
  "动作射击": "from-orange-400 to-amber-500",
  "塔防策略": "from-indigo-400 to-violet-500",
  "跑酷": "from-sky-400 to-blue-500",
  "益智消除": "from-purple-400 to-pink-500",
  "数字益智": "from-cyan-400 to-sky-500",
  "休闲挑战": "from-lime-400 to-green-500",
};

function GameCard({ game, onClick }: { game: GameItem; onClick: () => void }) {
  const grad = GAME_GENRE_COLORS[game.genre] || "from-sky-400 to-blue-500";
  return (
    <button onClick={onClick} className="bg-white/80 backdrop-blur-sm rounded-3xl border border-sky-50 hover:border-sky-200 overflow-hidden hover-lift transition-all text-left w-full">
      <div className={`bg-gradient-to-r ${grad} px-5 py-4 flex items-center gap-3`}>
        <span className="text-4xl">{game.coverEmoji}</span>
        <div>
          <p className="text-white font-bold text-base">{game.name}</p>
          <p className="text-white/70 text-xs">{game.genre}</p>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sky-600 text-xs leading-relaxed line-clamp-2">{game.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {game.tags.map((tag) => (
            <span key={tag} className="bg-sky-50 text-sky-500 text-xs px-2 py-0.5 rounded-full border border-sky-100">{tag}</span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(game.dimensions).map(([k, v]) => {
            const labels: Record<string, string> = { fun: "趣味", challenge: "挑战", engagement: "沉浸", time: "节奏" };
            return (
              <div key={k} className="bg-sky-50 rounded-lg px-2.5 py-1.5">
                <p className="text-sky-400 text-xs">{labels[k]}</p>
                <p className="text-sky-700 text-xs font-semibold">{v}</p>
              </div>
            );
          })}
        </div>
        <p className="text-sky-400 text-xs font-medium flex items-center gap-1">
          查看分身感受 <span>→</span>
        </p>
      </div>
    </button>
  );
}

function GameDetail({ game, avatarName, onBack }: { game: GameItem; avatarName: string; onBack: () => void }) {
  const grad = GAME_GENRE_COLORS[game.genre] || "from-sky-400 to-blue-500";
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sky-500 hover:text-sky-700 text-sm font-medium transition-colors">
        ← 返回游戏列表
      </button>
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-sky-50 overflow-hidden shadow-sm">
        <div className={`bg-gradient-to-r ${grad} px-6 py-5 flex items-center gap-4`}>
          <span className="text-5xl">{game.coverEmoji}</span>
          <div className="flex-1">
            <p className="text-white font-bold text-xl">{game.name}</p>
            <p className="text-white/70 text-sm">{game.genre} · {game.description}</p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          {/* Avatar review — 2048 显示深度报告，其他游戏显示简短感受 */}
          {game.report && game.report.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🪷</span>
                <p className="text-sky-700 font-bold text-sm">{avatarName} 的深度体验报告</p>
                <span className="bg-amber-100 text-amber-600 text-xs px-2 py-0.5 rounded-full font-medium">专属定制</span>
              </div>
              {game.report.map((section, i) => (
                <div key={i} className="bg-sky-50 rounded-2xl p-4 border border-sky-100">
                  <p className="text-sky-500 text-xs font-semibold uppercase tracking-wider mb-2">
                    {["01", "02", "03", "04"][i] ?? `0${i + 1}`} · {section.title}
                  </p>
                  <p className="text-sky-800 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-sky-50 rounded-2xl p-5 border border-sky-100">
              <p className="text-sky-400 text-xs font-medium mb-3 flex items-center gap-1.5">
                <span>🪷</span> {avatarName} 的亲身体验
              </p>
              <p className="text-sky-800 text-sm leading-relaxed">&ldquo;{game.avatarReview}&rdquo;</p>
            </div>
          )}

          {/* Dimensions */}
          <div>
            <p className="text-sky-400 text-xs font-medium mb-3 uppercase tracking-wider">体验维度</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(game.dimensions).map(([k, v]) => {
                const labels: Record<string, string> = { fun: "趣味感", challenge: "挑战性", engagement: "沉浸度", time: "时间节奏" };
                return (
                  <div key={k} className="bg-white border border-sky-100 rounded-xl px-4 py-3">
                    <p className="text-sky-400 text-xs mb-1">{labels[k]}</p>
                    <p className="text-sky-800 font-semibold text-sm">{v}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {game.tags.map((tag) => (
              <span key={tag} className={`bg-gradient-to-r ${grad} text-white text-xs px-3 py-1 rounded-full`}>{tag}</span>
            ))}
          </div>

          {/* Play button — 直接跳转，不用 iframe（绝大多数网站禁止被嵌入）*/}
          <a
            href={game.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r ${grad} hover:opacity-90 transition-opacity`}
          >
            🎮 去玩这个游戏 ↗
          </a>
        </div>
      </div>
    </div>
  );
}

const REC_GRAD: Record<string, string> = {
  "动作RPG": "from-orange-500 to-red-600",
  "魂类动作": "from-slate-600 to-zinc-700",
  "开放世界RPG": "from-violet-500 to-purple-700",
  "回合制RPG": "from-amber-500 to-yellow-600",
  "开放世界": "from-rose-500 to-pink-600",
  "动作冒险": "from-blue-500 to-indigo-700",
  "步行模拟": "from-teal-500 to-cyan-700",
};

function BigGameCard({
  rec, expanded, onToggle, avatarName,
}: {
  rec: GameRecommendation;
  expanded: boolean;
  onToggle: () => void;
  avatarName: string;
}) {
  const grad = REC_GRAD[rec.genre[0]] || "from-sky-500 to-blue-700";
  return (
    <div className="bg-white/85 backdrop-blur-sm rounded-3xl border border-sky-50 overflow-hidden hover:border-sky-200 transition-all shadow-sm">
      {/* Header */}
      <button onClick={onToggle} className="w-full text-left">
        <div className={`bg-gradient-to-r ${grad} px-6 py-4 flex items-center gap-4`}>
          <span className="text-4xl shrink-0">{rec.coverEmoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {rec.genre.map((g) => (
                <span key={g} className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{g}</span>
              ))}
              <span className="bg-white/10 text-white/70 text-xs px-2 py-0.5 rounded-full">{rec.platform}</span>
            </div>
            <p className="text-white font-bold text-lg leading-tight">{rec.name}</p>
            <p className="text-white/70 text-xs mt-0.5">{rec.nameEn}</p>
          </div>
          <div className="shrink-0 text-white/70 text-sm">{expanded ? "▲" : "▼"}</div>
        </div>
        {/* Preview strip */}
        <div className="px-6 py-3 border-b border-sky-50">
          <p className="text-sky-600 text-sm leading-relaxed">{rec.shortDesc}</p>
          {rec.matchTags.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {rec.matchTags.map((t) => (
                <span key={t} className="bg-amber-50 text-amber-600 text-xs px-2 py-0.5 rounded-full border border-amber-200">✦ 契合「{t}」</span>
              ))}
            </div>
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-6 py-5 space-y-5">
          {/* 分身推荐理由 */}
          <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100">
            <p className="text-sky-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>🪷</span> {avatarName} 为什么推荐你玩这个
            </p>
            <p className="text-sky-800 text-sm leading-relaxed">{rec.whyForYou}</p>
          </div>

          {/* 详细说明 */}
          <div>
            <p className="text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">游戏详情</p>
            <p className="text-sky-700 text-sm leading-relaxed whitespace-pre-line">{rec.detailDesc}</p>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2">
            {rec.tags.map((tag) => (
              <span key={tag} className={`bg-gradient-to-r ${grad} text-white text-xs px-3 py-1 rounded-full`}>{tag}</span>
            ))}
          </div>

          {/* 链接 */}
          <div>
            <p className="text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">去哪里了解</p>
            <div className="flex gap-2 flex-wrap">
              {rec.links.steam && (
                <a href={rec.links.steam} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 text-white hover:bg-slate-700 transition-colors">
                  🎮 Steam 页面 ↗
                </a>
              )}
              <a href={rec.links.gamersky} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors border border-sky-200">
                游民星空评测 ↗
              </a>
              <a href={rec.links.threeDm} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors border border-sky-100">
                3DM 攻略 ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedCard({ item, avatarName, gradClass }: { item: FeedItem; avatarName: string; gradClass: string }) {
  return (
    <div className="space-y-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-sky-50 overflow-hidden shadow-sm">
        {/* Card header */}
        <div className={`bg-gradient-to-r ${gradClass} px-6 py-4 flex items-start justify-between gap-4`}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">事情描述</span>
              {item.sourceName && <span className="text-white/70 text-xs">{item.sourceName}</span>}
            </div>
            {item.sourceUrl ? (
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
                className="group inline-flex items-start gap-1 hover:underline underline-offset-2 decoration-white/50">
                <h3 className="text-white font-bold text-base leading-snug group-hover:text-white/90">{item.title}</h3>
                <span className="text-white/50 text-xs mt-1 shrink-0">↗</span>
              </a>
            ) : (
              <h3 className="text-white font-bold text-base leading-snug">{item.title}</h3>
            )}
          </div>
          {item.sourceUrl && (
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 flex items-center gap-1">
              原文 →
            </a>
          )}
        </div>

        <div className="px-6 py-4 space-y-4">
          <p className="text-sky-700 text-sm leading-relaxed">{item.summary}</p>

          {/* Dimensions */}
          <div>
            <p className="text-sky-400 text-xs font-medium mb-2 uppercase tracking-wider">维度评价</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(item.dimensions).map(([key, val]) => {
                const labels: Record<string, string> = { feeling: "感受", attraction: "吸引力", comfort: "舒适", desire: "欲望", resonance: "契合" };
                return (
                  <span key={key} className="pill bg-sky-50 text-sky-600 border border-sky-100">
                    {labels[key]}：<span className="font-semibold">{val}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Avatar experience */}
          <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100">
            <p className="text-sky-400 text-xs font-medium mb-2">{avatarName} 的体验感受</p>
            <p className="text-sky-700 text-sm leading-relaxed italic">&ldquo;{item.avatarExperience}&rdquo;</p>
          </div>
        </div>
      </div>

      {/* More items */}
      {item.moreItems.length > 0 && (
        <div>
          <p className="text-sky-500 text-xs font-medium mb-2 uppercase tracking-wider">更多相关内容</p>
          <div className="space-y-2">
            {item.moreItems.map((more, i) => (
              <a key={i}
                href={typeof more === "string" ? "#" : more.url}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between bg-white/70 hover:bg-white border border-sky-50 hover:border-sky-200 px-4 py-3 rounded-xl text-sky-700 text-sm hover-lift transition-all group">
                <span className="line-clamp-1">{typeof more === "string" ? more : more.title}</span>
                <span className="text-sky-300 group-hover:text-sky-500 ml-3 shrink-0 transition-colors">→</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
