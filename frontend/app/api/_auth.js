import crypto from "crypto";
import { isAccessLocked } from "../../lib/hostedMode.js";

const ACCESS_HEADER = "x-signalflow-access-key";
const AUTH_HEADER = "authorization";
const SESSION_DAYS = 30;

function base64Url(input) {
  return Buffer.from(input).toString("base64url");
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}


export function createSessionToken() {
  const secret = process.env.SIGNALFLOW_ACCESS_KEY;
  if (!secret) {
    return "";
  }

  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      sub: "owner",
      scope: "signalflow:generate",
      exp: Math.floor(Date.now() / 1000) + SESSION_DAYS * 24 * 60 * 60,
    }),
  );
  const body = `${header}.${payload}`;
  return `${body}.${sign(body, secret)}`;
}

function verifySessionToken(token) {
  const secret = process.env.SIGNALFLOW_ACCESS_KEY;
  if (!secret || !token) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const body = `${parts[0]}.${parts[1]}`;
  const expected = sign(body, secret);
  if (!safeEqual(parts[2], expected)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return payload?.sub === "owner" && payload?.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function requireOwnerAccess(request) {
  const expected = process.env.SIGNALFLOW_ACCESS_KEY;

  if (!expected) {
    return null;
  }

  const provided = request.headers.get(ACCESS_HEADER) || "";
  const bearer = request.headers.get(AUTH_HEADER) || "";
  const token = bearer.startsWith("Bearer ") ? bearer.slice("Bearer ".length) : "";

  if (provided === expected || verifySessionToken(token)) {
    return null;
  }

  return new Response(
    JSON.stringify({
      error: "This hosted workspace is private. Self-host SignalFlow Studio or enter the owner's access key.",
    }),
    {
      status: 401,
      headers: { "Content-Type": "application/json" },
    },
  );
}
