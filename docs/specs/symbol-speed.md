# Spec: Symbol Speed (symbol_speed.html)

## Maqsad
Brain Games to'plamiga processing speed (axborotni qayta ishlash tezligi)ni charxlaydigan o'yin qo'shish — 60 soniyada ko'rsatilgan belgini grid ichidan imkon qadar tez topib bosish.

## Nega kerak
To'plamda processing speed sohasi bo'sh. Oddiy, tez tushunarli, addictive mexanika — barcha yosh uchun mos.

## Qamrov ICHIDA
- Tepada katta maqsad belgi, pastda 3x3 grid; gridda faqat bitta katak maqsadga mos, qolgan 8 tasi chalg'ituvchi
- To'g'ri bosishda darhol yangi trial (yangi maqsad + yangi grid)
- Qiyinlik progressiyasi: ball oshgani sayin chalg'ituvchilar maqsadga o'xshashroq belgilar to'plamidan olinadi (masalan ♣/♠/♧, O/Ø/0, 6/9, E/Ǝ)
- 60 soniyalik raund, timer bar + soniya hisoblagich (flanker patterni)
- Ball: to'g'ri +1, xato −1 (0 dan pastga tushmaydi); trial almashgach ~120ms input lock
- Yakun ekrani: ball, to'g'ri/xato, aniqlik %, rekord (ScoreManager, `dir: 'max'`)
- uz/ru/en, dark/light theme, SoundFX + TG haptic, mobile-first
- `index.html`, `stats.html`, `shared/scoreManager.js` ro'yxatlariga qo'shish

## Qamrov TASHQARISIDA (bularni qilma!)
- Klaviatura bilan yozish (typing) rejimi — keyingi versiya
- Grid o'lchamini tanlash (4x4, 5x5) — keyingi versiya
- O'rtacha reaksiya vaqti (ms) statistikasi — keyingi versiya
- Leaderboard/server — loyihada yo'q

## Texnik
- Yangi fayl: `symbol_speed.html` (standalone, `flanker.html` shabloni asosida)
- `shared/scoreManager.js`: `symbol_speed: { file: 'symbol_speed.html', dir: 'max', legacy: [], fmt: v => v + '' }`
- `stats.html` META: `symbol_speed: { icon: '🔣', name: 'Symbol Speed' }`
- `index.html`: yangi karta + 3 tilda i18n kaliti
- DB/migration: yo'q (localStorage)

## Qoidalar (EARS)
- QACHON raund boshlansa, TIZIM 60s timer ishga tushirishi SHART va birinchi trialni (maqsad + 3x3 grid) ko'rsatishi SHART
- QACHON trial yaratilsa, TIZIM gridda roppa-rosa BITTA mos belgini tasodifiy katakka joylashi SHART va 8 ta chalg'ituvchi maqsaddan farqli bo'lishi SHART
- QACHON foydalanuvchi mos katakni bossa, TIZIM +1 ball berishi SHART va darhol yangi trial ko'rsatishi SHART
- AGAR noto'g'ri katak bosilsa, TIZIM −1 ball berishi SHART (minimal 0), xato signal berishi SHART va SHU trial davom etishi SHART (yangi trial ochilMASLIGI kerak — foydalanuvchi to'g'risini topguncha)
- QACHON ball oshsa, TIZIM chalg'ituvchilarni o'xshashroq to'plamdan tanlashi SHART (bosqichli qiyinlik)
- QACHON timer 0 ga yetsa, TIZIM inputni bloklashi SHART va yakun ekranini ko'rsatishi SHART
- AGAR yangi ball rekorddan yuqori bo'lsa, TIZIM ScoreManager orqali saqlashi SHART va "Yangi rekord!" ko'rsatishi SHART

## Acceptance criteria (tugadi deganda)
- [ ] 60s davomida uzluksiz triallar; har gridda aniq 1 ta to'g'ri javob
- [ ] To'g'ri +1 / xato −1 (min 0); xatoda trial almashmaydi
- [ ] Ball oshgani sayin belgilar vizual o'xshashroq bo'ladi
- [ ] Timer tugagach yakun ekrani, rekord saqlanadi, index kartada ko'rinadi
- [ ] 3 til, dark/light, mobilda katakchalar qulay bosiladi
- [ ] stats.html da Symbol Speed rekordi ko'rinadi
