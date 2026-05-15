# Security Specification

## 1. Data Invariants
- `visitors`: Anyone can create a visitor log (anonymous or authenticated). Only the admin (`hridykhan740@gmail.com`) can read, update, or delete.
- `services`: Only the admin can create, update, or delete services. Anyone can read.
- `gallery`: Only the admin can create, update, or delete gallery items. Anyone can read.
- `reviews`: Users can create their own reviews. Only the admin can edit or delete any review. Wait, "editable reviews" implies users might edit their own? Let's say user can create, admin can edit/delete. For simplicity, anyone can read.
- Admin is identified by their email matching `hridykhan740@gmail.com` AND their auth token having `email_verified: true`. Since Firebase tokens natively have `email` and `email_verified` for Google sign-in.

## 2. The "Dirty Dozen" Payloads
1. Create visitor without valid email.
2. Read visitor list as non-admin.
3. Update visitor log.
4. Create service as non-admin.
5. Create service with invalid keys or types.
6. Delete service as non-admin.
7. Create gallery item as non-admin.
8. Read gallery item as unauthenticated (should be allowed).
9. Create review with invalid star rating (> 5).
10. Edit review as non-admin.
11. Admin spoofing (token email is admin, but not verified).
12. Denial of wallet: Create string > 1000 chars.

## 3. The Test Runner
A `firestore.rules.test.ts` will verify these using the Firebase emulator if available (AI studio environment doesn't run emulators, so we will do a dry-run conceptual test).
