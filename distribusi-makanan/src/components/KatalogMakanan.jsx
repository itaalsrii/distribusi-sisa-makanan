import React, { useState, useEffect } from 'react';
import { colors } from '../theme';

const KEY_MAKANAN = 'surplus_makanan';
const KEY_KLAIM = 'surplus_klaim';
const KEY_PEMBAYARAN = 'surplus_pembayaran';
const MAKS_FOTO = 2 * 1024 * 1024; // 2MB
const OPSI_KATEGORI = ['Makanan Berat', 'Makanan Ringan', 'Roti & Kue', 'Minuman', 'Lainnya'];
const OPSI_JENIS = ['Gratis (100% Free)', 'Berbayar (Harga Murah)'];
const BANKS = ['BCA', 'BNI', 'BRI', 'Mandiri'];

function bacaList(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// data pembayaran disimpan sebagai object: { "nama mitra": { virtualAccount, qris } }
function bacaObjek(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

const samaNama = (a, b) =>
  String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

const kunciMitra = (nama) => String(nama || '').trim().toLowerCase();

// porsi yang sudah diklaim = semua klaim makanan ini yang tidak ditolak (rumus sama dengan halaman penerima)
const hitungTerklaim = (klaim, idMakanan) =>
  klaim
    .filter((k) => k.idMakanan === idMakanan && k.status !== 'Ditolak')
    .reduce((total, k) => total + Number(k.jumlah || 0), 0);

const formAwal = {
  makanan: '',
  kategori: OPSI_KATEGORI[0],
  jenis: OPSI_JENIS[0],
  porsi: '',
  harga: '',
  jam: '',
  alamat: '',
  deskripsi: ''
};

const vaAwal = { BCA: '', BNI: '', BRI: '', Mandiri: '' };

export default function KatalogMakanan({ namaMitra }) {
  const [semuaMakanan, setSemuaMakanan] = useState(() => bacaList(KEY_MAKANAN));
  const [semuaKlaim, setSemuaKlaim] = useState(() => bacaList(KEY_KLAIM));
  const [modal, setModal] = useState(null); // null | 'form' | 'hapus' | 'bayar'
  const [editId, setEditId] = useState(null); // null = tambah baru, angka = edit
  const [itemHapus, setItemHapus] = useState(null);
  const [form, setForm] = useState(formAwal);
  const [gambar, setGambar] = useState(null);
  const [inputKey, setInputKey] = useState(0); // buat reset input file
  const [error, setError] = useState('');

  // state pengaturan pembayaran
  const [vaForm, setVaForm] = useState(vaAwal);
  const [qris, setQris] = useState(null);
  const [qrisInputKey, setQrisInputKey] = useState(0);
  const [errorBayar, setErrorBayar] = useState('');

  // klaim baru dari halaman penerima ikut mengubah sisa stok
  useEffect(() => {
    const muat = () => {
      setSemuaKlaim(bacaList(KEY_KLAIM));
      setSemuaMakanan(bacaList(KEY_MAKANAN));
    };
    window.addEventListener('storage', muat);
    window.addEventListener('surplus-claims-updated', muat);
    return () => {
      window.removeEventListener('storage', muat);
      window.removeEventListener('surplus-claims-updated', muat);
    };
  }, []);

  // tiap Mitra hanya lihat makanan miliknya, terbaru di atas
  const makananMitra = semuaMakanan
    .filter((m) => samaNama(m.restoran, namaMitra))
    .reverse();

  const berbayar = form.jenis === OPSI_JENIS[1];

  const simpanKeStorage = (data) => {
    localStorage.setItem(KEY_MAKANAN, JSON.stringify(data));
    window.dispatchEvent(new Event('surplus-makanan-updated'));
    setSemuaMakanan(data);
  };

  const bukaTambah = () => {
    setForm(formAwal);
    setGambar(null);
    setEditId(null);
    setError('');
    setInputKey((k) => k + 1);
    setModal('form');
  };

  const bukaEdit = (m) => {
    setForm({
      makanan: m.makanan,
      kategori: m.kategori || OPSI_KATEGORI[0],
      jenis: m.harga > 0 ? OPSI_JENIS[1] : OPSI_JENIS[0],
      porsi: String(m.porsi),
      harga: m.harga > 0 ? String(m.harga) : '',
      jam: m.jam || '',
      alamat: m.alamat || '',
      deskripsi: m.deskripsi || ''
    });
    setGambar(m.gambar || null);
    setEditId(m.id);
    setError('');
    setInputKey((k) => k + 1);
    setModal('form');
  };

  const bukaBayar = () => {
    const tersimpan = bacaObjek(KEY_PEMBAYARAN)[kunciMitra(namaMitra)] || {};
    setVaForm({ ...vaAwal, ...(tersimpan.virtualAccount || {}) });
    setQris(tersimpan.qris || null);
    setErrorBayar('');
    setQrisInputKey((k) => k + 1);
    setModal('bayar');
  };

  const tutupModal = () => {
    setModal(null);
    setItemHapus(null);
    setError('');
    setErrorBayar('');
  };

  const ubahField = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const pilihFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG, PNG, dll).');
      setInputKey((k) => k + 1);
      return;
    }
    if (file.size > MAKS_FOTO) {
      setError('Ukuran foto maksimal 2MB.');
      setInputKey((k) => k + 1);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setGambar(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const ubahVA = (bank, nilai) => {
    setVaForm({ ...vaForm, [bank]: nilai });
    setErrorBayar('');
  };

  const pilihQris = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorBayar('File QRIS harus berupa gambar (JPG, PNG, dll).');
      setQrisInputKey((k) => k + 1);
      return;
    }
    if (file.size > MAKS_FOTO) {
      setErrorBayar('Ukuran gambar QRIS maksimal 2MB.');
      setQrisInputKey((k) => k + 1);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setQris(reader.result);
      setErrorBayar('');
    };
    reader.readAsDataURL(file);
  };

  const simpanBayar = (e) => {
    e.preventDefault();

    // nomor VA boleh kosong, tapi kalau diisi harus angka saja (8-20 digit)
    const bersih = {};
    for (const bank of BANKS) {
      const nilai = String(vaForm[bank] || '').replace(/\s/g, '');
      if (nilai && !/^[0-9]{8,20}$/.test(nilai)) {
        setErrorBayar(`Nomor VA ${bank} harus berupa angka 8 sampai 20 digit.`);
        return;
      }
      bersih[bank] = nilai;
    }

    try {
      // baca ulang dulu supaya tidak menimpa data Mitra lain / tab lain
      const semua = bacaObjek(KEY_PEMBAYARAN);
      semua[kunciMitra(namaMitra)] = { virtualAccount: bersih, qris: qris };
      localStorage.setItem(KEY_PEMBAYARAN, JSON.stringify(semua));
      window.dispatchEvent(new Event('surplus-pembayaran-updated'));
      tutupModal();
    } catch {
      setErrorBayar('Gagal menyimpan, penyimpanan browser penuh. Coba pakai gambar QRIS yang lebih kecil.');
    }
  };

  const simpan = (e) => {
    e.preventDefault();

    if (!form.makanan.trim() || !form.alamat.trim() || !form.jam) {
      setError('Nama makanan, batas jam ambil, dan lokasi wajib diisi.');
      return;
    }
    if (!(Number(form.porsi) > 0)) {
      setError('Jumlah porsi harus lebih dari 0.');
      return;
    }
    if (berbayar && !(Number(form.harga) > 0)) {
      setError('Isi harga per porsi untuk makanan berbayar.');
      return;
    }

    // jangan sampai total porsi lebih kecil dari yang sudah diklaim penerima
    if (editId !== null) {
      const terklaim = hitungTerklaim(bacaList(KEY_KLAIM), editId);
      if (Number(form.porsi) < terklaim) {
        setError(`Total porsi tidak boleh kurang dari ${terklaim}, karena sudah diklaim penerima.`);
        return;
      }
    }

    const data = {
      restoran: namaMitra,
      makanan: form.makanan.trim(),
      kategori: form.kategori,
      porsi: Number(form.porsi),
      jam: form.jam,
      batas: `Hari ini, ${form.jam} WIB`,
      alamat: form.alamat.trim(),
      deskripsi: form.deskripsi.trim(),
      harga: berbayar ? Number(form.harga) : 0,
      gambar: gambar
    };

    try {
      // baca ulang dulu supaya tidak menimpa data dari tab lain
      const terbaru = bacaList(KEY_MAKANAN);
      if (editId !== null) {
        simpanKeStorage(terbaru.map((m) => (m.id === editId ? { ...m, ...data } : m)));
      } else {
        simpanKeStorage([...terbaru, { id: Date.now(), ...data }]);
      }
      tutupModal();
    } catch {
      setError('Gagal menyimpan, penyimpanan browser penuh. Coba pakai foto yang lebih kecil.');
    }
  };

  const konfirmasiHapus = () => {
    simpanKeStorage(bacaList(KEY_MAKANAN).filter((m) => m.id !== itemHapus.id));
    tutupModal();
  };

  // ---------- style ----------
  const bannerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    backgroundColor: colors.surface,
    padding: '28px 60px',
    flexWrap: 'wrap'
  };

  const sectionStyle = { padding: '32px 60px 40px' };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px',
    alignItems: 'start'
  };

  const cardStyle = {
    backgroundColor: colors.surface,
    borderRadius: '18px',
    padding: '20px'
  };

  const fotoStyle = {
    width: '100%',
    height: '210px',
    objectFit: 'cover',
    borderRadius: '14px',
    border: `1.5px solid ${colors.border}`,
    display: 'block',
    boxSizing: 'border-box'
  };

  const fotoKosongStyle = {
    ...fotoStyle,
    backgroundColor: colors.surfaceLight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.muted,
    fontSize: '0.9rem'
  };

  const badgeStyle = (warna) => ({
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: warna,
    border: `1px solid ${warna}`,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: '6px',
    padding: '2px 8px'
  });

  const tombolKecil = (warna, isi) => ({
    backgroundColor: isi ? warna : 'transparent',
    color: isi ? '#1a1a1a' : warna,
    border: `1.5px solid ${warna}`,
    borderRadius: '8px',
    padding: '7px 18px',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer'
  });

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    overflowY: 'auto',
    zIndex: 1000
  };

  const modalStyle = {
    backgroundColor: colors.bg,
    borderRadius: '22px',
    padding: '32px 36px',
    width: '100%',
    boxSizing: 'border-box',
    border: `1px solid ${colors.border}`
  };

  const formGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px 24px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
    textTransform: 'uppercase'
  };

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: colors.surface,
    color: colors.text,
    border: 'none',
    borderRadius: '10px',
    padding: '13px 16px',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    colorScheme: 'dark'
  };

  const penuh = { gridColumn: '1 / -1' };

  const tombolBatal = {
    backgroundColor: '#6b6b70',
    color: colors.text,
    border: 'none',
    borderRadius: '8px',
    padding: '10px 26px',
    fontSize: '0.95rem',
    cursor: 'pointer'
  };

  const terklaimSaatEdit = editId !== null ? hitungTerklaim(semuaKlaim, editId) : 0;

  const iconTombolTambah = (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );

  const iconTombolBayar = (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );

  return (
    <div>
      {/* banner atas */}
      <div style={bannerStyle}>
        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke={colors.primary}
          strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
          <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>Katalog Makanan Saya</h1>
          <p style={{ margin: '4px 0 0', color: colors.muted, fontSize: '1.1rem' }}>
            Kelola stok, harga, foto, atau dokumen makanan yang dipublikasikan
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={bukaBayar}
            style={{
              ...tombolKecil(colors.muted, false),
              color: colors.text,
              padding: '12px 22px',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {iconTombolBayar}
            Pengaturan Pembayaran
          </button>
          <button
            type="button"
            onClick={bukaTambah}
            style={{
              ...tombolKecil(colors.primary, true),
              color: colors.text,
              padding: '12px 22px',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {iconTombolTambah}
            Tambah Makanan
          </button>
        </div>
      </div>

      {/* daftar kartu makanan */}
      <div style={sectionStyle}>
        {makananMitra.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '90px 20px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Belum ada makanan</div>
            <div style={{ marginTop: '6px', color: colors.muted }}>
              Klik "Tambah Makanan" untuk mulai membagikan makanan dari {namaMitra}.
            </div>
          </div>
        ) : (
          <div style={gridStyle}>
            {makananMitra.map((m) => {
              const terklaim = hitungTerklaim(semuaKlaim, m.id);
              const sisa = Math.max(0, Number(m.porsi || 0) - terklaim);
              const habis = sisa === 0;

              return (
                <div key={m.id} style={cardStyle}>
                  {m.gambar ? (
                    <img
                      src={m.gambar}
                      alt={m.makanan}
                      style={{ ...fotoStyle, opacity: habis ? 0.45 : 1 }}
                    />
                  ) : (
                    <div style={fotoKosongStyle}>Belum ada foto</div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '12px'
                    }}
                  >
                    {m.harga > 0 ? (
                      <span style={badgeStyle(colors.warning)}>
                        Rp {m.harga.toLocaleString('id-ID')}
                      </span>
                    ) : (
                      <span style={badgeStyle(colors.success)}>Gratis</span>
                    )}
                    {habis ? (
                      <span style={badgeStyle(colors.primary)}>Habis</span>
                    ) : (
                      <span style={{ fontSize: '0.85rem' }}>Stok: {sisa} Porsi</span>
                    )}
                  </div>

                  <div style={{ fontSize: '1.3rem', fontWeight: 700, margin: '6px 0 2px' }}>
                    {m.makanan}
                  </div>
                  <div style={{ fontSize: '0.9rem' }}>Batas Pengambilan: {m.batas}</div>
                  <div style={{ fontSize: '0.85rem', color: colors.muted, marginTop: '2px' }}>
                    {terklaim} dari {m.porsi} porsi sudah diklaim
                  </div>

                  <div
                    style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}
                  >
                    <button type="button" style={tombolKecil(colors.warning, true)} onClick={() => bukaEdit(m)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      style={tombolKecil(colors.primary, false)}
                      onClick={() => {
                        setItemHapus(m);
                        setModal('hapus');
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* popup tambah / edit */}
      {modal === 'form' && (
        <div style={overlayStyle}>
          <form style={{ ...modalStyle, maxWidth: '760px' }} onSubmit={simpan}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
              {editId !== null ? 'Edit Katalog Makanan' : 'Tambah Katalog Makanan'}
            </h2>
            <p style={{ margin: '4px 0 24px', color: colors.muted }}>
              {editId !== null
                ? 'Isi detail makanan yang ingin Anda edit'
                : 'Isi detail makanan yang ingin Anda bagikan'}
            </p>

            <div style={formGrid}>
              <div style={penuh}>
                <label style={labelStyle}>Nama Makanan/Paket</label>
                <input
                  style={inputStyle}
                  name="makanan"
                  value={form.makanan}
                  onChange={ubahField}
                  placeholder="Contoh: Nasi Box Ayam Bakar 5 Porsi"
                />
              </div>

              <div>
                <label style={labelStyle}>Kategori</label>
                <select style={inputStyle} name="kategori" value={form.kategori} onChange={ubahField}>
                  {OPSI_KATEGORI.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Jenis Penawaran</label>
                <select style={inputStyle} name="jenis" value={form.jenis} onChange={ubahField}>
                  {OPSI_JENIS.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Total Porsi</label>
                <input
                  style={inputStyle}
                  type="number"
                  min="1"
                  name="porsi"
                  value={form.porsi}
                  onChange={ubahField}
                  placeholder="Contoh: 5"
                />
                {editId !== null && (
                  <div style={{ marginTop: '6px', fontSize: '0.82rem', color: colors.muted }}>
                    Sudah diklaim penerima: {terklaimSaatEdit} porsi
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Batas Jam Ambil</label>
                <input style={inputStyle} type="time" name="jam" value={form.jam} onChange={ubahField} />
              </div>

              {berbayar && (
                <div style={penuh}>
                  <label style={labelStyle}>Harga per porsi (Rp)</label>
                  <input
                    style={inputStyle}
                    type="number"
                    min="1"
                    name="harga"
                    value={form.harga}
                    onChange={ubahField}
                    placeholder="Contoh: 10000"
                  />
                </div>
              )}

              <div>
                <label style={labelStyle}>Lokasi Pengambilan</label>
                <input
                  style={inputStyle}
                  name="alamat"
                  value={form.alamat}
                  onChange={ubahField}
                  placeholder="Contoh: Jl. Sudirman No.24 Batam"
                />
              </div>

              <div>
                <label style={labelStyle}>Deskripsi Singkat</label>
                <input
                  style={inputStyle}
                  name="deskripsi"
                  value={form.deskripsi}
                  onChange={ubahField}
                  placeholder="Contoh: Kondisi masih sangat bagus"
                />
              </div>

              <div style={penuh}>
                <label style={labelStyle}>Upload File Foto (maks 2MB)</label>
                <input key={inputKey} style={inputStyle} type="file" accept="image/*" onChange={pilihFoto} />
                {gambar && (
                  <img
                    src={gambar}
                    alt="Preview"
                    style={{ ...fotoStyle, height: '150px', width: '220px', marginTop: '12px' }}
                  />
                )}
              </div>
            </div>

            {error && (
              <p style={{ color: colors.primary, margin: '18px 0 0', fontSize: '0.9rem' }}>{error}</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
              <button type="button" onClick={tutupModal} style={tombolBatal}>
                Batal
              </button>
              <button type="submit" style={{ ...tombolKecil(colors.warning, true), padding: '10px 22px' }}>
                {editId !== null ? 'Simpan Perubahan' : 'Tambah Makanan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* popup pengaturan pembayaran */}
      {modal === 'bayar' && (
        <div style={overlayStyle}>
          <form style={{ ...modalStyle, maxWidth: '620px' }} onSubmit={simpanBayar}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Pengaturan Pembayaran</h2>
            <p style={{ margin: '4px 0 24px', color: colors.muted, lineHeight: 1.5 }}>
              Dipakai penerima saat membayar makanan berbayar dari {namaMitra}. Cukup diisi sekali,
              berlaku untuk semua makanan Anda.
            </p>

            <div style={formGrid}>
              <div style={penuh}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>Nomor Virtual Account</div>
                <div style={{ fontSize: '0.85rem', color: colors.muted, marginTop: '2px' }}>
                  Kosongkan bank yang tidak Anda punya. Hanya angka.
                </div>
              </div>

              {BANKS.map((bank) => (
                <div key={bank}>
                  <label style={labelStyle}>{bank}</label>
                  <input
                    style={inputStyle}
                    inputMode="numeric"
                    value={vaForm[bank]}
                    onChange={(e) => ubahVA(bank, e.target.value)}
                    placeholder={`Nomor VA ${bank}`}
                  />
                </div>
              ))}

              <div style={{ ...penuh, marginTop: '4px' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>Gambar QRIS</div>
                <div style={{ fontSize: '0.85rem', color: colors.muted, marginTop: '2px' }}>
                  Upload gambar QRIS merchant Anda (maks 2MB).
                </div>
              </div>

              <div style={penuh}>
                <input
                  key={qrisInputKey}
                  style={inputStyle}
                  type="file"
                  accept="image/*"
                  onChange={pilihQris}
                />
                {qris && (
                  <div style={{ marginTop: '12px' }}>
                    <img
                      src={qris}
                      alt="Preview QRIS"
                      style={{
                        maxWidth: '220px',
                        maxHeight: '220px',
                        objectFit: 'contain',
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        padding: '8px',
                        display: 'block'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setQris(null);
                        setQrisInputKey((k) => k + 1);
                      }}
                      style={{ ...tombolKecil(colors.primary, false), marginTop: '10px' }}
                    >
                      Hapus QRIS
                    </button>
                  </div>
                )}
              </div>
            </div>

            {errorBayar && (
              <p style={{ color: colors.primary, margin: '18px 0 0', fontSize: '0.9rem' }}>{errorBayar}</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
              <button type="button" onClick={tutupModal} style={tombolBatal}>
                Batal
              </button>
              <button type="submit" style={{ ...tombolKecil(colors.warning, true), padding: '10px 22px' }}>
                Simpan Pengaturan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* popup konfirmasi hapus */}
      {modal === 'hapus' && itemHapus && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: '480px', textAlign: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: `2px solid ${colors.primary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px'
              }}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={colors.primary}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </div>
            <h2 style={{ margin: '0 0 10px', fontSize: '1.3rem', fontWeight: 700 }}>Hapus Makanan Ini?</h2>
            <p style={{ margin: 0, color: colors.muted, lineHeight: 1.5 }}>
              Apakah Anda yakin ingin menghapus "
              <span style={{ color: colors.text }}>{itemHapus.makanan}</span>"? Item akan dihapus dari
              katalog makanan.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '26px' }}>
              <button type="button" onClick={tutupModal} style={tombolBatal}>
                Batal
              </button>
              <button
                type="button"
                onClick={konfirmasiHapus}
                style={{
                  backgroundColor: '#a82b27',
                  color: colors.text,
                  border: `1.5px solid ${colors.primary}`,
                  borderRadius: '8px',
                  padding: '10px 22px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}