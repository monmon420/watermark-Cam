let currentLocation = "未設定";

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isLine = /Line/i.test(navigator.userAgent);

// 統一解析網址參數：同時支援 ?watermark= 和 ?loc=
function getLocationFromURL() {
  const params = new URLSearchParams(location.search);
  const loc = params.get("loc") || params.get("watermark");
  if (loc) {
    currentLocation = decodeURIComponent(loc);
  }
}

async function startCamera() {
  if (isIOS && isLine) {
    alert("【💡 系統提示】\n偵測到您使用 iPhone LINE 開啟。\n\n請點擊右下角或右上角的「•••」，選擇「在 Safari 開啟」，相機與拍照下載功能才能完全正常喔！");
  }

  try {
    const constraints = {
      video: {
        facingMode: "environment", // 強制後鏡頭
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    document.getElementById("video").srcObject = stream;
  } catch (error) {
    console.error("相機啟動失敗：", error);
    alert("無法啟動相機。請確認：\n1. 網址開頭必須是 https \n2. 已允許瀏覽器的相機權限。");
  }
}

function updateOverlay() {
  const now = new Date().toLocaleString('zh-TW', { hour12: false });
  const overlayEl = document.getElementById("overlay");
  if (overlayEl) {
    overlayEl.innerText = `⏱️ ${now}\n📍 位置：${currentLocation}`;
  }
}

function takePhoto() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  // 使用相機原生高解析度
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // 1. 繪製鏡頭畫面
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // 2. 動態計算字體大小 (依照片寬度 3.5% 縮放)
  const fontSize = Math.floor(canvas.width * 0.035); 
  ctx.font = `bold ${fontSize}px sans-serif`;

  const now = new Date().toLocaleString('zh-TW', { hour12: false });
  const text1 = `⏱️ ${now}`;
  const text2 = `📍 位置：${currentLocation}`;

  const paddingX = canvas.width * 0.04; 
  const paddingY = canvas.height * 0.05; 
  
  const text1Width = ctx.measureText(text1).width;
  const text2Width = ctx.measureText(text2).width;
  const maxTextWidth = Math.max(text1Width, text2Width);

  // 3. 繪製半透明黑底
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  const rectWidth = maxTextWidth + 40;
  const rectHeight = (fontSize * 2) + 50;
  ctx.fillRect(canvas.width - rectWidth - paddingX + 20, canvas.height - rectHeight - paddingY + 10, rectWidth, rectHeight);

  // 4. 繪製白色文字
  ctx.fillStyle = "white";
  ctx.textBaseline = "bottom";
  ctx.fillText(text1, canvas.width - text1Width - paddingX, canvas.height - paddingY - fontSize - 15);
  ctx.fillText(text2, canvas.width - text2Width - paddingX, canvas.height - paddingY);

  const imgDataUrl = canvas.toDataURL("image/png");

  // 5. 萬能下載與防禦機制
  try {
    const link = document.createElement("a");
    link.download = `Photo_${currentLocation}_${Date.now()}.png`;
    link.href = imgDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    showImageModal(imgDataUrl);
  }
}

function showImageModal(src) {
  const modal = document.createElement("div");
  modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; padding:20px; box-sizing:border-box;";
  modal.innerHTML = `
    <p style="margin-bottom:15px; font-weight:bold; font-size:18px;">📸 拍照成功！</p>
    <p style="margin-bottom:15px; color:#ccc;">請【長按下方照片】選擇儲存影像</p>
    <img src="${src}" style="max-width:100%; max-height:65%; object-fit:contain; border-radius:8px; box-shadow:0 0 20px rgba(255,255,255,0.2); margin-bottom:25px;">
    <button id="close-modal-btn" style="padding:12px 35px; font-size:16px; background:#fff; color:#000; border:none; border-radius:25px; font-weight:bold;">返回相機</button>
  `;
  document.body.appendChild(modal);
  document.getElementById("close-modal-btn").addEventListener("click", () => {
    document.body.removeChild(modal);
  });
}

// 初始化
getLocationFromURL();
updateOverlay();
setInterval(updateOverlay, 1000);
window.addEventListener("DOMContentLoaded", startCamera);