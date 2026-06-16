let currentLocation = "未設定";

// 判斷瀏覽器環境
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isLine = /Line/i.test(navigator.userAgent);

async function startCamera() {
  // 針對 iOS LINE 的防坑提示
  if (isIOS && isLine) {
    alert("【系統提示】偵測到您使用 iPhone LINE 開啟。\n\n請點擊右上角「三個點 •••」，並選擇「在 Safari 開啟」，相機與拍照下載功能才能正常運作喔！");
  }

  try {
    const constraints = {
      video: {
        facingMode: "environment", // 優先使用後鏡頭
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    document.getElementById("video").srcObject = stream;
  } catch (error) {
    console.error("無法開啟相機：", error);
    alert("相機啟動失敗！請確保使用的是 HTTPS 連線，並已允許瀏覽器取用相機權限。");
  }
}

function updateOverlay() {
  const now = new Date().toLocaleString();
  const overlayEl = document.getElementById("overlay");
  if (overlayEl) {
    overlayEl.innerText = `${now}\n位置：${currentLocation}`;
  }
}

updateOverlay();
setInterval(updateOverlay, 1000);

function takePhoto() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // 1. 繪製相機畫面
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // 2. 繪製浮水印 (等比例縮放字體)
  const fontSize = Math.floor(canvas.width * 0.035); 
  ctx.font = `bold ${fontSize}px sans-serif`;

  const now = new Date().toLocaleString();
  const text1 = now;
  const text2 = `位置：${currentLocation}`;

  const paddingX = canvas.width * 0.04; 
  const paddingY = canvas.height * 0.05; 
  
  const text1Width = ctx.measureText(text1).width;
  const text2Width = ctx.measureText(text2).width;
  const maxTextWidth = Math.max(text1Width, text2Width);

  // 背景框
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  const rectWidth = maxTextWidth + 40;
  const rectHeight = (fontSize * 2) + 40;
  ctx.fillRect(canvas.width - rectWidth - paddingX + 20, canvas.height - rectHeight - paddingY + 10, rectWidth, rectHeight);

  // 畫字
  ctx.fillStyle = "white";
  ctx.textBaseline = "bottom";
  ctx.fillText(text1, canvas.width - text1Width - paddingX, canvas.height - paddingY - fontSize - 10);
  ctx.fillText(text2, canvas.width - text2Width - paddingX, canvas.height - paddingY);

  // 3. 產出圖片 DataURL
  const imgDataUrl = canvas.toDataURL("image/png");

  // 4. 下載防禦機制（解決 iOS LINE 或部分瀏覽器不支援自動下載的問題）
  try {
    // 試圖自動下載
    const link = document.createElement("a");
    link.download = `photo_${currentLocation}_${Date.now()}.png`;
    link.href = imgDataUrl;
    document.body.appendChild(link); // iOS 有時需要節點在 body 上才能點擊
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    // 如果自動下載失敗（例如在 LINE 內），改彈出視窗讓使用者長按圖片儲存
    showImageModal(imgDataUrl);
  }
}

// 彈出視窗供使用者「長按儲存」照片 (相容性方案)
function showImageModal(src) {
  // 建立一個覆蓋全螢幕的特殊圖層
  const modal = document.createElement("div");
  modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff;";
  
  modal.innerHTML = `
    <p style="margin-bottom:15px; font-weight:bold;">請【長按下方照片】選擇儲存影像</p>
    <img src="${src}" style="max-width:90%; max-height:70%; box-shadow:0 0 20px rgba(217,217,217,0.5); margin-bottom:20px;">
    <button id="close-modal-btn" style="padding:10px 20px; font-size:16px; background:#fff; color:#000; border:none; border-radius:20px; font-weight:bold;">返回相機</button>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById("close-modal-btn").addEventListener("click", () => {
    document.body.removeChild(modal);
  });
}

function getLocationFromURL() {
  const params = new URLSearchParams(location.search);
  const loc = params.get("loc");
  if (loc) currentLocation = decodeURIComponent(loc);
}

getLocationFromURL();
window.addEventListener("DOMContentLoaded", startCamera);