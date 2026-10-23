# Quy tắc làm việc

## Ngôn ngữ

- Luôn giao tiếp với người dùng bằng **tiếng Việt**.
- Commit message phải viết bằng **tiếng Việt**, ngắn gọn và mô tả đúng thay đổi.

## Git & GitHub

- Remote chính thức: `https://github.com/lighthouse2815/undertale.git`
- Nhánh chính: `main`

### Sau mỗi phần code hoàn chỉnh

Sau khi hoàn thành một phần việc (tính năng, sửa lỗi, refactor, tài liệu...), **bắt buộc**:

1. Kiểm tra thay đổi: `git status` và `git diff`
2. Chạy build/test nếu dự án có
3. Stage đúng các file liên quan: `git add <files>`
4. Commit bằng tiếng Việt
5. Push lên GitHub: `git push origin main`
6. Báo lại cho người dùng mã commit và nội dung đã push

### Định dạng commit message

```
<loại>: <mô tả ngắn bằng tiếng Việt>
```

Các loại thường dùng:

- `feat:` thêm tính năng mới
- `fix:` sửa lỗi
- `refactor:` tái cấu trúc code
- `docs:` cập nhật tài liệu
- `chore:` việc phụ trợ (cấu hình, dependency...)
- `test:` thêm/sửa test
- `style:` định dạng code, không đổi logic

Ví dụ:

- `feat: thêm màn hình chọn nhân vật`
- `fix: sửa lỗi âm thanh không phát khi vào trận`
- `docs: cập nhật hướng dẫn cài đặt`

### Những thứ KHÔNG được commit

- Thư mục `Undertale-AnkerGames/` (game gốc, dung lượng lớn, vấn đề bản quyền)
- File build, cache, log, file tạm
- Khóa bí mật, token, mật khẩu, file cấu hình cá nhân
- Thay đổi không liên quan đến phần việc đang làm

### Nguyên tắc

- Mỗi commit chỉ nên chứa **một thay đổi logic** rõ ràng.
- Không commit khi build/test đang lỗi (trừ khi người dùng yêu cầu).
- Không force push lên `main` nếu chưa được người dùng đồng ý.
- Nếu push thất bại, báo lỗi cho người dùng, không tự ý xóa lịch sử.
