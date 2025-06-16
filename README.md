# HAST Mobile - Ứng dụng Thời Khóa Biểu

Ứng dụng mobile cho hệ thống quản lý thời khóa biểu HAST, được phát triển bằng React Native và Expo.

## 🚀 Tính năng

- **Đăng nhập an toàn**: Hỗ trợ đăng nhập bằng username/email và mật khẩu
- **Quên mật khẩu**: Gửi yêu cầu reset mật khẩu qua email
- **Lưu trữ bảo mật**: Sử dụng Expo SecureStore để lưu trữ token
- **UI hiện đại**: Giao diện đẹp với animations, gradient và hiệu ứng mượt mà
- **Debug Panel**: Công cụ debug tích hợp để kiểm tra API response
- **Test Connection**: Kiểm tra kết nối API trước khi đăng nhập
- **Environment Config**: Quản lý cấu hình cho các môi trường khác nhau
- **Xử lý lỗi thông minh**: Tự động xử lý các lỗi API và hiển thị thông báo phù hợp

## 📋 Yêu cầu hệ thống

- Node.js (phiên bản 16 trở lên)
- npm hoặc yarn
- Expo CLI
- Android Studio (cho Android) hoặc Xcode (cho iOS)

## 🛠️ Cài đặt

1. **Clone dự án**
   ```bash
   git clone <repository-url>
   cd HAST-Mobile
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Cài đặt Expo CLI (nếu chưa có)**
   ```bash
   npm install -g @expo/cli
   ```

4. **Chạy ứng dụng**
   ```bash
   npm start
   ```

## 📱 Chạy trên thiết bị

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Web
```bash
npm run web
```

## 🔧 Cấu hình API

API endpoint được cấu hình trong file `config/api.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: 'https://api.hast-app.online',
  ENDPOINTS: {
    LOGIN: '/api/auth/sign-in',
    LOGIN_GOOGLE: '/api/auth/sign-in-google',
    LOGOUT: '/api/auth/sign-out',
    // ... other endpoints
  }
};
```

## 📂 Cấu trúc dự án

```
HAST-Mobile/
├── config/
│   └── api.js                 # Cấu hình API endpoints
├── services/
│   └── authService.js         # Service xử lý authentication
├── screens/
│   └── HomeScreen.js          # Màn hình chính
├── helpers/
│   └── validationHelpers.js   # Helpers validate dữ liệu
├── App.js                     # Component chính
├── LoginScreen.js             # Màn hình đăng nhập
└── package.json
```

## 🔐 Authentication Flow

1. **Kiểm tra trạng thái đăng nhập**: App tự động kiểm tra token đã lưu khi khởi động
2. **Đăng nhập**: Gửi request đến `/api/auth/sign-in` với username/password
3. **Lưu token**: Token được lưu an toàn bằng Expo SecureStore
4. **Tự động thêm header**: Mọi request sau đó đều tự động thêm Authorization header
5. **Xử lý token hết hạn**: Tự động xóa token và chuyển về màn hình đăng nhập khi token hết hạn

## 🎨 UI/UX Features

- **Modern gradient design**: Header tối với gradient đẹp mắt
- **Smooth animations**: Fade in, slide up, scale effects mượt mà
- **Card-based layout**: Form được thiết kế dạng card với shadows
- **Interactive buttons**: Button press animations và hover effects
- **Responsive design**: Tự động điều chỉnh theo kích thước màn hình
- **Loading states**: Hiển thị loading indicator khi đang xử lý
- **Form validation**: Validate dữ liệu đầu vào real-time
- **Keyboard handling**: Tự động điều chỉnh layout khi keyboard xuất hiện
- **Debug tools**: Built-in debug panel và connection testing

## 📱 Tính năng đăng nhập

- **Hỗ trợ username hoặc email**
- **Hiển thị/ẩn mật khẩu**
- **Ghi nhớ đăng nhập tự động**
- **Reset mật khẩu qua email**
- **Xử lý lỗi đăng nhập thông minh**
- **Cảnh báo khóa tài khoản sau 5 lần thất bại**

## 🔗 API Endpoints được sử dụng

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/auth/sign-in` | POST | Đăng nhập với username/password |
| `/api/auth/sign-out` | POST | Đăng xuất |
| `/api/auth/reset-password` | PUT | Reset mật khẩu |

## 🚨 Xử lý lỗi

Ứng dụng xử lý các loại lỗi sau:

- **Lỗi mạng**: Hiển thị thông báo kết nối mạng
- **Token hết hạn**: Tự động đăng xuất và chuyển về login
- **Đăng nhập thất bại**: Hiển thị thông báo lỗi cụ thể từ server
- **Validation errors**: Hiển thị lỗi validation real-time

## 🐛 Troubleshooting

### Vấn đề: "Đăng nhập với mật khẩu nào cũng được"

1. **Sử dụng Debug Panel**:
   - Thử đăng nhập với thông tin sai
   - Nhấn nút "Debug" trong alert
   - Xem API response structure

2. **Test kết nối**:
   - Nhấn nút "🌐 Test Kết Nối"
   - Kiểm tra console logs

3. **Xem hướng dẫn chi tiết**: [Debug Guide](./docs/DEBUG_GUIDE.md)

### Các vấn đề phổ biến khác:

- **App không start**: Chạy `npm install` và restart Metro
- **API không kết nối được**: Kiểm tra network và URL trong `config/environment.js`
- **Build lỗi**: Clear cache bằng `expo start -c`

## 📝 Ghi chú phát triển

### Dependencies chính:
- **expo**: Framework phát triển React Native
- **axios**: HTTP client cho API calls
- **expo-secure-store**: Lưu trữ dữ liệu bảo mật
- **expo-constants**: Truy cập constants của ứng dụng

### Best practices được áp dụng:
- **Separation of concerns**: Tách biệt logic API, UI và validation
- **Error boundaries**: Xử lý lỗi một cách graceful
- **Security first**: Sử dụng SecureStore cho sensitive data
- **User experience**: Loading states và feedback rõ ràng

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án này thuộc về HAST và được bảo vệ bởi các điều khoản bản quyền tương ứng.

## 📞 Hỗ trợ

Nếu gặp vấn đề hoặc cần hỗ trợ, vui lòng liên hệ team phát triển hoặc tạo issue trong repository. 