import "./app.css";
import { createRoot } from "react-dom/client";
import { View } from "./View";

const root = createRoot(document.getElementById("app"));

try {
  const res = await fetch("hn.json");
  const hn = await res.json();

  root.render(<View data={hn} />);
} catch (e) {
  root.render(<h1>Error, unable to load</h1>);
}

if (DEV) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload()
  );
}
