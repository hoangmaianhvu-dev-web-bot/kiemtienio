
import { BLOG_DESTINATION, TASK_RATES } from '../constants.tsx';

/**
 * Hàm mở link nhiệm vụ. 
 * Sử dụng window.open để vượt qua lỗi CORS (Chặn truy cập API chéo sân).
 * Hệ thống tự động tạo link rút gọn với đích đến là trang Blog lấy mã.
 */
export const openTaskLink = (taskId: number, userId: string, token: string) => {
  const task = TASK_RATES[taskId];
  if (!task) return;

  // Đích đến là Blog lấy mã, có kèm theo Token bảo mật (Security Token)
  const dest = encodeURIComponent(`${BLOG_DESTINATION}?uid=${userId}&tid=${taskId}&key=${token}`);
  let apiUrl = "";

  // Cấu hình URL rút gọn dựa trên cấu trúc API chuẩn của từng nhà cung cấp
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

  // Mở tab mới để trình duyệt xử lý redirect
  if (apiUrl) {
    window.open(apiUrl, "_blank");
  } else {
    console.error("Lỗi: Không xác định được cấu hình API cho Node ID:", taskId);
  }
};
