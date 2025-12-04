addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 從 Worker 中讀取 index.css 靜態檔案
  const cssFile = await fetch('index.css')  // 確保路徑正確
  const cssContent = await cssFile.text()    // 讀取 CSS 檔案的內容

  // 返回 CSS 內容並設置正確的 Content-Type
  return new Response(cssContent, {
    headers: { 'Content-Type': 'text/css' }
  })
}
