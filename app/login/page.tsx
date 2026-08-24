"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import axiosClient, { setAccessToken } from "../lib/axiosClient";
import "../styles/admin-login.css";
import axios from "axios";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API}/admin/login`, { email, password });
      console.log("response", res)
      if (!res.data?.success || !res.data?.accessToken) {
        throw new Error(res.data?.message || "Invalid email or password");
      }
      // console.log("Response Token", res.data.accessToken)
      setAccessToken(res.data.accessToken);
      router.push("/admin");
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Invalid email or password");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adminLogin">
      <div className="adminLogin-card">
        <h1 className="adminLogin-title">Admin Login</h1>
        <p className="adminLogin-subtitle">Sign in to manage contact queries</p>
        {error && <div className="adminLogin-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="adminLogin-field">
            <label className="adminLogin-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="adminLogin-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="adminLogin-field">
            <label className="adminLogin-label" htmlFor="password">
              Password
            </label>
            <div className="adminLogin-passwordWrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="adminLogin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="adminLogin-passwordToggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="adminLogin-submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
