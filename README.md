# adidas – CHILE20 (Rebuilt 3D WebGL Experience)

Projek ini merupakan hasil *reverse engineering* menyeluruh ke atas laman web rasmi **[adidas – CHILE20](https://adidaschile20.com/)** (Foot Locker x adidas Originals) yang dibangunkan oleh studio kreatif **Active Theory**.

Projek ini mengandungi seluruh aset 3D (geometri Cinema4D, tekstur PBR 4K/8K, normal maps, video stream, audio track, font SDF, dan enjin Hydra WebGL) yang sedia dijalankan secara lokal tanpa sebarang pergantungan luar.

---

## Cara Pantas Menjalankan

1. Jalankan pelayan lokal:
   ```bash
   node server.js
   ```
2. Buka pelayar di:
   ```
   http://localhost:4183
   ```
3. Jalankan suite ujian integriti automatik:
   ```bash
   node test_ui_sweater.js
   ```

---

## Dokumentasi & Analisis Kejuruteraan

Sila baca dokumen **[BEDAH_TEKNIKAL.md](BEDAH_TEKNIKAL.md)** untuk kupasan mendalam tentang:
- Enjin WebGL **Hydra** & multi-threading via WebWorkers
- Enjin Tipografi **GLUI** (Signed Distance Fields / SDF)
- Rangkaian Pasca-Pemprosesan **Nuke / NukePass** (UnrealBloom, Fluids, Shaders)
- Anatomi Geometri 3D Pakaian (Bomber Jacket / Sweater & Tracksuits)
- Konfigurasi Kamera & Pemandangan dalam `uil.json`
- Panduan eksperimen shader dan tekstur kustom
