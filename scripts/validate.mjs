// yakudoc-packs のパック JSON を検証する。
// CI(.github/workflows/validate.yml)とローカルの両方から実行できる。
// 依存なしで動くよう Node 標準 API のみを使う。
import { readdirSync, readFileSync, statSync } from "node:fs";
import * as path from "node:path";

const PACKS_DIR = path.join(process.cwd(), "packs");

/** ファイル名(<name>.json)から想定されるパッケージ名。__ は / に戻す */
function packageNameFromFileName(fileName) {
  return fileName.replace(/\.json$/i, "").replace(/__/g, "/");
}

const errors = [];
let packCount = 0;
let entryCount = 0;

let langDirs = [];
try {
  langDirs = readdirSync(PACKS_DIR).filter((name) =>
    statSync(path.join(PACKS_DIR, name)).isDirectory()
  );
} catch {
  console.error(`packs ディレクトリが見つかりません: ${PACKS_DIR}`);
  process.exit(1);
}

for (const lang of langDirs) {
  const langDir = path.join(PACKS_DIR, lang);
  for (const fileName of readdirSync(langDir)) {
    if (!fileName.toLowerCase().endsWith(".json")) {
      errors.push(`${lang}/${fileName}: .json 以外のファイルは packs 配下に置かないでください`);
      continue;
    }
    const rel = `${lang}/${fileName}`;
    const filePath = path.join(langDir, fileName);

    let pack;
    try {
      pack = JSON.parse(readFileSync(filePath, "utf8"));
    } catch (error) {
      errors.push(`${rel}: JSON として解釈できません(${error.message})`);
      continue;
    }
    if (pack === null || typeof pack !== "object" || Array.isArray(pack)) {
      errors.push(`${rel}: トップレベルはオブジェクトである必要があります`);
      continue;
    }

    packCount += 1;

    if (typeof pack.name !== "string" || pack.name === "") {
      errors.push(`${rel}: "name"(パッケージ名)が必要です`);
    } else if (pack.name !== packageNameFromFileName(fileName)) {
      errors.push(
        `${rel}: "name"(${pack.name})とファイル名(${packageNameFromFileName(fileName)})が一致しません`
      );
    }

    if (typeof pack.lang !== "string" || pack.lang === "") {
      errors.push(`${rel}: "lang"(言語コード)が必要です`);
    } else if (pack.lang !== lang) {
      errors.push(`${rel}: "lang"(${pack.lang})がディレクトリ名(${lang})と一致しません`);
    }

    if (pack.entries === null || typeof pack.entries !== "object" || Array.isArray(pack.entries)) {
      errors.push(`${rel}: "entries" オブジェクトが必要です`);
      continue;
    }

    for (const [hash, entry] of Object.entries(pack.entries)) {
      entryCount += 1;
      if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
        errors.push(`${rel}#${hash}: エントリはオブジェクトである必要があります`);
        continue;
      }
      if (typeof entry.original !== "string" || entry.original === "") {
        errors.push(`${rel}#${hash}: "original"(原文)が必要です`);
      }
      if (entry.translated !== undefined && typeof entry.translated !== "string") {
        errors.push(`${rel}#${hash}: "translated" は文字列である必要があります`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`検証に失敗しました(${errors.length} 件):\n`);
  for (const error of errors) {
    console.error(`  ✖ ${error}`);
  }
  process.exit(1);
}

console.log(
  `✔ 検証を通過しました(${langDirs.length} 言語 / ${packCount} パック / ${entryCount} エントリ)`
);
