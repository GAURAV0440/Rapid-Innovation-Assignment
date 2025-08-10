import React from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/axios";
import Loading from "../components/Loading";
import ErrorBanner from "../components/ErrorBanner";
import { useAuth } from "../context/AuthContext";
import { useToaster } from "../components/Toaster";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { notify } = useToaster();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", { email, password });
      // auto-login after registration
      await login(email, password);
      notify("success", "Registered and logged in.");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed.");
      notify("error", "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-semibold">Register</h1>
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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="label" htmlFor="confirm">Confirm Password</label>
          <input
            id="confirm"
            type="password"
            className="input"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      {loading && (
        <div className="mt-6">
          <Loading label="Processing..." />
        </div>
      )}

      <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">
        Already have an account?{" "}
        <Link to="/login" className="underline">Login</Link>
      </p>
    </div>
  );
};

export default Register;
