const fs = require('fs');
const path = require('path');
const https = require('https');
const extractZip = require('extract-zip');

// Font sources
const sources = {
  roboto: {
    url: 'https://fonts.google.com/download?family=Roboto',
    files: [
      'Roboto-Regular.ttf',
      'Roboto-Bold.ttf',
      'Roboto-Medium.ttf',
      'Roboto-Light.ttf',
      'Roboto-Italic.ttf',
      'Roboto-BoldItalic.ttf'
    ]
  }
};

// Download and extract font
async function downloadFont(fontName) {
  if (!sources[fontName]) {
    console.error(`Font "${fontName}" not found in sources.`);
    return;
  }

  const source = sources[fontName];
  const fontDir = path.join(__dirname, '..', 'assets', 'fonts', fontName);
  const zipPath = path.join(__dirname, '..', 'assets', 'fonts', `${fontName}.zip`);

  // Create directories if they don't exist
  if (!fs.existsSync(fontDir)) {
    fs.mkdirSync(fontDir, { recursive: true });
  }

  // Download the font zip file
  await new Promise((resolve, reject) => {
    const file = fs.createWriteStream(zipPath);
    https.get(source.url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(zipPath);
      reject(err);
    });
  });

  // Extract the zip file
  await extractZip(zipPath, { dir: fontDir });

  // Delete the zip file
  fs.unlinkSync(zipPath);

  console.log(`Font "${fontName}" downloaded and extracted successfully.`);
}

// Initialize fonts
async function initFonts() {
  try {
    await downloadFont('roboto');
  } catch (error) {
    console.error('Error initializing fonts:', error);
  }
}

module.exports = {
  initFonts
};