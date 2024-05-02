import { useState, useRef, useLayoutEffect, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";

export const View = ({ data }) => {
  const [idx, setIdx] = useState(0);
  const [hov, setHov] = useState(0);

  const current = data[idx];

  return (
    <>
      <label>
        hacker news
        {current && ` – ${formatDistanceToNow(new Date(current.at))} ago`}
        <br />
        <input
          type="range"
          value={idx}
          max={data.length - 1}
          onChange={(e) => setIdx(e.target.valueAsNumber)}
        />
      </label>
      {current && (
        <>
          <div className="time-graph">
            <ol>
              {current.entries.map(
                ({ id, rank, score, text, url, user, created, comments }) => (
                  <li
                    key={id}
                    onClick={() => setHov(id)}
                    className={hov === id ? "active" : ""}
                  >
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
