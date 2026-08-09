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
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import logo from "../assets/logo.jpeg";
import {
  DEMO_LOGINS,
  generateOtp,
  isValidEmail,
  isValidNameToken,
  sanitizeNameInput,
  isValidPhone,
  sanitizePhoneInput,
} from "../data/users";

const EMPTY_SIGNUP = { first_name: "", last_name: "", email: "", password: "", phone: "" };
const EMPTY_LOGIN = { email: "", password: "" };

export default function Auth({ users = [], onRegister, onLoginSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "verify"
  const [showPassword, setShowPassword] = useState(false);

  const [loginForm, setLoginForm] = useState(EMPTY_LOGIN);
  const [loginError, setLoginError] = useState("");

  const [signupForm, setSignupForm] = useState(EMPTY_SIGNUP);
  const [signupErrors, setSignupErrors] = useState({});

  const [pendingUser, setPendingUser] = useState(null); // signupForm, kept while verifying OTP
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpNotice, setOtpNotice] = useState("");

  function switchMode(next) {
    setMode(next);
    setLoginError("");
    setSignupErrors({});
    setOtpError("");
    setOtpNotice("");
  }

  function handleLoginChange(field, value) {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
    if (loginError) setLoginError(""); // Instant error clearing when user edits input
  }

  function handleLoginSubmit(e) {
    e.preventDefault();
    setLoginError(""); // Reset error state on attempt

    const trimmedEmail = loginForm.email.trim().toLowerCase();
    const rawPassword = loginForm.password;

    if (!trimmedEmail || !rawPassword) {
      setLoginError("Email and password are required.");
      return;
    }

    const match = users.find(
      (u) => u.email.toLowerCase() === trimmedEmail
    );

    if (!match || match.password !== rawPassword) {
      setLoginError("Invalid email or password.");
      return;
    }

    onLoginSuccess(match);
  }

  function handleDemoLogin(demo) {
    setLoginForm({ email: demo.email, password: demo.password });
    setLoginError("");
    const match = users.find((u) => u.email.toLowerCase() === demo.email.toLowerCase());
    if (match) onLoginSuccess(match);
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
    else if (users.some((u) => u.email.toLowerCase() === signupForm.email.trim().toLowerCase()))
      errors.email = "An account with this email already exists.";

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

  function handleSignupSubmit(e) {
    e.preventDefault();
    const errors = validateSignup();
    setSignupErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const otp = generateOtp();
    setPendingUser({ ...signupForm, otp });
    setOtpInput("");
    setOtpError("");
    setOtpNotice(`Dev mode: your verification code is ${otp} (this would be emailed in production).`);
    setMode("verify");
  }

  function handleResendOtp() {
    const otp = generateOtp();
    setPendingUser((prev) => ({ ...prev, otp }));
    setOtpNotice(`New code sent. Dev mode: your verification code is ${otp}.`);
    setOtpError("");
    setOtpInput("");
  }

  function handleVerifySubmit(e) {
    e.preventDefault();
    if (otpInput.trim() !== pendingUser.otp) {
      setOtpError("Incorrect code. Please try again.");
      return;
    }

    const newUser = {
      id: Date.now(),
      first_name: pendingUser.first_name.trim(),
      last_name: pendingUser.last_name.trim(),
      email: pendingUser.email.trim().toLowerCase(),
      password: pendingUser.password,
      phone: pendingUser.phone.trim(),
      role: "customer",
      is_verified: true,
      is_vendor: false,
      wishlist: [],
    };

    onRegister(newUser);
    onLoginSuccess(newUser);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
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

              <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>
                <LogIn size={15} /> {busy ? "Signing in…" : "Sign In"}
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

              <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>
                <UserPlus size={15} /> {busy ? "Creating…" : "Create Account"}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{" "}
              <button onClick={() => switchMode("login")}>Sign in</button>
            </p>
          </>
        )}

        {mode === "verify" && pendingUser && (
          <>
            <button className="back-link" onClick={() => switchMode("signup")}>
              <ArrowLeft size={15} /> Back
            </button>
            <h1 className="auth-title">
              <ShieldCheck size={18} /> Verify Your Email
            </h1>
            <p className="auth-subtitle">
              Enter the 6-digit code sent to <strong>{pendingUser.email}</strong>.
            </p>

            {otpNotice && <p className="auth-notice">{otpNotice}</p>}

            <form className="auth-form" onSubmit={handleVerifySubmit}>
              <label className="auth-field">
                <span>
                  <ShieldCheck size={14} /> Verification code
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  className="otp-input"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                />
              </label>

              {otpError && <p className="auth-error">{otpError}</p>}

              <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>
                <ShieldCheck size={15} /> {busy ? "Verifying…" : "Verify & Continue"}
              </button>
            </form>

            <p className="auth-switch">
              Didn't get a code?{" "}
              <button onClick={handleResendOtp}>Resend code</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}