import { useState } from "react";
import { Link } from "react-router-dom";
import "./Penerima.css";
const makananList = [
  {
    id: 1,
    restoran: "Restoran sederhana BC",
    makanan: "Ayam Bakar & Lalapan",
    porsi: 8,
    batas: "21:30",
    alamat: "Jl. Engku Putri No.12",
    harga: 12000,
    gambar:"https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500",
  },

  {
    id: 2,
    restoran: "Warung ibu dwi",
    makanan: "Ayam penyet & Ayam bakar",
    porsi: 5,
    batas: "23:00",
    alamat: "Jl. Bengkong No.2",
    harga: 0,
    gambar:"https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500",
  },

  {
    id: 3,
    restoran: "Restoran murah meriah",
    makanan: "Ikan Bakar & Asam Manis",
    porsi: 8,
    batas: "22:30",
    alamat: "Jl. Engku Putri No.12",
    harga: 18000,
    gambar:"https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500",
  },
];

function LogoMakanan() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-label="Logo Surplus">
      <path d="M17 5 C9 10 27 12 18 19 M29 5 C21 10 39 12 30 19 M23 2 C15 7 33 9 24 15"stroke="white"strokeWidth="2.5"strokeLinecap="round"/>
      <path d="M7 31 C9 22 16 19 24 19 C32 19 39 22 41 31 Z"fill="white"/>
      <path d="M5 34 H43 M12 38 H36"stroke="white"strokeWidth="2.5"strokeLinecap="round"/>
    </svg>
  );

}
function LogoBanner() {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-label="Logo Surplus">
      <circle cx="50" cy="50" r="50" fill="#e52529" />
      <path d="M18 32 C27 42 35 22 49 28 C39 37 46 46 58 52 C73 60 67 77 49 84 C57 69 42 63 32 57 C23 52 27 43 18 32Z"fill="#29292c"/>
      <path d="M65 19 C78 29 83 43 77 57 C72 49 64 42 66 34 C67 28 69 24 65 19Z"fill="#29292c"/>
      <path d="M12 24 C18 14 28 8 39 6 C31 13 29 21 32 29 C24 25 18 25 12 24Z"fill="#29292c"/>
    </svg>
  );

}
function Penerima() {
  const [cari, setCari] = useState("");
  const [filter, setFilter] = useState("Semua");
  // Data klaim disimpan dalam state selama halaman masih aktif.
  const [daftarKlaim, setDaftarKlaim] = useState([]);
  const [makananDipilih, setMakananDipilih] = useState(null);
  const [modalKlaimTerbuka, setModalKlaimTerbuka] = useState(false);
  const [modalDaftarTerbuka, setModalDaftarTerbuka] = useState(false);
  const [namaLengkap, setNamaLengkap] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [jumlahPorsi, setJumlahPorsi] = useState(1);
  const [metodePengambilan, setMetodePengambilan] = useState("");
  const sisaPorsi = (item) => {
    const sudahDiklaim = daftarKlaim
      .filter((klaim) => klaim.idMakanan === item.id)
      .reduce((total, klaim) => total + klaim.jumlah, 0);
    return Math.max(0, item.porsi - sudahDiklaim);
  };
  const makananTampil = makananList.filter((item) => {
    const kataKunci = cari.toLowerCase();
    const cocokCari =
      item.restoran.toLowerCase().includes(kataKunci) ||
      item.makanan.toLowerCase().includes(kataKunci);
    const cocokFilter =
      filter === "Semua" ||
      (filter === "Gratis" && item.harga === 0) ||
      (filter === "Berbayar" && item.harga > 0);
    return cocokCari && cocokFilter && sisaPorsi(item) > 0;
  });
  const klaimMakanan = (item) => {
    setMakananDipilih(item);
    setNamaLengkap("");
    setWhatsapp("");
    setJumlahPorsi(1);
    setMetodePengambilan("");
    setModalKlaimTerbuka(true);
  };

  const konfirmasiKlaim = (e) => {
    e.preventDefault();
    if (!makananDipilih) return;
    if (!namaLengkap.trim() || !whatsapp.trim() || !metodePengambilan) {
      alert("Lengkapi semua data klaim terlebih dahulu.");
      return;
    }
    if (!/^[0-9+\\-\s()]{8,20}$/.test(whatsapp.trim())) {
      alert("Masukkan nomor WhatsApp yang valid.");
      return;
    }
    const jumlah = Number(jumlahPorsi);
    const stokTersedia = sisaPorsi(makananDipilih);
    if (!Number.isInteger(jumlah) || jumlah < 1 || jumlah > stokTersedia) {
      alert("Jumlah porsi melebihi stok yang tersedia.");
      return;
    }

    const klaimBaru = {
      id: `${Date.now()}-${makananDipilih.id}`,
      idMakanan: makananDipilih.id,
      restoran: makananDipilih.restoran,
      makanan: makananDipilih.makanan,
      harga: makananDipilih.harga,
      alamat: makananDipilih.alamat,
      nama: namaLengkap.trim(),
      whatsapp: whatsapp.trim(),
      jumlah,
      metode: metodePengambilan,
      status: "Menunggu Konfirmasi",
    };
    setDaftarKlaim((sebelumnya) => [...sebelumnya, klaimBaru]);
    setModalKlaimTerbuka(false);
    setModalDaftarTerbuka(true);
  };
  const lihatKlaimSaya = () => {
    setModalDaftarTerbuka(true);
  };
  const tutupSemuaModal = () => {
    setModalKlaimTerbuka(false);
    setModalDaftarTerbuka(false);
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
      {/* Konten utama */}
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
        {/* Pencarian dan filter */}
        <section className="search-filter">
          <div className="search-box">
            <svg className="search-icon"viewBox="0 0 24 24"fill="none"aria-hidden="true">
              <circle cx="10.8"cy="10.8"r="6.8"stroke="currentColor"strokeWidth="2"/>
              <path d="M16 16 L21 21"stroke="currentColor"strokeWidth="2"strokeLinecap="round"/>
              </svg>
              <input type="text"placeholder="Cari nama makanan dan restoran"value={cari}onChange={(e) => setCari(e.target.value)}/>
          </div>
          <div className="filter-buttons">{["Semua", "Gratis", "Berbayar"].map((item) => (
              <button key={item}type="button"className={`filter-btn ${filter === item ? "filter-active" : ""}`}onClick={() => setFilter(item)}>
                {item === "Semua" ? "Semua makanan" : item}
              </button>
            ))}
          </div>
        </section>
        {/* Kartu makanan */}
        <section className="food-grid" id="daftar-makanan">{makananTampil.length > 0 ? (makananTampil.map((item) => (
              <article className="food-card" key={item.id}>
                <div className="food-image-wrapper">
                  <span className="food-price">{item.harga === 0? "Gratis": `Harga Rp ${item.harga.toLocaleString("id-ID")}`}</span>
                  <img src={item.gambar}alt={item.makanan}className="food-image"/>
                </div>
                <div className="food-details">
                  <h3>
                    <span className="detail-icon" aria-hidden="true">♧</span>{item.restoran}
                  </h3>
                  <p className="food-name">{item.makanan}</p>

                  <p>
                    <span className="detail-icon" aria-hidden="true">▣</span>Sisa: {sisaPorsi(item)} porsi
                  </p>

                  <p>
                    <span className="detail-icon" aria-hidden="true">◷</span>Batas ambil hari ini, {item.batas}
                  </p>

                  <p>
                    <span className="detail-icon" aria-hidden="true">⌖</span>{item.alamat}
                  </p>
                  <button type="button"className="claim-btn"onClick={() => klaimMakanan(item)}disabled={sisaPorsi(item) <= 0}>
                    {sisaPorsi(item) <= 0 ? "Stok habis" : "Klaim makanan ini"}
                  </button>
                </div>

              </article>))) : (
            <div className="empty-food">Makanan tidak ditemukan atau stok habis.</div>
          )}
        </section>
      </main>
      {/* Footer */}
      <footer className="penerima-footer">
        © 2026 Surplus - Platform Distribusi Makanan Berlebih.
      </footer>

      {/* Modal formulir klaim makanan */}
      {modalKlaimTerbuka && makananDipilih && (
        <div className="klaim-overlay"onClick={(e) => {if (e.target === e.currentTarget) setModalKlaimTerbuka(false);}}>
          <section className="klaim-modal"role="dialog"aria-modal="true"aria-labelledby="judul-form-klaim">
            <button type="button"className="modal-close"onClick={() => setModalKlaimTerbuka(false)}aria-label="Tutup formulir">
              &times;
            </button>
            <span className="modal-price">{makananDipilih.harga === 0? "Gratis": `Harga Rp ${makananDipilih.harga.toLocaleString("id-ID")}`}</span>
            <h2 id="judul-form-klaim">{makananDipilih.makanan}</h2>
            <p className="modal-restaurant">
              Donatur: {makananDipilih.restoran}
            </p>

            <form onSubmit={konfirmasiKlaim}>
              <label htmlFor="namaLengkap">Nama Lengkap/Nama Lembaga</label>
              <input
                id="namaLengkap"
                type="text"
                placeholder="cth: panti asuhan"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                required
              />
              <label htmlFor="whatsapp">No WhatsApp Aktif</label>
              <input
                id="whatsapp"
                type="tel"
                placeholder="cth: 081122334455"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
              />
              <label htmlFor="jumlahPorsi">Jumlah Porsi yang Ingin Diklaim</label>
              <select
                id="jumlahPorsi"
                value={jumlahPorsi}
                onChange={(e) => setJumlahPorsi(Number(e.target.value))}
                required
              >
                {Array.from(
                  { length: Math.max(0, sisaPorsi(makananDipilih)) },
                  (_, i) => i + 1
                ).map((jumlah) => (
                  <option key={jumlah} value={jumlah}>
                    {jumlah}
                  </option>
                ))}

              </select>
              <label htmlFor="metodePengambilan">Mode Pengambilan</label>
              <select
                id="metodePengambilan"
                value={metodePengambilan}
                onChange={(e) => setMetodePengambilan(e.target.value)}
                required
              >
                <option value="">Pilih metode pengambilan</option>
                <option value="Ambil sendiri">Ambil sendiri</option>
                <option value="QRIS">QRIS</option>
                <option value="Virtual Account">Virtual Account</option>
                <option value="Tunai">Tunai</option>
              </select>
              <button type="submit" className="konfirmasi-btn">
                Konfirmasi klaim makanan
              </button>
            </form>
          </section>
        </div>
      )}

      {/* Modal daftar klaim saya */}
      {modalDaftarTerbuka && (
        <div
          className="klaim-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalDaftarTerbuka(false);
          }}
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
              onClick={() => setModalDaftarTerbuka(false)}
              aria-label="Tutup daftar klaim"
            >
              &times;
            </button>
            <h2 className="daftar-klaim-title" id="judul-daftar-klaim">
              <span className="daftar-klaim-icon" aria-hidden="true">▣</span>
              Daftar Klaim Makanan Anda
            </h2>
            {daftarKlaim.length > 0 ? (
              <div className="daftar-klaim-list">
                {[...daftarKlaim].reverse().map((klaim) => (
                  <article className="daftar-klaim-card" key={klaim.id}>
                    <div className="daftar-klaim-header">
                      <div>
                        <h3>{klaim.makanan}</h3>
                        <p className="klaim-restoran">♧ {klaim.restoran}</p>
                      </div>
                      <span className="klaim-status">{klaim.status}</span>
                    </div>
                    <div className="daftar-klaim-info">
                      <span>Jumlah: {klaim.jumlah} porsi</span>
                      <span>Metode: {klaim.metode}</span>
                    </div>
                    <div className="klaim-detail-tambahan">
                      <p>Nama: {klaim.nama}</p>
                      <p>WhatsApp: {klaim.whatsapp}</p>
                      <p>Alamat: {klaim.alamat}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="klaim-kosong">
                <p>Belum ada makanan yang diklaim.</p>
                <button
                  type="button"
                  className="konfirmasi-btn"
                  onClick={tutupSemuaModal}
                >
                  Cari makanan
                </button>
              </div>
            )}
            <button
              type="button"
              className="tutup-daftar-btn"
              onClick={() => setModalDaftarTerbuka(false)}
            >
              Tutup
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
export default Penerima;
