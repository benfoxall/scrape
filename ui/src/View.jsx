import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import styles from "./View.module.css";
import { RankGraph } from "./RankGraph";
import { PointsGraph } from "./PointsGraph";
import { CommentsGraph } from "./CommentsGraph";

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

export function colour(idx) {
  return colours[idx % colours.length];
}

export const View = ({ data }) => {
  const [index, setIndex] = useState(0);
  const [highlights, setHighlights] = useState([]);
  const [collapsed, setCollapsed] = useState(false);

  const current = data[index];

  function highlight(item) {
    if (highlights.includes(item)) {
      setHighlights(highlights.filter((h) => h !== item));
    } else {
      setHighlights(highlights.concat(item));
    }
  }

  const [graph, setGraph] = useState("#rank");

  function setSection(e) {
    e.preventDefault();
    setGraph(e.target.getAttribute("href"));
  }

  return (
    <>
      <label className={styles.slider}>
        {current && `${formatDistanceToNow(new Date(current.at))} ago`}
        <input
          type="range"
          value={index}
          max={data.length - 1}
          onChange={(e) => setIndex(e.target.valueAsNumber)}
        />
      </label>

      <ol className={styles.list} style={{ height: collapsed ? "20vh" : "" }}>
        {current.entries
          // .slice(0, 4)
          .map(({ id, rank, score, text, url, user, created, comments }) => {
            const colourIndex = highlights.indexOf(id);
            const itemColor = colour(colourIndex);

            return (
              <li key={id} className={styles.row} style={{ color: itemColor }}>
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
          })}
      </ol>

      <a
        href="#"
        className={styles.collapse}
        onClick={(e) => {
          e.preventDefault();
          setCollapsed((c) => !c);
        }}
      >
        {collapsed ? "⬇" : "⬆"}
      </a>

      <nav className={styles.nav}>
        <a
          onClick={setSection}
          href="#rank"
          className={graph === "#rank" ? styles.active : ""}
        >
          Ranking
        </a>
        <a
          onClick={setSection}
          href="#votes"
          className={graph === "#votes" ? styles.active : ""}
        >
          Votes
        </a>
        <a
          onClick={setSection}
          href="#comment"
          className={graph === "#comment" ? styles.active : ""}
        >
          Comments
        </a>
      </nav>

      <section class={styles.graphContainer}>
        {graph === "#rank" && (
          <RankGraph data={data} current={current} highlights={highlights} />
        )}
        {graph === "#votes" && (
          <PointsGraph data={data} current={current} highlights={highlights} />
        )}

        {graph === "#comment" && (
          <CommentsGraph
            data={data}
            current={current}
            highlights={highlights}
          />
        )}
      </section>
    </>
  );
};
