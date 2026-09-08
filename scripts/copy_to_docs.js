import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const docsDir = path.join(rootDir, 'docs');

console.log('📦 正在同步 dist/ 到 docs/ 供 GitHub Pages 靜態分支部署...');

if (!fs.existsSync(distDir)) {
  console.error('❌ 找不到 dist/ 目錄，請先執行 vite build！');
  process.exit(1);
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 清理舊有的 docs/static 檔案避免殘留過期的 bundle 哈希
try {
  const docsStaticDir = path.join(docsDir, 'static');
  if (fs.existsSync(docsStaticDir)) {
    const files = fs.readdirSync(docsStaticDir);
    for (const f of files) {
      try {
        fs.unlinkSync(path.join(docsStaticDir, f));
      } catch (_) {}
    }
  }
} catch (err) {
  console.warn('⚠️ 清理舊靜態檔略過:', err.message);
}

copyDirRecursive(distDir, docsDir);

// 確保 docs/.nojekyll 存在
const noJekyllPath = path.join(docsDir, '.nojekyll');
fs.writeFileSync(noJekyllPath, '# Disable Jekyll for GitHub Pages\n');

console.log('✅ docs/ 目錄同步成功！包含 index.html, static/, assets/, phaser.min.js 與 .nojekyll');
