import { useState } from "react";

export const View = ({ data }) => {
  const [i, setValue] = useState(0);

  const current = data[i];

  return (
    <>
      <input
        type="range"
        value={i}
        max={data.length - 1}
        onChange={(e) => setValue(e.target.valueAsNumber)}
      />
      {i + 1} / {data.length}
      {current && (
        <>
          <h3>{new Date(current.at).toLocaleString()}</h3>

          <ul>
            {current.entries.map(
              ({ id, rank, score, text, url, user, created, comments }) => (
                <li key={id}>
                  <h4>
                    {rank}. {text}
                  </h4>
                  <p>
                    {score} points by {user}, {comments} comments
                  </p>
                </li>
              )
            )}
          </ul>
        </>
      )}
    </>
  );
};
