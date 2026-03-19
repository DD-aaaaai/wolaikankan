"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AvatarUser {
  username?: string;
  route?: string | null;
  title?: string;
  hook?: string;
  briefIntroduction?: string;
  matchScore?: number;
  isSelf?: boolean;
}

const AVATAR_GRADIENTS = [
  "from-sky-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-purple-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-red-500",
  "from-indigo-400 to-violet-500",
  "from-cyan-400 to-sky-500",
  "from-lime-400 to-green-500",
  "from-fuchsia-400 to-purple-500",
  "from-yellow-400 to-amber-500",
];

export default function PlazaPage() {
  const [self, setSelf] = useState<AvatarUser | null>(null);
  const [users, setUsers] = useState<AvatarUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/plaza")
      .then((r) => r.json())
      .then((d) => {
        setSelf(d.self || null);
        setUsers(d.users || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 50%, #ecfdf5 100%)" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-sky-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🪷</span>
          <span className="text-sky-700 font-bold text-sm" style={{ fontFamily: "var(--font-syne)" }}>我来看看</span>
        </div>
        <div className="flex gap-1">
          {(["我的分身", "分身广场"] as const).map((label, i) => (
            <Link key={label} href={i === 0 ? "/avatar" : "/plaza"}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${i === 1 ? "bg-sky-500 text-white shadow-sm" : "text-sky-500 hover:bg-sky-50"}`}>
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="px-6 py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 fade-up-1">
          <p className="text-sky-400 text-xs font-medium tracking-widest uppercase mb-1">分身广场</p>
          <h1 className="text-3xl font-bold text-sky-900 mb-2" style={{ fontFamily: "var(--font-syne)" }}>
            看看其他人的分身 🌊
          </h1>
          <p className="text-sky-500/70 text-sm">每一个分身，都是一个独特的视角在看这个世界。</p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shimmer rounded-3xl h-44" />
            ))}
          </div>
        )}

        {!loading && (
          <div className="space-y-8">
            {/* Self card */}
            {self && (
              <div>
                <p className="text-sky-500 text-xs font-semibold uppercase tracking-widest mb-3">✨ 你的分身</p>
                <div className="max-w-sm">
                  <UserCard user={self} gradIndex={0} isSelf />
                </div>
              </div>
            )}

            {/* Others */}
            {users.length > 0 && (
              <div>
                <p className="text-sky-500 text-xs font-semibold uppercase tracking-widest mb-3">🌊 广场上的分身们</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user, i) => (
                    <UserCard key={i} user={user} gradIndex={(i + 1) % AVATAR_GRADIENTS.length} />
                  ))}
                </div>
              </div>
            )}

            {users.length === 0 && !self && (
              <div className="text-center py-20">
                <span className="text-5xl">🌫️</span>
                <p className="text-sky-400 text-sm mt-4">暂时还没有发现其他分身</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function UserCard({ user, gradIndex, isSelf }: { user: AvatarUser; gradIndex: number; isSelf?: boolean }) {
  const grad = AVATAR_GRADIENTS[gradIndex];
  const homepage = user.route ? `https://second-me.cn/${user.route}` : null;
  const initials = (user.username || "?").slice(0, 2);

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-3xl border overflow-hidden hover-lift transition-all ${isSelf ? "border-sky-300 ring-2 ring-sky-200" : "border-sky-50 hover:border-sky-200"}`}>
      {/* Card top strip */}
      <div className={`bg-gradient-to-r ${grad} h-1.5`} />

      <div className="p-5 space-y-3">
        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sky-900 font-semibold text-sm truncate">{user.username || "匿名分身"}</p>
              {isSelf && <span className="bg-sky-100 text-sky-600 text-xs px-1.5 py-0.5 rounded-full font-medium">你</span>}
            </div>
            {user.title && <p className="text-sky-400 text-xs truncate">{user.title}</p>}
          </div>
          {user.matchScore !== undefined && !isSelf && (
            <div className="text-right shrink-0">
              <p className="text-xs font-bold text-sky-600">{Math.round(user.matchScore * 100)}%</p>
              <p className="text-xs text-sky-400">契合</p>
            </div>
          )}
        </div>

        {/* Hook */}
        {user.hook && (
          <p className="text-sky-700 text-xs leading-relaxed italic bg-sky-50 rounded-xl px-3 py-2 line-clamp-2">
            &ldquo;{user.hook}&rdquo;
          </p>
        )}

        {/* Intro */}
        {user.briefIntroduction && (
          <p className="text-sky-500 text-xs leading-relaxed line-clamp-2">{user.briefIntroduction}</p>
        )}

        {/* Link */}
        {homepage ? (
          <a href={homepage} target="_blank" rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-xl transition-all bg-gradient-to-r ${grad} text-white hover:opacity-90`}>
            SecondMe 主页 →
          </a>
        ) : isSelf ? (
          <Link href="/avatar"
            className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-xl bg-gradient-to-r ${grad} text-white hover:opacity-90`}>
            查看我的分身 →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
