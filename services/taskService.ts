
import { BLOG_DESTINATION, TASK_RATES } from '../constants.tsx';

/**
 * Hàm mở link nhiệm vụ. 
 * Hệ thống gọi API nhà mạng, bóc tách JSON để lấy link rút gọn cuối cùng và chuyển hướng ngay lập tức.
 */
export const openTaskLink = async (taskId: number, userId: string, token: string) => {
  const task = TASK_RATES[taskId];
  if (!task) return;

  const dest = encodeURIComponent(`${BLOG_DESTINATION}?uid=${userId}&tid=${taskId}&key=${token}`);
  let apiUrl = "";

  // Xây dựng API URL chính xác theo mẫu được cung cấp
  switch(taskId) {
    case 1: 
      apiUrl = `https://link4m.co/api-shorten/v2?api=${task.apiKey}&url=${dest}`; 
      break;
    case 2: 
      apiUrl = `https://yeulink.com/api?token=${task.apiKey}&url=${dest}`; 
      break;
    case 3: 
      apiUrl = `https://yeumoney.com/QL_api.php?token=${task.apiKey}&format=json&url=${dest}`; 
      break;
    case 4: 
      apiUrl = `https://xlink.co/api?token=${task.apiKey}&url=${dest}`; 
      break;
    case 5: 
      apiUrl = `https://services.traffictot.com/api/v1/shorten?api=${task.apiKey}&url=${dest}`; 
      break;
    case 6: 
      apiUrl = `https://api.layma.net/api/admin/shortlink/quicklink?tokenUser=${task.apiKey}&format=json&url=${dest}`; 
      break;
  }

  if (!apiUrl) return;

  try {
    // Gọi API để lấy link rút gọn (Shortened Link)
    const response = await fetch(apiUrl);
    const data = await response.json();

    let finalLink = "";

    // Bóc tách link chính xác dựa trên cấu trúc JSON của từng nhà mạng
    if (data.status === "success" || data.success === true || data.shortenedUrl || data.link) {
      finalLink = data.shortenedUrl || data.link || data.url || (data.data && data.data.shortenedUrl);
    }

    if (finalLink) {
      // Chuyển hướng người dùng ngay lập tức đến link rút gọn đích thực
      window.location.href = finalLink;
    } else {
      // Fallback: Nếu không bóc tách được JSON, buộc phải mở API URL trực tiếp
      window.location.href = apiUrl;
    }
  } catch (error) {
    console.error("Task API Error (CORS or Network):", error);
    // Nếu bị lỗi CORS, chuyển hướng thẳng đến API URL (nhà mạng sẽ tự redirect)
    window.location.href = apiUrl;
  }
};
