
import { BLOG_DESTINATION, TASK_RATES } from '../constants.tsx';

/**
 * Silent Mining Redirect 2.0:
 * 1. Gọi API nhà mạng thông qua Proxy (allorigins.win) để vượt rào cản CORS.
 * 2. Phân tích nội dung JSON trả về để trích xuất link rút gọn thực tế.
 * 3. Tự động chuyển hướng (Redirect) người dùng đến link đích ngay lập tức.
 * 
 * Mục tiêu: Loại bỏ hoàn toàn màn hình JSON đen/trắng gây khó chịu cho người dùng.
 */
export const openTaskLink = async (taskId: number, userId: string, token: string) => {
  const task = TASK_RATES[taskId];
  if (!task) return;

  const dest = encodeURIComponent(`${BLOG_DESTINATION}?uid=${userId}&tid=${taskId}&key=${token}`);
  let apiUrl = "";

  // Xây dựng API URL chính xác cho từng nhà mạng dựa trên ID
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

  // SỬ DỤNG PROXY ĐỂ FIX TRIỆT ĐỂ LỖI HIỆN JSON VÀ CORS
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

  try {
    // 1. Gọi API thông qua Proxy để lấy nội dung ngầm
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error("Proxy error");
    
    const proxyData = await response.json();
    
    // 2. Parse nội dung JSON nằm bên trong field contents của proxy
    if (!proxyData.contents) throw new Error("Empty proxy content");
    
    const data = JSON.parse(proxyData.contents);

    // 3. Bóc tách link theo các key phổ biến của các nhà mạng rút gọn
    // Chấp nhận nhiều định dạng key từ các nhà cung cấp khác nhau
    let realLink = data.shortenedUrl || 
                   data.short_url || 
                   data.link || 
                   data.url || 
                   data.html || 
                   (data.data && data.data.shortenedUrl);

    // Kiểm tra tính hợp lệ của link
    if (realLink && typeof realLink === 'string' && realLink.startsWith('http')) {
      // THÀNH CÔNG: Bay thẳng sang trang vượt link bằng replace (không lưu history để Back ko bị loop)
      window.location.replace(realLink);
    } else {
      // DỰ PHÒNG: Nếu bóc tách JSON không thấy link rõ ràng, mở link API gốc
      // Trong trường hợp này, nếu nhà mạng ko hỗ trợ redirect, user có thể thấy JSON nhưng là case hiếm
      window.location.href = apiUrl;
    }
  } catch (error) {
    // LỖI: Nếu proxy hoặc fetch thất bại, mở link API trực tiếp làm fallback cuối cùng
    console.warn("Silent Redirect Failed, falling back to direct API link:", error);
    window.location.href = apiUrl;
  }
};
