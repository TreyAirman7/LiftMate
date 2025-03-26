const fs = require('fs');
const { createCanvas } = require('canvas');

// Function to create an icon
function createIcon(size) {
  // Create canvas
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fill background with LiftMate purple
  ctx.fillStyle = '#6750A4';
  ctx.fillRect(0, 0, size, size);
  
  // Add text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size/3}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LM', size/2, size/2);
  
  // Convert to buffer and return
  return canvas.toBuffer('image/png');
}

// Sizes needed for PWA icons
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Ensure icons directory exists
try {
  fs.mkdirSync('../icons', { recursive: true });
} catch (err) {
  // Directory may already exist, ignore
}

// Create and save each icon
sizes.forEach(size => {
  const iconBuffer = createIcon(size);
  fs.writeFileSync(`../icons/icon-${size}x${size}.png`, iconBuffer);
  console.log(`Created icon-${size}x${size}.png`);
});

console.log('All icons created successfully!');