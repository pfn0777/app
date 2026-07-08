# Spec: Arrow Flanker Test (flanker.html)

## Maqsad
Brain Games to'plamiga selektiv diqqat va impuls nazoratini charxlaydigan Arrow Flanker o'yinini qo'shish — 60 soniyalik vaqt bosimi ostida o'rtadagi strelka yo'nalishini tez va to'g'ri aniqlash.

## Nega kerak
To'plamda impuls nazorati (inhibition) sohasi bo'sh — Stroop'ga uslubdosh, lekin boshqa mexanika. Klassik, ilmiy asoslangan test, mobil uchun juda mos (2 tugma).

## Qamrov ICHIDA
- 5 ta strelka qatori: `←←←←←` (congruent) yoki `←←→←←` (incongruent), ~50/50 aralash
- Javob: ekran pastida 2 ta katta tugma (⬅ / ➡) — o'rtadagi strelka yo'nalishi bosiladi
- 60 soniyalik raund, tepada qayta sanovchi timer bar
- Ball: to'g'ri +1, xato −1 (0 dan pastga tushmaydi); yakunda to'g'ri/xato statistika
- Rekord: eng yuqori ball, `ScoreManager` orqali (`dir: 'max'`)
- uz/ru/en tillar, intro ekran (qoida tushuntirish), game-over ekran
- Mavjud shared modullar: `telegram.js`, `theme.js` (dark/light), `audio.js` (to'g'ri/xato tovush), `scoreManager.js`
- Haptic feedback (TG.haptic), mobile-first layout
- `index.html`, `stats.html`, `shared/scoreManager.js` ga ro'yxatga qo'shish

## Qamrov TASHQARISIDA (bularni qilma!)
- Harf/rang flanker variantlari — keyingi versiya
- Qiyinlik selektorlari (strelka soni, tezlik) — keyingi versiya
- Har trial uchun alohida vaqt limiti — raund timeri kifoya
- O'rtacha reaksiya vaqti (ms) statistikasi — keyingi versiya
- Leaderboard/server — loyihada umuman yo'q

## Texnik
- Yangi fayl: `flanker.html` (standalone, mavjud o'yinlar shabloni asosida — eng yaqini `reaction_time.html` / `colors_game.html`)
- `shared/scoreManager.js`: `flanker: { file: 'flanker.html', dir: 'max', legacy: [], fmt: v => v + '' }`
- `stats.html` META: `flanker: { icon: '🎯', name: ... }`
- `index.html`: yangi karta + 3 tilda `flanker` i18n kaliti
- DB/migration: yo'q (localStorage)

## Qoidalar (EARS)
- QACHON raund boshlansa, TIZIM 60s timer ishga tushirishi SHART va birinchi trialni ko'rsatishi SHART
- QACHON foydalanuvchi tugma bossa VA yo'nalish o'rtadagi strelkaga mos kelsa, TIZIM +1 ball berishi SHART va darhol yangi trial ko'rsatishi SHART
- QACHON javob noto'g'ri bo'lsa, TIZIM −1 ball berishi SHART (minimal 0) va vizual/tovush xato signali berishi SHART
- QACHON timer 0 ga yetsa, TIZIM inputni bloklashi SHART va game-over ekranida ball, to'g'ri/xato son, rekordni ko'rsatishi SHART
- AGAR yangi ball rekorddan yuqori bo'lsa, TIZIM rekordni ScoreManager orqali saqlashi SHART va "Yangi rekord!" ko'rsatishi SHART
- AGAR trial almashish paytida takror bosish bo'lsa, TIZIM faqat bitta javobni qabul qilishi SHART

## Acceptance criteria (tugadi deganda)
- [ ] 60s davomida uzluksiz trial'lar, congruent/incongruent aralash
- [ ] To'g'ri +1 / xato −1, ball 0 dan pastga tushmaydi
- [ ] Timer tugagach game-over, rekord saqlanadi va index kartada ko'rinadi
- [ ] 3 til to'liq ishlaydi, dark/light theme, mobil ekranda tugmalar qulay
- [ ] stats.html sahifasida flanker rekordi ko'rinadi
