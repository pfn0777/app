# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Loyiha

Brain training o'yinlari to'plami — Telegram Mini App sifatida ham, oddiy brauzerda ham ishlaydigan statik sayt. Build tizimi yo'q: har bir o'yin repo tub papkasidagi bitta standalone `.html` fayl (HTML+CSS+vanilla JS bitta faylda).

## Commands

```bash
npx serve .          # lokal server
git push origin main # deploy (hosting avtomatik push'dan kuzatadi)
```

Test, lint yoki build skripti yo'q — o'zgarishni tekshirish uchun faylni brauzerda ochish yoki `npx serve .` orqali qarash yetarli.

## Struktura

```
index.html            # Bosh menyu — kartalar orqali har bir o'yinga link
stats.html             # Statistika sahifasi (ScoreManager'dan o'qiydi, i18n yo'q)
<oyin>_game.html        # Har bir o'yin — o'zining <head>, <style>, <script> bilan to'liq mustaqil
shared/
├── telegram.js         # Telegram Web App SDK wrapper (window.TG) — Telegram tashqarisida no-op
├── theme.js             # Dark/light tema (window.Theme), localStorage 'bg_theme'
├── audio.js              # Web Audio synth success/fail tovushlari (window.SoundFX), localStorage 'bg_sound'
├── scoreManager.js        # Yagona score/streak saqlash (window.ScoreManager)
├── tabManager.js           # Ko'p-panelli o'yinlarda tab almashtirish + timer tozalash
├── timerManager.js          # setTimeout/setInterval'larni kuzatib, bulk tozalash
└── shuffle.js                # Fisher-Yates shuffle
docs/specs/            # Ayrim o'yinlar uchun dizayn spetsifikatsiyalari (flanker, symbol-speed va h.k.)
plans/                  # O'tgan refaktoring/bugfix rejalari (tarixiy hujjat)
```

Yangi o'yin qo'shilganda: mavjud `*_game.html` fayllardan birini namuna qilib olish (masalan `schulte_table.html`), `ScoreManager.GAMES` reestriga qo'shish va `index.html`'ga karta + i18n kalitlarini qo'shish (quyida).

## Arxitektura

### Har bir o'yin fayli bir xil patternga amal qiladi
- `<head>` skriptlar tartibi: `telegram-web-app.js` → `shared/telegram.js` → `shared/theme.js` → `shared/audio.js` → `shared/scoreManager.js`. Bu tartib muhim — `theme.js`/`telegram.js` bir-biriga bog'liq.
- Sahifa boshida `TR` (yoki `T`) obyekti — `{ uz: {...}, ru: {...}, en: {...} }` tarjima kalitlari.
- "Start overlay" — o'yin qoidalarini ko'rsatib, "Play" tugmasi bosilguncha o'yinni boshlamaydigan modal (`#start-ov`).
- "End overlay" — o'yin tugagach natija/rekord ko'rsatadigan modal (`#end-ov`).
- `applyLang(l)` funksiyasi — tilni almashtirib, DOM matnlarini yangilaydi.

### Til (i18n) — bitta umumiy holat
Barcha sahifalar **bitta** localStorage kalitidan foydalanadi: `brain_lang`. Bosh menyuda tanlangan til shu kalitga yoziladi va har bir o'yin sahifasi ochilganda o'sha qiymatni o'qib avtomatik qo'llaydi (`let lang = localStorage.getItem('brain_lang') || 'uz'`). Yangi o'yin qo'shganda ham xuddi shu kalitni ishlatish shart — fayl-spetsifik kalit (`<oyin>_lang`) ishlatilmasin, aks holda til bosh menyudan meros olinmaydi.

### Score saqlash — `shared/scoreManager.js`
Yagona format: `{ game, score, user_id, timestamp }`, `localStorage['bg_scores']` massivida saqlanadi. `ScoreManager.GAMES` reestrida har bir o'yin uchun: `file` (html fayl nomi), `dir` (`'max'` — katta yaxshi, `'min'` — kichik/vaqt yaxshi), `legacy` (eski, fayl-spetsifik localStorage kalitlari — bir martalik migratsiya uchun, **o'chirilmaydi**, faqat o'qiladi), `fmt` (ko'rsatish formati). Asosiy metodlar: `record(game, score)`, `best(game)`, `bestFmt(game)`, `getStreak()`. Yangi o'yin qo'shganda uni shu reestrga qo'shish kerak — aks holda bosh menyudagi rekord ko'rsatkichi va statistika ishlamaydi.

### Tema va ovoz
`shared/theme.js` — `<html data-theme="dark|light">` atributini boshqaradi; har sahifaning o'z CSS'ida `[data-theme="dark"]` selektorlari bo'ladi. `shared/audio.js` — fayl yuklamaydi, tovushlarni Web Audio API bilan sintez qiladi.

## Konventsiyalar
- Bitta o'yin = bitta standalone `.html` fayl repo tub papkasida (subfolder yo'q).
- Mobile-first, touch uchun optimallashtirilgan.
- Telegram Mini App integratsiyasi ixtiyoriy — hamma narsa oddiy brauzerda ham ishlashi kerak (`shared/telegram.js` buni ta'minlaydi).
