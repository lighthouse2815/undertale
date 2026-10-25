# Butterscotch

Runtime GameMaker mã nguồn mở, tích hợp để chạy bytecode Undertale trên web.

- Upstream: https://github.com/ButterscotchRunner/Butterscotch
- Commit: `eac193381c3eec93e7d1c0ae99aa2db3c4eaebf1`
- Bản phân phối: artifact `butterscotch-web`, workflow run `40216010072`, artifact ID `12608015811`.
- Giấy phép: AGPL-3.0, xem [source/LICENSE](source/LICENSE).
- `butterscotch.mjs` và `butterscotch.wasm`: runtime được phân phối bởi upstream.
- `source/`: mã nguồn C và các thư viện đi kèm tại cùng commit, giữ nguyên nội dung;
  bỏ bộ kiểm thử và frontend Android, không dùng cho bản build web này.

Biên dịch lại runtime bằng Emscripten theo workflow chính thức của upstream:

```bash
emcmake cmake -S vendor/butterscotch/source -B build/butterscotch \
  -DPLATFORM=web -DBACKEND=web -DCMAKE_BUILD_TYPE=Release
cmake --build build/butterscotch
```

Khi cập nhật, lấy cùng một revision cho runtime và source, giữ giấy phép của
Butterscotch và các thư viện trong `source/vendor/`. Bản web dùng WebGL 2 và
WebAssembly JSPI. Trạng thái tương thích của runtime có thể khác runner GameMaker
gốc; kiểm thử tích hợp chỉ xác nhận các luồng được ghi trong bộ test.
