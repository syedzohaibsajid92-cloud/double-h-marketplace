import React, { useState } from "react";

const BASE = "http://localhost:3000/api";

const THEME = {
  bg: "#161311",
  panel: "#201b18",
  border: "#332b26",
  orange: "#ff7a29",
  orangeDim: "#3a2418",
  text: "#f1ece6",
  sub: "#9c9088",
  green: "#5fbf7a",
  red: "#e0584a",
};

function StatusPill({ status }) {
  if (status == null) return null;
  const ok = status >= 200 && status < 300;
  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 4,
        background: ok ? "rgba(95,191,122,0.15)" : "rgba(224,88,74,0.15)",
        color: ok ? THEME.green : THEME.red,
        border: `1px solid ${ok ? THEME.green : THEME.red}`,
      }}
    >
      {status}
    </span>
  );
}

function Field({ label, value, onChange, placeholder, width }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, width: width || "auto" }}>
      <span style={{ fontSize: 11, color: THEME.sub, letterSpacing: 0.4, textTransform: "uppercase" }}>
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: "#141110",
          border: `1px solid ${THEME.border}`,
          borderRadius: 6,
          padding: "8px 10px",
          color: THEME.text,
          fontSize: 13,
          fontFamily: "'JetBrains Mono', monospace",
          outline: "none",
        }}
      />
    </label>
  );
}

function Endpoint({ method, path, description, needsBody, defaultBody, exec }) {
  const [params, setParams] = useState({});
  const [body, setBody] = useState(defaultBody || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Extract :params from path
  const paramNames = (path.match(/:(\w+)/g) || []).map((p) => p.slice(1));
  // Extract ?query placeholders like page=1&limit=20 -> keep as editable string
  const hasQuery = path.includes("?");
  const [queryString, setQueryString] = useState(hasQuery ? path.split("?")[1] : "");

  const runRequest = async () => {
    setLoading(true);
    setResult(null);
    let resolvedPath = path.split("?")[0];
    paramNames.forEach((p) => {
      resolvedPath = resolvedPath.replace(`:${p}`, params[p] || `:${p}`);
    });
    const url = BASE + resolvedPath + (hasQuery ? `?${queryString}` : "");
    try {
      const res = await exec(url, method, needsBody ? body : undefined);
      setResult(res);
    } catch (err) {
      setResult({ status: null, error: err.message });
    }
    setLoading(false);
  };

  const methodColors = {
    GET: "#5fa8e0",
    POST: THEME.green,
    PUT: "#e0b84a",
    PATCH: THEME.orange,
    DELETE: THEME.red,
  };

  return (
    <div
      style={{
        border: `1px solid ${THEME.border}`,
        borderRadius: 10,
        padding: 14,
        background: THEME.panel,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 700,
            color: methodColors[method],
            border: `1px solid ${methodColors[method]}`,
            borderRadius: 4,
            padding: "2px 6px",
            minWidth: 52,
            textAlign: "center",
          }}
        >
          {method}
        </span>
        <code style={{ fontSize: 12.5, color: THEME.text, fontFamily: "'JetBrains Mono', monospace" }}>
          {path.split("?")[0]}
        </code>
        {result && <StatusPill status={result.status} />}
      </div>
      {description && <div style={{ fontSize: 12, color: THEME.sub }}>{description}</div>}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {paramNames.map((p) => (
          <Field
            key={p}
            label={p}
            value={params[p] || ""}
            onChange={(v) => setParams((prev) => ({ ...prev, [p]: v }))}
            placeholder={`enter ${p}`}
            width={160}
          />
        ))}
        {hasQuery && (
          <Field
            label="query"
            value={queryString}
            onChange={setQueryString}
            width={220}
          />
        )}
      </div>

      {needsBody && (
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 11, color: THEME.sub, letterSpacing: 0.4, textTransform: "uppercase" }}>
            Request Body (JSON)
          </span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            style={{
              background: "#141110",
              border: `1px solid ${THEME.border}`,
              borderRadius: 6,
              padding: "8px 10px",
              color: THEME.text,
              fontSize: 12.5,
              fontFamily: "'JetBrains Mono', monospace",
              resize: "vertical",
              outline: "none",
            }}
          />
        </label>
      )}

      <button
        onClick={runRequest}
        disabled={loading}
        style={{
          alignSelf: "flex-start",
          background: loading ? THEME.orangeDim : THEME.orange,
          color: loading ? THEME.orange : "#1a1310",
          border: "none",
          borderRadius: 6,
          padding: "7px 16px",
          fontSize: 12.5,
          fontWeight: 700,
          cursor: loading ? "default" : "pointer",
          letterSpacing: 0.3,
        }}
      >
        {loading ? "Sending…" : "Send Request"}
      </button>

      {result && (
        <div>
          <div style={{ fontSize: 11, color: THEME.sub, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.4 }}>
            Response
          </div>
          <pre
            style={{
              background: "#0f0d0c",
              border: `1px solid ${THEME.border}`,
              borderRadius: 6,
              padding: 10,
              fontSize: 12,
              color: result.error ? THEME.red : THEME.text,
              maxHeight: 260,
              overflow: "auto",
              margin: 0,
              fontFamily: "'JetBrains Mono', monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {result.error ? `Network error: ${result.error}` : JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: THEME.orange,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          margin: "4px 0 0 0",
          borderBottom: `1px solid ${THEME.border}`,
          paddingBottom: 8,
        }}
      >
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </div>
  );
}

export default function AdminApiTester() {
  const [token, setToken] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzg2MDM1NTc0LCJleHAiOjE3ODYxMjE5NzR9.R1zJ8TJpB4qMJSCqKoPG0Pndwrc-Rl7oBt7EzdtAj1A");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginResult, setLoginResult] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const exec = async (url, method, bodyStr) => {
    const activeToken = token.trim();
    const headers = {
      "Content-Type": "application/json",
    };

    if (activeToken) {
      headers["Authorization"] = activeToken.startsWith("Bearer ")
        ? activeToken
        : `Bearer ${activeToken}`;
    }

    const opts = { method, headers };

    if (bodyStr && bodyStr.trim()) {
      try {
        opts.body = JSON.stringify(JSON.parse(bodyStr));
      } catch (e) {
        return { status: null, error: "Invalid JSON in request body" };
      }
    }

    try {
      const res = await fetch(url, opts);
      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = { note: "No JSON body returned" };
      }
      return { status: res.status, data };
    } catch (err) {
      return { status: null, error: err.message };
    }
  };

  const doLogin = async () => {
    setLoggingIn(true);
    setLoginResult(null);
    try {
      const res = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      setLoginResult({ status: res.status, data });
      const found = data.token || data.accessToken || (data.data && data.data.token);
      if (found) setToken(found);
    } catch (err) {
      setLoginResult({ status: null, error: err.message });
    }
    setLoggingIn(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        color: THEME.text,
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "24px 16px 60px",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        <header>
          <div style={{ fontSize: 11, color: THEME.orange, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 }}>
            Double H Hardware Marketplace
          </div>
          <h1 style={{ fontSize: 24, margin: "4px 0 2px", fontWeight: 800 }}>Admin API Tester</h1>
          <div style={{ fontSize: 12.5, color: THEME.sub }}>
            Base URL: <code style={{ color: THEME.text }}>{BASE}</code> — Vendor, Product, Analytics, Coupons &amp; CMS endpoints
          </div>
        </header>

        {/* Auth */}
        <Section title="1 · Get Admin Token">
          <div
            style={{
              border: `1px solid ${THEME.border}`,
              borderRadius: 10,
              padding: 14,
              background: THEME.panel,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 12, color: THEME.sub }}>
              POST /api/auth/login with an admin account, or just paste a token you already have below.
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Field label="email" value={loginEmail} onChange={setLoginEmail} placeholder="admin@example.com" width={220} />
              <Field label="password" value={loginPassword} onChange={setLoginPassword} placeholder="••••••••" width={180} />
            </div>
            <button
              onClick={doLogin}
              disabled={loggingIn}
              style={{
                alignSelf: "flex-start",
                background: loggingIn ? THEME.orangeDim : THEME.orange,
                color: loggingIn ? THEME.orange : "#1a1310",
                border: "none",
                borderRadius: 6,
                padding: "7px 16px",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: loggingIn ? "default" : "pointer",
              }}
            >
              {loggingIn ? "Logging in…" : "Log In"}
            </button>
            {loginResult && (
              <pre
                style={{
                  background: "#0f0d0c",
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 6,
                  padding: 10,
                  fontSize: 12,
                  margin: 0,
                  color: loginResult.error ? THEME.red : THEME.text,
                  fontFamily: "'JetBrains Mono', monospace",
                  whiteSpace: "pre-wrap",
                }}
              >
                {loginResult.error
                  ? `Network error: ${loginResult.error}`
                  : JSON.stringify(loginResult.data, null, 2)}
              </pre>
            )}
            <Field label="admin JWT token (auto-filled after login, or paste manually)" value={token} onChange={setToken} placeholder="eyJhbGciOi..." />
          </div>
        </Section>

        <Section title="2 · Vendor Approval">
          <Endpoint method="GET" path="/admin/vendors/pending?page=1&limit=20" exec={exec} description="List pending vendors" />
          <Endpoint method="PATCH" path="/admin/vendors/:id/approve" exec={exec} description="Approve a vendor" />
          <Endpoint
            method="PATCH"
            path="/admin/vendors/:id/reject"
            exec={exec}
            needsBody
            defaultBody='{\n  "reason": "Incomplete documentation"\n}'
            description="Reject a vendor"
          />
        </Section>

        <Section title="3 · Product Approval">
          <Endpoint method="GET" path="/admin/products/pending?page=1&limit=20" exec={exec} description="List pending products" />
          <Endpoint method="PATCH" path="/admin/products/:id/approve" exec={exec} description="Approve a product" />
          <Endpoint
            method="PATCH"
            path="/admin/products/:id/reject"
            exec={exec}
            needsBody
            defaultBody='{\n  "reason": "Image quality too low"\n}'
            description="Reject a product"
          />
        </Section>

        <Section title="4 · Analytics">
          <Endpoint method="GET" path="/admin/analytics/overview" exec={exec} description="Overview metrics" />
          <Endpoint method="GET" path="/admin/analytics/revenue-trends?range=6m" exec={exec} description="Revenue trend data" />
        </Section>

        <Section title="5 · Coupons / Promotions">
          <Endpoint method="GET" path="/admin/coupons" exec={exec} description="List all coupons" />
          <Endpoint
            method="POST"
            path="/admin/coupons"
            exec={exec}
            needsBody
            defaultBody={
              '{\n  "code": "SAVE10",\n  "discount_type": "percentage",\n  "discount_value": 10,\n  "min_order_amount": 500,\n  "valid_from": "2026-08-01",\n  "valid_until": "2026-09-01",\n  "usage_limit": 100\n}'
            }
            description="Create a coupon"
          />
          <Endpoint
            method="PUT"
            path="/admin/coupons/:id"
            exec={exec}
            needsBody
            defaultBody={'{\n  "discount_value": 15,\n  "usage_limit": 200\n}'}
            description="Update a coupon"
          />
          <Endpoint method="DELETE" path="/admin/coupons/:id" exec={exec} description="Delete a coupon" />
        </Section>

        <Section title="6 · CMS Pages">
          <Endpoint method="GET" path="/admin/cms" exec={exec} description="List CMS pages" />
          <Endpoint method="GET" path="/admin/cms/:slug" exec={exec} description="Get a single CMS page" />
          <Endpoint
            method="PUT"
            path="/admin/cms/:slug"
            exec={exec}
            needsBody
            defaultBody={'{\n  "title": "About Us",\n  "content": "<p>Double H Hardware Marketplace...</p>"\n}'}
            description="Create or update a CMS page"
          />
        </Section>

        <footer style={{ fontSize: 11.5, color: THEME.sub, textAlign: "center", paddingTop: 10 }}>
          Requests go directly to <code>{BASE}</code> from your browser — make sure the backend is running locally and CORS allows this origin.
        </footer>
      </div>
    </div>
  );
}