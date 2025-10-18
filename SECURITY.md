# Security Policy

Thank you for helping keep **ngxsmk-tel-input** and its users safe.  
We follow responsible disclosure and coordinate fixes before public release.

---

## Supported Versions

Only the **latest version published on npm** is currently supported for security fixes.  
(Pre-1.0 policy: we only patch the most recent release. Please upgrade to the newest version before reporting.)

| Version on npm        | Security Fixes |
|-----------------------|----------------|
| latest (most recent)  | ✅ Supported   |
| anything older        | ❌ Unsupported |

**Note:** The library declares Angular peer deps `>=17 <20`. Using unsupported Angular versions may limit our ability to fix or reproduce issues.

---

## Reporting a Vulnerability (preferred)

**Please do _not_ open a public GitHub issue.**  
Use one of the private channels below:

1. **GitHub Security Advisory** (recommended)
   - Repo → **Security** tab → **Report a vulnerability**.
2. **Email**
   - `sachindilshan040@gmail.com`
   - Subject: `SECURITY: <short title>`
   - If you need encryption, send a note first and we’ll provide a public key.

### What to include

- A clear description of the issue and potential impact.
- Steps to reproduce and a minimal PoC (CodePen, JSFiddle, repo, or code snippet).
- Affected versions (library + Angular + Node).
- Any logs, stack traces, or screenshots that help triage.
- Your preferred contact for follow-up and whether you’d like **credit**.

---

## Our Commitment & Timeline

- **Acknowledgement:** within **72 hours**.
- **Triage & severity:** within **5 business days** (CVSS-style guidance).
- **Fix & release window:** aim for **30 days** for High/Critical; **90 days** max unless complexity requires more time.
- **Coordinated disclosure:** we’ll ask you to keep details private until a fix is released. We’ll credit you (unless you prefer otherwise).

If an issue is actively exploited, we’ll prioritize an out-of-band patch and public advisory as soon as practical.

---

## Scope

**In scope**
- Vulnerabilities in this repo’s source code and published npm package (`ngxsmk-tel-input`).
- Supply chain issues affecting the published package (e.g., typo-squatting, malicious publish, integrity concerns).

**Out of scope / best reported upstream**
- Vulnerabilities in **dependencies** (e.g., `intl-tel-input`, `libphonenumber-js`, Angular).  
  → Please report to the respective projects, and feel free to CC us so we can track/mitigate.
- Issues caused solely by misconfiguration in a consumer app (e.g., missing CSS/assets).

---

## How we ship securely

- Builds are produced with Angular CLI/ng-packagr.
- We avoid including development files in the npm package.
- Releases may be published from CI with npm provenance when available.
- We maintain minimal runtime dependencies and up-to-date dev tooling.

### Verifying the package

- Install from the official scope/name: `ngxsmk-tel-input`.
- Compare the `sha512` and file list shown by `npm view ngxsmk-tel-input dist-tags version` and `npm pack --dry-run`.
- Prefer the **latest** release unless a security advisory states otherwise.

---

## Credit

We’re happy to acknowledge reporters in release notes and/or a dedicated `SECURITY-ACKNOWLEDGEMENTS.md` (optional).  
Let us know **how you’d like to be credited** (name, handle, link).

---

## Safe Harbor

We will not pursue or support legal action for good-faith, non-disruptive research that:
- Respects privacy and does not exfiltrate data beyond what’s necessary to demonstrate impact,
- Avoids service degradation for other users,
- Uses the private reporting channels above, and
- Gives us reasonable time to remediate before public disclosure.

If you’re unsure whether your testing is in scope, contact us first.

---

## Questions?

Email: `sachindilshan040@gmail.com`  
Package: https://www.npmjs.com/package/ngxsmk-tel-input
