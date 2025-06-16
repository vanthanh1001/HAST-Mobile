# 🔐 Tính năng Quên Mật Khẩu - HAST Mobile

## 📋 Tổng quan

Tính năng **Quên Mật Khẩu** cho phép người dùng reset mật khẩu khi không nhớ mật khẩu hiện tại. Mật khẩu mới sẽ được gửi qua email đã đăng ký.

## 🎨 Giao diện

### LoginScreen
- Thêm button **"🤔 Quên mật khẩu?"** với UI đẹp
- Button có background màu xanh nhạt với border radius
- Khi nhấn sẽ chuyển đến màn hình ForgotPasswordScreen

### ForgotPasswordScreen  
- **Header**: Icon 🔐, tiêu đề "Quên Mật Khẩu"
- **Form**: Input tên đăng nhập/email với validation
- **Button**: "📧 Gửi yêu cầu reset" với loading state
- **Info Card**: Hướng dẫn và lưu ý quan trọng
- **Back Button**: "← Quay lại" và "🔙 Về trang đăng nhập"

## 🔧 Cấu trúc Code

```
screens/
├── ForgotPasswordScreen.js    # Màn hình reset mật khẩu
├── LoginScreen.js             # Đã cập nhật với link forgot password
└── HomeScreen.js              # Không thay đổi

services/
└── authService.js            # Đã thêm hàm resetPassword()

config/
├── api.js                    # Đã có endpoint RESET_PASSWORD  
└── environment.js            # Không thay đổi

App.js                        # Đã cập nhật navigation logic
```

## 📡 API Integration

### Endpoint
```
PUT /api/auth/reset-password
Content-Type: application/json
Body: "username_or_email"
```

### Request Example
```javascript
await axios.put('/api/auth/reset-password', 'tuyendht', {
  headers: { 'Content-Type': 'application/json' }
});
```

### Response Format
```javascript
// Thành công
{
  "success": true,
  "description": "Mật khẩu mới đã được gửi qua email",
  "status": "200"
}

// Thất bại  
{
  "success": false,
  "description": "Không tìm thấy",
  "status": "404"
}
```

## 🚀 Cách sử dụng

### Cho User
1. Mở app HAST Mobile
2. Ở màn hình đăng nhập, nhấn **"🤔 Quên mật khẩu?"**
3. Nhập tên đăng nhập hoặc email
4. Nhấn **"📧 Gửi yêu cầu reset"**
5. Kiểm tra email để nhận mật khẩu mới
6. Đăng nhập với mật khẩu mới

### Cho Developer  
```javascript
// Import ForgotPasswordScreen
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';

// Sử dụng trong App.js
if (currentScreen === 'forgotPassword') {
  return <ForgotPasswordScreen onBackToLogin={showLogin} />;
}

// Gọi API reset password
const result = await AuthService.resetPassword('username');
if (result.success) {
  Alert.alert('Thành công', result.message);
}
```

## ✨ Tính năng nổi bật

### UI/UX
- **Animations**: Fade in, slide, scale effects
- **Modern Design**: Card-based với gradient background
- **Responsive**: Tương thích đa thiết bị
- **Accessibility**: Clear labels và feedback

### Validation
- **Required fields**: Kiểm tra input không trống
- **Email format**: Validate format email nếu chứa @
- **Username length**: Tối thiểu 3 ký tự

### Error Handling
- **Network errors**: Hiển thị message rõ ràng
- **API errors**: Sử dụng description từ HAST API
- **Loading states**: Disable button khi đang gửi request

## 🔍 Testing

### Manual Testing
1. Test với username hợp lệ
2. Test với email hợp lệ
3. Test với input trống
4. Test với username/email không tồn tại
5. Test khi mất kết nối mạng

### API Testing Script
```bash
node scripts/testResetPassword.js
```

## ⚠️ Lưu ý quan trọng

### Cho User
- **Email delivery**: Kiểm tra cả hộp thư spam
- **Password expiry**: Đăng nhập sớm để tránh bị khóa tài khoản
- **Account lock**: Liên hệ admin nếu tài khoản bị khóa
- **Correct info**: Đảm bảo nhập đúng username/email đã đăng ký

### Cho Developer
- **HAST API format**: Luôn check `response.data.success` thay vì HTTP status
- **Error messages**: Sử dụng `response.data.description` cho error text
- **No Authorization**: Reset password endpoint không cần token
- **Content-Type**: Phải set `application/json` trong header

## 🛠️ Cài đặt và chạy

```bash
# Cài đặt dependencies (đã có)
npm install

# Chạy ứng dụng
npm start

# Test API
node scripts/testResetPassword.js
```

## 📱 Screenshots

```
┌─────────────────────┐  ┌─────────────────────┐
│   LoginScreen       │  │ ForgotPasswordScreen│
│                     │  │                     │
│  [Username Input]   │  │    🔐 Quên MK       │
│  [Password Input]   │  │                     │
│                     │  │  [Username Input]   │
│  🤔 Quên mật khẩu?  │→ │                     │
│                     │  │  📧 Gửi yêu cầu     │
│  🚀 Đăng nhập       │  │                     │
│                     │  │  🔙 Về đăng nhập    │
└─────────────────────┘  └─────────────────────┘
```

## 📄 API Documentation Reference

Tham khảo file `API Document.csv`:
- **Chức năng**: Quên mật khẩu
- **Endpoint**: `/api/auth/reset-password`
- **Method**: PUT
- **Payload**: "string" (username/email)
- **Chú thích**: Mật khẩu sẽ được gửi qua email

---

🎯 **Happy Coding!** Tính năng Forgot Password đã sẵn sàng sử dụng với UI đẹp và tích hợp API hoàn chỉnh. 