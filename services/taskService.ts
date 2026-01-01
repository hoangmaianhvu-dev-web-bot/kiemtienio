import { BLOG_DESTINATION, TASK_RATES } from '../constants.tsx';

/**
 * Silent Redirect 9.0:
 * - Đối với TrafficTot: Sử dụng endpoint /redirect để trình duyệt tự xử lý 302.
 * - Đối với LayMaNet: Bóc tách trường 'html' từ JSON.
 * - Đối với các cổng khác: Bóc tách JSON qua proxy và mở link rút gọn ngay lập tức.
 * - Đảm bảo không hiện trang API JSON thô cho người dùng.
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

  // Mở tab mới ngay lập tức để tránh Popup Blocker (trình duyệt cho phép mở tab trắng khi click)
  const newWindow = window.open('about:blank', '_blank');
  if (newWindow) {
    newWindow.document.write(`
      <style>
        body { 
          background: #02040a; 
          color: #3b82f6; 
          display: flex; 
          flex-direction: column;
          align-items: center; 
          justify-content: center; 
          height: 100vh; 
          margin: 0;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        .loader { 
          border: 4px solid rgba(59, 130, 246, 0.1); 
          border-top: 4px solid #3b82f6; 
          border-radius: 50%; 
          width: 60px; 
          height: 60px; 
          animation: spin 1s linear infinite; 
          margin-bottom: 25px;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .text { 
          text-transform: uppercase; 
          font-weight: 900; 
          font-style: italic; 
          letter-spacing: 4px; 
          font-size: 13px;
          text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
        .sub-text {
          margin-top: 15px;
          color: #475569;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-align: center;
        }
      </style>
      <div class="loader"></div>
      <div class="text">NOVA CLOUD SYNC</div>
      <div class="sub-text">ĐANG KẾT NỐI MÁY CHỦ NHIỆM VỤ...</div>
    `);
  }

  // Nếu là TrafficTot (endpoint redirect trả về 302), chuyển hướng tab đã mở ngay
  if (isDirectRedirect) {
    if (newWindow) {
      newWindow.location.href = apiUrl;
    }
    return;
  }

  // Đối với các cổng trả về JSON, dùng proxy để bóc tách và tự động chuyển hướng
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error("Proxy connection error");
    
    const proxyData = await response.json();
    if (!proxyData.contents) throw new Error("Empty response contents");
    
    let realLink = "";
    try {
      const data = JSON.parse(proxyData.contents);
      // Thuật toán bóc tách link rút gọn từ JSON của các nhà cung cấp
      realLink = data.html || // LayMaNet
                 data.shortenedUrl || // Link4M, YeuLink
                 data.link || // XLink, YeuMoney
                 data.short_url || // TrafficTot JSON mode
                 data.url || 
                 (data.data && (data.data.html || data.data.shortenedUrl || data.data.link || data.data.short_url || data.data.url));
    } catch (e) {
      // Dự phòng: Nếu response không phải JSON mà là URL text thô
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
      // Bất khả kháng mới mở thẳng apiUrl (ví cập nhật thất bại)
      if (newWindow) {
        newWindow.location.href = apiUrl;
      }
    }
  } catch (error) {
    console.warn("Lỗi bóc tách link, mở link API trực tiếp làm dự phòng:", error);
    if (newWindow) {
      newWindow.location.href = apiUrl;
    }
  }
};