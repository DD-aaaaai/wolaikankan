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
    <main className="min-h-screen bg-stone-950 text-stone-100">
      <nav className="border-b border-stone-800 px-6 py-4 flex items-center justify-between">
        <span className="text-stone-400 text-xs tracking-widest">🪷 我来看看</span>
        <div className="flex gap-6 text-xs text-stone-500">
          <Link href="/avatar" className="hover:text-stone-300 transition-colors">我的分身</Link>
          <Link href="/plaza" className="text-stone-300">分身广场</Link>
        </div>
      </nav>

      <div className="px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <p className="text-stone-500 text-xs tracking-widest mb-1">分身广场</p>
          <h2 className="text-2xl font-light">看看其他人的分身</h2>
          <p className="text-stone-500 text-sm mt-2">每一个分身，都是一个独特的视角在看这个世界。</p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-stone-900 p-5 animate-pulse h-40" />
            ))}
          </div>
        )}

        {!loading && (
          <>
            {/* Self card */}
            {self && (
              <div className="mb-6">
                <p className="text-stone-500 text-xs tracking-widest mb-3">你的分身</p>
                <UserCard user={self} />
              </div>
            )}

            {/* Other avatars */}
            <p className="text-stone-500 text-xs tracking-widest mb-3">广场上的分身</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user, i) => (
                <UserCard key={i} user={user} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function UserCard({ user }: { user: AvatarUser }) {
  const homepage = user.route ? `https://second-me.cn/${user.route}` : null;

  return (
    <div className={`p-5 space-y-3 transition-colors ${user.isSelf ? "bg-stone-800 border border-stone-600" : "bg-stone-900 hover:bg-stone-800"}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-stone-100 text-sm font-medium">{user.username || "匿名分身"}</p>
            {user.isSelf && <span className="text-xs px-1.5 py-0.5 bg-stone-600 text-stone-300">你</span>}
          </div>
          {user.title && <p className="text-stone-500 text-xs mt-0.5">{user.title}</p>}
        </div>
        {user.matchScore !== undefined && !user.isSelf && (
          <span className="text-stone-600 text-xs">契合 {Math.round(user.matchScore * 100)}%</span>
        )}
      </div>

      {user.hook && (
        <p className="text-stone-400 text-sm leading-relaxed italic">&ldquo;{user.hook}&rdquo;</p>
      )}

      {user.briefIntroduction && (
        <p className="text-stone-500 text-xs leading-relaxed line-clamp-2">{user.briefIntroduction}</p>
      )}

      {homepage ? (
        <a href={homepage} target="_blank" rel="noopener noreferrer"
          className="inline-block text-stone-500 text-xs hover:text-stone-300 transition-colors border-b border-stone-700 hover:border-stone-500">
          查看 SecondMe 主页 →
        </a>
      ) : user.isSelf ? (
        <Link href="/avatar" className="inline-block text-stone-500 text-xs hover:text-stone-300 transition-colors border-b border-stone-700 hover:border-stone-500">
          查看我的分身 →
        </Link>
      ) : (
        <span className="text-stone-700 text-xs">主页暂不可用</span>
      )}
    </div>
  );
}
