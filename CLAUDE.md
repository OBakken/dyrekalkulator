# Dyrekalkulator

## Prosjektbeskrivelse
Interaktiv norskspråklig webapp (dyrekalkulator.no) som visualiserer hvor mange dyr som dør for én person
i løpet av et livsløp, basert på offisielle norske forbrukstall.

## Tech stack
- React 18 + Vite
- Ingen UI-biblioteker — ren CSS-in-JS
- Web Audio API for lyd (oscillatorer, kompressor)
- Deploy: Vercel / Netlify / GitHub Pages

## Datakilder
- **Kjøttforbruk per dyreslag**: Animalia «Kjøttets tilstand 2025», tabell «Fra engrosforbruk til tilberedt kjøtt» (2024-tall)
- **Spiselig andel per dyreslag**: Animalia / NIBIO (storfe 78,6%, småfe 77,8%, svin 86,9%, fjørfe 79,8%)
- **Slaktevekter**: Animalia årsstatistikk 2023 (storfe 284 kg, lam 18,4 kg, svin ~80 kg, kylling ~1,3 kg)
- **Kjønnsfordeling**: Norkost 4 (2022–23)
- **Fiskeforbruk**: Sjømatrådet / Flesland 2024
- **Forventet levealder**: SSB 2024 (menn 81,6 år, kvinner 84,8 år)
- **Svinn**: NIBIO/Norsus ~9,1% gjennom verdikjeden — inkludert i tallene (dyret dør uansett)

## Nøkkelberegninger
- `kgPer` = gjennomsnittlig slaktevekt × spiselig andel (uten svinnfradrag)
- `yearlyKg` = beregnet reelt forbruk ÷ 0,909 (legger svinn tilbake)
- Aldersjustert forbruk: barn 0–2 = 15%, 2–6 = 35%, 6–10 = 50%, 10–14 = 70%, 14–18 = 85%, 18–70 = 100%, 70–80 = 85%, 80+ = 70%
- Kjønnsmodifikatorer fra Norkost 4: menn ~25% mer kjøtt, kvinner ~22% mindre

## Kommandoer
- `npm install` — installer avhengigheter
- `npm run dev` — start utviklingsserver
- `npm run build` — bygg for produksjon (dist/)
- `npm run preview` — forhåndsvis produksjonsbygg

## Filstruktur
```
src/
  App.jsx          — hovedkomponent med all logikk
  main.jsx         — React entry point
  index.css        — minimal global CSS
index.html         — HTML shell
package.json
vite.config.js
CLAUDE.md          — denne filen
README.md          — prosjektbeskrivelse for GitHub
```

## Designprinsipper
- Mørkt tema (#111 bakgrunn)
- Dyrene har SVG-illustrasjoner med progressring
- Lyd: Web Audio oscillatorer for dyredød, dyp kirkeklokke for menneskedød
- Menneskefigur som eldes (gråner hår, faller ved død)
- Aldersjustert — barn og eldre spiser mindre
- Svinn inkludert — «dyret dør uansett»

## Viktig
- Alle tall skal referere til offisielle norske kilder
- Ikke bruk «spist» — bruk «døde» / «produsert» (svinn-perspektivet)
- Tittel: «Hvor mange dyr dør før deg?»
