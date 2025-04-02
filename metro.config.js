// metro.config.js

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Customize the resolver's extensions (for source and assets)
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'];
config.resolver.assetExts = ['glb', 'gltf', 'png', 'jpg', 'bin', 'ttf', 'otf'];

// Apply the nativewind transformation (for tailwind CSS-like usage)
module.exports = withNativeWind(config, { input: "./global.css" });
