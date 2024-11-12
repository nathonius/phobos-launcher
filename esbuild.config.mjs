import { build } from "esbuild";

await build({
  entryPoints: ["./app/main.ts", "./app/preload.ts"],
  outdir: "./dist",
  bundle: true,
  tsconfig: "./tsconfig.serve.json",
  platform: "node",
  external: ["electron", "fsevents"],
});
