# Pages CMS Setup

Website nay da duoc chuyen sang mo hinh noi dung co the quan tri bang Pages CMS.

## File cau hinh CMS

- `.pages.yml`

Pages CMS se doc file nay de tao giao dien admin.

## Noi dung admin se sua

Tat ca du lieu hien nam trong:

- `source/static/data/site.json`
- `source/static/data/home.json`
- `source/static/data/about.json`
- `source/static/data/contact.json`
- `source/static/data/blog-page.json`
- `source/static/data/courses-page.json`
- `source/static/data/resources-page.json`
- `source/static/data/feedback-page.json`
- `source/static/data/blog-posts.json`
- `source/static/data/courses-items.json`
- `source/static/data/feedback-items.json`
- `source/static/data/resource-items.json`

## Nhung gi admin co the sua

- logo, favicon, hotline, email, Zalo, Facebook, copyright
- noi dung homepage
- noi dung gioi thieu
- link Google Form tren trang lien he
- danh sach bai blog
- danh sach khoa hoc
- danh sach feedback
- danh sach tai lieu va link Google Drive

## Luu y quan trong

Co mot so link placeholder can thay bang link that:

- `https://forms.gle/REPLACE_ME`
- `https://drive.google.com/drive/folders/REPLACE_ME`
- `https://drive.google.com/file/d/REPLACE_ME/view`

Ban co the thay truc tiep trong CMS hoac trong cac file JSON o tren.

## Cach build

```bash
npm run build
```

Output se nam trong thu muc `theme/`.

## Cach deploy

Co the deploy len:

- Cloudflare Pages
- GitHub Pages

Neu dung Pages CMS, nen de repo tren GitHub de CMS co the ghi noi dung truc tiep vao repo.
