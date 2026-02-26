import "./app.css";
import { createRoot } from "react-dom/client";
import { View } from "./View";
import { CoolView } from "./CoolView";

const root = createRoot(document.getElementById("app"));

try {
  const res = await fetch("/hn.json");
  const hn = await res.json();

  const isCool = window.location.pathname.startsWith("/cool");
  root.render(isCool ? <CoolView data={hn} /> : <View data={hn} />);
} catch (e) {
  root.render(<h1>Error, unable to load</h1>);
}

if (DEV) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload()
  );
}
