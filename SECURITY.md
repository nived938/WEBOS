# SECURITY.md - Security Policy & Hardening Guidelines for NOVA OS

This document describes the security model, isolation mechanisms, and vulnerability disclosure policies of NOVA OS.

---

## 1. Security Architecture

NOVA OS operates within the client web browser sandbox. Because it executes client-side JavaScript, security is designed to protect user confidentiality, prevent clickjacking, and isolate dynamic code execution.

### Key Security Layers

```
┌────────────────────────────────────────────────────────┐
│                   Browser Sandbox                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │                 NOVA OS Kernel                   │  │
│  │   - In-Memory Virtual File System (VFS)          │  │
│  │   - LocalStorage Quota Isolation                 │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Sandboxed Untrusted Execution            │  │
│  │   - Code Playground (<iframe sandbox>)           │  │
│  │   - Web Browser IFrame (<iframe sandbox>)        │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Sandboxing Untrusted Code

### Code Playground (`PlaygroundApp.tsx`)
When running arbitrary user-authored HTML/CSS/JavaScript in the Code Playground:
- The iframe utilizes the restrictive sandbox attribute:
  ```html
  <iframe sandbox="allow-scripts allow-modals" srcdoc="..." />
  ```
- **Disallowed Permissions**:
  - `allow-same-origin`: **Omitted**. The code cannot access `window.localStorage`, cookies, or the host NOVA OS DOM.
  - `allow-top-navigation`: **Omitted**. The sandbox cannot redirect the parent operating system.
  - `allow-popups`: **Omitted**. The code cannot spawn rogue popups.

---

## 3. Storage & VFS Protection

- All file operations in the Virtual File System (VFS) are scoped strictly to the in-memory tree and serialized within the application's origin `localStorage`.
- Protected directories (`/`, `/Users/guest`) cannot be pruned or modified to ensure the operating system environment remains bootable.
- Sensitive user preferences do not transmit to external servers; all data remains local on the user's device.

---

## 4. Cross-Origin Requests & Network Policies

- When using the built-in **API Client** (`ApiTesterApp.tsx`), network requests comply with standard browser Cross-Origin Resource Sharing (CORS) rules.
- External URLs that enforce `X-Frame-Options: DENY` or `SAMEORIGIN` are detected safely and redirected to fallback reader cards or dedicated browser tabs.

---

## 5. Reporting Security Vulnerabilities

We take security and privacy seriously. If you discover a vulnerability or potential exploit within NOVA OS:
1. **Do not create a public GitHub issue.**
2. Email full vulnerability details, steps to reproduce, and potential impact to the repository maintainer.
3. We will acknowledge receipt within 48 hours and work on a prompt patch.
