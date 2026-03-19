# Branch Workflow

## Mục tiêu

- `cms-draft`: branch để `Pages CMS` ghi nội dung.
- `GitHub Pages`: hiển thị URL draft để quản lý xem trước.
- `release`: branch production để `Cloudflare Pages` deploy site chính.

## Flow đề xuất

1. Editor mở `Pages CMS` và chuyển sang branch `cms-draft`.
2. Mỗi lần save trên `cms-draft`, GitHub Actions workflow `Draft Preview` sẽ build site và deploy lên `GitHub Pages`.
3. Nếu chưa có PR mở từ `cms-draft` vào `release`, workflow sẽ tự tạo PR.
4. Quản lý xem bản draft trên URL GitHub Pages.
5. Khi duyệt xong, quản lý merge PR từ `cms-draft` vào `release`.
6. `Cloudflare Pages` theo dõi branch `release` và deploy site chính.

## Những gì đã được cấu hình trong repo

- Workflow [`.github/workflows/github-pages-draft.yml`](E:/Project/edu-page/educenter-bootstrap-main/.github/workflows/github-pages-draft.yml)
  - trigger khi có push vào `cms-draft`
  - build bằng `npm ci` + `npm run build`
  - deploy `theme/` lên `GitHub Pages` bằng official Pages actions
  - tự kiểm tra PR mở từ `cms-draft` sang `release`
  - chỉ tạo PR mới khi chưa có PR mở sẵn
- Workflow [`.github/workflows/cloudflare-pages.yml`](E:/Project/edu-page/educenter-bootstrap-main/.github/workflows/cloudflare-pages.yml)
  - chỉ chạy build check cho `release`
  - dùng để check nhanh trước khi Cloudflare Pages lấy branch `release`

## Việc cần làm trên GitHub

1. Tạo branch `cms-draft`.
2. Tạo branch `release`.
3. Vào `Settings > Pages`.
4. Chọn `Source = GitHub Actions`.
5. Sử dụng URL Pages do GitHub tạo ra làm URL draft.
6. Trong `Settings > Actions > General`, bật quyền cho workflow tạo pull request nếu repo đang tắt mặc định.

## Việc cần làm trên Cloudflare Pages

1. Vào project Pages đang host site chính.
2. Đặt `Production branch = release`.
3. Nếu không cần preview branch, tắt bớt branch previews để tránh tốn build.

## Việc cần làm trong Pages CMS

1. Đăng nhập repo.
2. Chuyển sang branch `cms-draft` trong dropdown branch.
3. Chỉ sửa nội dung trên branch này.

## Lưu ý

- GitHub Pages chỉ có một site cho mỗi repo, nên URL này sẽ là bản draft hiện tại.
- GitHub Pages site là public trên internet, kể cả khi repo là private nếu plan của bạn cho phép Pages.
- Workflow này giúp giảm số lần production deploy trên Cloudflare, nhưng draft vẫn build mỗi lần save vào `cms-draft`.
- Khi PR từ `cms-draft` sang `release` đã tồn tại, các lần save sau chỉ cập nhật branch `cms-draft`; workflow sẽ không tạo PR trùng.
