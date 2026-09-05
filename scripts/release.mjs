import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const version = process.argv[2];
if (!/^0\.\d+\.\d+$/.test(version ?? ""))
  throw new Error("Usage: node scripts/release.mjs 0.x.y");
const paths = [
  "package.json",
  ...["apps", "packages"].flatMap((root) =>
    readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => `${root}/${d.name}/package.json`),
  ),
];
for (const path of paths) {
  let json;
  try {
    json = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") continue;
    throw error;
  }
  json.version = version;
  writeFileSync(path, JSON.stringify(json, null, 2) + "\n");
}
for (const path of ["README.md", "docs/CONTEXT.md"]) {
  writeFileSync(
    path,
    readFileSync(path, "utf8").replace(
      /(Current version:\*?\*?\s*)`[^`]+`/g,
      `$1\`${version}\``,
    ),
  );
}
