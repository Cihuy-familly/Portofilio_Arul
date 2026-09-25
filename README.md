# Porto Arul

Landing page portfolio React untuk Arul (ILKOM) dengan fokus PR + content creator.

## Jalankan Project

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
pnpm dev
```

Jika kamu pakai npm:

```bash
npm install
npm run dev
```

## Struktur CMS Strapi (CMS_Arul)

Karena kamu mau CMS hanya untuk `IG content` dan `Work experience`, setup paling aman:

1. Tetap pakai collection type `CMS_Arul`.
2. Tambahkan field repeatable component atau relation list:
   - `ig_contents` (repeatable)
     - `title` (text)
     - `caption` (text)
     - `platform` (text)
     - `metric` (text)
     - `publishedAt` (date)
     - `postUrl` (text)
     - `thumbnail` (media single image)
   - `work_experiences` (repeatable)
     - `role` (text)
     - `company` (text)
     - `period` (text)
     - `summary` (rich text / text)
     - `highlights` (json array atau repeatable text)
3. Isi minimal 1 entry di `CMS_Arul`.
4. Buka `Settings > Users & Permissions Plugin > Roles > Public`.
5. Aktifkan permission `find` + `findOne` untuk `CMS_Arul`.
6. Simpan lalu test endpoint:
   - `https://strapi.cihuy-familly.my.id/api/cms-aruls?populate=*`

## Integrasi Frontend

- Base URL diatur dari `VITE_STRAPI_URL` (lihat `.env.example`).
- Frontend akan mencoba endpoint kandidat:
  - `/api/cms-aruls?populate=*`
  - `/api/cms-arul?populate=*`
  - `/api/cms_aruls?populate=*`
- Kalau CMS belum siap/public, UI otomatis pakai fallback data lokal supaya landing page tetap tampil.

## Container Image CI

GitHub Actions menjalankan build pada runner `[self-hosted, cihuy-service]` setiap ada push ke `main` atau saat workflow dijalankan manual. Satu image manifest dibangun untuk:

- `linux/amd64` (x86-64)
- `linux/arm64` (ARM64)

Tags yang diterbitkan:

- `v0.0.<github-run-number>` sebagai version tag unik
- `sha-<short-commit>` untuk melacak source commit
- `latest` untuk deployment terbaru dari branch `main`

Konfigurasi repository GitHub yang diperlukan:

- Variable `REGISTRY_URL`: `registry.cihuyproject.my.id` (tanpa `https://`)
- Variable `REGISTRY_IMAGE_NAME`: `portfolio-arul` (opsional; ini nilai default)
- Variable `REGISTRY_USERNAME`: username registry
- Secret `REGISTRY_PASSWORD`: password registry

Password harus disimpan sebagai GitHub Actions secret, bukan variable biasa atau file repository.

## Deploy Dengan Podman

File deploy yang sudah disiapkan:
- `Dockerfile`
- `nginx.conf`
- `podman-compose.yml`

Login satu kali pada server deployment agar Podman menyimpan credential di auth store milik user:

```bash
podman login registry.cihuyproject.my.id --username <registry-user>
```

Jalankan deployment:

```bash
podman compose -f podman-compose.yml pull
podman compose -f podman-compose.yml up -d
```

Secara default Compose menarik `registry.cihuyproject.my.id/portfolio-arul:latest`. Untuk deploy version tertentu:

```bash
IMAGE_TAG=v0.0.12 podman compose -f podman-compose.yml up -d
```

Cek container:

```bash
podman ps
podman logs -f porto_arul_web
```

Stop:

```bash
podman compose -f podman-compose.yml down
```
