const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Canvas size (match to your desired output)
// Use full A4 resolution for direct high-quality download
const W = 4960; // A4 width at 600 DPI
const H = 7016; // A4 height at 600 DPI
canvas.width = W;
canvas.height = H;

// Hide canvas completely (no preview)
canvas.style.display = "none";

// Background source default
let currentBgSource = 'images/rgb-01.jpg';

// Controls (if you have them)
const colorButtons = document.querySelectorAll('.controls button');
colorButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    colorButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    currentBgSource = button.getAttribute('data-file');
    generateImage();
  });
});

document.getElementById('generateButton').addEventListener('click', generateImage);

// Helper to load uploaded images (calls callback with an Image or null)
function loadImage(inputId, callback) {
  const fileInput = document.getElementById(inputId);
  const file = fileInput?.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => callback(img);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    callback(null);
  }
}

// Full generate function (draws bg, QR, logo, updates download link)
function generateImage() {
  if (!document.getElementById('companyLogo').files.length) {
    alert("⚠️ Please upload Company Logo (bottom white box).");
    return;
  }
  if (!document.getElementById('UploadQR').files.length) {
    alert("⚠️ Please upload QR image.");
    return;
  }

  const bg = new Image();
  bg.src = currentBgSource;

  bg.onload = () => {
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(bg, 0, 0, W, H);

    // --- 1️⃣ Draw QR inside phone screen ---
    loadImage('UploadQR', (qr) => {
      if (qr) {
        const qrBoxW = W * 0.37;   // QR box width
        const qrBoxH = H * 0.33;   // QR box height

        // ✅ Slightly more right (previously +W*0.01, now +W*0.015)
        const qrBoxX = W * 0.33 + (W * 0.024);
        const qrBoxY = H * 0.34;

        const qrPadding = 0.98;
        const qrSize = Math.min(qrBoxW, qrBoxH) * qrPadding;

        // Center QR inside box
        const drawX = qrBoxX + (qrBoxW - qrSize) / 2;
        const drawY = qrBoxY + (qrBoxH - qrSize) / 2;

        // Slight left tilt
        ctx.save();
        ctx.translate(drawX + qrSize / 2, drawY + qrSize / 2);
        ctx.rotate((-5 * Math.PI) / 180);

        ctx.globalCompositeOperation = "multiply";
        ctx.drawImage(qr, -qrSize / 2, -qrSize / 2, qrSize, qrSize);
        ctx.restore();
      }

      // --- 2️⃣ Company logo inside white box ---
     loadImage('companyLogo', (logo) => {
  if (logo) {
    // White box on left side near bottom
    const boxW = W * 0.40; // width of white box
    const boxH = H * 0.12; // height of white box
    const boxX = W * 0.07; // move to left side (adjust this to move more/less)
    const boxY = H * 0.86; // near bottom

    // Draw white box
    

    // Scale and center logo inside box
    const logoPadding = 0.85;
    const scale = Math.min(
      (boxW * logoPadding) / logo.width,
      (boxH * logoPadding) / logo.height
    );

    const logoW = logo.width * scale;
    const logoH = logo.height * scale;
    const logoX = boxX + (boxW - logoW) / 2;
    const logoY = boxY + (boxH - logoH) / 2;

    ctx.drawImage(logo, logoX, logoY, logoW, logoH);
  }


        const link = document.getElementById('downloadLink');
        if (link) {
          link.href = canvas.toDataURL('image/png');
          link.download = 'OfferImage.png';
        }
      });
    });
  };

  bg.onerror = () => {
    alert("⚠️ Background image not found! Check your path.");
  };
}



// 📄 Download as A4 PDF
document.getElementById('downloadPDF').addEventListener('click', () => {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) return alert("⚠️ jsPDF library not loaded.");

    const canvas = window.canvas || document.getElementById('canvas');
    if (!canvas) return alert("⚠️ Main canvas not found.");

    // ✅ A4 @ 600 DPI (print quality)
    const A4_WIDTH = 4960;
    const A4_HEIGHT = 7016;

    // Create high-res temp canvas
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    tempCanvas.width = A4_WIDTH;
    tempCanvas.height = A4_HEIGHT;

    ctx.drawImage(canvas, 0, 0, A4_WIDTH, A4_HEIGHT);

    // 🔹 Less compression → bigger file (≈ 8–12 MB)
    const imgData = tempCanvas.toDataURL('image/jpeg', 0.98);

    // Create PDF (no compression)
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [A4_WIDTH, A4_HEIGHT],
        compress: false,
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH, A4_HEIGHT);
    pdf.save('Standee_A4_UltraQuality.pdf');
});


// 🖼️ **High-Quality JPG (~6–8 MB)**
document.getElementById('downloadStandee').addEventListener('click', async () => {
  if (!document.getElementById('companyLogo').files.length) {
    return alert("⚠️ Please upload Company Logo first.");
  }
  if (!document.getElementById('UploadQR').files.length) {
    return alert("⚠️ Please upload QR image first.");
  }

  await new Promise(resolve => {
    generateImage();
    setTimeout(resolve, 1500); // small delay to finish drawing
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const link = document.createElement('a');
  link.download = 'Standee_A4_HQ.jpg';
  link.href = imgData;
  link.click();
});
