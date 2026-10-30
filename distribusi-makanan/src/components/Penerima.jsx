import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Penerima.css";

const CLAIMS_KEY = "surplus_klaim";

const MAKANAN_KEY = "surplus_makanan";

const PEMBAYARAN_KEY = "surplus_pembayaran";

const BANKS = ["BCA", "BNI", "BRI", "Mandiri"];

const METODE_PENGAMBILAN = ["Ambil sendiri", "GoSend"];

const METODE_PEMBAYARAN = ["QRIS", "Virtual Account"];

const bacaData = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

// data pembayaran disimpan Mitra sebagai object: { "nama mitra": { virtualAccount, qris } }
const bacaPembayaran = () => {
  try {
    const data = JSON.parse(localStorage.getItem(PEMBAYARAN_KEY) || "{}");
    return data && typeof data === "object" && !Array.isArray(data)
      ? data
      : {};
  } catch {
    return {};
  }
};

// kunci harus sama persis dengan kunciMitra() di KatalogMakanan
const ambilPembayaranMitra = (semua, namaRestoran) =>
  semua[String(namaRestoran || "").trim().toLowerCase()] || {};

const simpanKlaim = (data) => {
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("surplus-claims-updated"));
};

const bacaMakananMitra = () =>
  bacaData(MAKANAN_KEY).map((m) => ({
    ...m,
    batas: m.jam || m.batas,
  }));

const formatHarga = (harga) =>
  Number(harga) === 0
    ? "Gratis"
    : `Harga Rp ${Number(harga).toLocaleString("id-ID")}`;

// pengambilan cuma ada dua: "Ambil sendiri" atau "GoSend"
// klaim lama yang isinya "Tunai" dan sejenisnya dianggap "Ambil sendiri"
const labelPengambilan = (klaim) => {
  const nilai = klaim.metodePengambilan || klaim.metode || "";
  return nilai === "GoSend" ? "GoSend" : "Ambil sendiri";
};

// pembayaran: "Gratis" atau nominal + lewat apa (QRIS / Virtual Account + bank)
// klaim lama tanpa metode pembayaran cuma nampilin nominalnya
const labelPembayaran = (klaim) => {
  const harga = Number(klaim.harga || 0);
  if (harga === 0) return "Gratis";
  const total = harga * Number(klaim.jumlah || 1);
  const nominal = `Rp ${total.toLocaleString("id-ID")}`;
  if (klaim.metodePembayaran === "QRIS") return `${nominal} via QRIS`;
  if (klaim.metodePembayaran === "Virtual Account") {
    return `${nominal} via Virtual Account${
      klaim.bankVA ? ` ${klaim.bankVA}` : ""
    }`;
  }
  return nominal;
};

// samakan format nomor WA: 0812..., +62812..., 62812..., 812... dianggap nomor yang sama
const normalisasiNomor = (nomor) => {
  const digit = String(nomor || "").replace(/\D/g, "");
  if (!digit) return "";
  if (digit.startsWith("62")) return `0${digit.slice(2)}`;
  if (digit.startsWith("0")) return digit;
  return `0${digit}`;
};

function LogoMakanan() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-label="Logo Surplus">
      <path
        d="M17 5 C9 10 27 12 18 19 M29 5 C21 10 39 12 30 19 M23 2 C15 7 33 9 24 15"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M7 31 C9 22 16 19 24 19 C32 19 39 22 41 31 Z"
        fill="white"
      />
      <path
        d="M5 34 H43 M12 38 H36"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoBanner() {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-label="Logo Surplus">
      <circle cx="50" cy="50" r="50" fill="#e52529" />
      <path
        d="M18 32 C27 42 35 22 49 28 C39 37 46 46 58 52 C73 60 67 77 49 84 C57 69 42 63 32 57 C23 52 27 43 18 32Z M65 19 C78 29 83 43 77 57 C72 49 64 42 66 34 C67 28 69 24 65 19Z M12 24 C18 14 28 8 39 6 C31 13 29 21 32 29 C24 25 18 25 12 24Z"
        fill="#29292c"
      />
    </svg>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </>
  );
}

export default function Penerima() {
  const [cari, setCari] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [daftarKlaim, setDaftarKlaim] = useState(() =>
    bacaData(CLAIMS_KEY)
  );
  const [makananMitra, setMakananMitra] = useState(bacaMakananMitra);
  const [pembayaranMitra, setPembayaranMitra] = useState(bacaPembayaran);
  const [makananDipilih, setMakananDipilih] = useState(null);
  const [modalKlaimTerbuka, setModalKlaimTerbuka] = useState(false);
  const [modalDaftarTerbuka, setModalDaftarTerbuka] = useState(false);
  const [namaLengkap, setNamaLengkap] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [alamatPenerima, setAlamatPenerima] = useState("");
  const [jumlahPorsi, setJumlahPorsi] = useState(1);
  const [metodePengambilan, setMetodePengambilan] = useState("");
  const [metodePembayaran, setMetodePembayaran] = useState("");
  const [bankVA, setBankVA] = useState("BCA");
  const [buktiPembayaran, setBuktiPembayaran] = useState(null);
  const [previewBukti, setPreviewBukti] = useState("");
  const [pesanBukti, setPesanBukti] = useState("");
  // cek klaim pakai nomor WhatsApp
  const [nomorCek, setNomorCek] = useState("");
  const [nomorAktif, setNomorAktif] = useState("");
  const [pesanCek, setPesanCek] = useState("");
  const makananGratis = Number(makananDipilih?.harga) === 0;

  // data pembayaran milik Mitra dari makanan yang sedang dipilih
  const pembayaranDipilih = makananDipilih
    ? ambilPembayaranMitra(pembayaranMitra, makananDipilih.restoran)
    : {};
  const vaDipilih = pembayaranDipilih.virtualAccount || {};
  const qrisDipilih = pembayaranDipilih.qris || null;

  useEffect(() => {
    const muatData = () => {
      setDaftarKlaim(bacaData(CLAIMS_KEY));
      setMakananMitra(bacaMakananMitra());
      setPembayaranMitra(bacaPembayaran());
    };
    window.addEventListener("storage", muatData);
    window.addEventListener("surplus-claims-updated", muatData);
    window.addEventListener("surplus-makanan-updated", muatData);
    window.addEventListener("surplus-pembayaran-updated", muatData);
    return () => {
      window.removeEventListener("storage", muatData);
      window.removeEventListener("surplus-claims-updated", muatData);
      window.removeEventListener("surplus-makanan-updated", muatData);
      window.removeEventListener("surplus-pembayaran-updated", muatData);
    };
  }, []);
  const sisaPorsi = (item) => {
    const terpakai = daftarKlaim
      .filter(
        (k) => k.idMakanan === item.id && k.status !== "Ditolak"
      )
      .reduce((total, k) => total + Number(k.jumlah || 0), 0);
    return Math.max(0, Number(item.porsi || 0) - terpakai);
  };
  const makananTampil = makananMitra.filter((item) => {
    const kata = cari.toLowerCase();
    const cocokCari =
      (item.restoran || "").toLowerCase().includes(kata) ||
      (item.makanan || "").toLowerCase().includes(kata);
    const cocokFilter =
      filter === "Semua" ||
      (filter === "Gratis" && Number(item.harga) === 0) ||
      (filter === "Berbayar" && Number(item.harga) > 0);
    return cocokCari && cocokFilter && sisaPorsi(item) > 0;
  });
  // klaim yang ditampilkan di "Klaim saya": hanya yang nomor WA-nya sama dengan nomor yang dicek
  const klaimSaya = nomorAktif
    ? daftarKlaim.filter(
        (k) => normalisasiNomor(k.whatsapp) === nomorAktif
      )
    : [];
  const resetPembayaran = () => {
    setBankVA("BCA");
    setBuktiPembayaran(null);
    setPreviewBukti("");
    setPesanBukti("");
  };
  const klaimMakanan = (item) => {
    // ambil data terbaru, siapa tahu Mitra baru saja mengatur pembayaran
    setPembayaranMitra(bacaPembayaran());
    setMakananDipilih(item);
    setNamaLengkap("");
    setWhatsapp("");
    setAlamatPenerima("");
    setJumlahPorsi(1);
    setMetodePengambilan("");
    setMetodePembayaran(Number(item.harga) === 0 ? "Gratis" : "");
    resetPembayaran();
    setModalKlaimTerbuka(true);
  };
  const pilihBuktiPembayaran = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const tipeDiizinkan = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (
      !tipeDiizinkan.includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setPesanBukti(
        !tipeDiizinkan.includes(file.type)
          ? "Format file harus JPG, PNG, WEBP, atau PDF."
          : "Ukuran bukti maksimal 2 MB."
      );
      setBuktiPembayaran(null);
      setPreviewBukti("");
      e.target.value = "";
      return;
    }
    setBuktiPembayaran(file);
    setPesanBukti("");
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreviewBukti(reader.result);
      reader.onerror = () =>
        setPesanBukti("Gagal membaca gambar bukti pembayaran.");
      reader.readAsDataURL(file);
    } else {
      setPreviewBukti("");
    }
  };
  const konfirmasiKlaim = async (e) => {
    e.preventDefault();
    if (!makananDipilih) return;
    const pembayaran = makananGratis ? "Gratis" : metodePembayaran;
    const perluBukti = ["QRIS", "Virtual Account"].includes(pembayaran);
    if (
      !namaLengkap.trim() ||
      !whatsapp.trim() ||
      !alamatPenerima.trim() ||
      !metodePengambilan ||
      (!makananGratis && !metodePembayaran)
    ) {
      alert("Lengkapi semua data klaim terlebih dahulu.");
      return;
    }
    if (!/^[0-9+\-\s()]{8,20}$/.test(whatsapp.trim())) {
      alert("Masukkan nomor WhatsApp yang valid.");
      return;
    }
    const jumlah = Number(jumlahPorsi);
    if (
      !Number.isInteger(jumlah) ||
      jumlah < 1 ||
      jumlah > sisaPorsi(makananDipilih)
    ) {
      alert("Jumlah porsi melebihi stok yang tersedia.");
      return;
    }
    if (perluBukti && !buktiPembayaran) {
      alert("Upload bukti pembayaran terlebih dahulu.");
      return;
    }
    const nomorVA =
      pembayaran === "Virtual Account" ? vaDipilih[bankVA] || "" : "";
    if (pembayaran === "Virtual Account" && !nomorVA) {
      alert(
        `Nomor VA ${bankVA} untuk ${makananDipilih.restoran} belum diatur.`
      );
      return;
    }
    if (pembayaran === "QRIS" && !qrisDipilih) {
      alert(`QRIS untuk ${makananDipilih.restoran} belum diatur.`);
      return;
    }
    try {
      let buktiData = null;
      if (buktiPembayaran && perluBukti) {
        buktiData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () =>
            reject(new Error("Gagal membaca bukti pembayaran."));
          reader.readAsDataURL(buktiPembayaran);
        });
      }
      const klaimTersimpan = bacaData(CLAIMS_KEY);
      const terpakai = klaimTersimpan
        .filter(
          (k) =>
            k.idMakanan === makananDipilih.id &&
            k.status !== "Ditolak"
        )
        .reduce((total, k) => total + Number(k.jumlah || 0), 0);
      if (
        jumlah >
        Number(makananDipilih.porsi || 0) - terpakai
      ) {
        alert("Stok baru saja berubah. Silakan coba lagi.");
        setDaftarKlaim(klaimTersimpan);
        return;
      }
      const klaimBaru = {
        id: `${Date.now()}-${makananDipilih.id}`,
        idMakanan: makananDipilih.id,
        mitraId: makananDipilih.mitraId || null,
        restoran: makananDipilih.restoran,
        makanan: makananDipilih.makanan,
        harga: makananDipilih.harga,
        alamat: makananDipilih.alamat,
        nama: namaLengkap.trim(),
        whatsapp: whatsapp.trim(),
        alamatPenerima: alamatPenerima.trim(),
        jumlah,
        metodePengambilan,
        metodePembayaran: pembayaran,
        bankVA: pembayaran === "Virtual Account" ? bankVA : null,
        nomorVA: nomorVA || null,
        buktiPembayaran: buktiData,
        namaFileBukti: buktiPembayaran?.name || null,
        waktuKlaim: new Date().toISOString(),
        status: "Menunggu Konfirmasi",
        statusPembayaran: perluBukti
          ? "Menunggu Verifikasi"
          : "Tidak Memerlukan Pembayaran Online",
      };
      const semuaKlaim = [...klaimTersimpan, klaimBaru];
      simpanKlaim(semuaKlaim);
      setDaftarKlaim(semuaKlaim);
      setModalKlaimTerbuka(false);
      // habis klaim, langsung tampilkan klaim milik nomor yang baru dipakai
      setNomorAktif(normalisasiNomor(klaimBaru.whatsapp));
      setNomorCek("");
      setPesanCek("");
      setModalDaftarTerbuka(true);
      resetPembayaran();
    } catch (error) {
      console.error(error);
      alert(
        "Klaim gagal disimpan. Coba gunakan file bukti yang lebih kecil."
      );
    }
  };
  // Chrome nge-blok link data: di tab baru, jadi diubah ke blob dulu baru dibuka
  const bukaBukti = (dataUrl) => {
    try {
      const [header, isi] = dataUrl.split(",");
      const tipe = header.match(/data:(.*?);base64/)[1];
      const biner = atob(isi);
      const bytes = new Uint8Array(biner.length);
      for (let i = 0; i < biner.length; i++) bytes[i] = biner.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([bytes], { type: tipe }));
      window.open(url, "_blank");
    } catch {
      alert("Gagal membuka bukti pembayaran.");
    }
  };
  const salinNomorVA = async (nomor) => {
    try {
      await navigator.clipboard.writeText(nomor);
      alert("Nomor Virtual Account berhasil disalin.");
    } catch {
      alert("Gagal menyalin. Silakan salin nomor secara manual.");
    }
  };
  // tiap buka "Klaim saya" selalu minta nomor WA lagi
  const lihatKlaimSaya = () => {
    setDaftarKlaim(bacaData(CLAIMS_KEY));
    setMakananMitra(bacaMakananMitra());
    setPembayaranMitra(bacaPembayaran());
    setNomorCek("");
    setNomorAktif("");
    setPesanCek("");
    setModalDaftarTerbuka(true);
  };
  const cekKlaim = (e) => {
    e.preventDefault();
    const nomor = normalisasiNomor(nomorCek);
    if (nomor.length < 8) {
      setPesanCek("Masukkan nomor WhatsApp yang valid.");
      return;
    }
    setDaftarKlaim(bacaData(CLAIMS_KEY));
    setPembayaranMitra(bacaPembayaran());
    setPesanCek("");
    setNomorAktif(nomor);
  };
  const gantiNomor = () => {
    setNomorAktif("");
    setNomorCek("");
    setPesanCek("");
  };
  const tutupDaftar = () => {
    setModalDaftarTerbuka(false);
    setNomorAktif("");
    setNomorCek("");
    setPesanCek("");
  };
  const tutupSemuaModal = () => {
    setModalKlaimTerbuka(false);
    tutupDaftar();
  };
  const tutupJikaLatar = (e, tutup) => {
    if (e.target === e.currentTarget) tutup();
  };
  return (
    <div className="penerima-page">
      <nav className="penerima-navbar">
        <Link to="/penerima" className="penerima-brand">
          <div className="brand-icon">
            <LogoMakanan />
          </div>
          <span>Surplus</span>
        </Link>
        <div className="navbar-actions">
          <Link to="/login" className="navbar-btn">
            Login
          </Link>
          <button
            type="button"
            className="navbar-btn klaim-nav-btn"
            onClick={lihatKlaimSaya}
          >
            <span className="klaim-icon" aria-hidden="true">
              ▣
            </span>
            Klaim saya
          </button>
        </div>
      </nav>
      <main className="penerima-content">
        <section className="welcome-banner">
          <div className="welcome-logo">
            <LogoBanner />
          </div>
          <div className="welcome-text">
            <h1>Selamat Datang di Surplus!!</h1>
            <p>Cari Makanan Layak Konsumsi Hari Ini</p>
          </div>
        </section>
        <section className="search-filter">
          <div className="search-box">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="10.8"
                cy="10.8"
                r="6.8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16 16 L21 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Cari nama makanan dan restoran"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            {["Semua", "Gratis", "Berbayar"].map((item) => (
              <button
                key={item}
                type="button"
                className={`filter-btn ${
                  filter === item ? "filter-active" : ""
                }`}
                onClick={() => setFilter(item)}
              >
                {item === "Semua" ? "Semua makanan" : item}
              </button>
            ))}
          </div>
        </section>
        <section className="food-grid" id="daftar-makanan">
          {makananTampil.length ? (
            makananTampil.map((item) => (
              <article className="food-card" key={item.id}>
                <div className="food-image-wrapper">
                  <span className="food-price">
                    {formatHarga(item.harga)}
                  </span>
                  {item.gambar && (
                    <img
                      src={item.gambar}
                      alt={item.makanan}
                      className="food-image"
                    />
                  )}
                </div>
                <div className="food-details">
                  <h3>
                    <span className="detail-icon">♧</span>
                    {item.restoran}
                  </h3>
                  <p className="food-name">{item.makanan}</p>
                  <p>
                    <span className="detail-icon">▣</span>
                    Sisa: {sisaPorsi(item)} porsi
                  </p>
                  <p>
                    <span className="detail-icon">◷</span>
                    Batas ambil hari ini, {item.batas}
                  </p>
                  <p>
                    <span className="detail-icon">⌖</span>
                    {item.alamat}
                  </p>
                  <button
                    type="button"
                    className="claim-btn"
                    onClick={() => klaimMakanan(item)}
                    disabled={sisaPorsi(item) <= 0}
                  >
                    {sisaPorsi(item) <= 0
                      ? "Stok habis"
                      : "Klaim makanan ini"}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-food">
              Makanan tidak ditemukan atau stok habis.
            </div>
          )}
        </section>
      </main>
      <footer className="penerima-footer">
        © 2026 Surplus - Platform Distribusi Makanan Berlebih.
      </footer>
      {modalKlaimTerbuka && makananDipilih && (
        <div
          className="klaim-overlay"
          onClick={(e) =>
            tutupJikaLatar(e, () => setModalKlaimTerbuka(false))
          }
        >
          <section
            className="klaim-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="judul-form-klaim"
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setModalKlaimTerbuka(false)}
              aria-label="Tutup formulir"
            >
              &times;
            </button>
            <span className="modal-price">
              {formatHarga(makananDipilih.harga)}
            </span>
            <h2 id="judul-form-klaim">{makananDipilih.makanan}</h2>
            <p className="modal-restaurant">
              Donatur: {makananDipilih.restoran}
            </p>
            <form onSubmit={konfirmasiKlaim}>
              <Field
                label="Nama Lengkap/Nama Lembaga"
                htmlFor="namaLengkap"
              >
                <input
                  id="namaLengkap"
                  type="text"
                  placeholder="cth: panti asuhan"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  required
                />
              </Field>
              <Field label="No WhatsApp Aktif" htmlFor="whatsapp">
                <input
                  id="whatsapp"
                  type="tel"
                  placeholder="cth: 081122334455"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                />
              </Field>
              <Field
                label="Alamat Lengkap Penerima"
                htmlFor="alamatPenerima"
              >
                <textarea
                  id="alamatPenerima"
                  placeholder="Masukkan alamat lengkap penerima"
                  value={alamatPenerima}
                  onChange={(e) => setAlamatPenerima(e.target.value)}
                  rows={3}
                  required
                />
              </Field>
              <Field label="Jumlah Porsi" htmlFor="jumlahPorsi">
                <select
                  id="jumlahPorsi"
                  value={jumlahPorsi}
                  onChange={(e) =>
                    setJumlahPorsi(Number(e.target.value))
                  }
                  required
                >
                  {Array.from(
                    { length: sisaPorsi(makananDipilih) },
                    (_, i) => i + 1
                  ).map((jumlah) => (
                    <option key={jumlah} value={jumlah}>
                      {jumlah} porsi
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="Metode Pengambilan"
                htmlFor="metodePengambilan"
              >
                <select
                  id="metodePengambilan"
                  value={metodePengambilan}
                  onChange={(e) =>
                    setMetodePengambilan(e.target.value)
                  }
                  required
                >
                  <option value="">Pilih metode pengambilan</option>
                  {METODE_PENGAMBILAN.map((metode) => (
                    <option key={metode} value={metode}>
                      {metode}
                    </option>
                  ))}
                </select>
              </Field>
              {!makananGratis && (
                <Field
                  label="Metode Pembayaran"
                  htmlFor="metodePembayaran"
                >
                  <select
                    id="metodePembayaran"
                    value={metodePembayaran}
                    onChange={(e) => {
                      setMetodePembayaran(e.target.value);
                      resetPembayaran();
                    }}
                    required
                  >
                    <option value="">Pilih metode pembayaran</option>
                    {METODE_PEMBAYARAN.map((metode) => (
                      <option key={metode} value={metode}>
                        {metode}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              {makananGratis && (
                <div className="pembayaran-box">
                  <h3>Pembayaran: Gratis</h3>
                  <p>Makanan ini dapat diklaim tanpa pembayaran.</p>
                </div>
              )}
              {!makananGratis && metodePembayaran === "QRIS" && (
                <div className="pembayaran-box">
                  <h3>Pembayaran QRIS</h3>
                  {qrisDipilih ? (
                    <>
                      <p>
                        Scan QRIS milik {makananDipilih.restoran}, lalu
                        upload bukti pembayaran.
                      </p>
                      <img
                        src={qrisDipilih}
                        alt="QRIS Mitra"
                        className="qris-image"
                      />
                      <p className="pembayaran-catatan">
                        Pastikan QRIS dan nominal pembayaran benar
                        sebelum melakukan transfer.
                      </p>
                    </>
                  ) : (
                    <p className="pembayaran-error">
                      QRIS belum didaftarkan oleh Mitra. Silakan pilih
                      metode lain.
                    </p>
                  )}
                </div>
              )}
              {!makananGratis &&
                metodePembayaran === "Virtual Account" && (
                  <div className="pembayaran-box">
                    <h3>Pembayaran Virtual Account</h3>
                    <Field label="Pilih Bank" htmlFor="bankVA">
                      <select
                        id="bankVA"
                        value={bankVA}
                        onChange={(e) => setBankVA(e.target.value)}
                      >
                        {BANKS.map((bank) => (
                          <option key={bank} value={bank}>
                            {bank}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <label>Nomor Virtual Account Mitra</label>
                    <div className="va-display">
                      <span>
                        {vaDipilih[bankVA] ||
                          `Nomor VA ${bankVA} belum didaftarkan oleh Mitra`}
                      </span>
                      {vaDipilih[bankVA] && (
                        <button
                          type="button"
                          onClick={() => salinNomorVA(vaDipilih[bankVA])}
                        >
                          Salin
                        </button>
                      )}
                    </div>
                    <p className="pembayaran-catatan">
                      Nomor ditampilkan sesuai bank dan Mitra pemilik
                      makanan yang dipilih.
                    </p>
                  </div>
                )}
              {!makananGratis &&
                ["QRIS", "Virtual Account"].includes(
                  metodePembayaran
                ) && (
                  <div className="pembayaran-box">
                    <Field
                      label="Upload Bukti Pembayaran"
                      htmlFor="buktiPembayaran"
                    >
                      <input
                        id="buktiPembayaran"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={pilihBuktiPembayaran}
                        required
                      />
                    </Field>
                    {previewBukti && (
                      <img
                        src={previewBukti}
                        alt="Preview bukti pembayaran"
                        className="bukti-preview"
                      />
                    )}
                    {buktiPembayaran && (
                      <p className="pembayaran-catatan">
                        File: {buktiPembayaran.name}
                      </p>
                    )}
                    {pesanBukti && (
                      <p className="pembayaran-error">{pesanBukti}</p>
                    )}
                  </div>
                )}
              <button type="submit" className="konfirmasi-btn">
                Konfirmasi klaim makanan
              </button>
            </form>
          </section>
        </div>
      )}
      {modalDaftarTerbuka && (
        <div
          className="klaim-overlay"
          onClick={(e) => tutupJikaLatar(e, tutupDaftar)}
        >
          <section
            className="daftar-klaim-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="judul-daftar-klaim"
          >
            <button
              type="button"
              className="modal-close"
              onClick={tutupDaftar}
              aria-label="Tutup daftar klaim"
            >
              &times;
            </button>
            <h2
              className="daftar-klaim-title"
              id="judul-daftar-klaim"
            >
              <span className="daftar-klaim-icon">▣</span>
              Daftar Klaim Makanan Anda
            </h2>
            {!nomorAktif ? (
              <form onSubmit={cekKlaim} style={{ margin: "8px 0 12px" }}>
                <p style={{ margin: "0 0 12px", opacity: 0.8 }}>
                  Masukkan nomor WhatsApp yang Anda pakai saat klaim untuk
                  melihat status klaim Anda.
                </p>
                <input
                  type="tel"
                  placeholder="cth: 081122334455"
                  value={nomorCek}
                  onChange={(e) => {
                    setNomorCek(e.target.value);
                    setPesanCek("");
                  }}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 14px",
                    marginBottom: "12px",
                    borderRadius: "10px",
                    border: "1px solid #38383c",
                    backgroundColor: "#16171a",
                    color: "#fff",
                    fontSize: "1rem",
                  }}
                />
                {pesanCek && (
                  <p className="pembayaran-error">{pesanCek}</p>
                )}
                <button type="submit" className="konfirmasi-btn">
                  Cek klaim saya
                </button>
              </form>
            ) : (
              <>
                <p style={{ margin: "0 0 12px", opacity: 0.8 }}>
                  Klaim untuk nomor {nomorAktif}.{" "}
                  <button
                    type="button"
                    onClick={gantiNomor}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      font: "inherit",
                      cursor: "pointer",
                      textDecoration: "underline",
                      color: "inherit",
                    }}
                  >
                    Ganti nomor
                  </button>
                </p>
                {klaimSaya.length ? (
                  <div className="daftar-klaim-list">
                    {[...klaimSaya].reverse().map((klaim) => {
                      const qrisKlaim = ambilPembayaranMitra(
                        pembayaranMitra,
                        klaim.restoran
                      ).qris;
                      return (
                        <article
                          className="daftar-klaim-card"
                          key={klaim.id}
                        >
                          <div className="daftar-klaim-header">
                            <div>
                              <h3>{klaim.makanan}</h3>
                              <p className="klaim-restoran">
                                ♧ {klaim.restoran}
                              </p>
                            </div>
                            <span className="klaim-status">
                              {klaim.status}
                            </span>
                          </div>
                          <div className="daftar-klaim-info">
                            <span>Jumlah: {klaim.jumlah} porsi</span>
                            <span>
                              Pengambilan: {labelPengambilan(klaim)}
                            </span>
                            <span>
                              Pembayaran: {labelPembayaran(klaim)}
                            </span>
                          </div>
                          <div className="klaim-detail-tambahan">
                            <p>Nama: {klaim.nama}</p>
                            <p>WhatsApp: {klaim.whatsapp}</p>
                            <p>
                              Alamat Penerima:{" "}
                              {klaim.alamatPenerima || "-"}
                            </p>
                            <p>Alamat Restoran: {klaim.alamat || "-"}</p>
                            {klaim.bankVA && (
                              <>
                                <p>Bank: {klaim.bankVA}</p>
                                <p>Nomor VA: {klaim.nomorVA || "-"}</p>
                                {klaim.nomorVA && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      salinNomorVA(klaim.nomorVA)
                                    }
                                    style={{
                                      background: "none",
                                      border: "none",
                                      padding: 0,
                                      font: "inherit",
                                      cursor: "pointer",
                                      textDecoration: "underline",
                                      color: "inherit",
                                    }}
                                  >
                                    Salin nomor VA
                                  </button>
                                )}
                              </>
                            )}
                            {klaim.metodePembayaran === "QRIS" && (
                              <div>
                                <p>QRIS {klaim.restoran}:</p>
                                {qrisKlaim ? (
                                  <img
                                    src={qrisKlaim}
                                    alt={`QRIS ${klaim.restoran}`}
                                    className="qris-image"
                                  />
                                ) : (
                                  <p>QRIS belum didaftarkan oleh Mitra.</p>
                                )}
                              </div>
                            )}
                            <p>
                              Status pembayaran:{" "}
                              {klaim.statusPembayaran || "-"}
                            </p>
                            {klaim.namaFileBukti && (
                              <p>File bukti: {klaim.namaFileBukti}</p>
                            )}
                            {klaim.buktiPembayaran && (
                              <button
                                type="button"
                                className="lihat-bukti-link"
                                onClick={() =>
                                  bukaBukti(klaim.buktiPembayaran)
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  padding: 0,
                                  font: "inherit",
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                }}
                              >
                                Lihat bukti pembayaran
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="klaim-kosong">
                    <p>Belum ada klaim dengan nomor ini.</p>
                    <button
                      type="button"
                      className="konfirmasi-btn"
                      onClick={tutupSemuaModal}
                    >
                      Cari makanan
                    </button>
                  </div>
                )}
              </>
            )}
            <button
              type="button"
              className="tutup-daftar-btn"
              onClick={tutupDaftar}
            >
              Tutup
            </button>
          </section>
        </div>
      )}
    </div>
  );
}