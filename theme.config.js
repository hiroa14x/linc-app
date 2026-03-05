/** @type {const} */
const themeColors = {
  // LINC風の明るく親しみのある配色
  primary: { light: '#3959cc', dark: '#5d77d5' },      // LINC Blue 500
  sub: { light: '#8296df', dark: '#a3b3e8' },          // LINC Blue 300
  accent: { light: '#da3170', dark: '#e87da5' },       // LINC Pink 500
  background: { light: '#ffffff', dark: '#151718' },   // 白背景
  surface: { light: '#f0f2fc', dark: '#1e2022' },      // LINC Blue 100（薄い青）
  foreground: { light: '#32353a', dark: '#ECEDEE' },   // Text Main
  muted: { light: '#686a6d', dark: '#9BA1A6' },        // Text Sub
  border: { light: '#E5E7EB', dark: '#334155' },
  success: { light: '#27cc91', dark: '#4ADE80' },      // LINC Green
  warning: { light: '#ffa11a', dark: '#FBBF24' },      // LINC Orange
  error: { light: '#e32e55', dark: '#F87171' },        // LINC Red
};

module.exports = { themeColors };
