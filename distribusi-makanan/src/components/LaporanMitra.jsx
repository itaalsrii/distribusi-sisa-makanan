import React, { useState, useEffect } from 'react';
import { colors } from '../theme';

const KEY_KLAIM = 'surplus_klaim';

function bacaKlaim() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY_KLAIM) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const samaNama = (a, b) =>
  String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

// waktu klaim diambil dari id (Date.now()-idMakanan), cadangan dari waktuKlaim
function waktuKlaim(k) {
  const w = parseInt(String(k.id).split('-')[0], 10);
  if (w) return w;
  const t = Date.parse(k.waktuKlaim);
  return Number.isNaN(t) ? 0 : t;
}

// format 2026-09-26 18:30 (sesuai Figma)
function formatWaktu(k) {
  const w = waktuKlaim(k);
  if (!w) return '-';
  const d = new Date(w);
  const dua = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dua(d.getMonth() + 1)}-${dua(d.getDate())} ${dua(d.getHours())}:${dua(d.getMinutes())}`;
}

const nominalKlaim = (k) => Number(k.harga || 0) * Number(k.jumlah || 1);

// format Nominal sesuai Figma: "Rp 20.000" atau "Rp 0 (Gratis)"
const formatNominal = (k) => {
  const total = nominalKlaim(k);
  return total === 0 ? 'Rp 0 (Gratis)' : `Rp ${total.toLocaleString('id-ID')}`;
};

// alamat penerima (klaim lama mungkin belum punya)
const alamatKlaim = (k) => k.alamatPenerima || '-';

// escape supaya nama penerima/makanan/alamat aman masuk ke HTML
const esc = (teks) =>
  String(teks ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export default function LaporanMitra({ namaMitra }) {
  const [semuaKlaim, setSemuaKlaim] = useState(bacaKlaim);

  // update otomatis kalau klaim berubah (tab lain atau halaman ini)
  useEffect(() => {
    const muat = () => setSemuaKlaim(bacaKlaim());
    window.addEventListener('storage', muat);
    window.addEventListener('surplus-claims-updated', muat);
    return () => {
      window.removeEventListener('storage', muat);
      window.removeEventListener('surplus-claims-updated', muat);
    };
  }, []);

  // rekapitulasi penyaluran = klaim milik Mitra ini yang sudah Selesai, terbaru di atas
  const baris = semuaKlaim
    .filter((k) => samaNama(k.restoran, namaMitra) && k.status === 'Selesai')
    .sort((a, b) => waktuKlaim(b) - waktuKlaim(a));

  const totalPorsi = baris.reduce((t, k) => t + Number(k.jumlah || 0), 0);
  const totalNominal = baris.reduce((t, k) => t + nominalKlaim(k), 0);
  const teksTotalNominal = totalNominal === 0 ? 'Rp 0 (Gratis)' : `Rp ${totalNominal.toLocaleString('id-ID')}`;

  const tanggalCetak = () => {
    const d = new Date();
    const dua = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${dua(d.getMonth() + 1)}-${dua(d.getDate())}`;
  };

  const namaFile = (ekstensi) =>
    `rekap-penyaluran-${String(namaMitra).trim().toLowerCase().replace(/\s+/g, '-')}-${tanggalCetak()}.${ekstensi}`;

  // ---------- Unduh Excel ----------
  // tabel HTML disimpan sebagai .xls, Excel bisa langsung membukanya
  const unduhExcel = () => {
    const isiBaris = baris
      .map(
        (k) => `<tr>
          <td>${esc(k.nama)}</td>
          <td>${esc(formatWaktu(k))}</td>
          <td>${esc(k.makanan)}</td>
          <td>${esc(k.jumlah)}</td>
          <td>${esc(formatNominal(k))}</td>
          <td>${esc(alamatKlaim(k))}</td>
        </tr>`
      )
      .join('');

    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"></head>
      <body>
        <table border="1">
          <tr><th colspan="6">Rekapitulasi Penyaluran Makanan - ${esc(namaMitra)}</th></tr>
          <tr>
            <th>Nama Penerima</th><th>Tanggal/Waktu</th><th>Nama Makanan</th>
            <th>Jumlah</th><th>Nominal</th><th>Alamat</th>
          </tr>
          ${isiBaris}
          <tr><th colspan="3">Total</th><th>${totalPorsi}</th><th>${esc(teksTotalNominal)}</th><th></th></tr>
        </table>
      </body>
    </html>`;

    const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = namaFile('xls');
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // ---------- Unduh PDF ----------
  // buka dialog cetak browser dengan halaman rapi, pilih "Save as PDF" / "Simpan sebagai PDF"
  const unduhPdf = () => {
    const isiBaris = baris
      .map(
        (k) => `<tr>
          <td>${esc(k.nama)}</td>
          <td>${esc(formatWaktu(k))}</td>
          <td>${esc(k.makanan)}</td>
          <td class="tengah">${esc(k.jumlah)}</td>
          <td>${esc(formatNominal(k))}</td>
          <td>${esc(alamatKlaim(k))}</td>
        </tr>`
      )
      .join('');

    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${esc(namaFile('pdf').replace('.pdf', ''))}</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; color: #111; padding: 24px; }
            h1 { margin: 0 0 4px; font-size: 20px; }
            p { margin: 0 0 18px; color: #555; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th, td { border: 1px solid #bbb; padding: 8px 10px; text-align: left; }
            th { background: #eee; }
            .tengah { text-align: center; }
            tfoot td { font-weight: bold; background: #f6f6f6; }
          </style>
        </head>
        <body>
          <h1>Rekapitulasi Penyaluran Makanan</h1>
          <p>${esc(namaMitra)} &middot; dicetak ${esc(tanggalCetak())}</p>
          <table>
            <thead>
              <tr>
                <th>Nama Penerima</th><th>Tanggal/Waktu</th><th>Nama Makanan</th>
                <th>Jumlah</th><th>Nominal</th><th>Alamat</th>
              </tr>
            </thead>
            <tbody>${isiBaris}</tbody>
            <tfoot>
              <tr>
                <td colspan="3">Total</td>
                <td class="tengah">${totalPorsi}</td>
                <td>${esc(teksTotalNominal)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>`;

    // iframe tersembunyi supaya tidak diblok pop-up blocker
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => iframe.remove(), 500);
    }, 300);
  };

  // ---------- style ----------
  const bannerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    backgroundColor: colors.surface,
    padding: '28px 60px'
  };

  const sectionStyle = { padding: '56px 60px 56px' };

  const tableCard = {
    backgroundColor: colors.surface,
    borderRadius: '18px',
    padding: '12px 24px 28px',
    minHeight: '380px',
    overflowX: 'auto'
  };

  const tableStyle = {
    width: '100%',
    minWidth: '980px',
    borderCollapse: 'collapse',
    tableLayout: 'fixed'
  };

  const thStyle = (rata) => ({
    textAlign: rata,
    padding: '24px 14px',
    fontSize: '1.05rem',
    fontWeight: 700,
    borderBottom: `2px solid ${colors.bg}`
  });

  const tdStyle = (rata) => ({
    textAlign: rata,
    padding: '22px 14px',
    fontSize: '1rem',
    verticalAlign: 'middle',
    lineHeight: 1.5,
    wordBreak: 'break-word'
  });

  const tombolUnduh = (bg, border) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: bg,
    color: colors.text,
    border: `1.5px solid ${border}`,
    borderRadius: '10px',
    padding: '11px 20px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: baris.length === 0 ? 'not-allowed' : 'pointer',
    opacity: baris.length === 0 ? 0.5 : 1
  });

  const kolom = [
    { judul: 'Nama Penerima', lebar: '17%', rata: 'left' },
    { judul: 'Tanggal/Waktu', lebar: '17%', rata: 'left' },
    { judul: 'Nama Makanan', lebar: '20%', rata: 'left' },
    { judul: 'Jumlah', lebar: '9%', rata: 'center' },
    { judul: 'Nominal', lebar: '15%', rata: 'center' },
    { judul: 'Alamat', lebar: '22%', rata: 'left' }
  ];

  return (
    <div>
      {/* banner atas */}
      <div style={bannerStyle}>
        <svg viewBox="0 0 48 48" width="60" height="60" fill="none" aria-hidden="true">
          <path
            d="M10 4h19l11 11v29a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
            fill={colors.primary}
          />
          <path d="M29 4v9a2 2 0 0 0 2 2h9" fill="#a82b27" />
          <path
            d="M14 31h16m0 0-6-6m6 6-6 6"
            stroke="#16171a"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>Laporan &amp; Ekspor Rekapitulasi</h1>
          <p style={{ margin: '4px 0 0', color: colors.muted, fontSize: '1.1rem' }}>
            Lihat dan unduh rekapitulasi penyaluran makanan
          </p>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
          <button
            type="button"
            onClick={unduhExcel}
            disabled={baris.length === 0}
            style={tombolUnduh('rgba(34,197,94,0.22)', '#2f7d4f')}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
              <path d="M14 2v6h6" />
              <path d="m9 12.5 5 5m0-5-5 5" />
            </svg>
            Unduh Excel
          </button>

          <button
            type="button"
            onClick={unduhPdf}
            disabled={baris.length === 0}
            style={tombolUnduh('#a82b27', colors.primary)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
              <path d="M14 2v6h6" />
              <path d="M8 17v-4h1.5a1.2 1.2 0 0 1 0 2.4H8M13 17v-4h1a2 2 0 0 1 0 4h-1" />
            </svg>
            Unduh PDF
          </button>
        </div>
      </div>

      {/* tabel rekapitulasi */}
      <div style={sectionStyle}>
        <div style={tableCard}>
          <table style={tableStyle}>
            <colgroup>
              {kolom.map((c) => (
                <col key={c.judul} style={{ width: c.lebar }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {kolom.map((c) => (
                  <th key={c.judul} style={thStyle(c.rata)}>
                    {c.judul}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {baris.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ ...tdStyle('center'), color: colors.muted, padding: '90px 14px' }}
                  >
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: colors.text }}>
                      Belum ada penyaluran yang selesai
                    </div>
                    <div style={{ marginTop: '6px' }}>
                      Pengajuan berstatus Selesai untuk {namaMitra} akan muncul di sini.
                    </div>
                  </td>
                </tr>
              )}

              {baris.map((k) => (
                <tr key={k.id}>
                  <td style={tdStyle('left')}>{k.nama}</td>
                  <td style={tdStyle('left')}>{formatWaktu(k)}</td>
                  <td style={tdStyle('left')}>{k.makanan}</td>
                  <td style={tdStyle('center')}>{k.jumlah}</td>
                  <td style={tdStyle('center')}>{formatNominal(k)}</td>
                  <td style={tdStyle('left')}>{alamatKlaim(k)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}