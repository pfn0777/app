# Reja: O'yinlar bug-fix + Statistika/Streak + Dark mode + Audio

Spec: `docs/specs/oyinlar-bugfix-yangilanish.md`

## O'zgaradigan / yangi fayllar
1. `shared/telegram.js` (yangi) — SDK wrapper: `ready()`/`expand()`, HapticFeedback, theme params; Telegram tashqarisida xatosiz no-op
2. `shared/theme.js` (yangi) — dark mode: Telegram theme'dan avto + qo'lda toggle, `bg_theme` kaliti
3. `shared/audio.js` (yangi) — Web Audio API bilan success/fail tovushlari, mute (`bg_sound`)
4. `shared/scoreManager.js` — yagona format `{game, score, user_id, timestamp}`, streak hisoblash, eski kalitlardan migratsiya
5. `stats.html` (yangi) — umumiy statistika: har o'yin best score, streak, o'ynalgan kunlar
6. `index.html` — nback linki, stats linki, dark mode toggle, yangi shared skriptlar
7. Barcha 13 o'yin fayli — SDK + shared skriptlar ulash, score yozishni scoreManager'ga o'tkazish, haptic/audio chaqiruvlar, dark mode CSS o'zgaruvchilari, audit paytida topilgan buglar tuzatiladi

## Qadamlar
1. **Audit** — har 14 faylni o'qib chiqish, bug ro'yxatini tuzish (timer leak, touch, til va h.k.)
2. **Shared modullar** — `telegram.js`, `theme.js`, `audio.js` yozish; `scoreManager.js`ni kengaytirish (format + streak + migratsiya)
3. **index.html** — nback + stats linklari, toggle, skriptlar
4. **O'yinlarni birma-bir yangilash** — oddiylardan boshlab (piano_tiles → ... → chess/checkers oxirida, ehtiyotkorlik bilan)
5. **stats.html** — scoreManager ma'lumotlaridan sahifa
6. **Tekshirish** — har faylni Node bilan sintaks-tekshirish, brauzerda smoke test, acceptance criteria bo'yicha yurish

## Xavf
- Chess/Checkers: Firebase multiplayer'ga tegilmaydi — faqat SDK/score/theme qatlamlari qo'shiladi; o'zgarishdan keyin multiplayer oqimi qo'lda tekshiriladi
- Migratsiya: eski best score'lar o'chirilmaydi, faqat o'qiladi
