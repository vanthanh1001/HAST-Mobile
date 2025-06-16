# 🐛 Debug Guide - HAST Mobile

## Tại sao đăng nhập với mật khẩu nào cũng được?

Đây là vấn đề phổ biến khi tích hợp API. Dưới đây là hướng dẫn debug để tìm ra nguyên nhân:

## 🔍 Cách sử dụng Debug Panel

1. **Mở ứng dụng** và thử đăng nhập
2. **Nhấn nút "Debug"** trong alert kết quả đăng nhập
3. **Xem API Response** trong Debug Panel
4. **Phân tích response structure**

## 📋 Các trường hợp có thể xảy ra

### 1. API trả về 200 OK nhưng không có token
```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "user": {...},
    // ❌ Thiếu token field
  }
}
```
**Giải pháp**: Cập nhật authService để handle case này

### 2. Server chấp nhận mọi request (Dev Mode)
```json
{
  "status": 200,
  "success": true,
  "message": "Development mode - all logins accepted"
}
```
**Giải pháp**: Liên hệ backend team để tắt dev mode

### 3. Response format không đúng
```json
{
  "code": 0,
  "data": {
    "access_token": "...",  // ✅ Token có nhưng field name khác
    "user_info": {...}
  }
}
```
**Giải pháp**: Cập nhật authService để handle tất cả format

### 4. Validation chưa được implement đúng
```json
{
  "status": 200,
  "error": "Invalid credentials",  // ❌ Lỗi nhưng vẫn status 200
  "success": false
}
```
**Giải pháp**: Check response.error field

## 🛠️ Debugging Steps

### Step 1: Test Connection
1. Nhấn nút **"🌐 Test Kết Nối"**
2. Xem kết quả trong console

### Step 2: Login Test
1. Nhập **username sai** và **password sai**
2. Nhấn **"🚀 Đăng nhập"**
3. Nhấn **"Debug"** trong alert
4. Xem response trong Debug Panel

### Step 3: Analyze Response
```javascript
// Response mong đợi
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com"
  }
}

// Response thực tế có thể là
{
  "code": 200,
  "data": {
    "access_token": "...",
    "user_info": {...}
  }
}
```

### Step 4: Update AuthService
Dựa vào response structure, cập nhật code trong `services/authService.js`:

```javascript
// Thêm case mới cho response format
if (responseData.code === 200 && responseData.data.access_token) {
  const token = responseData.data.access_token;
  await SecureStore.setItemAsync('authToken', token);
  // ...
}
```

## 🔧 Common Solutions

### 1. Thêm logging chi tiết
```javascript
console.log('Request URL:', config.url);
console.log('Request Headers:', config.headers);
console.log('Request Body:', config.data);
console.log('Response Status:', response.status);
console.log('Response Data:', response.data);
```

### 2. Check network trong DevTools
- Mở **React Native Debugger**
- Vào tab **Network**
- Xem raw HTTP request/response

### 3. Verify API với Postman
```bash
POST https://api.hast-app.online/api/auth/sign-in
Content-Type: application/json

{
  "user_name": "wrong_user",
  "password": "wrong_password"
}
```

## 🚨 Red Flags

### ❌ Những dấu hiệu cho thấy API có vấn đề:
- Status 200 với username/password sai
- Không có token trong response
- Response format thay đổi liên tục
- CORS errors
- Timeout sau 1-2 giây

### ✅ Những dấu hiệu API hoạt động đúng:
- Status 401/403 với credentials sai
- Status 200 với token khi credentials đúng
- Response format consistent
- Error messages rõ ràng

## 📞 Next Steps

1. **Nếu API hoạt động đúng**: Cập nhật authService
2. **Nếu API có vấn đề**: Liên hệ backend team
3. **Nếu không chắc**: Gửi debug response cho team lead

## 🔗 Useful Links

- [API Documentation](../API%20Document.csv)
- [Swagger UI](https://api.hast-app.online/swagger/index.html)
- [AuthService Code](../services/authService.js) 