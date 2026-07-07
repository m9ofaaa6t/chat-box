# Custom AI Chatbox — OpenRouter + TanStack Query + Next.js

Chatbox AI custom:
- **Backend**: Next.js Route Handler (`app/api/chat/route.ts`) yang menyimpan API key OpenRouter
  dengan aman di server dan meneruskan (proxy) permintaan ke OpenRouter.
- **Frontend**: React di Next.js App Router, memakai **TanStack Query** (`useMutation`)
  untuk memanggil endpoint backend dan mengelola state loading/error.

## Cara pakai di VS Code

1. Buka folder ini di VS Code.
2. Install dependency:
   ```bash
   npm install
   ```
3. Salin file environment:
   ```bash
   cp .env.local.example .env.local
   ```
   Lalu isi `OPENROUTER_API_KEY` dengan API key dari https://openrouter.ai/keys
4. Jalankan development server:
   ```bash
   npm run dev
   ```
5. Buka http://localhost:3000 di browser.

## Struktur proyek

```
app/
  api/chat/route.ts   <- backend: proxy aman ke OpenRouter API
  layout.tsx          <- root layout + Providers (TanStack Query)
  page.tsx            <- halaman utama, merender <ChatBox />
  providers.tsx        <- QueryClientProvider (TanStack Query)
  globals.css
components/
  ChatBox.tsx          <- UI chat + logic useMutation (frontend)
lib/
  types.ts             <- tipe data bersama (ChatMessage, dll)
```

## Cara kerja singkat

1. User mengetik pesan di `ChatBox.tsx` → dikirim via `useMutation` ke `POST /api/chat`.
2. Route handler di server membaca `OPENROUTER_API_KEY` dari `.env.local`
   dan meneruskan riwayat percakapan ke OpenRouter (`/api/v1/chat/completions`).
3. Balasan model dikembalikan ke frontend, ditambahkan ke daftar pesan, dan dirender.

## Mengganti model

Ubah `OPENROUTER_MODEL` di `.env.local`, misalnya:
```
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
OPENROUTER_MODEL=meta-llama/llama-3.1-70b-instruct
OPENROUTER_MODEL=google/gemini-flash-1.5
```
Lihat daftar model lengkap di https://openrouter.ai/models

## Catatan keamanan

- **Jangan pernah** memanggil OpenRouter langsung dari frontend dengan API key ter-hardcode —
  itu akan mengekspos key ke publik. Selalu lewat backend (`/api/chat`) seperti contoh ini.
- `.env.local` sudah masuk `.gitignore`, jangan commit ke git.
