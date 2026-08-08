import { api, setToken, clearToken } from "./client";
import { adaptUser } from "./adapters";

// Register, then silently verify the email using the OTP the backend
// returns (it's returned directly for now since there's no email
// service wired up yet), then log the user straight in so the demo
// flow feels like a normal one-step signup.
export async function register({ first_name, last_name, email, password, phone }) {
  const res = await api.post("/api/auth/register", { first_name, last_name, email, password, phone });

  if (res.emailVerificationOtp) {
    try {
      await api.post("/api/auth/verify-email", { email, otp: res.emailVerificationOtp });
    } catch {
      // non-fatal — user can still try logging in
    }
  }

  return login({ email, password });
}

export async function login({ email, password }) {
  const res = await api.post("/api/auth/login", { email, password });
  setToken(res.token);
  return adaptUser(res.user);
}

// Used to restore a session on page load from a saved token.
// /api/profile returns the full user row (unlike /api/auth/me,
// which only returns the decoded JWT payload).
export async function fetchMe() {
  const res = await api.get("/api/profile", { auth: true });
  return adaptUser(res);
}

export function logout() {
  clearToken();
}
