import { Component, lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import { LoadingState } from "./components/Page";
import { useAuth } from "./lib/auth";
import Home from "./pages/Home";
import About from "./pages/About";
import Members from "./pages/Members";
import MemberProfile from "./pages/MemberProfile";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Gallery from "./pages/Gallery";
import Updates from "./pages/Updates";
import UpdateDetail from "./pages/UpdateDetail";
import Learning from "./pages/Learning";
import Suggestions from "./pages/Suggestions";
import Signup from "./pages/auth/Signup";
import Verify from "./pages/auth/Verify";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// The admin control room is only ever reached by staff, so it is kept out of the
// public bundle and fetched on demand.
const Admin = lazy(() => import("./pages/Admin"));

/** Blocks access to private student pages until a Supabase session exists. */
function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, session } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-guard">
        <LoadingState label="Checking your session" />
      </div>
    );
  }
  if (!session) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

function NotFoundRoute() {
  return <NotFound />;
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-fallback">
          <span className="eyebrow">SOMETHING WENT SIDEWAYS</span>
          <h1>This page hit a snag.</h1>
          <p>Please refresh to keep exploring the community. If it keeps happening, come back in a moment.</p>
          <a className="button button-orange" href="/">Reload the community site</a>
        </main>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="auth-guard">
            <LoadingState label="Loading" />
          </div>
        }
      >
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/members" element={<Members />} />
            <Route path="/members/:id" element={<MemberProfile />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/updates" element={<Updates />} />
            <Route path="/updates/:slug" element={<UpdateDetail />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/suggestions" element={<Suggestions />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/verify" element={<Verify />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFoundRoute />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
