import React, { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
} from "lucide-react";
import logo from "../assets/logo.jpeg";
import {
  isValidEmail,
  isValidNameToken,
  sanitizeNameInput,
  isValidPhone,
  sanitizePhoneInput,
} from "../data/users";
import { ApiError } from "../api/client";

const EMPTY_SIGNUP = { first_name: "", last_name: "", email: "", password: "", phone: "" };
const EMPTY_LOGIN = { email: "", password: "" };

export default function Auth({ onRegister, onLoginSuccess, onCancel }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [showPassword, setShowPassword] = useState(false);

  const [loginForm, setLoginForm] = useState(EMPTY_LOGIN);
  const [loginError, setLoginError] = useState("");

  const [signupForm, setSignupForm] = useState(EMPTY_SIGNUP);
  const [signupErrors, setSignupErrors] = useState({});

  const [submitting, setSubmitting] = useState(false);

  function switchMode(next) {
    setMode(next);
    setLoginError("");
    setSignupErrors({});
  }

  function handleLoginChange(field, value) {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
    if (loginError) setLoginError(""); // Instant error clearing when user edits input
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setLoginError("");

    const trimmedEmail = loginForm.email.trim().toLowerCase();
    const rawPassword = loginForm.password;

    if (!trimmedEmail || !rawPassword) {
      setLoginError("Email and password are required.");
      return;
    }

    setSubmitting(true);
    try {
      // onLoginSuccess is owned by App.jsx — it calls the real login API
      // and updates the app's session state.
      await onLoginSuccess({ email: trimmedEmail, password: rawPassword });
    } catch (err) {
      setLoginError(err instanceof ApiError ? err.message : "Could not sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSignupChange(field, value) {
    let clean = value;
    if (field === "first_name" || field === "last_name") clean = sanitizeNameInput(value);
    if (field === "phone") clean = sanitizePhoneInput(value);
    setSignupForm((prev) => ({ ...prev, [field]: clean }));

    // Clear specific field error on typing
    if (signupErrors[field]) {
      setSignupErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  function validateSignup() {
    const errors = {};
    if (!signupForm.first_name.trim()) errors.first_name = "First name is required.";
    else if (!isValidNameToken(signupForm.first_name))
      errors.first_name = "Letters only, no spaces or numbers.";

    if (!signupForm.last_name.trim()) errors.last_name = "Last name is required.";
    else if (!isValidNameToken(signupForm.last_name))
      errors.last_name = "Letters only, no spaces or numbers.";

    if (!signupForm.email.trim()) errors.email = "Email is required.";
    else if (!isValidEmail(signupForm.email)) errors.email = "Enter a valid email address.";

    // Password validation: minimum 8 characters and at least 1 special character
    const specialCharRegex = /[@$!%*?&#]/;
    if (!signupForm.password) {
      errors.password = "Password is required.";
    } else if (signupForm.password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    } else if (!specialCharRegex.test(signupForm.password)) {
      errors.password = "Password must contain at least one special character (@, $, !, %, *, ?, &, #).";
    }

    if (signupForm.phone && !isValidPhone(signupForm.phone))
      errors.phone = "Enter an 11-digit number starting with 0 (e.g. 03001234567).";

    return errors;
  }

  async function handleSignupSubmit(e) {
    e.preventDefault();
    const errors = validateSignup();
    setSignupErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      // onRegister is owned by App.jsx — it calls the real register API,
      // which registers, silently verifies the email, and logs the user
      // in as one step. No separate OTP screen needed on the frontend.
      await onRegister({
        first_name: signupForm.first_name.trim(),
        last_name: signupForm.last_name.trim(),
        email: signupForm.email.trim().toLowerCase(),
        password: signupForm.password,
        phone: signupForm.phone.trim(),
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not create account. Please try again.";
      setSignupErrors({ email: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
            <div className="auth-card">
        {onCancel && (
          <button className="back-link" onClick={onCancel} type="button">
            ← Back to browsing
          </button>
        )}
        <div className="auth-brand">
          <img src={logo} alt="PAK Hardware logo" className="brand-logo" />
          <span className="brand-name">PAK HARDWARE</span>
        </div>

        {mode === "login" && (
          <>
            <h1 className="auth-title">
              <LogIn size={18} /> Sign In
            </h1>
            <p className="auth-subtitle">Log in to shop, sell, or manage the marketplace.</p>

            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <label className="auth-field">
                <span>
                  <Mail size={14} /> Email
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={loginForm.email}
                  onChange={(e) => handleLoginChange("email", e.target.value)}
                />
              </label>

              <label className="auth-field">
                <span>
                  <Lock size={14} /> Password
                </span>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={loginForm.password}
                    onChange={(e) => handleLoginChange("password", e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </label>

              {loginError && <p className="auth-error">{loginError}</p>}

              <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
                <LogIn size={15} /> {submitting ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account?{" "}
              <button onClick={() => switchMode("signup")}>Create one</button>
            </p>
          </>
        )}

        {mode === "signup" && (
          <>
            <h1 className="auth-title">
              <UserPlus size={18} /> Create Account
            </h1>
            <p className="auth-subtitle">Sign up to start shopping on PAK Hardware.</p>

            <form className="auth-form" onSubmit={handleSignupSubmit}>
              <div className="auth-field-row">
                <label className="auth-field">
                  <span>
                    <User size={14} /> First name
                  </span>
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="First name"
                    value={signupForm.first_name}
                    onChange={(e) => handleSignupChange("first_name", e.target.value)}
                  />
                  {signupErrors.first_name && (
                    <em className="auth-field-error">{signupErrors.first_name}</em>
                  )}
                </label>

                <label className="auth-field">
                  <span>
                    <User size={14} /> Last name
                  </span>
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="Last name"
                    value={signupForm.last_name}
                    onChange={(e) => handleSignupChange("last_name", e.target.value)}
                  />
                  {signupErrors.last_name && (
                    <em className="auth-field-error">{signupErrors.last_name}</em>
                  )}
                </label>
              </div>

              <label className="auth-field">
                <span>
                  <Mail size={14} /> Email
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={signupForm.email}
                  onChange={(e) => handleSignupChange("email", e.target.value)}
                />
                {signupErrors.email && <em className="auth-field-error">{signupErrors.email}</em>}
              </label>

              <label className="auth-field">
                <span>
                  <Lock size={14} /> Password
                </span>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 chars & 1 special char"
                    value={signupForm.password}
                    onChange={(e) => handleSignupChange("password", e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {signupErrors.password && (
                  <em className="auth-field-error">{signupErrors.password}</em>
                )}
              </label>

              <label className="auth-field">
                <span>
                  <Phone size={14} /> Phone <small>(optional)</small>
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="03XXXXXXXXX"
                  value={signupForm.phone}
                  onChange={(e) => handleSignupChange("phone", e.target.value)}
                />
                {signupErrors.phone && <em className="auth-field-error">{signupErrors.phone}</em>}
              </label>

              <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
                <UserPlus size={15} /> {submitting ? "Creating…" : "Create Account"}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{" "}
              <button onClick={() => switchMode("login")}>Sign in</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
