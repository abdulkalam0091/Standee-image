const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Canvas size (match to your desired output)
const W = 800, H = 1000;
canvas.width = W;
canvas.height = H;

// Background source default
let currentBgSource = 'images/standee-01.jpg';

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
        const qrBoxW = W * 0.35;   // QR box width
        const qrBoxH = H * 0.36;   // QR box height

        // ✅ Slightly more right (previously +W*0.01, now +W*0.015)
        const qrBoxX = W * 0.35 + (W * 0.015);
        const qrBoxY = H * 0.32;

        const qrPadding = 0.98;
        const qrSize = Math.min(qrBoxW, qrBoxH) * qrPadding;

        // Center QR inside box
        const drawX = qrBoxX + (qrBoxW - qrSize) / 2;
        const drawY = qrBoxY + (qrBoxH - qrSize) / 2;

        // Slight left tilt
        ctx.save();
        ctx.translate(drawX + qrSize / 2, drawY + qrSize / 2);
        ctx.rotate((-7 * Math.PI) / 180);
        ctx.drawImage(qr, -qrSize / 2, -qrSize / 2, qrSize, qrSize);
        ctx.restore();
      }

      // --- 2️⃣ Company logo inside white box ---
     loadImage('companyLogo', (logo) => {
  if (logo) {
    // White box on left side near bottom
    const boxW = W * 0.30; // width of white box
    const boxH = H * 0.12; // height of white box
    const boxX = W * 0.10; // move to left side (adjust this to move more/less)
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



document.getElementById('downloadPDF').addEventListener('click', () => {
    // This function MUST remain separate from generateImage()
    const { jsPDF } = window.jspdf;
    
    // This ensures the library is available before trying to use it
    if (!jsPDF) {
        alert("⚠️ Error: jsPDF library is not loaded in your HTML. PDF download failed.");
        return;
    }
    
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height] // match canvas size
    });

    const imgData = canvas.toDataURL('image/png');

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

    pdf.save('OfferImage.pdf');
});

document.getElementById('downloadStandee').addEventListener('click', () => {
    // 1. Get the image data from the canvas
    const imgData = canvas.toDataURL('image/jpeg', 0.9); // 0.9 is the quality for JPG

    // 2. Create a temporary anchor element
    const link = document.createElement('a');
    
    // 3. Set the download filename and the image data as the href
    link.download = 'StandeeImage.jpg'; 
    link.href = imgData;

    // 4. Append the link to the document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});