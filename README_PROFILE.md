# HAST Mobile - Profile Management

## Tính năng Profile đã được thêm

### 1. Xem Profile (ProfileScreen)
- Hiển thị thông tin cá nhân của user
- Tự động tải thông tin từ API `/api/user/profile`
- Hỗ trợ pull-to-refresh để cập nhật thông tin
- Các nút điều hướng: Cập nhật thông tin, Đổi mật khẩu, Đăng xuất

### 2. Cập nhật Profile (UpdateProfileScreen)
- Form cập nhật thông tin cá nhân
- Các trường: Họ tên, Số điện thoại, Giới tính, Ngày sinh
- Validation form đơn giản
- Date picker cho ngày sinh
- Dropdown cho giới tính

### 3. Đổi mật khẩu (ChangePasswordScreen)
- Form đổi mật khẩu với 3 trường: mật khẩu cũ, mật khẩu mới, xác nhận mật khẩu
- Validation cơ bản (tối thiểu 6 ký tự)
- Hiển thị/ẩn mật khẩu không có (để UI đơn giản)
- Gợi ý yêu cầu mật khẩu

## Navigation

Từ HomeScreen → Profile → Update Profile / Change Password

## API Integration

### AuthService đã được mở rộng với:
- `getProfile()` - Lấy thông tin profile từ `/api/user/profile`
- `updateProfile(data)` - Cập nhật profile qua `/api/user/update`
- `changePassword(old, new, confirm)` - Đổi mật khẩu qua `/api/auth/update-password`

### Tất cả đều hỗ trợ HAST API format:
```json
{
  "success": true/false,
  "description": "message",
  "data": {...}
}
```

## Dependencies mới đã thêm:
- `@react-native-community/datetimepicker`: Date picker
- `@react-native-picker/picker`: Dropdown picker

## Cách sử dụng:

1. Từ HomeScreen, nhấn "Xem chi tiết profile"
2. Trong ProfileScreen:
   - Xem thông tin cá nhân
   - Nhấn "Cập nhật thông tin" để chỉnh sửa
   - Nhấn "Đổi mật khẩu" để thay đổi password
   - Nhấn "Đăng xuất" để thoát

## UI Design:
- Thiết kế đơn giản, hiệu quả
- Ít sử dụng icon, tập trung vào text
- Card-based layout
- Consistent color scheme (#007AFF primary)
- Responsive và user-friendly 