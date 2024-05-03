import { useMemo } from "react";
import { colour } from "./View";

export const RankGraph = ({ data, current, highlights }) => {
  const idx = data.indexOf(current);
  const paths = useMemo(() => {
    const pathss = new Map();
    let prev = new Set();

    data.forEach(({ entries }, i) => {
      for (const { rank, id } of entries) {
        const x = i * 20,
          y = rank * 10;

        let p = pathss.get(id) || `M ${x} ${y}`;

        if (!prev.has(id)) {
          p += `M${x} ${y} `;
        }

        p += `L${x} ${y} h3`;

        pathss.set(id, p);
        prev.add(id);
      }

      prev.clear();
      for (const { rank, id } of entries) {
        prev.add(id);
      }
    });
    return pathss;
  }, [data]);

  return (
    <>
      <svg style={{ height: 310, width: data.length * 20 }}>
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={600}
          stroke="red"
          strokeDasharray="5,5"
          style={{ transform: `translateX(${idx * 20}px)` }}
        ></line>
        {Array.from(paths.entries()).map(([id, d], i) => (
          <path
            key={i}
            d={d}
            stroke={colour(highlights.indexOf(id)) || "#888a"}
            strokeWidth={highlights.indexOf(id) === -1 ? 1 : 3}
          />
        ))}
      </svg>
    </>
  );
};
