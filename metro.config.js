const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Necessário para expo-sqlite funcionar na web (usa SQLite via WebAssembly)
config.resolver.assetExts.push('wasm');

module.exports = config;
