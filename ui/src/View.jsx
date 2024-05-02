import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import styles from "./View.module.css";

const colours = [
  "#e60049",
  "#0bb4ff",
  "#50e991",
  "#e6d800",
  "#9b19f5",
  "#ffa300",
  "#dc0ab4",
  "#b3d4ff",
  "#00bfa0",
];

function colour(idx) {
  return colours[idx % colours.length];
}

export const View = ({ data }) => {
  const [idx, setIdx] = useState(0);
  const [highlights, setHighlights] = useState([]);

  const current = data[idx];

  function highlight(item) {
    if (highlights.includes(item)) {
      setHighlights(highlights.filter((h) => h !== item));
    } else {
      setHighlights(highlights.concat(item));
    }
  }

  return (
    <>
      <label className={styles.slider}>
        {current && `${formatDistanceToNow(new Date(current.at))} ago`}
        <input
          type="range"
          value={idx}
          max={data.length - 1}
          onChange={(e) => setIdx(e.target.valueAsNumber)}
        />
      </label>
      {current && (
        <ol className={styles.list}>
          {current.entries.map(
            ({ id, rank, score, text, url, user, created, comments }) => {
              const colourIndex = highlights.indexOf(id);
              const itemColor = colour(colourIndex);

              return (
                <li
                  key={id}
                  onClick={() => setHov(id)}
                  className={styles.row}
                  style={{ color: itemColor }}
                >
                  <button
                    aria-label="highlight"
                    onClick={() => highlight(id)}
                    style={{ background: itemColor }}
                  >
                    →
                  </button>
                  <span>{rank}.</span>
                  <div>
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
                  </div>
                </li>
              );
            }
          )}
        </ol>
      )}

      <hr />
    </>
  );
};
