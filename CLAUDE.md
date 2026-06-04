# Brain Games — Telegram Mini App (10+ kognitiv o'yinlar)

## Stack
- **Frontend**: HTML + CSS + Vanilla JS (yoki React, agar build qo'shgan bo'lsang)
- **Telegram**: Web App SDK (`telegram-web-app.js`)
- **Multiplayer (Chess)**: Firebase Realtime DB
- **Chess AI**: Stockfish (WASM, brauzerda)
- **Hosting**: Vercel
- **Bot**: aiogram 3 (Mini App'ni ochish uchun)

## O'yinlar ro'yxati
1. **Piano Tiles** — reaksiya
2. **Schulte Table** — diqqat
3. **Stroop Test** — kognitiv moslashuvchanlik
4. **Chess** — Stockfish AI + Firebase multiplayer
5. **Checkers** — shashka
6. **Reaction Time** — reaksiya o'lchash
7. **Sequence Memory** — xotira
8. **Mental Math** — hisob
9. **(+ qo'shimcha 2-3 ta)**

## Commands
```bash
# Lokal
npx serve .
# yoki agar build kerak bo'lsa
npm run dev

# Deploy
git push origin main   # GitHub → Vercel auto-deploy
```

## Struktura
```
index.html              # Asosiy menu — barcha o'yinlarga link
games/
├── piano-tiles/
├── schulte-table/
├── stroop/
├── chess/              # Stockfish + Firebase multiplayer
│   ├── index.html
│   ├── stockfish.js    # WASM
│   └── multiplayer.js  # Firebase config
├── checkers/
├── reaction-time/
├── sequence-memory/
├── mental-math/
└── ...
shared/
├── telegram.js         # Web App SDK wrapper
├── score.js            # Telegram'ga score yuborish
└── styles.css          # Umumiy stillar
firebase-config.js      # ⚠️ Public config (security rules muhim)
vercel.json
```

## Telegram Mini App integratsiya
- `Telegram.WebApp.ready()` — har sahifada
- `Telegram.WebApp.expand()` — to'liq ekran
- `Telegram.WebApp.MainButton` — natija yuborish
- `Telegram.WebApp.HapticFeedback` — taktil javob
- Theme: `Telegram.WebApp.themeParams` (light/dark)

## Firebase (Chess multiplayer)
- **Database**: Realtime DB (Firestore emas — latency past)
- **Auth**: anonymous (Telegram user ID asosida)
- **Security rules**: faqat o'yinchilar o'z room'ini yoza oladi
- **Room cleanup**: 24 soatdan keyin avtomatik o'chirish

## Konventsiyalar
- **Bitta o'yin = bitta papka** (`games/<name>/`)
- **Index.html**: har bir o'yinda standalone bo'lsin
- **Score format**: `{ game, score, user_id, timestamp }`
- **Mobile-first**: barcha o'yinlar touch uchun optimallashtirilgan
- **Offline-capable**: shared assets cache (service worker, ixtiyoriy)

## Performance
- Stockfish WASM ~1MB — lazy load
- Firebase SDK CDN'dan — modular import
- Imagelar webp formatda

## ⚠️ Tegma
- `firebase-config.js` — security rules Firebase console'da
- Stockfish WASM fayli — uni qayta build qilma, CDN'dan ol

## Keyingi qadamlar
- Leaderboard (umumiy reyting)
- Daily challenge
- Telegram Stars'da skin/theme sotish
- Yangi o'yinlar (memory matrix, n-back)

# Miya Geniusi — standalone brain training platform (HTML, o'zbek)

## Stack
- **Pure web**: HTML + CSS + Vanilla JS
- **Hosting**: Vercel / GitHub Pages
- **Til**: faqat o'zbek (lotin)
- **No backend**: lokal state (`localStorage`)

## Maqsad
Brain Games Telegram Mini App'ning **mustaqil web versiyasi**. Telegram tashqarisida ishlaydi, brauzerdan ochiladi. Miya rivojlantirish o'yinlari, statistika, kunlik mashqlar.

## Commands
```bash
# Lokal
npx serve .

# Deploy
vercel --prod
```

## Struktura
```
index.html              # Asosiy menu
games/                  # O'yinlar (Brain Games bilan deyarli bir xil)
├── memory/
├── attention/
├── math/
└── ...
stats.html              # Foydalanuvchi statistikasi (localStorage)
about.html              # Loyiha haqida
shared/
├── theme.css
├── i18n-uz.js          # Faqat o'zbek matnlari
└── tracker.js          # localStorage'ga score yozish
manifest.json           # PWA support
```

## Brain Games'dan farqi
| Xususiyat | Brain Games | Miya Geniusi |
|---|---|---|
| Platform | Telegram Mini App | Standalone web |
| Auth | Telegram user_id | localStorage |
| Multiplayer | Bor (Chess, Firebase) | Yo'q |
| Til | uz/ru/en | Faqat uz |
| Score sync | Telegram bot | Lokal |

## Konventsiyalar
- **Til**: faqat o'zbek. Hech qanday ru/en string yo'q.
- **No tracking**: oddiy Yandex Metrika boshqalar tashqari analytics yo'q
- **Offline-first**: PWA + service worker
- **Mobile-first**: 80% trafik telefondan

## Code sharing strategy
Brain Games bilan o'yin logikasini umumiy qilish (DRY):
1. Bir nechta o'yinning core JS kodini ikkala loyihaga copy-paste qilingan — kelajakda ajratish kerak (npm package yoki git submodule)
2. Bitta loyihada bug fix bo'lsa — boshqasiga ham qo'l bilan ko'chirish (hozircha)

## Keyingi qadamlar
- PWA install banner
- Kunlik streak (gamification)
- O'yinlar uchun audio (success/fail tovushi)
- Dark mode toggle

## ⚠️ Tegma
- `i18n-uz.js` — faqat lotin yozuvi (kirill emas)
- Production link'lar `index.html`'da
