
# 💎 Diamond Dash Web Dashboard

Hệ thống quản trị và kiếm tiền trực tuyến tích hợp AI, được phát triển dựa trên mô hình Telegram Bot truyền thống nhưng với giao diện Web hiện đại, mượt mà và trực quan.

## 🚀 Tính năng nổi bật

- **Kiếm điểm (Nhiệm vụ):** Tích hợp các cổng rút gọn link phổ biến (Link4M, LayMaNgay, XLink, YeuMoney).
- **Rút thưởng:** Hỗ trợ rút về Ngân hàng (ATM) hoặc đổi Kim cương Free Fire trực tiếp qua ID Game.
- **Hỗ trợ AI (Gemini 3.0):** Trợ lý ảo thông minh tích hợp Google Search để trả lời mọi thắc mắc của người dùng.
- **Bảng xếp hạng:** Tôn vinh các thành viên tích cực nhất.
- **Hệ thống Giftcode:** Phát hành và quản lý mã quà tặng dễ dàng.
- **Panel Admin:** Quản lý người dùng, duyệt yêu cầu rút tiền và theo dõi thống kê toàn diện.

## 🛠 Công nghệ sử dụng

- **Frontend:** React 19, Tailwind CSS, Lucide Icons.
- **AI:** Google Gemini API (@google/genai).
- **Storage:** LocalStorage (Mô phỏng Database cho phiên bản demo).
- **Design:** Glassmorphism UI.

## 📦 Cài đặt và Chạy Local

1. **Clone dự án:**
   ```bash
   git clone https://github.com/your-username/diamond-dash-web.git
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Cấu hình API Key:**
   Đảm bảo bạn có `process.env.API_KEY` của Gemini để sử dụng tính năng hỗ trợ AI.

4. **Chạy ứng dụng:**
   Mở `index.html` qua Live Server hoặc sử dụng các công cụ build như Vite/Webpack.

## 📜 Giấy phép

Dự án được phát hành dưới giấy phép MIT.
