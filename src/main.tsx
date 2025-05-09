  import { StrictMode } from "react";
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "remixicon/fonts/remixicon.css";
  import "./index.css";
  import { ThemeProvider } from "./context/ThemeContext.tsx";

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>
  );
