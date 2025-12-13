# How To Run and Debug Without Losing Your Mind

## Running

- Use `pnpm dev` to run the app.
- Keep the terminal visible for logs and errors.

## When you see an error:

1. **Read the error message.**
   - Note the file and line.
   - Copy the stack trace into your devlog if it's weird.

2. **Open the file mentioned.**
   - Look at the line.
   - Check:
     - typos
     - missing imports
     - type mismatches.

3. **Use the compiler.**
   - If TypeScript yells, fix types first.
   - TS errors usually point directly at the problem.

4. **Use AI smartly.**
   - Paste the error and the relevant code into your editor's AI.
   - Ask:
     > "Why is this error happening? Show me how to fix it while keeping the rest of the file intact."

5. **Re-run.**
   - Fix one thing at a time.
   - Don't change 10 files blindly.

The goal is not "never see errors". The goal is "I can fix errors calmly and quickly".
