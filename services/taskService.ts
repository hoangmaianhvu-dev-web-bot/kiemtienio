
import { BLOG_DESTINATION, TASK_RATES } from '../constants.tsx';

/**
 * Silent Mining Redirect 2.5:
 * 1. Xây dựng API URL dựa trên cấu hình nhà mạng.
 * 2. Sử dụng Proxy (allorigins.win) để gọi API ngầm, tránh CORS và không hiện JSON cho User.
 * 3. Bóc tách field "shortenedUrl" (hoặc link rút gọn tương đương) từ dữ liệu trả về.
 * 4. Chuyển hướng trực tiếp (window.location.replace) sang trang web đích.
 */
export const openTaskLink = async (taskId: number, userId: string, token: string) => {
  const task = TASK_RATES[taskId];
  if (!task) return;

  // Tạo link đích mà người dùng sẽ quay lại sau khi vượt link (Security Page)
  const dest = encodeURIComponent(`${BLOG_DESTINATION}?uid=${userId}&tid=${taskId}&key=${token}`);
  let apiUrl = "";

  // Cấu hình Endpoint API cho từng nhà mạng
  switch(taskId) {
    case 1: // LINK4M
      apiUrl = `https://link4m.co/api-shorten/v2?api=${task.apiKey}&url=${dest}`; 
      break;
    case 2: // YEULINK
      apiUrl = `https://yeulink.com/api?token=${task.apiKey}&url=${dest}`; 
      break;
    case 3: // YEUMONEY
      apiUrl = `https://yeumoney.com/QL_api.php?token=${task.apiKey}&format=json&url=${dest}`; 
      break;
    case 4: // XLINK
      apiUrl = `https://xlink.co/api?token=${task.apiKey}&url=${dest}`; 
      break;
    case 5: // TRAFFICTOT
      apiUrl = `https://services.traffictot.com/api/v1/shorten?api=${task.apiKey}&url=${dest}`; 
      break;
    case 6: // LAYMANET
      apiUrl = `https://api.layma.net/api/admin/shortlink/quicklink?tokenUser=${task.apiKey}&format=json&url=${dest}`; 
      break;
  }

  if (!apiUrl) return;

  // Sử dụng Proxy AllOrigins để lấy JSON ngầm (Vượt CORS)
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

  try {
    // Gọi fetch ngầm
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error("Cổng Proxy gặp sự cố");
    
    const proxyData = await response.json();
    
    // Parse nội dung JSON thật từ field 'contents' của Proxy
    if (!proxyData.contents) throw new Error("Dữ liệu Proxy trống");
    const data = JSON.parse(proxyData.contents);

    // Bóc tách link rút gọn thực tế (ví dụ: https://link4m.com/ScBN5E)
    // Ưu tiên field 'shortenedUrl' như Link4M cung cấp, sau đó là các field phổ biến khác
    let realLink = data.shortenedUrl || 
                   data.short_url || 
                   data.link || 
                   data.url || 
                   data.html || 
                   (data.data && data.data.shortenedUrl);

    if (realLink && typeof realLink === 'string' && realLink.startsWith('http')) {
      // THÀNH CÔNG: Bay thẳng qua web nhà mạng (ví dụ: link4m.com/...)
      // Dùng replace để không lưu history, tránh việc User nhấn Back lại bị quay lại trang JSON
      window.location.replace(realLink);
    } else {
      // DỰ PHÒNG: Nếu bóc tách lỗi, mở link API trực tiếp (User có thể thấy JSON)
      window.location.href = apiUrl;
    }
  } catch (error) {
    // LỖI: Fallback cuối cùng là chuyển hướng trực tiếp tới API
    console.warn("Silent Redirect Failed:", error);
    window.location.href = apiUrl;
  }
};
