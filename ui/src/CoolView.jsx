import { useMemo, useState } from "react";

const CHART_W = 820;
const CHART_H = 340;
const M = { top: 20, right: 20, bottom: 46, left: 46 };
const PW = CHART_W - M.left - M.right;
const PH = CHART_H - M.top - M.bottom;
const MAX_HOURS = 30;
const MAX_RANK = 30;

function xScale(h) {
  return M.left + (Math.min(h, MAX_HOURS) / MAX_HOURS) * PW;
}
function yScale(rank) {
  return M.top + ((rank - 1) / (MAX_RANK - 1)) * PH;
}

function storyColor(peakRank) {
  if (peakRank <= 3) return "#ff6600";
  if (peakRank <= 10) return "#0088cc";
  return "#888";
}

function storyUrl(url) {
  return new URL(url, "https://news.ycombinator.com").href;
}

function buildStories(data) {
  const map = new Map();
  for (const { at, entries } of data) {
    const time = new Date(at).getTime();
    for (const entry of entries) {
      if (!map.has(entry.id)) {
        map.set(entry.id, {
          id: entry.id,
          text: entry.text,
          url: entry.url,
          user: entry.user,
          snapshots: [],
        });
      }
      map.get(entry.id).snapshots.push({
        time,
        rank: entry.rank,
        score: entry.score,
        comments: entry.comments,
      });
    }
  }
  return Array.from(map.values())
    .filter((s) => s.snapshots.length >= 2)
    .map((story) => {
      const sorted = [...story.snapshots].sort((a, b) => a.time - b.time);
      const firstSeen = sorted[0].time;
      const lastSeen = sorted[sorted.length - 1].time;
      const peakRank = Math.min(...sorted.map((s) => s.rank));
      const peakScore = Math.max(...sorted.map((s) => s.score));
      const pts = sorted
        .map((s) => ({ ...s, hourOffset: (s.time - firstSeen) / 36e5 }))
        .filter((p) => p.hourOffset <= MAX_HOURS);
      return { ...story, pts, firstSeen, lastSeen, peakRank, peakScore };
    });
}

function StoryPath({ story, isHovered, dimmed, onHover }) {
  const d = story.pts
    .map(
      ({ hourOffset, rank }, i) =>
        `${i === 0 ? "M" : "L"}${xScale(hourOffset).toFixed(1)},${yScale(rank).toFixed(1)}`
    )
    .join(" ");

  let stroke, strokeWidth, opacity;
  if (isHovered) {
    stroke = "#ff3300";
    strokeWidth = 3;
    opacity = 1;
  } else if (story.peakRank <= 3) {
    stroke = storyColor(story.peakRank);
    strokeWidth = 1.5;
    opacity = dimmed ? 0.08 : 0.75;
  } else if (story.peakRank <= 10) {
    stroke = storyColor(story.peakRank);
    strokeWidth = 1;
    opacity = dimmed ? 0.04 : 0.35;
  } else {
    stroke = storyColor(story.peakRank);
    strokeWidth = 0.6;
    opacity = dimmed ? 0.02 : 0.18;
  }

  return (
    <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      opacity={opacity}
      style={{ cursor: "pointer" }}
      tabIndex={0}
      onMouseEnter={() => onHover(story.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(story.id)}
      onBlur={() => onHover(null)}
    />
  );
}

function DomainChart({ stories }) {
  const domains = useMemo(() => {
    const map = new Map();
    for (const story of stories) {
      if (!story.url) continue;
      let domain;
      try {
        domain = new URL(story.url, "https://news.ycombinator.com").hostname.replace(/^www\./, "");
      } catch {
        continue;
      }
      const d = map.get(domain) || {
        count: 0,
        totalScore: 0,
        topRank: MAX_RANK,
      };
      d.count++;
      d.totalScore += story.peakScore;
      d.topRank = Math.min(d.topRank, story.peakRank);
      map.set(domain, d);
    }
    return Array.from(map.entries())
      .map(([domain, stats]) => ({
        domain,
        ...stats,
        avgScore: Math.round(stats.totalScore / stats.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [stories]);

  const maxCount = domains[0]?.count || 1;

  return (
    <div style={{ display: "grid", gap: "0.35rem" }}>
      {domains.map(({ domain, count, avgScore, topRank }) => (
        <div
          key={domain}
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <div
            style={{
              width: 170,
              textAlign: "right",
              fontSize: 13,
              color: "#444",
              flexShrink: 0,
              fontFamily: "monospace",
            }}
          >
            {domain}
          </div>
          <div
            style={{
              flex: 1,
              background: "#f0f0f0",
              borderRadius: 3,
              height: 20,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${((count / maxCount) * 100).toFixed(1)}%`,
                background: storyColor(topRank),
                height: "100%",
                borderRadius: 3,
              }}
            />
          </div>
          <div
            style={{ width: 120, fontSize: 12, color: "#888", flexShrink: 0 }}
          >
            {count} {count === 1 ? "story" : "stories"} · peak #{topRank}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div
      style={{
        background: "#fff8f0",
        border: "1px solid #ffd0a0",
        borderRadius: 8,
        padding: "0.5rem 1rem",
        minWidth: 110,
      }}
    >
      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ff6600" }}>
        {value}
      </div>
      <div style={{ fontSize: "0.75rem", color: "#888" }}>{label}</div>
    </div>
  );
}

export function CoolView({ data }) {
  const [hoveredId, setHoveredId] = useState(null);
  const stories = useMemo(() => buildStories(data), [data]);
  const hovered = hoveredId ? stories.find((s) => s.id === hoveredId) : null;
  const avgPeakScore =
    stories.length > 0
      ? Math.round(
          stories.reduce((sum, s) => sum + s.peakScore, 0) / stories.length
        )
      : 0;

  return (
    <main style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto" }}>
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ margin: "0 0 0.4rem", fontSize: "1.4rem" }}>
          Story Arcs
        </h2>
        <p style={{ margin: "0 0 1.25rem", color: "#666", fontSize: "0.9rem" }}>
          Each line is a story's journey through the rankings. X = hours since
          it first appeared on the front page. Y = rank (1 = top).{" "}
          <span style={{ color: "#ff6600" }}>Orange = reached top 3</span>,{" "}
          <span style={{ color: "#0088cc" }}>blue = top 10</span>. Hover to
          inspect.
        </p>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          <StatCard value={stories.length} label="Stories tracked" />
          <StatCard
            value={stories.filter((s) => s.peakRank <= 3).length}
            label="Reached top 3"
          />
          <StatCard value={`${avgPeakScore} pts`} label="Avg peak score" />
          <StatCard value={data.length} label="Snapshots" />
        </div>

        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          role="img"
          aria-labelledby="chart-title"
          style={{
            width: "100%",
            display: "block",
            border: "1px solid #e8e8e8",
            borderRadius: 8,
            background: "#fafafa",
          }}
        >
          <title id="chart-title">
            Story rank trajectories over time: each line shows a story's rank
            (1 = top) across the hours it spent on the HN front page.
          </title>

          <rect x={M.left} y={M.top} width={PW} height={PH} fill="white" />

          {/* Rank grid lines */}
          {[1, 5, 10, 15, 20, 25, 30].map((r) => {
            const y = yScale(r);
            return (
              <g key={r}>
                <line
                  x1={M.left}
                  y1={y}
                  x2={M.left + PW}
                  y2={y}
                  stroke={r === 1 ? "#ffe0b0" : "#f0f0f0"}
                  strokeWidth={r === 1 ? 2 : 1}
                />
                <text
                  x={M.left - 6}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={10}
                  fill={r <= 3 ? "#cc6600" : "#ccc"}
                >
                  {r}
                </text>
              </g>
            );
          })}

          {/* Hour grid lines */}
          {[0, 6, 12, 18, 24, 30].map((h) => {
            const x = xScale(h);
            return (
              <g key={h}>
                <line
                  x1={x}
                  y1={M.top}
                  x2={x}
                  y2={M.top + PH}
                  stroke="#f0f0f0"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={M.top + PH + 16}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#bbb"
                >
                  {h}h
                </text>
              </g>
            );
          })}

          {/* Axis labels */}
          <text
            x={M.left + PW / 2}
            y={CHART_H - 5}
            textAnchor="middle"
            fontSize={11}
            fill="#aaa"
          >
            hours since story first appeared
          </text>
          <text
            x={14}
            y={M.top + PH / 2}
            textAnchor="middle"
            fontSize={11}
            fill="#aaa"
            transform={`rotate(-90, 14, ${M.top + PH / 2})`}
          >
            rank
          </text>

          {/* Background stories (lower ranked) */}
          {stories
            .filter((s) => s.peakRank > 10)
            .map((story) => (
              <StoryPath
                key={story.id}
                story={story}
                isHovered={hoveredId === story.id}
                dimmed={hoveredId !== null && hoveredId !== story.id}
                onHover={setHoveredId}
              />
            ))}

          {/* Mid-tier stories */}
          {stories
            .filter((s) => s.peakRank > 3 && s.peakRank <= 10)
            .map((story) => (
              <StoryPath
                key={story.id}
                story={story}
                isHovered={hoveredId === story.id}
                dimmed={hoveredId !== null && hoveredId !== story.id}
                onHover={setHoveredId}
              />
            ))}

          {/* Top-3 stories on top of stack */}
          {stories
            .filter((s) => s.peakRank <= 3)
            .map((story) => (
              <StoryPath
                key={story.id}
                story={story}
                isHovered={hoveredId === story.id}
                dimmed={hoveredId !== null && hoveredId !== story.id}
                onHover={setHoveredId}
              />
            ))}
        </svg>

        {/* Tooltip area */}
        <div
          style={{
            minHeight: 58,
            marginTop: "0.5rem",
            padding: "0.6rem 1rem",
            background: hovered ? "#fff8f0" : "transparent",
            border: hovered ? "1px solid #ffd0a0" : "1px solid transparent",
            borderRadius: 8,
            transition: "background 0.1s, border-color 0.1s",
          }}
        >
          {hovered ? (
            <>
              <div style={{ fontWeight: 700, marginBottom: 3 }}>
                <a
                  href={hovered.url ? storyUrl(hovered.url) : "#"}
                  style={{ color: "inherit", textDecoration: "none" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {hovered.text}
                </a>
              </div>
              <div style={{ fontSize: "0.83rem", color: "#888" }}>
                Peak rank:{" "}
                <strong style={{ color: "#444" }}>#{hovered.peakRank}</strong>
                &ensp;·&ensp;Peak score:{" "}
                <strong style={{ color: "#444" }}>{hovered.peakScore} pts</strong>
                &ensp;·&ensp;Visible for:{" "}
                <strong style={{ color: "#444" }}>
                  {((hovered.lastSeen - hovered.firstSeen) / 36e5).toFixed(1)}h
                </strong>
                &ensp;·&ensp;by {hovered.user}
              </div>
            </>
          ) : (
            <div style={{ color: "#ccc", fontSize: "0.85rem" }}>
              Hover a line to see story details
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 style={{ margin: "0 0 0.4rem", fontSize: "1.4rem" }}>
          Top Domains
        </h2>
        <p style={{ margin: "0 0 1.25rem", color: "#666", fontSize: "0.9rem" }}>
          Which domains appear most on the HN front page.{" "}
          <span style={{ color: "#ff6600" }}>Orange = had a top-3 story</span>,{" "}
          <span style={{ color: "#0088cc" }}>blue = top-10</span>.
        </p>
        <DomainChart stories={stories} />
      </section>
    </main>
  );
}
