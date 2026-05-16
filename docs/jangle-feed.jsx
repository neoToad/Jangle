import { useState } from "react";

const palette = {
  bg: "#1a1614",
  surface: "#252019",
  surfaceHover: "#2e2820",
  border: "#3a3228",
  accent: "#c9a87c",
  accentSoft: "rgba(201,168,124,0.12)",
  sage: "#8faa8b",
  sageSoft: "rgba(143,170,139,0.12)",
  textPrimary: "#ede6d6",
  textMuted: "#9c8f7e",
  textDim: "#5a5048",
  glow: "rgba(201,168,124,0.06)",
};

const style = {
  root: {
    minHeight: "100vh",
    backgroundColor: palette.bg,
    backgroundImage: `radial-gradient(ellipse at 20% 20%, rgba(201,168,124,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(143,170,139,0.03) 0%, transparent 60%)`,
    fontFamily: "'DM Sans', sans-serif",
    color: palette.textPrimary,
  },
};

const posts = [
  {
    id: 1,
    type: "game",
    author: "mosswood",
    avatar: "🌿",
    time: "23 minutes ago",
    title: "Tiny Garden Sim",
    description: "A relaxing little game where you grow things and water them. No fail state, just vibes.",
    playCount: 41,
    reactions: { "🌱": 14, "❤️": 9, "✨": 6 },
    votes: 38,
    comments: 7,
    playing: true,
    color: palette.sage,
    colorSoft: palette.sageSoft,
  },
  {
    id: 2,
    type: "writing",
    author: "hazel.ink",
    avatar: "🖋️",
    time: "1 hour ago",
    title: "On Making Things Nobody Asked For",
    description: "A short essay about the strange compulsion to create stuff that has no audience, no purpose, and somehow becomes the most meaningful thing you've done.",
    reactions: { "💛": 22, "🔥": 11, "👀": 8 },
    votes: 54,
    comments: 19,
    playing: false,
    color: palette.accent,
    colorSoft: palette.accentSoft,
  },
  {
    id: 3,
    type: "youtube",
    author: "driftwood_tv",
    avatar: "📽️",
    time: "3 hours ago",
    title: "The Last Video Store in My City",
    description: "Someone made a short doc about the last Blockbuster-style store still operating. It's really beautiful.",
    reactions: { "😭": 17, "❤️": 13, "🎬": 5 },
    votes: 29,
    comments: 11,
    playing: false,
    color: "#a87c9e",
    colorSoft: "rgba(168,124,158,0.12)",
  },
  {
    id: 4,
    type: "game",
    author: "bytesprout",
    avatar: "🕹️",
    time: "5 hours ago",
    title: "Neon Marble Run",
    description: "Drop marbles, watch them bounce. Physics-based puzzle game with 12 levels. Made in a weekend.",
    playCount: 88,
    reactions: { "🎮": 20, "✨": 15, "🔥": 9 },
    votes: 71,
    comments: 23,
    playing: false,
    color: "#7ca8c9",
    colorSoft: "rgba(124,168,201,0.12)",
  },
];

const typeLabel = { game: "GAME", writing: "WRITING", youtube: "VIDEO" };
const typeIcon = { game: "▶", writing: "✦", youtube: "◈" };

function PostCard({ post }) {
  const [voted, setVoted] = useState(null);
  const [reactions, setReactions] = useState(post.reactions);
  const [showReactions, setShowReactions] = useState(false);
  const [hovered, setHovered] = useState(false);

  const vote = (dir) => setVoted(voted === dir ? null : dir);
  const addReaction = (emoji) => {
    setReactions((r) => ({ ...r, [emoji]: (r[emoji] || 0) + 1 }));
    setShowReactions(false);
  };

  const score = post.votes + (voted === "up" ? 1 : voted === "down" ? -1 : 0);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? palette.surfaceHover : palette.surface,
        border: `1px solid ${hovered ? post.color + "55" : palette.border}`,
        borderRadius: 20,
        padding: "22px 24px",
        marginBottom: 16,
        transition: "all 0.25s ease",
        boxShadow: hovered ? `0 0 32px ${post.color}18, 0 4px 20px rgba(0,0,0,0.3)` : "0 2px 12px rgba(0,0,0,0.2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle texture */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 20, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
        opacity: 0.5,
      }} />

      {/* Playing indicator */}
      {post.playing && (
        <div style={{
          position: "absolute", top: 16, right: 16,
          display: "flex", alignItems: "center", gap: 6,
          backgroundColor: palette.sageSoft,
          border: `1px solid ${palette.sage}44`,
          borderRadius: 20, padding: "3px 10px",
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            backgroundColor: palette.sage,
            boxShadow: `0 0 8px ${palette.sage}`,
            animation: "pulse 2s infinite",
          }} />
          <span style={{ fontSize: 11, color: palette.sage, fontWeight: 600, letterSpacing: "0.05em" }}>LIVE</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          backgroundColor: post.colorSoft,
          border: `1px solid ${post.color}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>{post.avatar}</div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: palette.textPrimary }}>{post.author}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
              color: post.color, backgroundColor: post.colorSoft,
              border: `1px solid ${post.color}33`,
              borderRadius: 6, padding: "2px 7px",
            }}>{typeIcon[post.type]} {typeLabel[post.type]}</span>
          </div>
          <div style={{ fontSize: 12, color: palette.textMuted, marginTop: 1 }}>{post.time}</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 20, fontWeight: 600,
          color: palette.textPrimary,
          marginBottom: 8, lineHeight: 1.3,
        }}>{post.title}</div>
        <div style={{ fontSize: 14, color: palette.textMuted, lineHeight: 1.6 }}>{post.description}</div>
      </div>

      {/* Game preview bar */}
      {post.type === "game" && (
        <div style={{
          backgroundColor: post.colorSoft,
          border: `1px solid ${post.color}33`,
          borderRadius: 12, padding: "12px 16px",
          marginBottom: 16,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>🎮</span>
            <div>
              <div style={{ fontSize: 12, color: post.color, fontWeight: 600 }}>Playable in browser</div>
              <div style={{ fontSize: 11, color: palette.textMuted }}>{post.playCount} people played</div>
            </div>
          </div>
          <button style={{
            backgroundColor: post.color,
            color: palette.bg,
            border: "none", borderRadius: 10,
            padding: "8px 18px", fontWeight: 700, fontSize: 13,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.03em",
          }}>Play Now</button>
        </div>
      )}

      {/* YouTube preview bar */}
      {post.type === "youtube" && (
        <div style={{
          backgroundColor: post.colorSoft,
          border: `1px solid ${post.color}33`,
          borderRadius: 12, padding: "12px 16px",
          marginBottom: 16,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            backgroundColor: post.color + "33",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>▶</div>
          <div>
            <div style={{ fontSize: 12, color: post.color, fontWeight: 600 }}>YouTube embed</div>
            <div style={{ fontSize: 11, color: palette.textMuted }}>Click to watch inline</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        {/* Reactions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {Object.entries(reactions).map(([emoji, count]) => (
            <button key={emoji} onClick={() => addReaction(emoji)} style={{
              backgroundColor: palette.accentSoft,
              border: `1px solid ${palette.border}`,
              borderRadius: 20, padding: "4px 10px",
              fontSize: 13, cursor: "pointer", color: palette.textPrimary,
              display: "flex", alignItems: "center", gap: 4,
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
            }}>
              {emoji} <span style={{ fontSize: 12, color: palette.textMuted }}>{count}</span>
            </button>
          ))}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowReactions(!showReactions)} style={{
              backgroundColor: "transparent",
              border: `1px dashed ${palette.border}`,
              borderRadius: 20, padding: "4px 10px",
              fontSize: 13, cursor: "pointer", color: palette.textMuted,
              fontFamily: "'DM Sans', sans-serif",
            }}>+ React</button>
            {showReactions && (
              <div style={{
                position: "absolute", bottom: "calc(100% + 8px)", left: 0,
                backgroundColor: palette.surface,
                border: `1px solid ${palette.border}`,
                borderRadius: 12, padding: 8,
                display: "flex", gap: 6, zIndex: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}>
                {["😍","🔥","💀","👏","🫶","🤯"].map(e => (
                  <button key={e} onClick={() => addReaction(e)} style={{
                    background: "none", border: "none", fontSize: 20,
                    cursor: "pointer", borderRadius: 8, padding: "4px 6px",
                  }}>{e}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{
            background: "none", border: "none", color: palette.textMuted,
            fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
            fontFamily: "'DM Sans', sans-serif",
          }}>💬 {post.comments}</button>

          {/* Vote */}
          <div style={{
            display: "flex", alignItems: "center", gap: 0,
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
            borderRadius: 20, overflow: "hidden",
          }}>
            <button onClick={() => vote("up")} style={{
              background: voted === "up" ? palette.accentSoft : "none",
              border: "none", color: voted === "up" ? palette.accent : palette.textMuted,
              padding: "5px 10px", cursor: "pointer", fontSize: 14,
            }}>▲</button>
            <span style={{ fontSize: 13, color: palette.textPrimary, padding: "0 4px", minWidth: 24, textAlign: "center" }}>{score}</span>
            <button onClick={() => vote("down")} style={{
              background: voted === "down" ? "rgba(180,100,100,0.12)" : "none",
              border: "none", color: voted === "down" ? "#c97c7c" : palette.textMuted,
              padding: "5px 10px", cursor: "pointer", fontSize: 14,
            }}>▼</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JangleFeed() {
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMsg, setChatMsg] = useState("");
  const [messages, setMessages] = useState([
    { user: "mosswood", text: "just dropped a new game if anyone wants to try it 🌱", time: "now" },
    { user: "hazel.ink", text: "omg tiny garden sim is so calming", time: "2m" },
    { user: "bytesprout", text: "working on level 8 of marble run still lol", time: "5m" },
  ]);

  const sendMsg = () => {
    if (!chatMsg.trim()) return;
    setMessages(m => [...m, { user: "you", text: chatMsg, time: "now" }]);
    setChatMsg("");
  };

  return (
    <div style={style.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #3a3228; border-radius: 3px; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .shake-btn:hover { animation: shake 0.4s ease; }
        @keyframes shake { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-6deg)} 75%{transform:rotate(6deg)} }
      `}</style>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        backgroundColor: palette.bg + "ee",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${palette.border}`,
        padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 56,
      }}>
        <div style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 22, fontWeight: 700,
          color: palette.accent,
          letterSpacing: "-0.02em",
        }}>jangle</div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
            borderRadius: 20, padding: "7px 16px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: palette.textMuted, fontSize: 13 }}>🔍</span>
            <input placeholder="search drops..." style={{
              background: "none", border: "none", outline: "none",
              color: palette.textPrimary, fontSize: 13,
              fontFamily: "'DM Sans', sans-serif", width: 140,
            }} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="shake-btn" style={{
            backgroundColor: palette.accentSoft,
            border: `1px solid ${palette.accent}44`,
            borderRadius: 20, padding: "7px 16px",
            color: palette.accent, fontWeight: 600, fontSize: 13,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>✦ Shake it</button>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            backgroundColor: palette.sageSoft,
            border: `1px solid ${palette.sage}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, cursor: "pointer",
          }}>🌿</div>
        </div>
      </nav>

      {/* Main layout */}
      <div style={{
        maxWidth: 900, margin: "0 auto", padding: "24px 16px",
        display: "flex", gap: 20, alignItems: "flex-start",
      }}>

        {/* Feed */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Feed header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["Following", "Explore", "Games"].map((tab, i) => (
                <button key={tab} style={{
                  backgroundColor: i === 0 ? palette.accentSoft : "transparent",
                  border: `1px solid ${i === 0 ? palette.accent + "44" : palette.border}`,
                  borderRadius: 20, padding: "6px 14px",
                  color: i === 0 ? palette.accent : palette.textMuted,
                  fontWeight: i === 0 ? 600 : 400, fontSize: 13,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>{tab}</button>
              ))}
            </div>
            <button style={{
              backgroundColor: palette.accent,
              border: "none", borderRadius: 20,
              padding: "8px 18px", color: palette.bg,
              fontWeight: 700, fontSize: 13, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}>+ Drop something</button>
          </div>

          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>

        {/* Chat sidebar */}
        <div style={{
          width: 260, flexShrink: 0,
          position: "sticky", top: 76,
          backgroundColor: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: 20, overflow: "hidden",
          animation: "fadeIn 0.3s ease",
        }}>
          <div style={{
            padding: "14px 16px",
            borderBottom: `1px solid ${palette.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: palette.sage, boxShadow: `0 0 8px ${palette.sage}`, animation: "pulse 2s infinite" }} />
              <span style={{ fontWeight: 600, fontSize: 14, color: palette.textPrimary }}>The Jangle</span>
            </div>
            <span style={{ fontSize: 11, color: palette.textMuted }}>12 online</span>
          </div>

          <div style={{ padding: "12px 14px", height: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ animation: "fadeIn 0.2s ease" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: palette.accent }}>{m.user}</span>
                  <span style={{ fontSize: 10, color: palette.textDim }}>{m.time}</span>
                </div>
                <div style={{
                  fontSize: 13, color: palette.textMuted, lineHeight: 1.5,
                  backgroundColor: palette.bg + "88",
                  borderRadius: 10, padding: "6px 10px",
                  border: `1px solid ${palette.border}`,
                }}>{m.text}</div>
              </div>
            ))}
          </div>

          <div style={{
            padding: "10px 12px",
            borderTop: `1px solid ${palette.border}`,
            display: "flex", gap: 8,
          }}>
            <input
              value={chatMsg}
              onChange={e => setChatMsg(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMsg()}
              placeholder="say something..."
              style={{
                flex: 1, backgroundColor: palette.bg,
                border: `1px solid ${palette.border}`,
                borderRadius: 12, padding: "7px 12px",
                color: palette.textPrimary, fontSize: 13,
                fontFamily: "'DM Sans', sans-serif", outline: "none",
              }}
            />
            <button onClick={sendMsg} style={{
              backgroundColor: palette.accentSoft,
              border: `1px solid ${palette.accent}44`,
              borderRadius: 12, padding: "7px 12px",
              color: palette.accent, cursor: "pointer", fontSize: 14,
            }}>↑</button>
          </div>
        </div>
      </div>
    </div>
  );
}
