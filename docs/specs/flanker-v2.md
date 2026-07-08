# Spec: Flanker v2 — klassik Eriksen protokoli

## Maqsad
`flanker.html` o'yin logikasini ilmiy asosdagi klassik Eriksen flanker task protokoliga to'liq mos qilib qayta yozish: 60s rush o'rniga 30 trial, RT o'lchovi va Flanker Effect ko'rsatkichi.

## Nega kerak
Hozirgi versiya (60s, ball +1/−1, qiyinlik progressiyasi) o'yin sifatida ishlaydi, lekin flanker testning asl maqsadini — selektiv diqqat va interferensiyani O'LCHASHNI — bermaydi. Klassik protokol RT asosida ishlaydi va foydalanuvchiga ilmiy ma'noli natija (Flanker Effect) beradi.

Manbalar: Human Benchmark flanker (30 trial, congruent/incongruent RT, effect baholash), mindLAMP/PSY4061 protokoli (fiksatsiya krest, tasodifiy interval).

## Qamrov ICHIDA
- 30 trial (15 congruent + 15 incongruent, tasodifiy aralash tartibda)
- Har trial oqimi: fiksatsiya krest `+` (400–800ms tasodifiy) → 5 strelka (javobgacha, maks 1500ms) → 300ms pauza → keyingi trial
- Javob: ⬅/➡ tugmalar + klaviatura strelkalari (spatial-compatible mapping)
- Timeout (1500ms javobsiz) = xato trial, RT hisobga kirmaydi
- Progress ko'rsatkich: `12/30` (ball emas)
- Yakun ekrani: congruent o'rtacha RT, incongruent o'rtacha RT, **Flanker Effect** (farq, ms), aniqlik %, baho shkalasi (<60ms a'lo / 60–120 yaxshi / 120–180 o'rtacha / >180 past)
- Rekord: **Flanker Effect, dir: 'min'** (kichik = yaxshi), format `X ms`
- Erta/impulsiv bosish himoyasi: fiksatsiya paytida bosilsa e'tiborga olinmaydi
- RT faqat TO'G'RI javoblardan hisoblanadi; agar biror turda to'g'ri javob 0 bo'lsa — effect hisoblanmaydi, rekord yozilmaydi
- uz/ru/en, dark/light, SoundFX/haptic — mavjud pattern saqlanadi

## Qamrov TASHQARISIDA (bularni qilma!)
- Qiyinlik progressiyasi (7/9 strelka, tasodifiy joylashuv) — olib tashlanadi, klassik protokol doim 5 strelka bir joyda
- Ball tizimi (+1/−1) — butunlay yo'q
- Trial sonini tanlash — doim 30
- RT tarixi grafigi — keyingi versiya

## Texnik
- `flanker.html` — script qismi to'liq qayta yoziladi (layout asosan qoladi: intro/game/final ekranlar)
- `shared/scoreManager.js` — `flanker` entry: `dir: 'max'` → `dir: 'min'`, `fmt: v => v + ' ms'` (eski test rekordlari faqat lokal, deploy bo'lmagan — mos kelmasa ham zarar yo'q)
- `index.html`, `stats.html` — o'zgarish shart emas (entry nomlari qoladi)
- DB/migration: yo'q

## Qoidalar (EARS)
- QACHON trial boshlansa, TIZIM fiksatsiya krestini 400–800ms (tasodifiy) ko'rsatishi SHART va bu paytdagi bosishlarni e'tiborga olMASLIGI kerak
- QACHON strelkalar ko'rsatilsa, TIZIM RT o'lchashni boshlashi SHART
- QACHON foydalanuvchi javob bersa, TIZIM to'g'ri/xato va RT ni yozishi SHART va 300ms dan keyin keyingi trialga o'tishi SHART
- AGAR 1500ms ichida javob bo'lmasa, TIZIM trialni xato deb belgilashi SHART va RT ni hisobga olMASLIGI kerak
- QACHON 30-trial tugasa, TIZIM congruent/incongruent o'rtacha RT (faqat to'g'ri javoblar), Flanker Effect va aniqlikni ko'rsatishi SHART
- AGAR congruent yoki incongruent turda birorta ham to'g'ri javob bo'lmasa, TIZIM effect o'rniga "—" ko'rsatishi SHART va rekord yozMASLIGI kerak
- AGAR yangi effect rekorddan kichik bo'lsa, TIZIM ScoreManager orqali saqlashi SHART va "Yangi rekord!" ko'rsatishi SHART

## Acceptance criteria (tugadi deganda)
- [ ] 30 trial (15/15 balans), har biri fiksatsiya → stimul → javob/timeout → pauza oqimida
- [ ] Fiksatsiya paytida bosish hech narsani buzmaydi
- [ ] Yakunda congruent RT, incongruent RT, Flanker Effect (ms), aniqlik %, baho ko'rinadi
- [ ] Rekord = eng kichik Flanker Effect, `X ms` formatida index/stats sahifalarida ko'rinadi
- [ ] Timeout xato hisoblanadi, RT ga kirmaydi
- [ ] 3 til, dark/light, klaviatura + touch ishlaydi
