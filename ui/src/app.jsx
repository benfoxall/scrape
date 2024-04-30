import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("app"));
root.render(<h1>Hello, world</h1>);

if (DEV) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload()
  );
}
