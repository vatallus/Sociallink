# Hệ Thống Quản Lý Hồ Sơ Y Tế và Đặt Lịch Khám

Một nền tảng SaaS toàn diện cho phép bác sĩ tạo và quản lý hồ sơ y tế cá nhân, đồng thời cho phép bệnh nhân đặt lịch khám trực tuyến một cách thuận tiện.

## Tính Năng Chính

### Quản Lý Tài Khoản và Xác Thực
- Đăng ký và đăng nhập an toàn
- Xác thực người dùng mạnh mẽ
- Quản lý phiên làm việc

### Quản Lý Hồ Sơ Y Tế (Biolink)
- Tạo và tùy chỉnh trang hồ sơ cá nhân
- Quản lý thông tin chuyên môn
- Đường dẫn tùy chỉnh (slug) cho dễ chia sẻ
- Thêm liên kết mạng xã hội

### Hệ Thống Đặt Lịch Khám
- Đặt lịch khám trực tuyến
- Quản lý thời gian rảnh
- Đệm thời gian giữa các cuộc hẹn
- Nhiều tùy chọn thời lượng khám

### Bảng Điều Khiển Quản Trị
- Tổng quan lịch hẹn
- Quản lý hồ sơ
- Quản lý thông tin cá nhân
- Thống kê biolink

## Cài Đặt

### Yêu Cầu Hệ Thống
- Node.js (v20.x trở lên)
- PostgreSQL
- npm hoặc yarn

### Các Bước Cài Đặt

1. Clone repository:
```bash
git clone <đường-dẫn-repository>
cd ten-du-an
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Thiết lập biến môi trường:
Tạo file `.env` trong thư mục gốc với các biến sau:
```env
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your_session_secret
```

4. Khởi tạo cơ sở dữ liệu:
```bash
npm run db:push
```

5. Khởi chạy server phát triển:
```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5000`

## Luồng Sử Dụng

### Dành Cho Bác Sĩ

1. **Đăng Ký Tài Khoản**
   - Truy cập `/auth`
   - Điền thông tin đăng ký
   - Xác nhận email (nếu cần)

2. **Tạo Hồ Sơ Y Tế**
   - Đăng nhập vào hệ thống
   - Truy cập trang Quản lý Hồ sơ
   - Nhấn "Tạo Hồ sơ Mới"
   - Điền thông tin chi tiết:
     + Chức danh
     + Chuyên khoa
     + Địa chỉ phòng khám
     + Thời gian làm việc
     + Đường dẫn tùy chỉnh (slug)

3. **Thiết Lập Lịch Làm Việc**
   - Vào trang Quản trị
   - Cấu hình thời gian rảnh
   - Đặt thời lượng khám và thời gian đệm

4. **Quản Lý Lịch Hẹn**
   - Xem danh sách lịch hẹn
   - Xác nhận hoặc từ chối lịch hẹn
   - Xem lịch sử khám

### Dành Cho Bệnh Nhân

1. **Tìm Bác Sĩ**
   - Truy cập trang chủ
   - Tìm bác sĩ qua đường dẫn được chia sẻ

2. **Đặt Lịch Khám**
   - Chọn ngày và giờ khám
   - Điền thông tin cá nhân
   - Xác nhận đặt lịch
   - Nhận thông báo xác nhận

## Phát Triển

### Cấu Trúc Dự Án
```
├── client/             # Frontend React
│   ├── src/
│   │   ├── components/ # Các component tái sử dụng
│   │   ├── hooks/     # Custom hooks
│   │   ├── lib/       # Utilities
│   │   └── pages/     # Các trang
├── server/            # Backend Express
│   ├── routes/       # API endpoints
│   └── storage.ts    # Data access layer
├── shared/           # Shared types & schemas
└── uploads/         # Upload files
```

### Công Nghệ Sử Dụng

#### Frontend
- React với TypeScript
- TanStack Query cho data fetching
- Shadcn UI components
- Tailwind CSS
- Wouter cho routing

#### Backend
- Node.js với Express
- PostgreSQL với Drizzle ORM
- Passport.js cho xác thực

### Lệnh Hữu Ích
- Chạy tests: `npm test`
- Build cho production: `npm run build`
- Khởi động server production: `npm start`

## Bảo Mật

- Mã hóa mật khẩu sử dụng bcrypt
- Quản lý phiên làm việc an toàn
- Xác thực API endpoints
- Kiểm tra quyền truy cập

## Liên Hệ & Hỗ Trợ

Nếu bạn gặp vấn đề hoặc cần hỗ trợ, vui lòng:
- Tạo issue trên repository
- Liên hệ qua email hỗ trợ
- Tham khảo tài liệu API

## License

[MIT License](LICENSE)