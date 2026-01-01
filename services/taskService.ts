
import { BLOG_DESTINATION, TASK_RATES } from '../constants.tsx';

/**
 * Silent Redirect 10.0:
 * - Đối với TrafficTot: Sử dụng endpoint /redirect để trình duyệt tự xử lý 302.
 * - Đối với các cổng khác: Bóc tách JSON qua proxy và tự động chuyển hướng tab.
 * - Thuật toán bóc tách được tinh chỉnh cho: Link4M, YeuLink, YeuMoney, XLink, LayMaNet.
 */
export const openTaskLink = async (taskId: number, userId: string, token: string) => {
  const task = TASK_RATES[taskId];
  if (!task) return;

  const dest = encodeURIComponent(`${BLOG_DESTINATION}?uid=${userId}&tid=${taskId}&key=${token}`);
  let apiUrl = "";
  let isDirectRedirect = false;

  // Xây dựng API URL theo chuẩn của từng nhà cung cấp
  switch(taskId) {
    case 1: // Link4M
      apiUrl = `https://link4m.co/api-shorten/v2?api=${task.apiKey}&url=${dest}`; 
      break;
    case 2: // YeuLink
      apiUrl = `https://yeulink.com/api?token=${task.apiKey}&url=${dest}`; 
      break;
    case 3: // YeuMoney
      apiUrl = `https://yeumoney.com/QL_api.php?token=${task.apiKey}&format=json&url=${dest}`; 
      break;
    case 4: // XLink
      apiUrl = `https://xlink.co/api?token=${task.apiKey}&url=${dest}`; 
      break;
    case 5: // TrafficTot - Sử dụng endpoint /redirect để trình duyệt xử lý redirect 302
      apiUrl = `https://services.traffictot.com/api/v1/shorten/redirect?api_key=${task.apiKey}&url=${dest}`;
      isDirectRedirect = true;
      break;
    case 6: // LayMaNet
      apiUrl = `https://api.layma.net/api/admin/shortlink/quicklink?tokenUser=${task.apiKey}&format=json&url=${dest}`; 
      break;
  }

  if (!apiUrl) return;

  // Mở tab mới ngay lập tức với giao diện Loading chuyên nghiệp
  const newWindow = window.open('about:blank', '_blank');
  if (newWindow) {
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Nova Cloud Sync - Đang kết nối...</title>
        <style>
          body { 
            background: #03050a; 
            color: #3b82f6; 
            display: flex; 
            flex-direction: column;
            align-items: center; 
            justify-content: center; 
            height: 100vh; 
            margin: 0;
            font-family: 'Inter', sans-serif;
            overflow: hidden;
          }
          .loader { 
            border: 4px solid rgba(59, 130, 246, 0.05); 
            border-top: 4px solid #3b82f6; 
            border-radius: 50%; 
            width: 70px; 
            height: 70px; 
            animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite; 
            margin-bottom: 30px;
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.1);
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .text { 
            text-transform: uppercase; 
            font-weight: 900; 
            font-style: italic; 
            letter-spacing: 5px; 
            font-size: 14px;
            text-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
            animation: pulse 2s infinite;
          }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
          .sub-text {
            margin-top: 20px;
            color: #475569;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 2px;
            text-align: center;
            max-width: 250px;
            line-height: 1.6;
          }
          .progress {
            width: 200px;
            height: 2px;
            background: rgba(255,255,255,0.05);
            margin-top: 30px;
            position: relative;
            overflow: hidden;
            border-radius: 10px;
          }
          .progress-bar {
            position: absolute;
            left: -100%;
            width: 100%;
            height: 100%;
            background: #3b82f6;
            animation: loading 2s infinite;
          }
          @keyframes loading { 0% { left: -100%; } 100% { left: 100%; } }
        </style>
      </head>
      <body>
        <div class="loader"></div>
        <div class="text">NOVA CLOUD SYNC</div>
        <div class="sub-text">HỆ THỐNG ĐANG BÓC TÁCH DỮ LIỆU TỪ MÁY CHỦ ${task.name}...</div>
        <div class="progress"><div class="progress-bar"></div></div>
      </body>
      </html>
    `);
  }

  // Nếu là TrafficTot Redirect, chuyển hướng thẳng
  if (isDirectRedirect) {
    if (newWindow) {
      newWindow.location.href = apiUrl;
    }
    return;
  }

  // Đối với các cổng trả về JSON, dùng proxy bóc tách link
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error("Proxy error");
    
    const proxyData = await response.json();
    if (!proxyData.contents) throw new Error("Empty content");
    
    let realLink = "";
    try {
      const data = JSON.parse(proxyData.contents);
      
      // Thuật toán bóc tách thông minh cho mọi nhà cung cấp
      // Cấu trúc của Link4M, YeuLink: { status: "success", shortenedUrl: "..." }
      // Cấu trúc của YeuMoney, XLink: { status: "success", link: "..." }
      // Cấu trúc của LayMaNet: { status: "success", html: "..." }
      
      realLink = data.shortenedUrl || 
                 data.link || 
                 data.html || 
                 data.short_url || 
                 data.url || 
                 (data.data && (data.data.shortenedUrl || data.data.link || data.data.html || data.data.url));

      // Xử lý riêng LayMaNet nếu nó trả về full thẻ <a>
      if (realLink && realLink.includes('<a href="')) {
        const match = realLink.match(/href="([^"]+)"/);
        if (match) realLink = match[1];
      }
    } catch (e) {
      // Nếu không phải JSON, kiểm tra xem có phải URL thô không
      const trimmed = proxyData.contents.trim();
      if (trimmed.startsWith('http')) {
        realLink = trimmed;
      }
    }

    if (realLink && typeof realLink === 'string' && realLink.startsWith('http')) {
      if (newWindow) {
        newWindow.location.href = realLink;
      }
    } else {
      // Nếu bóc tách thất bại, mở thẳng apiUrl (không tối ưu nhưng vẫn chạy được)
      if (newWindow) {
        newWindow.location.href = apiUrl;
      }
    }
  } catch (error) {
    console.error("Lỗi bóc tách link:", error);
    if (newWindow) {
      newWindow.location.href = apiUrl;
    }
  }
};
