# Logo Setup Instructions

## Logo File Location

The logo file needs to be placed in the `public/` folder.

## Steps:

1. **Add the logo file to the `public/` folder:**
   - File name: `gandhi-fellowship-logo.png` (or `.jpg` if PNG not available)
   - Location: `public/gandhi-fellowship-logo.png`

2. **If you have a different file name:**
   - Update all references in the code from `/gandhi-fellowship-logo.png` to your actual filename
   - Files to update:
     - `src/routes/Index.tsx`
     - `src/routes/Jobs.tsx`
     - `src/routes/JobDetail.tsx`
     - `src/components/Header.tsx`

3. **Commit the logo file to git:**
   ```bash
   git add public/gandhi-fellowship-logo.png
   git commit -m "Add Gandhi Fellowship logo"
   git push
   ```

## Current Logo References

The code currently references:
- `/gandhi-fellowship-logo.png` in all components

Make sure the file exists in the `public/` folder for it to display correctly.
