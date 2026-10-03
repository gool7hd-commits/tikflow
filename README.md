# TikFlow – TikTok LIVE Otomasyon Merkezi

TikFlow, TikTok canlı yayıncıları için geliştirilmiş, TikFinity benzeri, tam özellikli ve yüksek performanslı bir masaüstü otomasyon merkezidir.

Yayıncılar şifre girmeksizin yalnızca TikTok kullanıcı adını yazarak canlı yayınlarına bağlanır; hediye, yorum, beğeni, takip ve paylaşım gibi olaylar gerçekleştiğinde kendi video editlerini, ses efektlerini ve animasyonlarını OBS Studio / TikTok LIVE Studio ekranında sıfır gecikmeyle oynatır.

---

## 🌟 Öne Çıkan Özellikler

1. **Entegre TikTok Hediye Kataloğu (~560+ Hediye)**:
   - Gerçek TikTok hediye görselleri (CDN), jeton değerleri ve Türkçe eşlemeleri (Holiday Universe, Aslan, Gül, Galaksi vb.).
   - Her hediye kartından tek tıkla kural veya edit bağlama.
2. **Doğrudan TikTok Bağlantısı**:
   - Kullanıcı adını girince anında bağlanma ve anlık izleyici sayısı.
   - Detaylı hata teşhisi ("Kullanıcı bulunamadı", "Yayın kapalı", "Rate limit" vb.).
   - Hediye serilerini (streak) hatasız sayma ve mükerrer hediye filtreleme.
3. **Tek Link Overlay Mimarisi (`http://localhost:21420/overlay`)**:
   - Dikey (1080×1920) veya Yatay (1920×1080) yayın modları.
   - OBS ve TikTok LIVE Studio için tek bir Browser Source / Bağlantı linki yeterlidir.
   - Şeffaf arka plan, CSS transform ölçekleme ile her ekrana tam uyum.
4. **11 Entegre Canlı Widget**:
   - Edit / Video Oynatıcı (MP4, WebM şeffaf alfa kanal, MOV, GIF)
   - Ses Oynatıcı (MP3, WAV efektleri)
   - Dinamik Uyarı Kutusu (Alert Banner)
   - Canlı Sohbet (Chat) Akışı
   - Hedef Çubuğu (Beğeni / Takip / Jeton)
   - Beğeni & Jeton Sayaçları
   - Hediye Lider Tablosu (Top 5 Destekçi)
   - Son Takipçi & Son Hediye Kayan Bandı
   - Canlı İzleyici Sayacı
   - Özel Metin / Logo Widget'ı
   - TTS (Metin Seslendirme) Göstergesi
5. **Canlı Canvas Editörü (Yayın Ekranı)**:
   - 1080×1920 önizleme tuvali.
   - Widget'ları sürükleyin, boyutlandırın, opaklık ve döndürme verin.
   - 9-noktalı hızlı konum ızgarası (Sol Üst, Merkez, Sağ Alt vb.).
   - Kaydettiğiniz anda OBS ekranı canlı olarak güncellenir.
6. **Şeffaf Masaüstü Penceresi**:
   - OBS gerektirmeden masaüstünüzün veya oyununuzun üstünde şeffaf pencere açar.
   - "Tıklamaları Arkaya Geçir" (click-through) özelliği ile oyun kontrollerini engellemez.
7. **Hızlı Test Paneli (Simülatör)**:
   - Tüm hediyeleri, chat yorumlarını, beğenileri gerçek olay hattından test edin.

---

## 🛠️ Kurulum ve Çalıştırma

### Hazır `.exe` İle Başlatmak
Klasördeki şu dosyaya çift tıklayarak anında açabilirsiniz:
```text
dist-electron\win-unpacked\TikFlow.exe
```

### Terminal Üzerinden Çalıştırma
```powershell
# Web ve geliştirici sunucusu:
npm run dev:web

# Masaüstü uygulaması:
npm run dev

# Windows kurulum ve taşınabilir exe üretimi:
npm run build
```

---

## 🎥 OBS Studio ve TikTok LIVE Studio Kurulumu

### OBS Studio Kurulumu
1. OBS Studio'da **Kaynaklar (Sources)** bölümünden **`+` -> Tarayıcı (Browser)** seçin.
2. URL: `http://localhost:21420/overlay`
3. **Genişlik (Width):** `1080`
4. **Yükseklik (Height):** `1920`
5. **Tamam**'a basın.

### TikTok LIVE Studio Kurulumu
1. **Kaynak Ekle** butonuna basın.
2. **Bağlantı / Link** kaynağını seçin.
3. URL alanına `http://localhost:21420/overlay` yapıştırın.
4. Çözünürlüğü `1080 x 1920` olarak ayarlayın.
