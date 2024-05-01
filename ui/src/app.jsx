import "./app.css";
import { createRoot } from "react-dom/client";
import { View } from "./View";
import hn from "../../hacker-news.json";

const root = createRoot(document.getElementById("app"));

root.render(<View data={hn} />);

if (DEV) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload()
  );
}
