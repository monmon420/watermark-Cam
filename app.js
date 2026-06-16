let currentLocation = "未設定";

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  document.getElementById("video").srcObject = stream;
}

function updateOverlay() {
  const now = new Date().toLocaleString();
  document.getElementById("overlay").innerText =
    `${now}\n${currentLocation}`;
}

setInterval(updateOverlay, 1000);

function takePhoto() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0);

  const now = new Date().toLocaleString();
  ctx.fillStyle = "white";
  ctx.font = "40px sans-serif";
  ctx.fillText(now, 30, canvas.height - 100);
  ctx.fillText(currentLocation, 30, canvas.height - 50);

  const link = document.createElement("a");
  link.download = "photo.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function getLocationFromURL() {
  const params = new URLSearchParams(location.search);
  const loc = params.get("loc");
  if (loc) currentLocation = loc;
}
getLocationFromURL();
