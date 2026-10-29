# Bíblia em Áudio JFAC 1848

App Android nativo em React Native (Expo), sem WebView. Traz a tradução João Ferreira de Almeida Corrigida de 1848 embutida no app (funciona sem internet), com leitor por livro/capítulo/versículo, busca, tema claro/escuro e tela Sobre.

Esta primeira versão não tem áudio, login nem vídeos. O app web e a API (Node + SQLite) que existiam antes foram removidos desta branch e continuam no histórico do git (branches anteriores, como `ajusteClaude`).

## Estrutura

```
app/            projeto Expo
  App.js        telas Home, Configurações e Sobre, tema, fonte e posição salvos (AsyncStorage)
  src/Config.js tema e tamanho da fonte
  src/Reader.js leitor, busca e navegação
  src/Picker.js seleção de livro, capítulo e versículo
  src/bible.js  acesso ao texto
  assets/biblia.json   texto da Bíblia
```

## Como rodar a versão web (navegador)

Serve para validar a interface rápido, sem celular (usa react-native-web). Requisito: Node.js.

```sh
cd app
npm ci --no-audit --no-fund
npx expo start --web --port 8081
```

Abra http://localhost:8081 no navegador. As alterações no código recarregam sozinhas; `Ctrl+C` encerra o servidor. Pelo Claude Code, o servidor também está configurado em `.claude/launch.json` (nome `web`).

Observação: o visual do `Switch` e da barra de status pode diferir um pouco do Android; a validação final é no aparelho.

## Como compilar e instalar (passo a passo)

Requisitos: Node.js, JDK 17 e Android SDK. No Git Bash do Windows:

```sh
export ANDROID_HOME="$LOCALAPPDATA/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
```

**1. Instalar as dependências** (a pasta `app/node_modules` é recriada)

```sh
cd app
rm -rf node_modules android
npm ci --no-audit --no-fund
```

**2. Gerar o projeto nativo** (cria `app/android`; ele não vai para o git)

```sh
npx expo prebuild --platform android --clean
```

**3. Compilar o APK de release** (só arm64; leva alguns minutos)

```sh
cd android
./gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a
```

Para todas as arquiteturas (APK maior), use o comando completo sem o `-P...`:

```sh
cd android
./gradlew.bat assembleRelease
```

O APK sai em `app/android/app/build/outputs/apk/release/app-release.apk`.

**4. Conectar o celular**

Ative a Depuração USB (Opções do desenvolvedor), conecte o cabo, escolha "Transferência de arquivos" e aceite "Permitir depuração USB?". Confira:

```sh
adb devices -l
```

Se o mesmo aparelho aparecer duas vezes (cabo e Wi-Fi), use o serial do cabo em todos os comandos com `-s SERIAL`, por exemplo `adb -s RQ8RA00QQ9M ...`.

**5. Instalar e abrir** (dentro de `app/android`)

```sh
adb install -r app/build/outputs/apk/release/app-release.apk
adb shell monkey -p com.bibliaudio.app -c android.intent.category.LAUNCHER 1
```

**6. Ver erros no aparelho**

```sh
adb logcat -c
adb logcat -s ReactNativeJS
```

O log mostra `Running "main"` quando o app sobe sem erro. Se fechar logo ao abrir, procure `Abort message` ou `FATAL` com `adb logcat -d | grep -E "FATAL|Abort message"`.

**Atalho (debug, com o celular conectado):** `cd app && npm run prebuild && npm run android` compila a versão debug, instala e abre o app.

Se o Gradle reclamar de versão de Java (`invalid source release`), confira com `java -version` se o JDK ativo é o 17.
