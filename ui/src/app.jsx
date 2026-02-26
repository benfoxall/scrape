import "./app.css";
import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import { View } from "./View";
import { CoolView } from "./CoolView";

function Router({ data }) {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handler = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  return hash === "#cool" ? <CoolView data={data} /> : <View data={data} />;
}

const root = createRoot(document.getElementById("app"));

try {
  const res = await fetch("/hn.json");
  const hn = await res.json();
  root.render(<Router data={hn} />);
} catch (e) {
  root.render(<h1>Error, unable to load</h1>);
}

if (DEV) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload()
  );
}
