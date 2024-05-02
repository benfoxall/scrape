import { useState, useRef, useLayoutEffect, useMemo } from "react";

export const View = ({ data }) => {
  const [idx, setIdx] = useState(0);
  const [hov, setHov] = useState(0);
  const listRef = useRef(null);

  const heights = useHeights(listRef);

  const current = data[idx];

  const paths = useMemo(() => {
    const pathss = new Map();
    data.forEach(({ entries }, i) => {
      for (const { rank, id } of entries) {
        const x = i * 30,
          y = heights[rank - 1];

        let p = pathss.get(id) || `M ${x} ${y}`;

        p += `L ${x} ${y} h3`;

        pathss.set(id, p);
      }
    });
    return pathss;
  }, [heights, data]);

  return (
    <>
      <input
        type="range"
        value={idx}
        max={data.length - 1}
        onChange={(e) => setIdx(e.target.valueAsNumber)}
      />
      {idx + 1} / {data.length}
      {current && (
        <>
          <h3>{new Date(current.at).toLocaleString()}</h3>

          <div className="time-graph">
            <svg>
              {Array.from(paths.entries()).map(([id, d], i) => (
                <path
                  key={i}
                  d={d}
                  stroke={hov === id ? "#f08" : "#08f2"}
                  strokeWidth={hov === id ? 5 : 1}
                />
              ))}
            </svg>
            <ol ref={listRef}>
              {current.entries.map(
                ({ id, rank, score, text, url, user, created, comments }) => (
                  <li key={id} onMouseOver={() => setHov(id)}>
                    <h4>
                      <a
                        href={new URL(
                          url,
                          "https://news.ycombinator.com"
                        ).toString()}
                      >
                        {text}
                      </a>
                    </h4>
                    <p>
                      {score} points by {user},{" "}
                      <a href={`https://news.ycombinator.com/item?id=${id}`}>
                        {comments} comments
                      </a>
                    </p>
                  </li>
                )
              )}
            </ol>
          </div>
        </>
      )}
    </>
  );
};

function useHeights(ref) {
  const [heights, setHeights] = useState([]);

  useLayoutEffect(() => {
    function size() {
      const { current: list } = ref;

      if (list) {
        const { top: listTop } = list.getBoundingClientRect();

        setHeights(
          Array.from(list.childNodes, (node) => {
            const { height, top } = node.getBoundingClientRect();

            return top - listTop + height / 2;
          })
        );
      }
    }

    size();

    window.addEventListener("resize", size);
    return () => window.removeEventListener("resize", size);
  }, []);

  return heights;
}
