import { Route, Routes } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import "./globals.css";
import AuthLayout from "./layouts/AuthLayout";
import RootLayout from "./layouts/RootLayout";
import SigninForm from "./pages/auth/SigninForm";
import SignupForm from "./pages/auth/SignupForm";
import {
  Explore,
  Saved,
  AllUsers,
  CreatePost,
  EditPost,
  PostDetails,
  Profile,
  UpdateProfile,
  Home,
} from "./pages";
import Messages from "./pages/Messages";

function App() {
  return (
    <main className="flex h-screen">
      <Routes>
        {/* public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/signin" element={<SigninForm />} />
          <Route path="/signup" element={<SignupForm />} />
        </Route>

        {/* private routes */}
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/update-post/:id" element={<EditPost />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/profile/:id/*" element={<Profile />} />
          <Route path="/update-profile" element={<UpdateProfile />} />
          <Route path="/messages" element={<Messages />} />
          {/* <Route path="/update-profile/:id" element={<UpdateProfile />} /> */}
        </Route>
      </Routes>
      <Toaster />
    </main>
  );
}
export default App;
