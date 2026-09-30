# 考場互動筆記

[開啟互動地圖](https://joannecucumber.github.io/driving-notes/)

可直接用瀏覽器開啟 `index.html`，不需安裝。執行 `node build.mjs` 可產生含底圖與程式的 `考場互動筆記.html` 單檔版，方便離線分享。

## 使用

- 滑鼠移到地圖編號上顯示注意事項，離開後收起。
- 點擊編號固定閱讀，再次點擊、點空白處、按關閉鈕或 Esc 收起。
- 手機輕點編號；所有標記也支援鍵盤 Tab、Enter 與 Escape。
- 右側／下方筆記清單可定位對應標記。
- 「放大地圖」提供較大的地圖，可橫向與縱向捲動。
- 「顯示標記」可切換純地圖。

## 調整與重建

`notes.js` 儲存 18 組個人練習筆記，`x` / `y` 為原圖左上角起算的百分比。`map.png` 採用右側直線走道為完整鋪面的版本。筆記編號不是駕駛順序。

編輯 `notes.js`、`style.css` 或 `app.js` 後，可直接開啟 `index.html` 預覽；以 `node build.mjs` 更新單檔版。使用原生 HTML / CSS / JavaScript，無外部服務、追蹤或執行期套件。

GitHub Pages 從 `main` 分支的根目錄發布，推送更新後會自動重新部署。
