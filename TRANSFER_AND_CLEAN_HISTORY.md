# Transferring Code to Another Organization — Clean History Guide

## 1. Is this the latest version?

- **Current code (working tree)** is the Gandhi Fellowship version with:
  - No hardcoded keys (Supabase/Resend use env vars only)
  - Gandhi Fellowship branding, forms, and SQL
  - Supabase migrations: `supabase/migrations/000_SETUP_NEW_DATABASE.sql` and `001_rename_three_user_job_access_to_user_job_access.sql`

- **Git history** still contains many older commits. Anyone with repo access can run `git log` and `git show <commit>` to view **past file contents**, including any keys, passwords, or org emails that were ever committed (e.g. from an earlier version of the project).

So: the **latest version of the code** is clean, but the **history is not safe** to hand over as-is.

---

## 2. The problem

When you transfer this repo to another organization:

- They can clone and browse **full history**.
  - Old commits may still contain:
  - Supabase project URL and anon/service_role keys
  - Resend API key
  - Admin emails and passwords in docs/scripts

Removing secrets in the latest commit does **not** remove them from history.

---

## 3. Best solution: one clean commit, no history

**Recommended:** Give the other organization a repo that has **only one commit** with the current, clean code. No old commits = no history to search for keys.

Two ways to do it:

---

### Option A: New repo with single commit (recommended for transfer)

Do this on your machine, then push to the **new org’s empty repo**.

1. **Create a clean copy of the project (no git history):**
   ```bash
   # Create a new folder (e.g. on Desktop or in a new folder)
   mkdir Job-Portal-Gandhi-Fellowship-Clean
   cd Job-Portal-Gandhi-Fellowship-Clean
   ```

2. **Copy only the current files (no .git):**
   - Copy everything from your current project **except** the `.git` folder.
   - On Windows: copy all files/folders, then delete the `.git` folder inside the new folder.
   - Or from the project root:
     ```bash
     # From parent of your current repo (e.g. GitHub folder)
     xcopy /E /I /EXCLUDE:exclude.txt "Job-Portal-Gandhi_Fellowship" "Job-Portal-Gandhi-Fellowship-Clean"
     ```
     (Create `exclude.txt` with one line: `.git` so that folder is skipped.)
   - Or use Explorer: copy project folder → in the copy, delete the `.git` folder.

3. **Optional but recommended — remove old org SQL/docs before copying:**
   - The `database` folder has already been removed from this repo. If copying from an older copy, delete it (old migrations and org-specific scripts).
   - The new org only needs: `supabase/migrations/000_SETUP_NEW_DATABASE.sql`, `supabase/migrations/001_rename_three_user_job_access_to_user_job_access.sql`, and `SUPABASE_SETUP_GUIDE.md`.

4. **Start a new repo with one commit:**
   ```bash
   cd Job-Portal-Gandhi-Fellowship-Clean
   git init
   git add .
   git commit -m "Initial commit - Gandhi Fellowship Job Portal"
   ```

5. **Point to the new org’s repo and push:**
   ```bash
   git remote add origin https://github.com/NEW_ORG/repo-name.git
   git branch -M main
   git push -u origin main
   ```

Result: the new org gets **only this one commit**. No history, no old keys in git.

---

### Option B: Same repo — squash history into one commit

Use this if you want to **keep the same GitHub repo** but make history “clean” (one commit).

**Warning:** This rewrites history. Everyone who has cloned the repo will need to re-clone or reset. Coordinate with anyone else using the repo.

1. **Create an orphan branch (no history):**
   ```bash
   git checkout --orphan clean-main
   ```

2. **Add all current files and commit:**
   ```bash
   git add -A
   git commit -m "Initial commit - Gandhi Fellowship Job Portal"
   ```

3. **Replace main with this single commit:**
   ```bash
   git branch -D main
   git branch -m main
   git push origin main --force
   ```

After this, the repo has only one commit. Old commits are no longer on `main` (they can still exist in reflog until garbage-collected; for a true “clean” handover, Option A is clearer).

---

## 4. Optional: remove old org files before packaging

To avoid transferring old SQL and docs:

- **Delete the `database` folder** in the copy you use for the new org (already removed in this repo). It contained old scripts and org-specific emails.

The new org only needs:

- `supabase/migrations/000_SETUP_NEW_DATABASE.sql`
- `SUPABASE_SETUP_GUIDE.md`

So removing `database/` keeps the handover minimal and avoids leaking old org details from the repo content as well.

---

## 5. Summary

| Question | Answer |
|----------|--------|
| Is the **current** code the latest and clean? | Yes. No hardcoded keys; env vars only. |
| Is **git history** safe to share? | No. Old commits can still contain keys and org data. |
| Best way to transfer to another org? | **Option A:** New folder, no `.git`, one commit, push to new org’s repo. |
| Should we “delete all older commits and keep only one”? | Yes. Doing that via Option A or B gives a single clean commit and no history to mine for secrets. |

Doing Option A (new repo, one commit) is the simplest and safest way to transfer the code without exposing past secrets.
