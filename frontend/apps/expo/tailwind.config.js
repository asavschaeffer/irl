// tailwind.config.js
const tailwindConfig = require('@app-launch-kit/components/tailwind.config.js');
const path = require('path');

const toPosix = (p) => p.replace(/\\/g, '/');
const here = (...p) => toPosix(path.join(__dirname, ...p));

module.exports = {
  ...tailwindConfig,
  darkMode: process.env.DARK_MODE ? process.env.DARK_MODE : 'media',
  // Use absolute (posix) globs so NativeWind's "infinite loop" guard doesn't
  // mistakenly match its own generated output on Windows.
  content: [
    here('components/**/*.{js,ts,jsx,tsx,mdx}'),
    here('app/**/*.{js,ts,jsx,tsx,mdx}'),
    here('stories/**/*.{js,ts,jsx,tsx,mdx}'),
    here('assets/**/*.{js,ts,jsx,tsx,svg}'),

    // Monorepo shared packages
    here('../../packages/components/**/*.{js,ts,jsx,tsx}'),
    here('../../packages/modules/**/*.{js,ts,jsx,tsx}'),
    here('../../packages/utils/**/*.{js,ts,jsx,tsx}'),
    here('../../packages/config/**/*.{js,ts,jsx,tsx}'),
    here('../../packages/assets/**/*.{js,ts,jsx,tsx,svg,png,jpg,jpeg,webp}'),
  ],
  presets: [require('nativewind/preset')],
  safelist: [
    {
      pattern:
        /(bg|border|text|stroke|fill)-(primary|secondary|tertiary|error|success|warning|info|typography|outline|background)-(0|50|100|200|300|400|500|600|700|800|900|950|white|gray|black|error|warning|muted|success|info|toast|light|dark)/,
    },
    'flex-1',
    'overflow-hidden',
    'bg-[#fff]',
    'bg-[#121212]',
    'h-full',
    'w-full',
    'hidden',
    'md:flex',
    'md:pt-10',
    'md:pb-8',
    'md:rounded-sm',
    'md:px-[140px]',
    'md:mt-16',
    'md:max-w-[372px]',
  ],
};
