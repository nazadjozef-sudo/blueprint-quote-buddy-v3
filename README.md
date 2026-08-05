# Blueprint Quote Buddy

Vytvor modernú webovú aplikáciu na analýzu strojárskych výkresov (PDF) s cieľom urýchliť cenotvorbu. 

DIZAJN:

- Čistý "Apple-like" štýl: biele pozadie, jemné sivé akcenty, zaoblené rohy (16px), písmo Inter/SF Pro.

- Split-screen layout:

  * PRAVÁ STRANA (65%): Veľký box na nahrávanie PDF. Po nahratí zobraz interaktívny náhľad súboru.

  * ĽAVÁ STRANA (35%): Vertikálny formulár s extrahovanými údajmi.

FUNKCIONALITA (AI VISION LOGIKA):

Použi model Claude 3.5 Sonnet na analýzu nahraného PDF a extrahuj:

1. Aktuálny dátum a čas (automaticky).

2. Názov firmy (z pečiatky).

3. Číslo výkresu (z pečiatky).

4. Materiál & Trieda: Identifikuj normu (napr. 12050, 17241) a priraď kategóriu (Oceľ, Nerez, Hliník atď.) podľa ISO/DIN.

5. Povrchová úprava: Nájdi kľúčové slová (Zn, kalenie, lakovanie atď.).

DYNAMICKÉ POLIA PRE POLOTOVAR:

AI určí tvar (Guľatina, Plech, Rúra, Šesťhran, Jokel, Výpalok).

- Každé rozmerové pole musí mať dve časti: [Rozmer z výkresu] + [Pole pre prídavok v mm].

- Príklad pre Guľatinu: 

  * Priemer (D): [50] mm + Prídavok: [2] mm = Výsledný D 52 mm.

  * Dĺžka (L): [100] mm + Prídavok: [5] mm = Výsledná L 105 mm.

- Ak používateľ manuálne zmení typ polotovaru (Dropdown), polia sa okamžite prekreslia.

VÝPOČET VÁHY:

- Aplikácia v reálnom čase počíta váhu: (Objem s prídavkami * Hustota materiálu).

- Hustoty: Oceľ (7.85), Nerez (8.0), Hliník (2.7), Mosadz (8.5) v g/cm³.

- Výsledok zobraz hrubým písmom v KG na 3 desatinné miesta.

PLNÁ EDITOVATEĽNOSŤ:

- Všetky polia (názov firmy, číslo výkresu, materiál, rozmery) MUSIA byť prepisovateľné používateľom. AI slúži len na prvotný návrh.

EXPORT:

- Tlačidlo "Uložiť do histórie" a "Exportovať do CSV".

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://arc-estimator.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0b0e7566-2c99-4489-aacb-540fe2884e45).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
