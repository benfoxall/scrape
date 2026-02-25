import "./app.css";
import { createRoot } from "react-dom/client";
import { CoolView } from "./CoolView";

const root = createRoot(document.getElementById("app"));

try {
  const res = await fetch("/hn.json");
  const hn = await res.json();
  root.render(<CoolView data={hn} />);
} catch (e) {
  root.render(<h1>Error loading data: {e.message}</h1>);
}

if (DEV) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload()
  );
}
