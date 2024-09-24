import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./globals.css";
import SignInForm from "./pages/auth/SigninForm";
import SignUpForm from "./pages/auth/SignupForm";
import { Home } from "./pages";
import RootLayout from "./layouts/RootLayout";
import AuthLayout from "./layouts/AuthLayout";
import { Toaster } from "@/components/ui/toaster";

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
function App() {
  return (
    <main className="flex h-screen">
      <RouterProvider router={router} />
      <Toaster />
    </main>
  );
}

export default App;
