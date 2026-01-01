
import { BLOG_DESTINATION, TASK_RATES } from '../constants.tsx';

/**
 * Silent Redirect 6.0:
 * - Fix LayMaNet: Ưu tiên bóc tách link từ trường 'html'.
 * - Fix TrafficTot: Sử dụng tham số 'api_key' đúng chuẩn.
 * - Giải quyết vấn đề Popup Blocker bằng cách mở cửa sổ trắng trước khi fetch.
 */
export const openTaskLink = async (taskId: number, userId: string, token: string) => {
  const task = TASK_RATES[taskId];
  if (!task) return;

  const dest = encodeURIComponent(`${BLOG_DESTINATION}?uid=${userId}&tid=${taskId}&key=${token}`);
  let apiUrl = "";

  // Xây dựng API URL theo chuẩn từng nhà mạng
  switch(taskId) {
    case 1: apiUrl = `https://link4m.co/api-shorten/v2?api=${task.apiKey}&url=${dest}`; break;
    case 2: apiUrl = `https://yeulink.com/api?token=${task.apiKey}&url=${dest}`; break;
    case 3: apiUrl = `https://yeumoney.com/QL_api.php?token=${task.apiKey}&format=json&url=${dest}`; break;
    case 4: apiUrl = `https://xlink.co/api?token=${task.apiKey}&url=${dest}`; break;
    case 5: apiUrl = `https://services.traffictot.com/api/v1/shorten?api_key=${task.apiKey}&url=${dest}`; break;
    case 6: apiUrl = `https://api.layma.net/api/admin/shortlink/quicklink?tokenUser=${task.apiKey}&format=json&url=${dest}`; break;
  }

  if (!apiUrl) return;

  // QUAN TRỌNG: Mở một cửa sổ mới TRƯỚC khi thực hiện tác vụ bất đồng bộ (fetch)
  // Trình duyệt sẽ cho phép mở popup nếu nó được kích hoạt trực tiếp từ hành động click.
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
          font-family: 'Inter', sans-serif;
        }
        .loader { 
          border: 4px solid rgba(59, 130, 246, 0.1); 
          border-top: 4px solid #3b82f6; 
          border-radius: 50%; 
          width: 50px; 
          height: 50px; 
          animation: spin 1s linear infinite; 
          margin-bottom: 20px;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .text { text-transform: uppercase; font-weight: 900; font-style: italic; letter-spacing: 3px; font-size: 12px; }
      </style>
      <div class="loader"></div>
      <div class="text">ĐANG KẾT NỐI MÁY CHỦ NHIỆM VỤ...</div>
    `);
  }

  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error("Cổng Proxy lỗi");
    
    const proxyData = await response.json();
    if (!proxyData.contents) throw new Error("Không có dữ liệu trả về");
    
    const data = JSON.parse(proxyData.contents);

    // Ưu tiên bóc tách trường 'html' (dùng cho LayMaNet) hoặc các trường link phổ biến khác
    const realLink = data.html || 
                     data.shortenedUrl || 
                     data.link || 
                     data.url || 
                     data.short_url || 
                     (data.data && (data.data.html || data.data.shortenedUrl || data.data.short_url || data.data.link));

    if (realLink && typeof realLink === 'string' && realLink.startsWith('http')) {
      if (newWindow) {
        newWindow.location.href = realLink;
      } else {
        window.open(realLink, '_blank');
      }
    } else {
      // Dự phòng: Nếu bóc tách JSON không thành công, mở thẳng apiUrl
      if (newWindow) {
        newWindow.location.href = apiUrl;
      } else {
        window.open(apiUrl, '_blank');
      }
    }
  } catch (error) {
    console.warn("Lỗi bóc tách link, chuyển hướng trực tiếp:", error);
    if (newWindow) {
      newWindow.location.href = apiUrl;
    } else {
      window.open(apiUrl, '_blank');
    }
  }
};
