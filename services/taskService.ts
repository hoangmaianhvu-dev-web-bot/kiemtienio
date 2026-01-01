
import { BLOG_DESTINATION, TASK_RATES } from '../constants.tsx';

/**
 * Silent Mining Redirect 3.0:
 * - Gọi API ngầm qua Proxy AllOrigins để tránh lộ JSON thô.
 * - Bóc tách link rút gọn (shortenedUrl) từ kết quả JSON.
 * - MỞ LINK TRONG TAB MỚI (_blank) để không làm mất trang web chính.
 */
export const openTaskLink = async (taskId: number, userId: string, token: string) => {
  const task = TASK_RATES[taskId];
  if (!task) return;

  const dest = encodeURIComponent(`${BLOG_DESTINATION}?uid=${userId}&tid=${taskId}&key=${token}`);
  let apiUrl = "";

  // Cấu hình Endpoint API chuẩn cho 6 nhà mạng
  switch(taskId) {
    case 1: apiUrl = `https://link4m.co/api-shorten/v2?api=${task.apiKey}&url=${dest}`; break;
    case 2: apiUrl = `https://yeulink.com/api?token=${task.apiKey}&url=${dest}`; break;
    case 3: apiUrl = `https://yeumoney.com/QL_api.php?token=${task.apiKey}&format=json&url=${dest}`; break;
    case 4: apiUrl = `https://xlink.co/api?token=${task.apiKey}&url=${dest}`; break;
    case 5: apiUrl = `https://services.traffictot.com/api/v1/shorten?api=${task.apiKey}&url=${dest}`; break;
    case 6: apiUrl = `https://api.layma.net/api/admin/shortlink/quicklink?tokenUser=${task.apiKey}&format=json&url=${dest}`; break;
  }

  if (!apiUrl) return;

  // Sử dụng Proxy để gọi ngầm
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error("Proxy error");
    
    const proxyData = await response.json();
    const data = JSON.parse(proxyData.contents);

    // Bóc tách link rút gọn thực tế (Ví dụ: https://link4m.com/ScBN5E)
    let realLink = data.shortenedUrl || 
                   data.link || 
                   data.url || 
                   data.short_url || 
                   (data.data && data.data.shortenedUrl);

    if (realLink && typeof realLink === 'string' && realLink.startsWith('http')) {
      // QUAN TRỌNG: Mở link trong TAB MỚI theo yêu cầu
      window.open(realLink, '_blank');
    } else {
      // DỰ PHÒNG: Nếu bóc tách lỗi, mở API trực tiếp trong tab mới
      window.open(apiUrl, '_blank');
    }
  } catch (error) {
    console.warn("Silent Redirect Failed, opening direct link:", error);
    window.open(apiUrl, '_blank');
  }
};
