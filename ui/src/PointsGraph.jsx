import { useMemo } from "react";
import { colour } from "./View";

const height = 400;

export const PointsGraph = ({ data, current, highlights }) => {
  const idx = data.indexOf(current);
  const paths = useMemo(() => {
    const convert = (v) => v; // Math.log(v + 1);

    const max = Math.max(
      ...data.map(({ entries }) =>
        Math.max(...entries.map(({ score }) => convert(score)))
      )
    );

    const scale = height / max;

    const pathss = new Map();
    data.forEach(({ entries }, i) => {
      for (const { score, id } of entries) {
        if (!score) continue;

        const x = i * 20,
          y = height - convert(score) * scale;

        let p = pathss.get(id) || `M ${x} ${y}`;

        p += `L ${x} ${y}`;

        pathss.set(id, p);
      }
    });
    return pathss;
  }, [data]);

  return (
    <>
      <h3>Votes</h3>
      <svg style={{ height, width: "100%" }}>
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
            stroke={colour(highlights.indexOf(id)) || "#0003"}
            strokeWidth={highlights.indexOf(id) === -1 ? 1 : 3}
          />
        ))}
      </svg>
    </>
  );
};
