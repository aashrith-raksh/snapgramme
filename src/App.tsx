import {
  Route,
  Routes,
} from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import "./globals.css";
import { Home } from "lucide-react";
import AuthLayout from "./layouts/AuthLayout";
import RootLayout from "./layouts/RootLayout";
import SigninForm from "./pages/auth/SigninForm";
import SignupForm from "./pages/auth/SignupForm";


function App() {
  return <main className="flex h-screen">
    <Routes>
      {/* public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/signin" element={<SigninForm />} />
        <Route path="/signup" element={<SignupForm />} />
      </Route>

      {/* private routes */}
      <Route element={<RootLayout />}>
        <Route index element={<Home />} />
      </Route>
    </Routes>
    <Toaster />
  </main>;
}
export default App;
