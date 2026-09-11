"use client";

/**
 * Real email/password account registry for SynapseLearn.
 *
 * Accounts are stored in the browser's localStorage (`synapse_accounts_v1`) with
 * PBKDF2-SHA256 (Web Crypto) salted password hashes — plaintext passwords are never
 * stored. Session persistence is governed by an explicit "remember me" marker
 * (localStorage = persistent, sessionStorage = per-tab).
 *
 * NOTE: With no server-side database, accounts are device-local. Full multi-device
 * sync requires a real backend; this layer keeps sign-in real (verified), private
 * (hashed), and honest.
 */

export interface PasswordAccount {
  id: string;
  name: string;
  email: string;
  salt: string;
  iterations: number;
  passwordHash: string;
  createdAt: string;
}

export interface AccountResult {
  ok: boolean;
  error?: string;
  account?: PasswordAccount;
}

const ACCOUNTS_KEY = "synapse_accounts_v1";
const RESET_KEY = "synapse_reset_codes_v1";
const SESSION_REMEMBER_KEY = "synapse_session_remember";
const SESSION_TAB_KEY = "synapse_session_tab";
const ITERATIONS = 210_000;

export function isCryptoAvailable(): boolean {
  return typeof window !== "undefined" && !!window.crypto?.subtle;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function validatePassword(password: string): { ok: boolean; reason?: string } {
  if (password.length < 8) return { ok: false, reason: "Password must be at least 8 characters." };
  if (!/[A-Za-z]/.test(password)) return { ok: false, reason: "Password must include letters." };
  return { ok: true };
}

function readAccounts(): PasswordAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: PasswordAccount[]) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    /* storage may be full/unavailable — signature calls handle errors */
  }
}

export function getAccount(email: string): PasswordAccount | undefined {
  return readAccounts().find((a) => a.email.toLowerCase() === email.toLowerCase());
}

export function accountExists(email: string): boolean {
  return Boolean(getAccount(email));
}

function randomB64(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function deriveBits(password: string, saltB64: string, iterations: number): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations, hash: "SHA-256" }, keyMaterial, 256);
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

export async function registerAccount(name: string, email: string, password: string): Promise<AccountResult> {
  if (!isCryptoAvailable()) {
    return { ok: false, error: "Secure password hashing is unavailable in this browser." };
  }
  const cleanEmail = email.trim().toLowerCase();
  if (!validateEmail(cleanEmail)) return { ok: false, error: "Enter a valid email address." };
  const pwCheck = validatePassword(password);
  if (!pwCheck.ok) return { ok: false, error: pwCheck.reason };
  const existing = getAccount(cleanEmail);
  if (existing) return { ok: false, error: "An account already exists for this email. Try signing in." };

  const salt = randomB64(16);
  const passwordHash = await deriveBits(password, salt, ITERATIONS);
  const account: PasswordAccount = {
    id: `user-${Date.now()}-${randomB64(4)}`,
    name: name.trim() || "SynapseLearn Member",
    email: cleanEmail,
    salt,
    iterations: ITERATIONS,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  writeAccounts([...readAccounts(), account]);
  return { ok: true, account };
}

export async function loginWithPassword(email: string, password: string): Promise<AccountResult> {
  if (!isCryptoAvailable()) return { ok: false, error: "Secure password verification is unavailable in this browser." };
  const cleanEmail = email.trim().toLowerCase();
  const account = getAccount(cleanEmail);
  if (!account) return { ok: false, error: "No registered account found for this email. Please sign up." };
  const attemptHash = await deriveBits(password, account.salt, account.iterations);
  const a = Uint8Array.from(atob(attemptHash), (c) => c.charCodeAt(0));
  const b = Uint8Array.from(atob(account.passwordHash), (c) => c.charCodeAt(0));
  if (a.length !== b.length) return { ok: false, error: "Incorrect password." };
  let equal = true;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      equal = false;
      break;
    }
  }
  if (!equal) return { ok: false, error: "Incorrect password. Please try again." };
  return { ok: true, account };
}

export function setSession(email: string, remember: boolean) {
  try {
    clearSession();
    const target = remember ? localStorage : sessionStorage;
    target.setItem(remember ? SESSION_REMEMBER_KEY : SESSION_TAB_KEY, email.toLowerCase());
  } catch {
    /* ignore */
  }
}

export function getSessionEmail(): string | undefined {
  try {
    const remembered = localStorage.getItem(SESSION_REMEMBER_KEY);
    if (remembered) return remembered;
    const tab = sessionStorage.getItem(SESSION_TAB_KEY);
    if (tab) return tab;
  } catch {
    /* ignore */
  }
  return undefined;
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_REMEMBER_KEY);
    sessionStorage.removeItem(SESSION_TAB_KEY);
  } catch {
    /* ignore */
  }
}

interface ResetRecord {
  code: string;
  expiry: number;
  used: boolean;
}

function readResets(): Record<string, ResetRecord> {
  try {
    return JSON.parse(localStorage.getItem(RESET_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeResets(resets: Record<string, ResetRecord>) {
  try {
    localStorage.setItem(RESET_KEY, JSON.stringify(resets));
  } catch {
    /* ignore */
  }
}

export function requestPasswordReset(email: string): { ok: boolean; error?: string; code?: string } {
  const cleanEmail = email.trim().toLowerCase();
  if (!accountExists(cleanEmail)) {
    return { ok: false, error: "No account found for this email." };
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const resets = readResets();
  resets[cleanEmail] = { code, expiry: Date.now() + 30 * 60 * 1000, used: false };
  writeResets(resets);
  return { ok: true, code };
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const record = readResets()[cleanEmail];
  if (!record || record.used) return { ok: false, error: "No active reset request for this email." };
  if (Date.now() > record.expiry) return { ok: false, error: "This reset code has expired. Request a new one." };
  if (String(record.code) !== String(code).trim()) return { ok: false, error: "Invalid reset code." };
  const pwCheck = validatePassword(newPassword);
  if (!pwCheck.ok) return { ok: false, error: pwCheck.reason };

  const accounts = readAccounts();
  const idx = accounts.findIndex((a) => a.email === cleanEmail);
  if (idx === -1) return { ok: false, error: "Account not found." };

  try {
    const salt = randomB64(16);
    const passwordHash = await deriveBits(newPassword, salt, ITERATIONS);
    accounts[idx] = { ...accounts[idx], salt, iterations: ITERATIONS, passwordHash };
    writeAccounts(accounts);
    const resets = readResets();
    resets[cleanEmail] = { ...record, used: true };
    writeResets(resets);
    return { ok: true };
  } catch {
    return { ok: false, error: "Password update failed. Please try again." };
  }
}