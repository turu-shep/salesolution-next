/**
 * Deliberately empty. This app uses plain CSS (globals.css) — no Tailwind, no
 * PostCSS plugins. The file exists so PostCSS config discovery stops HERE
 * instead of walking up to the repo root and finding the main site's
 * postcss.config.mjs, whose @tailwindcss/postcss plugin is not (and must not
 * be) a dependency of this package.
 */
export default { plugins: {} }
