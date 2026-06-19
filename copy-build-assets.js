const fs = require('fs');
const path = require('path');

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  console.log('Copying .next/static to .next/standalone/.next/static...');
  copyDirSync(
    path.join(__dirname, '.next', 'static'),
    path.join(__dirname, '.next', 'standalone', '.next', 'static')
  );

  console.log('Copying public to .next/standalone/public...');
  copyDirSync(
    path.join(__dirname, 'public'),
    path.join(__dirname, '.next', 'standalone', 'public')
  );
  
  console.log('Build assets copied successfully!');
} catch (err) {
  console.error('Error copying build assets:', err);
  process.exit(1);
}
