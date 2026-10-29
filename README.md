# Bíblia em Áudio JFAC 1848

App Android nativo em React Native (Expo), sem WebView. Traz a tradução João Ferreira de Almeida Corrigida de 1848 embutida no app (funciona sem internet), com leitor por livro/capítulo/versículo, busca, tema claro/escuro e tela Sobre.

Esta primeira versão não tem áudio, login nem vídeos. O app web e a API (Node + SQLite) que existiam antes foram removidos desta branch e continuam no histórico do git (branches anteriores, como `ajusteClaude`).

## Estrutura

```
app/            projeto Expo
  App.js        telas Home e Sobre, tema e posição salvos (AsyncStorage)
  src/Reader.js leitor, busca e navegação
  src/Picker.js seleção de livro, capítulo e versículo
  src/bible.js  acesso ao texto
  assets/biblia.json   texto da Bíblia
```

## Como rodar

Requisitos: Node.js, JDK 17 e Android SDK (variável `ANDROID_HOME`).

```sh
cd app
npm ci
npm run prebuild   # gera app/android (nativo)
```

**Celular conectado por cabo** (depuração USB ativada):

```sh
npm run android    # compila a versão debug, instala e abre o app
```

**Gerar o APK de release** (arm64):

```sh
cd app/android
./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
# APK: app/android/app/build/outputs/apk/release/app-release.apk
adb install -r app/build/outputs/apk/release/app-release.apk
```

Todas as arquiteturas: rode o `gradlew` sem o `-P`. Com mais de um dispositivo no `adb` (cabo e Wi-Fi), use `adb -s SERIAL install ...`.

Para ver erros no aparelho: `adb logcat -s ReactNativeJS`.
