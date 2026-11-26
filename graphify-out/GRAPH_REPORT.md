# Graph Report - bible-audio-journey  (2026-11-25)

## Corpus Check
- Large corpus: 34 files · ~716,809 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 206 nodes · 268 edges · 20 communities (15 shown, 5 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Dependências do app Expo
- Texto bíblico, busca e alterações
- Documentação, loja e privacidade
- Configuração app.json
- Páginas web React remanescentes
- App, configurações e tema
- Empacotamento Windows (electron-builder)
- package.json do desktop
- Servidor local do Electron
- Captura 01: leitor em Gênesis 1
- Captura 03: Salmos 23 claro
- Captura 02: João 3 escuro
- Banner da Play Store
- Ícone adaptativo
- Plugin de hardware opcional
- Arte da pomba com ramo
- Ícone do app
- Ícone do desktop
- Ícone da Play Store

## God Nodes (most connected - your core abstractions)
1. `Changes()` - 10 edges
2. `Bíblia em Áudio Almeida 1911 (App Android)` - 10 edges
3. `expo` - 9 edges
4. `react` - 8 edges
5. `react-native` - 7 edges
6. `Reader()` - 7 edges
7. `build` - 7 edges
8. `Política de Privacidade — Bíblia Almeida 1911` - 7 edges
9. `Play Store Screenshot 03: Bible Reader (Salmos 23, Light Theme)` - 6 edges
10. `App()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Ficha da Play Store — Bíblia Almeida 1911` --references--> `Bíblia em Áudio Almeida 1911 (App Android)`  [INFERRED]
  play-store/listing.md → README.md
- `Política de Privacidade — Bíblia Almeida 1911` --references--> `Bíblia em Áudio Almeida 1911 (App Android)`  [INFERRED]
  play-store/PRIVACY.md → README.md
- `Funciona offline, sem envio de dados` --conceptually_related_to--> `Texto bíblico embutido offline (porAlmeida1911.json)`  [INFERRED]
  play-store/PRIVACY.md → README.md
- `Recursos anunciados (texto completo, busca, tema, fonte, posição de leitura)` --conceptually_related_to--> `Leitor por livro/capítulo/versículo e busca`  [INFERRED]
  play-store/listing.md → README.md
- `Dados salvos apenas no aparelho` --shares_data_with--> `Tema, fonte e posição salvos (AsyncStorage)`  [INFERRED]
  play-store/PRIVACY.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Privacidade: offline, dados locais e sem coleta** — play_store_privacy_sem_coleta_de_dados, play_store_privacy_funcionamento_offline, play_store_privacy_dados_no_aparelho, readme_texto_biblico_embutido [INFERRED 0.85]
- **Atribuição e licenciamento do texto bíblico** — readme_traducao_almeida_1911, readme_licenca_cc_by_4_0, readme_crosswire_poralmeida1911, readme_general_public_license [EXTRACTED 1.00]
- **Dove and olive branch peace emblem** — artefatos_pomba_azul_com_ramo_de_oliveira_blue_dove, artefatos_pomba_azul_com_ramo_de_oliveira_olive_branch, artefatos_pomba_azul_com_ramo_de_oliveira_biblical_peace_symbolism [INFERRED 0.85]
- **Advertised App Features** — play_store_feature_graphic_1024x500_offline_reading, play_store_feature_graphic_1024x500_search, play_store_feature_graphic_1024x500_dark_theme [EXTRACTED 1.00]
- **Bible Passage Navigation Controls** — play_store_screenshots_01_book_chapter_verse_selectors, play_store_screenshots_01_search_button, play_store_screenshots_01_next_chapter_button [INFERRED 0.85]
- **Bible Reader Screen Layout** — play_store_screenshots_02_reader_top_bar, play_store_screenshots_02_verse_list, play_store_screenshots_02_chapter_navigation_buttons [EXTRACTED 1.00]
- **Bible Reading Navigation Controls** — play_store_screenshots_03_reference_selector, play_store_screenshots_03_search_button, play_store_screenshots_03_prev_next_navigation [INFERRED 0.85]

## Communities (20 total, 5 thin omitted)

### Community 0 - "Dependências do app Expo"
Cohesion: 0.09
Nodes (29): dependencies, expo@~53.0.0, expo-asset@~11.1.7, expo-clipboard@~7.1.5, expo-constants@~17.1.8, @expo/metro-runtime@~5.0.5, expo-status-bar@~2.2.3, react-dom@19.0.0 (+21 more)

### Community 1 - "Texto bíblico, busca e alterações"
Cohesion: 0.16
Nodes (20): BOOKS, comparar(), getChapter(), searchVerses(), Changes(), primeiroBranchComArquivo(), s, diffVerso() (+12 more)

### Community 2 - "Documentação, loja e privacidade"
Cohesion: 0.14
Nodes (19): Ficha da Play Store — Bíblia Almeida 1911, Recursos anunciados (texto completo, busca, tema, fonte, posição de leitura), Dados salvos apenas no aparelho, Funciona offline, sem envio de dados, Permissões do Android, Política de Privacidade — Bíblia Almeida 1911, App web e API Node + SQLite removidos, Bíblia em Áudio Almeida 1911 (App Android) (+11 more)

### Community 3 - "Configuração app.json"
Cohesion: 0.13
Nodes (14): backgroundColor, foregroundImage, adaptiveIcon, package, versionCode, expo, android, icon (+6 more)

### Community 4 - "Páginas web React remanescentes"
Cohesion: 0.16
Nodes (4): react@19.0.0, react, Video, videos

### Community 5 - "App, configurações e tema"
Cohesion: 0.22
Nodes (9): App(), s, VERSAO, Config(), FONT_DEFAULT, FONT_MAX, FONT_MIN, s (+1 more)

### Community 6 - "Empacotamento Windows (electron-builder)"
Cohesion: 0.15
Nodes (13): build, appId, directories, files, nsis, productName, win, output (+5 more)

### Community 7 - "package.json do desktop"
Cohesion: 0.20
Nodes (11): description, devDependencies, electron@^33.0.0, electron-builder@^25.0.0, main, name, scripts, build:win (+3 more)

### Community 8 - "Servidor local do Electron"
Cohesion: 0.18
Nodes (6): { app, BrowserWindow }, fs, http, path, root, types

### Community 9 - "Captura 01: leitor em Gênesis 1"
Cohesion: 0.25
Nodes (9): Portuguese Bible Text in Archaic Orthography, Book, Chapter and Verse Selector Pills, Floating Next Button (right chevron), Overflow Menu Button, Bible Reader Screen (Play Store Screenshot 01, Genesis 1), Reader Top Bar (search, book, chapter, verse, theme, overflow menu), Search Button, Dark Mode Toggle (moon icon) (+1 more)

### Community 10 - "Captura 03: Salmos 23 claro"
Cohesion: 0.25
Nodes (9): Play Store Screenshot 03: Bible Reader (Salmos 23, Light Theme), Joao Ferreira de Almeida Translation, 1911 Edition, Chapter Reading View with Numbered Verses, More Options Menu Button, Floating Previous and Next Arrow Buttons, Top Bar Book, Chapter and Verse Selectors, Search Button, Moon Icon Theme Toggle (+1 more)

### Community 11 - "Captura 02: João 3 escuro"
Cohesion: 0.29
Nodes (7): Portuguese Bible Text in Archaic Spelling (phariseos, signaes, aquelle), Book / Chapter / Verse Pill Selectors (João, 3, v. 16), Floating Previous / Next Navigation Buttons, Dark Reading Theme (black background, high contrast), Reader Top Bar (search, book, chapter and verse selectors, sun icon, more menu), Play Store Screenshot 02: Bible Chapter Reading Screen (João 3, dark theme), Numbered Verse List (large white text, small gray verse numbers)

### Community 12 - "Banner da Play Store"
Cohesion: 0.33
Nodes (6): App Icon: Dark Bible with Gold Cross and Red Bookmark, Bíblia Almeida 1911 (App Name), Dark Theme (Tema escuro), Play Store Feature Graphic (1024x500), Offline Reading (Leitura offline), Search (Busca)

### Community 13 - "Ícone adaptativo"
Cohesion: 0.50
Nodes (4): Adaptive App Icon (closed Bible on blue-to-warm squircle with white margin), Bible Book Motif (dark navy leather cover, gilded page edges), Gold Christian Cross, Red Ribbon Bookmark

### Community 15 - "Arte da pomba com ramo"
Cohesion: 0.50
Nodes (4): Biblical dove and olive branch symbolism (peace, hope), Blue line-art dove, Pomba Azul com Ramo de Oliveira (logo artwork), Green olive branch with two olives

## Ambiguous Edges - Review These
- `Creative Commons Attribution 4.0 International` → `General Public License (direitos da fonte)`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **33 isolated node(s):** `React Native (Expo) sem WebView`, `App web e API Node + SQLite removidos`, `Versão web para validar a interface (react-native-web)`, `Permissões do Android`, `Adaptive App Icon (closed Bible on blue-to-warm squircle with white margin)` (+28 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 99 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Páginas web React remanescentes` to `Dependências do app Expo`, `Texto bíblico, busca e alterações`, `App, configurações e tema`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Bíblia em Áudio Almeida 1911 (App Android)` (e.g. with `Ficha da Play Store — Bíblia Almeida 1911` and `Política de Privacidade — Bíblia Almeida 1911`) actually correct?**
  _`Bíblia em Áudio Almeida 1911 (App Android)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `React Native (Expo) sem WebView`, `App web e API Node + SQLite removidos`, `Versão web para validar a interface (react-native-web)` to the rest of the system?**
  _33 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dependências do app Expo` be split into smaller, more focused modules?**
  _Cohesion score 0.08735632183908046 - nodes in this community are weakly interconnected._
- **Why does `react-native` connect `Texto bíblico, busca e alterações` to `Dependências do app Expo`, `App, configurações e tema`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Should `Documentação, loja e privacidade` be split into smaller, more focused modules?**
  _Cohesion score 0.1380952380952381 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Creative Commons Attribution 4.0 International` and `General Public License (direitos da fonte)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._