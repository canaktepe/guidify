console.log("[Background] Script yüklendi");

// Global state
const pendingDownloads = new Map();
let listenerAdded = false;

// Lazy listener - sadece gerektiğinde ekle
function ensureListener() {
  if (listenerAdded) return;

  listenerAdded = true;
  console.log("[Background] onChanged listener ekleniyor");

  chrome.downloads.onChanged.addListener((delta) => {
    console.log("[Background] onChanged tetiklendi, delta.id:", delta.id, "Map size:", pendingDownloads.size);
    console.log("[Background] Map keys:", Array.from(pendingDownloads.keys()));

    const pending = pendingDownloads.get(delta.id);

    if (!pending) {
      console.log("[Background] Bu bizim indirmemiz değil (ID bulunamadı)");
      return;
    }

    console.log("[Background] Bizim indirmemiz bulundu! Delta:", JSON.stringify(delta, null, 2));

    // Dosya adı değişikliğini yakala
    if (delta.filename) {
      console.log("[Background] delta.filename mevcut:", delta.filename);
      if (delta.filename.current) {
        const newName = delta.filename.current.split(/[\\/]/).pop();
        console.log("[Background] Dosya adı güncellendi:", pending.filename, "->", newName);
        pending.filename = newName;
      }
    }

    // İndirme tamamlandı
    if (delta.state?.current === "complete") {
      console.log("[Background] İndirme tamamlandı, final dosya adı:", pending.filename);
      pending.sendResponse({ ok: true, downloadId: delta.id, filename: pending.filename });
      pendingDownloads.delete(delta.id);
    } else if (delta.state?.current === "interrupted") {
      console.log("[Background] İndirme kesildi");
      pending.sendResponse({ ok: false, error: "Download interrupted" });
      pendingDownloads.delete(delta.id);
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Background] Mesaj alındı:", message?.type);

  if (message?.type !== "download-guids") {
    console.log("[Background] Bu bizim mesajımız değil, atlanıyor");
    return;
  }

  console.log("[Background] download-guids mesajı işleniyor");

  const {
    text,
    filename = "guids.txt",
    saveAs = true
  } = message;

  const respondError = (error) => {
    console.log("[Background] Hata oluştu:", error);
    sendResponse({ ok: false, error: error || "unknown error" });
  };

  try {
    console.log("[Background] Data URL oluşturuluyor, text length:", text?.length);

    // Service worker'da URL.createObjectURL yok, data URL kullanmalıyız
    const base64 = btoa(unescape(encodeURIComponent(text)));
    const dataUrl = `data:text/plain;base64,${base64}`;
    console.log("[Background] Data URL oluşturuldu, length:", dataUrl.length);

    // Listener'ı ekle (ilk kez)
    ensureListener();

    console.log("[Background] chrome.downloads.download çağrılıyor, filename:", filename, "saveAs:", saveAs);
    chrome.downloads.download(
      {
        url: dataUrl,
        filename,
        saveAs
      },
      (downloadId) => {
        console.log("[Background] Callback çağrıldı, downloadId:", downloadId, "lastError:", chrome.runtime.lastError);

        if (chrome.runtime.lastError || !downloadId) {
          respondError(chrome.runtime.lastError?.message || "Download cancelled");
          return;
        }

        console.log("[Background] İndirme başlatıldı, ID:", downloadId, "varsayılan dosya adı:", filename);

        // Map'e ekle - artık ID'miz var
        pendingDownloads.set(downloadId, {
          filename,
          sendResponse
        });

        console.log("[Background] Map'e eklendi, ID:", downloadId, "Map size:", pendingDownloads.size);
      }
    );
    console.log("[Background] chrome.downloads.download çağrısı yapıldı, callback bekleniyor");
  } catch (error) {
    console.log("[Background] Try-catch hatası:", error);
    respondError(error?.message || String(error));
  }

  // keep the message channel open for async response
  console.log("[Background] return true - async response için kanal açık tutuluyor");
  return true;
});
