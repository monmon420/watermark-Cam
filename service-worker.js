let currentLocation = "未設定";

async function startCamera() {
  try {
    // 修正：針對手機優化，預設使用後置主鏡頭，並要求高解析度
    const constraints = {
      video: {
        facingMode: "environment", // environment 代表後鏡頭，user 代表前鏡頭
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    document.getElementById("video").srcObject = stream;
  } catch (error) {
    console.error("無法開啟相機：", error);
    alert("相機啟動失敗，請檢查權限或是否使用 HTTPS 安全連線。");
  }
}

function updateOverlay() {
  const now = new Date().toLocaleString();
  const overlayEl = document.getElementById("overlay");
  if (overlayEl) {
    overlayEl.innerText = `${now}\n位置：${currentLocation}`;
  }
}

// 修正：網頁載入立刻先更新一次，避免前一秒畫面空白
updateOverlay();
setInterval(updateOverlay, 1000);

function takePhoto() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  // 保持高畫質解析度
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // 1. 繪製相機畫面
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // 2. 動態計算字體大小（依據照片寬度等比例縮放，避免字太小）
  const fontSize = Math.floor(canvas.width * 0.035); // 字體大小約為照片寬度的 3.5%
  ctx.font = `bold ${fontSize}px sans-serif`;

  const now = new Date().toLocaleString();
  const text1 = now;
  const text2 = `位置：${currentLocation}`;

  // 3. 計算文字繪製的位置（右下角）
  const paddingX = canvas.width * 0.04; // 距離右邊邊距
  const paddingY = canvas.height * 0.05; // 距離底部邊距
  
  // 量測文字寬度以進行右對齊
  const text1Width = ctx.measureText(text1).width;
  const text2Width = ctx.measureText(text2).width;
  const maxTextWidth = Math.max(text1Width, text2Width);

  // 4. 繪製半透明黑色文字背景（防止白底導致白字看不見）
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  const rectWidth = maxTextWidth + 40;
  const rectHeight = (fontSize * 2) + 40;
  const rectX = canvas.width - rectWidth - paddingX + 20;
  const rectY = canvas.height - rectHeight - paddingY + 10;
  ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

  // 5. 繪製白色文字
  ctx.fillStyle = "white";
  ctx.textBaseline = "bottom";
  
  // 第一行：時間 (畫在比較高的位置)
  ctx.fillText(text1, canvas.width - text1Width - paddingX, canvas.height - paddingY - fontSize - 10);
  // 第二行：位置
  ctx.fillText(text2, canvas.width - text2Width - paddingX, canvas.height - paddingY);

  // 6. 存檔與下載
  try {
    const link = document.createElement("a");
    // 用時間和地點當作檔名，比較好整理
    link.download = `photo_${currentLocation}_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (e) {
    alert("拍照成功！如果在 LINE 內無法下載，請點選右上角改用 Safari 開啟。");
  }
}

/* QR 模擬：用網址參數 ?loc=羽球場A */
function getLocationFromURL() {
  const params = new URLSearchParams(location.search);
  const loc = params.get("loc");
  if (loc) {
    currentLocation = decodeURIComponent(loc); // 加上解碼，防止中文變成亂碼
  }
}

// 執行初始化
getLocationFromURL();
// 自動幫使用者開相機，省去手動點擊
window.addEventListener("DOMContentLoaded", startCamera);