import path from "path";
import { build } from "esbuild";
import dotenv from "dotenv";

const projectRoot = process.cwd();
dotenv.config({ path: path.resolve(projectRoot, ".env") });

const clerkPubKey =
  process.env.VITE_CLERK_PUBLISHABLE_KEY ||
  process.env.CLERK_PUBLISHABLE_KEY ||
  "";

if (!clerkPubKey) {
  console.error(
    "VITE_CLERK_PUBLISHABLE_KEY is not set; run the build with that env var pointing to your Clerk publishable key."
  );
  process.exit(1);
}

await build({
  entryPoints: [path.resolve(projectRoot, "src", "clerk-init.js")],
  bundle: true,
  format: "iife",
  target: ["es2020"],
  outfile: path.resolve(projectRoot, "clerk-init.js"),
  define: {
    "import.meta.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(clerkPubKey),
  },
});
