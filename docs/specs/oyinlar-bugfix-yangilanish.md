# Spec: O'yinlar bug-fix + Statistika/Streak + Dark mode + Audio

## Maqsad
Brain Games Telegram Mini App'dagi 14 ta HTML o'yinni auditdan o'tkazib buglarni tuzatish, so'ng umumiy statistika/kunlik streak, dark mode va success/fail audio qo'shish.

## Nega kerak
O'yinlar alohida-alohida yozilgan: Telegram SDK integratsiyasi ishlamaydi, score formati har xil, ba'zi o'yinlar menuga ulanmagan. Bu foydalanuvchi tajribasini buzadi va Telegram Mini App talablariga javob bermaydi.

## Audit natijasida topilgan buglar (tasdiqlangan)
1. **Telegram SDK faqat `index.html`da yuklangan** — 13 ta o'yin sahifasida `telegram-web-app.js` yo'q. `ready()`, `expand()`, `HapticFeedback`, theme ishlamaydi (CLAUDE.md talabi: har sahifada bo'lishi shart).
2. **`nback.html` menuga ulanmagan** — o'yin bor, lekin `index.html`dan link yo'q.
3. **Score formati tarqoq** — har o'yin o'z localStorage kalitini ishlatadi (`pt_best`, `iq_best`, `math_best_score`...). CLAUDE.md'dagi `{ game, score, user_id, timestamp }` formati hech qayerda yo'q; `shared/scoreManager.js` faqat `brain_game.html`da ishlatiladi.
4. **Shared modullar ishlatilmaydi** — `shared/` (shuffle, timerManager, tabManager, scoreManager) faqat 1/14 o'yinda ulangan; qolganlarida duplikat kod.
5. To'liq audit paytida qo'shimcha topiladigan buglar (timer leak, touch bug, til almashish va h.k.) — 1-bosqichda ro'yxatga olinadi.

## Qamrov ICHIDA
- **1-bosqich — Audit + bug-fix:** har 14 o'yinni ochib tekshirish, yuqoridagi 1–4 buglarni va yangi topilganlarni tuzatish.
- **2-bosqich — Telegram integratsiya:** har o'yinga SDK, `ready()`/`expand()`, HapticFeedback, theme params.
- **3-bosqich — Umumiy statistika + streak:** `shared/scoreManager.js`ni barcha o'yinlarga ulash, yagona score format, kunlik streak hisoblash, `stats.html` sahifasi (o'yinlar bo'yicha best score, o'ynalgan kunlar, streak).
- **4-bosqich — Dark mode:** Telegram `themeParams`dan avtomatik + qo'lda toggle (localStorage'da saqlanadi), barcha o'yinlarga tarqatish.
- **5-bosqich — Audio:** success/fail tovushlari (Web Audio API bilan sintez — fayl yuklamasdan), ovoz o'chirish tugmasi, sozlama localStorage'da.

## Qamrov TASHQARISIDA (bularni qilma!)
- Leaderboard / server-side reyting — backend kerak, keyingi versiyaga
- Yangi o'yinlar qo'shish — alohida spec
- Telegram Stars to'lovlari — alohida spec
- Chess/Checkers multiplayer logikasini o'zgartirish — faqat aniq bug bo'lsa tuzatiladi, Firebase rules'ga tegilmaydi
- To'liq shared/ refactoring (plans/shared-papkasi-refactoring-plan.md) — faqat scoreManager ulash kifoya, qolgani keyin

## Texnik
- Fayllar: barcha `*.html` (14 ta), `shared/scoreManager.js`, yangi `shared/telegram.js` (SDK wrapper), yangi `shared/theme.js` (dark mode), yangi `shared/audio.js`, yangi `stats.html`
- DB: yo'q — hammasi localStorage
- Yagona score format: `{ game, score, user_id, timestamp }` (user_id = Telegram user ID yoki 'local')
- localStorage kalitlari: `bg_scores` (massiv), `bg_streak`, `bg_theme`, `bg_sound`
- Eski kalitlar (`pt_best` va h.k.) — birinchi ochilishda migratsiya qilinadi, o'chirilmaydi
- ⚠️ Tegma: `firebase-config`, Stockfish WASM (CLAUDE.md)

## Qoidalar (EARS)
- QACHON foydalanuvchi istalgan o'yinni ochsa, TIZIM `Telegram.WebApp.ready()` va `expand()` chaqirishi SHART va Telegram tashqarisida ochilsa xatosiz ishlashi SHART (SDK yo'qligini tekshirish).
- QACHON o'yin tugasa, TIZIM score'ni yagona formatda `bg_scores`ga yozishi SHART va streak'ni yangilashi SHART (kuniga 1 marta oshadi).
- AGAR foydalanuvchi bir kun o'ynamasa, TIZIM streak'ni 0 ga tushirishi SHART.
- QACHON dark mode yoqilsa, TIZIM tanlovni `bg_theme`ga saqlashi SHART va barcha sahifalarda qo'llashi SHART.
- AGAR ovoz o'chirilgan bo'lsa, TIZIM hech qanday audio chalmasligi SHART.
- AGAR eski localStorage kalitlari mavjud bo'lsa, TIZIM ularni yangi formatga ko'chirishi SHART va ma'lumot yo'qotmasligi SHART.

## Acceptance criteria (tugadi deganda)
- [ ] Barcha 14 o'yin Telegram ichida ham, oddiy brauzerda ham xatosiz ochiladi (console'da error yo'q)
- [ ] `nback.html` menudan ochiladi
- [ ] Har o'yin tugaganda score `bg_scores`ga yagona formatda yoziladi
- [ ] `stats.html`da har o'yin best score'i, streak va o'ynalgan kunlar ko'rinadi
- [ ] Dark mode toggle ishlaydi va sahifalar orasida saqlanadi; Telegram dark theme'da avtomatik qo'llanadi
- [ ] Success/fail tovushlari chalinadi, mute tugmasi ishlaydi
- [ ] Eski best score'lar migratsiyadan keyin yo'qolmaydi
- [ ] Chess/Checkers multiplayer avvalgidek ishlaydi (regressiya yo'q)
