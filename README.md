# Dyrekalkulator

**Hvor mange dyr dør før deg?**

Interaktiv visualisering som viser hvor mange dyr som dør for én person gjennom et helt livsløp — basert på offisielle norske forbrukstall.

🔗 **[dyrekalkulator.no](#)** *(legg inn URL etter deploy)*

![Screenshot](screenshot.png)

## Hva er dette?

En webapp som beregner antall kyllinger, fisker, griser, sauer og storfe som slaktes for deg fra fødsel til forventet dødsalder. Du velger kjønn, appetitt og din nåværende alder, og kan «spille av» livet ditt på en tidslinje.

### Funksjoner
- **Aldersjustert forbruk** — barn og eldre spiser mindre
- **Kjønnsdifferensiert** — basert på Norkost 4
- **Svinn inkludert** — dyret dør uansett om kjøttet kastes
- **Lyd** — hvert dyreslag har sin lyd, pluss en dyp kirkeklokke når mennesket dør
- **Menneskefigur** som eldes og faller ved slutten

### Datakilder
| Kilde | Data | År |
|-------|------|----|
| Animalia «Kjøttets tilstand 2025» | Beregnet reelt forbruk per dyreslag | 2024 |
| Animalia / NIBIO | Spiselig andel av slakteskrott | 2023 |
| Animalia årsstatistikk | Gjennomsnittlige slaktevekter | 2023 |
| Norkost 4 (UiO/FHI/Hdir) | Kjønnsfordeling kjøttinntak | 2022–23 |
| Sjømatrådet / Flesland | Fiskeforbruk per person | 2024 |
| SSB | Forventet levealder | 2024 |
| NIBIO / Norsus | Matsvinn gjennom verdikjeden (~9%) | 2020 |

## Kjør lokalt

```bash
npm install
npm run dev
```

Åpne [http://localhost:5173](http://localhost:5173)

## Bygg for produksjon

```bash
npm run build
```

Output i `dist/` — klar for deploy til Vercel, Netlify eller GitHub Pages.

## Deploy til Vercel

```bash
npm i -g vercel
vercel
```

## Teknologi
- React 18 + Vite
- SVG-illustrasjoner (håndtegnet i kode)
- Web Audio API (oscillatorer + DynamicsCompressor)
- Ingen eksterne avhengigheter utover React

## Lisens

MIT

---

*Dyrekalkulator — laget med data fra Animalia, SSB og Norkost. Konsept og utvikling med hjelp av Claude (Anthropic).*
