import { Route, Routes } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import "./globals.css";
import AuthLayout from "./layouts/AuthLayout";
import RootLayout from "./layouts/RootLayout";
import { Suspense, lazy } from "react";
import Loader from "./components/shared/Loader";

// Lazy load components
const SigninForm = lazy(() => import("./pages/auth/SigninForm"));
const SignupForm = lazy(() => import("./pages/auth/SignupForm"));
const Explore = lazy(() => import("./pages/Explore"));
const Saved = lazy(() => import("./pages/Saved"));
const AllUsers = lazy(() => import("./pages/AllUsers"));
const CreatePost = lazy(() => import("./pages/CreatePost"));
const EditPost = lazy(() => import("./pages/EditPost"));
const PostDetails = lazy(() => import("./pages/PostDetails"));
const Profile = lazy(() => import("./pages/Profile"));
const UpdateProfile = lazy(() => import("./pages/UpdateProfile"));
const Home = lazy(() => import("./pages/Home"));
const MessagesPage = lazy(() => import("./pages/Messages"));

function App() {
  return (
    <main className="flex h-screen">
      <Suspense
        fallback={
          <div className="mx-auto my-auto">
            <Loader />
          </div>
        }
      >
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
            <Route path="/messages" element={<MessagesPage />} />
          </Route>
        </Routes>
      </Suspense>
      <Toaster />
    </main>
  );
}

export default App;
