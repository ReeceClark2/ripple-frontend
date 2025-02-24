document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;

  if (!canvas) {
    console.error("Canvas element not found!");
    return;
  }

  let true_width: number = 15;
  let true_height: number = 15;

  canvas.width = true_width;
  canvas.height = true_height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Failed to get canvas context!");
    return;
  }

  const width = canvas.width || true_width;
  const height = canvas.height || true_height;
  let pixels: { x: number; y: number; i: number }[] = [];

  // Initialize pixels array
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      pixels.push({ x, y, i: 0 });
    }
  }

  // Update intensity when clicked
  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = true_width / window.innerWidth;
    const scaleY = true_height / window.innerHeight;
    
    const x = Math.floor((event.clientX - rect.left) * scaleX);
    const y = Math.floor((event.clientY - rect.top) * scaleY);
    const index = y * true_width + x;

    console.log(x,y,canvas.width);
    if (index < pixels.length) {
      pixels[index].i = 255 * 10;
    }

    console.log(x, y);
  });

  function sendPixels() {
    if (pixels.length === 0) {
      console.warn("No pixels to send!");
      return;
    }
  
    // Filter pixels to only include those in a 5x5 grid
    // const selectedPixels = pixels.filter((pixel) => pixel.x % 5 === 0 && pixel.y % 5 === 0);
  
    // if (pixels.length === 0) {
    //   console.warn("No valid pixels to send!");
    //   return;
    // }
  
    // Convert selected pixels to ArrayBuffer (3 * Float32 per pixel)
    const buffer = new ArrayBuffer(pixels.length * 12);
    const view = new DataView(buffer);
  
    pixels.forEach((pixel, index) => {
      const offset = index * 12;
      view.setFloat32(offset + 0, pixel.x, true);
      view.setFloat32(offset + 4, pixel.y, true);
      view.setFloat32(offset + 8, pixel.i, true);
    });
  
    // Convert to Uint8Array for better browser compatibility
    const uint8Array = new Uint8Array(buffer);
  
    fetch("https://ripple-backend-4ksg.onrender.com/update", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: uint8Array,
    })    
      .then(response => {
        return response.arrayBuffer();
      })
    .then(data => {
        // Convert ArrayBuffer back into pixel objects
        const receivedPixels = [];
        const view = new DataView(data);
        const pixelCount = data.byteLength / 12;

        for (let i = 0; i < pixelCount; i++) {
            const offset = i * 12;
            const x = view.getFloat32(offset + 0, true);
            const y = view.getFloat32(offset + 4, true);
            const intensity = view.getFloat32(offset + 8, true);

            receivedPixels.push({ x, y, i: intensity });
        }

        console.log("Parsed pixels:", receivedPixels);
        pixels = receivedPixels;
        drawPixels();
    })

      .catch(error => console.error("Fetch Error:", error));        
  }  

  function drawPixels() {
    if (!ctx) return;
  
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
  
    for (let i = 0; i < pixels.length; i++) {
      const { x, y, i: intensity } = pixels[i];
  
      // Normalize intensity (assuming it's from 0 to 255)
      const factor = intensity / 255;
  
      // Base color (RGB)
      // const rBase = 3, gBase = 79, bBase = 94;
      const rBase = 0, gBase = 0, bBase = 0;
  
      // Blend with white based on intensity
      const r = Math.round(rBase + factor * (255 - rBase));
      const g = Math.round(gBase + factor * (255 - gBase));
      const b = Math.round(bBase + factor * (255 - bBase));
  
      // Convert (x, y) to 1D array index
      const index = (y * width + x) * 4;
      data[index] = r;
      data[index + 1] = g;
      data[index + 2] = b;
      data[index + 3] = 255; // Fully opaque
    }

    ctx.putImageData(imageData, 0, 0);
  }

  async function sendPixelsLoop() {
    while (true) {
      const startTime = performance.now();
  
      await sendPixels(); // Wait for the function to complete before proceeding
  
      const elapsedTime = performance.now() - startTime;
      const waitTime = Math.max(150 - elapsedTime, 0);
  
      await new Promise(resolve => setTimeout(resolve, waitTime)); // Ensure at least 100ms interval
    }
  }
  
  // Start the loop when the page loads
  sendPixelsLoop();
  
});
