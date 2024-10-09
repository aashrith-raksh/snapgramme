import { createRoot } from "react-dom/client";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import QueryProvider from "./lib/react-query/QueryProvider.tsx";

import { BrowserRouter } from "react-router-dom";
import "./globals.css";
import App from "./App.tsx";
import ConvoProvider from "./contexts/ConvoContext.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <QueryProvider>
      <AuthProvider>
        <ConvoProvider>
          <App />
        </ConvoProvider>
      </AuthProvider>
    </QueryProvider>
  </BrowserRouter>
);
