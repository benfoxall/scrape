import "./app.css";
import { createRoot } from "react-dom/client";
import { View } from "./View";

const root = createRoot(document.getElementById("app"));

try {
  const res = await fetch("./hn.json");
  const json = await res.json();

  root.render(<View data={json} />);
} catch (e) {
  console.error(e);
  root.render(<h1>Failed to fetch data</h1>);
}

if (DEV) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload()
  );
}
