// Marca recursos de hardware implícitos como opcionais, para não restringir
// a disponibilidade do app na Play Store (ex.: android.hardware.screen.portrait,
// que o Play deduz de screenOrientation="portrait").
const { withAndroidManifest } = require('@expo/config-plugins');

const OPCIONAIS = ['android.hardware.screen.portrait'];

module.exports = (config) =>
  withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    const features = (manifest['uses-feature'] = manifest['uses-feature'] || []);
    for (const name of OPCIONAIS) {
      const existente = features.find((f) => f.$['android:name'] === name);
      if (existente) existente.$['android:required'] = 'false';
      else features.push({ $: { 'android:name': name, 'android:required': 'false' } });
    }
    return cfg;
  });
