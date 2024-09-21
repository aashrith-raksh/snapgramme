import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./globals.css";
import SignInForm from "./pages/auth/SignInForm";
import SignUpForm from "./pages/auth/SignUpForm";
import { Home } from "./pages";
import RootLayout from "./layouts/RootLayout";

const router = createBrowserRouter([
  { path: "/signin", element: <SignInForm /> },
  { path: "/signup", element: <SignUpForm /> },
  { path: "/", 
    element: <RootLayout/>,
    children: [{ index: true, element: <Home /> }] },
]);
function App() {
  return (
    <main className="flex h-screen">
      <RouterProvider router={router} />
    </main>
  );
}

export default App;
