import { createRoot } from "react-dom/client";
// import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import QueryProvider from "./lib/react-query/QueryProvider.tsx";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./globals.css";
import SignInForm from "./pages/auth/SigninForm";
import SignUpForm from "./pages/auth/SignupForm";
import { Home } from "./pages";
import RootLayout from "./layouts/RootLayout";
import AuthLayout from "./layouts/AuthLayout";
import { Toaster } from "./components/ui/toaster.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [{ index: true, element: <Home /> }],
  },
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { path: "/signin", element: <SignInForm /> },
      { path: "/signup", element: <SignUpForm /> },
    ],
  },
]);


createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <QueryProvider>
        <RouterProvider router={router} />
        <Toaster />
      </QueryProvider>
    </AuthProvider>
);
