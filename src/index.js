// 使用 ES Module 語法的範例
export default {
  async fetch(req) {
    const cssFile = await fetch('path/to/your/index.css');
    const cssContent = await cssFile.text();

    return new Response(cssContent, {
      headers: { 'Content-Type': 'text/css' },
    });
  },
};
