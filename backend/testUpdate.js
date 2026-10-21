const http = require("http");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const jwtSecret = process.env.JWT_SECRET || "secret";
console.log("Using secret:", jwtSecret);

const token = jwt.sign({ id: 1, role: "admin" }, jwtSecret, { expiresIn: "1d" });
const data = JSON.stringify({ discount_value: 15, usage_limit: 200 });

const options = {
  hostname: "127.0.0.1",
  port: 3000,
  path: "/api/admin/coupons/4",
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data),
    "Authorization": `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => body += chunk);
  res.on("end", () => {
    console.log("STATUS:", res.statusCode);
    console.log("RESPONSE:", body);
  });
});

req.on("error", (e) => console.error("REQUEST ERROR:", e.message));
req.write(data);
req.end();
