import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/axios";
import Loading from "../components/Loading";
import ErrorBanner from "../components/ErrorBanner";
import { useToaster } from "../components/Toaster";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { notify } = useToaster();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const from = location.state?.from?.pathname || "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      // Validate via API to surface consistent errors (optional ping)
      await api.get("/"); // If backend root exists; ignore any error silently
    } catch {
      // ignore
    }
    try {
      await login(email, password);
      notify("success", "Logged in successfully.");
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid credentials.");
      notify("error", "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-semibold">Login</h1>
      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} onClose={() => setError(null)} />
        </div>
      )}
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            minLength={6}
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      {loading && (
        <div className="mt-6">
          <Loading label="Authenticating..." />
        </div>
      )}

      <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="underline">Register</Link>
      </p>
    </div>
  );
};

export default Login;
