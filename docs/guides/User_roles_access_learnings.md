# User Roles & Access Control — Implementation Learnings

Generic learnings from implementing role-based access control (RBAC) with Supabase RLS. No organization-specific data or table names.

---

## Session Analysis: What Took Maximum Time

### 1. RLS Policy Conflicts & Dependencies (~60% of time)
**Problem:** Multiple overlapping RLS policies caused unpredictable behavior (e.g. managers seeing all applications instead of only assigned ones).  
**Root cause:** Accumulated multiple policy versions; functions referenced wrong table names after renames.  
**Solution:** Clean-slate approach: drop and recreate SECURITY DEFINER functions with correct table references; use mutually exclusive policy conditions (e.g. `AND NOT is_admin()` in manager policy).

### 2. Table Name Migration Issues (~25% of time)
**Problem:** Renaming tables left orphaned references in functions and policies.  
**Solution:** Systematically recreate all functions and policies with the current table names. Use a single migration script that defines the canonical names.

### 3. Policy Overlap Logic (~15% of time)
**Problem:** Admin and manager policies could both match, causing unpredictable access.  
**Solution:** Mutually exclusive conditions, e.g. manager policy: `is_manager_for_job(...) AND NOT is_admin(...)`.

---

## Key Learnings for Faster Implementation

1. **Start with clean architecture** — Design RLS policies up front with clear role definitions; avoid accumulating multiple policy versions.
2. **Use SECURITY DEFINER functions from day 1** — Create helper functions (e.g. `is_admin(user_id)`, `is_manager_for_job(user_id, job_id)`) with SECURITY DEFINER for role checks; avoid querying protected tables directly in policy expressions to prevent recursion.
3. **Implement mutually exclusive policies** — Ensure policies cannot overlap (e.g. use `AND NOT` so admin and manager do not both match).
4. **Test early and often** — Test each policy with different user roles as soon as it’s added.
5. **Use CASCADE for cleanup** — When fixing issues, `DROP FUNCTION ... CASCADE` to clean dependent objects, then recreate.

---

## Implementation Phases (generic)

- **Phase 1 (Foundation):** Create access table (e.g. `user_job_access`: user_id, role, job_id, department, position). Create SECURITY DEFINER functions for role checks. Test with sample data.
- **Phase 2 (Basic policies):** Admin policies (full access); manager policies (restricted to assigned jobs). Test with different users.
- **Phase 3 (Refinement):** Add overlap prevention; test edge cases; document each policy’s purpose.
- **Phase 4 (Integration):** Update frontend for role-based UI; run full flow; verify security.

---

## Systematic Debugging Checklist (for any RLS issue)

1. **Data layer** — Verify data exists; verify user has a record in the access table.
2. **Function layer** — Verify helper functions exist and are SECURITY DEFINER; test them directly with the user’s ID.
3. **Policy coverage** — List all policies on the table; ensure every required operation (SELECT, INSERT, UPDATE, DELETE) has an appropriate policy.
4. **Policy logic** — Test the policy condition in a direct query.
5. **Frontend** — Check browser console and network; confirm the right API calls are made and responses match expectations.

Always check policy coverage first; many “complex” RLS issues are simply missing SELECT or other policies.

---

## Generic RBAC Patterns

- **Access table:** e.g. `user_job_access` (user_id, role, job_id, department, position). Use for “is this user admin?” and “is this user manager for this job?”.
- **Admin check:** `is_admin(user_id)` — returns true if user has admin role (e.g. role = 'admin' and job_id IS NULL).
- **Manager check:** `is_manager_for_job(user_id, job_id)` — returns true if there is a row linking that user and job.
- **Policies:** Admin: full access using `is_admin(auth.uid())`. Manager: SELECT/UPDATE only where `is_manager_for_job(auth.uid(), job_id) AND NOT is_admin(auth.uid())`. Users: SELECT own row only where `user_id = auth.uid()`.

---

## Security Note: Restrict Access Table

The access table itself should not be wide open. Prefer:
- Admins: full access to the access table (e.g. `is_admin(auth.uid())`).
- Users: read-only access to their own row (e.g. `user_id = auth.uid()`).

No credentials, API keys, or organization-specific names are included in this document.
