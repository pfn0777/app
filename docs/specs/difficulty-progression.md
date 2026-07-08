# Spec: Difficulty progression — Flanker & Symbol Speed

## Maqsad
Ikkala rush-o'yinda ball oshgani sayin qiyinlik va chalg'itish bosqichma-bosqich kuchayishi — o'yin monoton bo'lib qolmasligi va yuqori ball qiyin bo'lishi uchun.

## Nega kerak
Hozir Flanker'da qiyinlik umuman o'smaydi (doim 5 strelka, bir joyda), Symbol Speed'da faqat belgilar o'xshashlashadi. Tajribali o'yinchi uchun sekin zerikarli bo'ladi, rekordlar cheksiz o'saveradi.

## Qamrov ICHIDA

### Flanker (flanker.html)
- Strelka soni ball bilan oshadi: 0–9 ball → 5 ta, 10–19 → 7 ta, 20+ → 9 ta
- Strelka qatori har trialda arrow-zone ichida tasodifiy vertikal pozitsiyada chiqadi
- 7/9 strelkada shrift mos ravishda kichrayadi (ekranga sig'ishi uchun)

### Symbol Speed (symbol_speed.html)
- Grid ball bilan o'sadi: 0–11 → 3x3, 12–24 → 4x4, 25+ → 5x5 (katak o'lchami mos kichrayadi)
- O'xshashlik bosqichlari ertaroq: TIER_MEDIUM 8→5, TIER_HARD 20→12
- 30+ ballda joriy grid har 3 soniyada o'z ichida aralashadi (belgilar joyi almashadi, to'plam o'zgarmaydi); aralashish paytida ham input ishlaydi

## Qamrov TASHQARISIDA (bularni qilma!)
- Flanker: strelkalarni yashirish (qisqa ko'rinish) — foydalanuvchi rad etdi
- Qiyinlikni qo'lda tanlash selektorlari — avvalgi speclardagidek keyingi versiya
- Yangi ball formulasi / bonuslar — ball tizimi o'zgarmaydi (+1/−1)
- Rekordlarni reset qilish — eski rekordlar qoladi

## Texnik
- `flanker.html` — FLANKER_COUNT konstanta o'rniga `arrowCountFor(score)`; arrow-row'ga tasodifiy `translateY`; font-size dinamik
- `symbol_speed.html` — GRID_SIZE o'rniga `gridSizeFor(score)`; grid CSS columns dinamik; TIER konstantalar yangilanadi; `shuffleTimer` (3s interval, 30+ ballda, trial almashganda reset)
- Boshqa fayllar o'zgarmaydi; DB/migration yo'q

## Qoidalar (EARS)
- QACHON Flanker'da ball 10 ga yetsa, TIZIM keyingi trialdan 7 strelka ko'rsatishi SHART; 20 da — 9 strelka
- QACHON Flanker'da yangi trial chiqsa, TIZIM qatorni zona ichida tasodifiy balandlikka joylashi SHART (zona tashqarisiga chiqMASLIGI kerak)
- QACHON Symbol Speed'da ball 12 ga yetsa, TIZIM keyingi trialdan 4x4 grid; 25 da — 5x5 ko'rsatishi SHART
- QACHON Symbol Speed'da ball 30+ bo'lsa VA trial 3 soniyadan beri ochiq bo'lsa, TIZIM belgilar joyini aralashtirishi SHART va to'g'ri javob katagi saqlanib qolishi SHART
- AGAR aralashish foydalanuvchi bosayotgan paytga to'g'ri kelsa, TIZIM bosilgan katakning BOSISH PAYTIDAGI belgisi bo'yicha baholashi SHART (belgini almashtirib aldab qo'yMASLIK)
- QACHON yangi raund boshlansa, TIZIM barcha progressiyani boshidan (5 strelka, 3x3) boshlashi SHART

## Acceptance criteria (tugadi deganda)
- [ ] Flanker: 10 ballda 7, 20 ballda 9 strelka; qator har trialda boshqa balandlikda; mobil ekranga sig'adi
- [ ] Symbol Speed: 12 ballda 4x4, 25 da 5x5; o'xshashlik 5/12 balldan boshlanadi
- [ ] Symbol Speed: 30+ ballda grid 3s da aralashadi, to'g'ri javob doim gridda mavjud
- [ ] Qayta boshlaganda hamma narsa boshlang'ich holatga qaytadi
- [ ] Eski rekordlar saqlanadi, ball tizimi o'zgarmagan
