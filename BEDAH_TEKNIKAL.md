# Bedah Seni & Kejuruteraan 3D WebGL: adidas CHILE20 (Sweater & Tracksuit)

Dokumen ini membedah secara menyeluruh reka bentuk sistem, seni bina WebGL 3D bertaraf AAA, enjin *rendering*, *shaders*, serta mekanik interaktif laman web rasmi **[adidas – CHILE20](https://adidaschile20.com/)** (kolaborasi adidas Originals & Foot Locker). Seluruh projek telah di-*reverse engineer* menggunakan skil **REA** (*Reverse Engineering Anything*) dan dibina semula ke dalam direktori `ui-sweater`.

---

## 1. Ringkasan Seni Bina (Architecture Overview)

Laman web ini dibangunkan oleh studio kreatif digital tersohor dunia, **Active Theory** (*Awwwards Studio of the Year*). Berbeza dengan laman web e-dagang konvensional berasaskan DOM HTML atau canvas video rendering biasa, adidas CHILE20 ialah sebuah **persekitaran 3D masa-nyata penuh (Real-time 3D WebGL Metaverse)** di mana pakaian (Bomber Jacket / Sweater dan Tracksuit) serta tiga alam persekitarannya dipaparkan sebagai model poligon 3D dinamik dengan pencahayaan PBR (*Physically Based Rendering*).

```
┌────────────────────────────────────────────────────────────────────────┐
│  ACTIVE THEORY "HYDRA" 3D WEBGL ARCHITECTURE                           │
├────────────────────────────────┬───────────────────────────────────────┤
│  HYDRA ENGINE RUNTIME          │  GLUI (GPU ACCELERATED UI)            │
│  - WebGL Renderer (FBO & RT)   │  - SDF Font Engine (URW DIN / adineue)│
│  - Camera Controller & Lerp    │  - GPU Batch Text & Interactive Quads │
│  - Multi-thread Worker Pool    │  - Dynamic 2D/3D Stage Transforms     │
├────────────────────────────────┼───────────────────────────────────────┤
│  NUKE POST-PROCESSING PIPELINE │  SCENELAYOUT & UIL SYSTEM             │
│  - UnrealBloom & Fluid FBO     │  - 8,880+ Key Config Nodes (`uil.json`)│
│  - Screen Space Displacement   │  - PBR Shader Maps (Normal / MRO)     │
│  - Modular GLSL Compiled VS/FS │  - Video Texture Streaming (MP4)      │
└────────────────────────────────┴───────────────────────────────────────┘
```

### Stack Teknologi Teras:
* **Enjin WebGL:** **Hydra** (Proprietary Creative WebGL Framework oleh Active Theory).
* **WebGL UI Engine:** **GLUI** (*WebGL User Interface*) — teks, tipografi, butang, dan susun atur visual dirender terus di atas lapisan WebGL menggunakan *Signed Distance Field* (SDF).
* **Multi-threading:** **WebWorkers** (`hydra-thread.js` & `GeomThread`) untuk memproses geometri 3D yang berat di luar *main UI thread*.
* **Enjin Pasca-Pemprosesan (Post-Processing):** **Nuke** & **NukePass** (Active Theory Compositor dengan UnrealBloom, FXAA, Fluids, Displacement, Chromatic Aberration).
* **Shaders & Bahan:** `compiled.vs` (fail monolitik mengandungi 6,600+ baris kod GLSL untuk vertex & fragment shaders, pencahayaan PBR, matcap, dan blend modes).
* **Format Geometri 3D:** Format JSON modular berketumpatan tinggi (diekstrak daripada Cinema4D), dipecahkan mengikut bahagian pakaian (*front*, *back*, *arms*, *detail*, *buttons*).
* **Tekstur PBR:** Normal Maps 8K/4K (`_Normal_closeup.png`), Baked Occlusion (`_baked_closeup.png`), dan MRO (*Metallic-Roughness-Occlusion*) composite channels.
* **Audio Interaktif:** `AudioController` dengan fail muzik latar `main-optimized.mp3` dan kawalan audio 3D.
* **Tekstur Video:** `VideoTexture` memetakan video MP4 (`world1.mp4`, `world2.mp4`, `world3.mp4`) terus ke atas skrin monitor 3D di dalam alam maya.

---

## 2. Bedah Struktur 3D & Anatomi Pakaian (Sweater & Tracksuit)

Visual teras pengalaman ini tertumpu pada pakaian berteknologi tinggi adidas CHILE20:

### A. Bomber Jacket (The Signature Sweater / Jacket)
* **Geometri Modular:**
  - `assets/geometry/bomberjacket/closed/front.json` (~1.0 MB)
  - `assets/geometry/bomberjacket/closed/back.json` (~1.7 MB)
  - `assets/geometry/bomberjacket/closed/arms.json` (~1.6 MB)
  - `assets/geometry/bomberjacket/closed/detail.json` (~1.3 MB)
  - `assets/geometry/bomberjacket/closed/buttons.json` (~81 KB)
* **Tekstur PBR & Efek Wet-Look:**
  - **Format GPU-Compressed KTX (DXT & ASTC):** Enjin Hydra menggunakan fail mampatan perkakasan GPU `*-dxt.ktx` (S3TC) pada Desktop dan `*-astc.ktx` pada Mobile untuk memuatkan peta normal, MRO, dan baked lighting secara instan ke dalam VRAM GPU tanpa sebarang *decoding overhead*.
  - `arms_Normal_closeup.png` / `arms_Normal_closeup-dxt.ktx` (tekstur ultra tinggi memaparkan lipatan fabrik nilon kalis cuaca).
  - `front_Normal_closeup.png` & `back_Normal_closeup.png`.
  - `front_MRO_low-dxt.ktx` & `arms_MRO_optimized-dxt.ktx` mengawal pantulan kilauan (*wet-look specular sheen*) di bawah pancaran lampu neon.
  - Lapisan *matcap* khas (`matcap.png`) menghasilkan refleksi bayang sekeliling yang licin.

### C. Analisis Punca Model 3D Tidak Keluar & Penyelesaian (QA Deep-Dive)
Semasa audit kualiti (QA) dan perbandingan dengan laman rujukan asal:
1. **Ralat Sentry:** Skrip mengandungi panggilan `Sentry.configureScope(...)` untuk merekod GPU WebGL capabilities. Apabila Sentry di-mock tanpa fungsi `configureScope`, ralat `TypeError: Sentry.configureScope is not a function` telah mematikan rantaian *Promise* pemulaan (*bootstrap*). Ini telah diperbaiki dengan *safe mock* yang menyokong `configureScope`, `setExtra`, dan `setTag`.
2. **Pengepala & Pemuatan KTX Textures:** Enjin Hydra secara lalai memanggil fungsi `decodeCompressedImage(data, id)` yang mencari fail `${data.path}/${fileName}-${ext}.ktx`. Kegagalan memuatkan KTX menyebabkan fungsi tersebut melempar ralat `throw "Image not found"`. Sebanyak **286 fail KTX** telah dimuat turun dan pelayan `server.js` dikemaskini dengan sokongan MIME type `image/ktx`.
3. **Mekanik Navigasi & Tatalan Model 3D:** Model 3D Sweater terletak di alam **World 2** (`world_2_section_product` / laluan `/bomber/1`). Apabila berada di skrin utama (`stripes`), model 3D dipaparkan pada jalur tengah, dan tatalan ke bawah (`scroll > 500px`) akan membesarkan sweater ke tengah skrin dengan nisbah skala `1.2x` lengkap dengan interaksi putaran 360 darjah.

### B. Tracksuit (Black & White Variants)
* **Geometri Modular:**
  - `assets/geometry/tracksuit/updated/front.json` (~1.66 MB)
  - `assets/geometry/tracksuit/updated/back.json` (~1.70 MB)
  - `assets/geometry/tracksuit/updated/arms.json` (~1.18 MB)
  - `assets/geometry/tracksuit/updated/detail.json` (~1.44 MB)
* **Tekstur & Shading Dwitona:**
  - Dilengkapi set tekstur untuk versi hitam (*Black*) dan putih (*White*), contohnya `arms_white_baked_closeup.png` dan `back_white_baked_closeup.png`.
  - Shader fabrik menggunakan algoritma fresnel untuk meniru kelembutan lapisan dalaman berus (*soft-brushed lining*).

---

## 3. Tiga Alam Maya Interaktif (The 3 Worlds)

Laman web dibahagikan kepada 3 alam (*worlds*) dengan tema dan objek 3D interaktif tersendiri:

| Alam | Tema Visual | Objek 3D Unik & Interaksi | Tekstur Video |
|---|---|---|---|
| **World 1: Street Wet-Look** | Malam bandar, aspal basah, pencahayaan gelap & dramatik | Bola bola keranjang bertekstur PBR (`ball.json`), lantai basah bertabur lopak air | `world1.mp4` |
| **World 2: Skate Culture** | Garisan merah cergas, lantai hangar industri | Skateboard 3D interaktif lengkap papan & roda (`deck.json`, `wheels.json`) | `world2.mp4` |
| **World 3: The Music Studio** | Makmal bunyi futuristik, estetika perak/logam | Pembesar suara 3D (`speaker2.json`), meja konsol DJ (`table-optimized.json`), skrin hologram | `world3.mp4` |

---

## 4. Bedah Enjin GLUI & Tipografi SDF (Signed Distance Fields)

Untuk memastikan prestasi 60 FPS tanpa pergeseran DOM (*DOM reflow*), Active Theory tidak menggunakan teks HTML standard untuk tajuk dan elemen HUD. Sebaliknya:
1. **Font SDF (Signed Distance Field):**
   - Fon rasmi **URW DIN** (*Thin, Light, Medium, Demi*) dan **adineue PRO** ditukarkan kepada tekstur bitmap SDF berserta koordinat metrik JSON (`URWDIN-Medium.json` + `URWDIN-Medium.png`).
   - Shader teks membaca kecerunan jarak (*distance gradient*) daripada tekstur PNG, membolehkan teks dibesarkan ke sebarang saiz pada skrin 4K tanpa pecah mahupun kabur.
2. **GLUIStage & Batching:**
   - Semua butang, kursor seret (*drag*), ikon navigasi, dan petunjuk skrol digabungkan ke dalam penimbal (*draw call batching*) yang dirender serentak dalam satu *render pass*.

---

## 5. Pasca-Pemprosesan Nuke & Kompositor Shader (`compiled.vs`)

Semua shader digabungkan dalam format penanda khusus `{@}ShaderName.ext{@}`:
* **Antimatter Pipeline:** Pengiraan zarah dan kedudukan objek dalam ruang tekstur FBO (`AntimatterCopy`, `AntimatterPosition`).
* **UnrealBloom:** Menghasilkan kilauan neon terang pada garisan pakaian dan pantulan lantai basah.
* **Fluid Dynamics:** Simulasi zarah cecair dan wap kabus (`steam.png`, `clouds.jpg`, `noise.png`).
* **Color Grading & LUT:** Menggunakan tekstur pemetaan warna 3D `lut.png` untuk mendapatkan tona sinematik.

---

## 6. Cara Menjalankan & Bereksperimen Secara Lokal

Semua kod, enjin Hydra, shaders, fail konfigurasi `uil.json`, font SDF, video MP4, audio MP3, model 3D poligon tinggi, dan 325+ tekstur PBR telah lengkap dimuat turun dan distrukturkan ke dalam direktori:
`c:\Users\USER\Desktop\ui-gempak\ui-sweater`

### Langkah Menjalankan:

1. Buka terminal (PowerShell atau Command Prompt) di dalam folder `ui-sweater`:
   ```powershell
   cd c:\Users\USER\Desktop\ui-gempak\ui-sweater
   ```

2. Jalankan pelayan web tempatan:
   ```powershell
   node server.js
   ```

3. Buka pelayar web anda di:
   **`http://localhost:4183`**

4. Untuk menjalankan suite ujian pengesahan automatik:
   ```powershell
   node test_ui_sweater.js
   ```
   *(Semua 70 ujian pengesahan HTML, Shader, 3D Geometri, PBR Tekstur, KTX Magic Bytes, Video, Audio, dan HTTP Range Requests disahkan 100% LULUS).*

---

## 7. Bedah Pepijat Khusus: Isu "White Tracksuit Torso Hitam" & Pemampatan KTX Gzip

Semasa ujian QA dan perbandingan dengan laman rujukan asal (`https://adidaschile20.com/white-tracksuit/1`), satu anomali visual ditemui di mana bahagian hadapan baju *white tracksuit* menjadi hitam pekat (seperti dalam tangkapan skrin yang dimaklumkan).

### Punca Terperinci (Root Cause):
1. **CloudFront Gzip vs Binary Stream:** Apabila fail tekstur KTX dimuat turun daripada CDN AWS / CloudFront dengan pengepala `Accept-Encoding: gzip`, pelayan CDN menghantar fail dalam format kompresi gzip (`1F 8B 08 00`).
2. **KTX Header Corruption:** Format Khronos KTX 1.1 memerlukan pengepala *magic identifier* tetap 12-bait:
   `\xABKTX 11\xBB\r\n\x1A\n` (`AB 4B 54 58 20 31 31 BB 0D 0A 1A 0A`).
3. **Integer Overflow dalam Parser Hydra:** Apabila enjin Hydra (`app.js`) cuba membaca bait resolusi lebar dan tinggi pada *fixed binary offset* daripada fail yang masih berformat gzip, nilai dimensi yang terhasil menjadi negatif (`width: -1610960588`), menyebabkan pengagihan tekstur GPU WebGL gagal (`texture: false`) dan shader memaparkan bahagian dada baju sebagai warna hitam sifar (`vec4(0.0, 0.0, 0.0, 1.0)`).
4. **Penyelesaian Menyeluruh:** Skrip `zlib.gunzipSync` telah dijalankan ke atas kesemua 38 fail KTX yang terjejas merentasi model *tracksuit*, *bomber jacket*, dan persekitaran studio 3D. Kini semua tekstur KTX mempunyai pengepala sah Khronos KTX 1.1 dan render tekstur fabrik putih, logo Trefoil merah, serta sulaman 3-stripes dipaparkan dengan sempurna 100% sama seperti tapak asal!

---

## 8. Idea & Panduan Eksperimen untuk Anda

* **Eksperimen Kamera & Sudut Pandang:** Ubah suai nilai kamera di dalam `assets/data/uil.json` (seperti `fov`, `position`, `lerpSpeed`, `deltaRotate`) untuk menukar sudut putaran 3D sweater.
* **Eksperimen Shader:** Buka `assets/shaders/compiled.vs` dan cari blok `{@}PBR.fs{@}` atau `{@}UnrealBloom.fs{@}` untuk menukar keamatan kilauan neon atau warna pantulan.
* **Tukar Tekstur PBR Sendiri:** Gantikan imej `front_baked_closeup.png` atau `front_Normal_closeup.png` di dalam `assets/images/bomberjacket/closed/` dengan rekaan grafik atau logo anda sendiri untuk melihat ia diaplikasikan secara dinamik pada model 3D sweater!
