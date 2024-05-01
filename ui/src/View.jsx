import { useState } from "react";

export const View = ({ data }) => {
  const [idx, setIdx] = useState(0);

  const current = data[idx];

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

          <ol>
            {current.entries.map(
              ({ id, rank, score, text, url, user, created, comments }) => (
                <li key={id}>
                  <h4>
                    <a href={url}>{text}</a>
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
        </>
      )}
    </>
  );
};
