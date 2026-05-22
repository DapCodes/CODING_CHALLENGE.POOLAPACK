import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';
import { Plus, Edit2, Trash2, X, Search, FileDown, FileUp, FileText, Download } from 'lucide-react';
import { useToast } from '../components/Toast';
import Pagination from '../components/Pagination';
import { exportToExcel, exportToPDF, importFromExcel, downloadTemplate } from '../utils/exportUtils';

const COLUMNS_EXPORT = [
  { label: 'ID', value: r => r.id_siswa, width: 8, pdfWidth: 12, align: 'center' },
  { label: 'Nama Siswa', value: r => r.nama_siswa, width: 30, pdfWidth: 'auto' },
  { label: 'Alamat', value: r => r.alamat, width: 40, pdfWidth: 'auto' },
  { label: 'Kabupaten / Kota', value: r => r.Kabupaten?.nama || r.id_kota_kabupaten, width: 25, pdfWidth: 'auto' },
  { label: 'Kecamatan', value: r => r.Kecamatan?.nama || r.id_kecamatan, width: 25, pdfWidth: 'auto' },
];
const IMPORT_TEMPLATE_COLS = [
  { label: 'nama_siswa', width: 30, example: 'Budi Santoso' },
  { label: 'alamat', width: 40, example: 'Jl. Merdeka No. 1' },
  { label: 'id_kota_kabupaten', width: 18, example: '1' },
  { label: 'id_kecamatan', width: 15, example: '1' },
];

const Siswa = () => {
  const [data, setData] = useState([]);
  const [kabupatens, setKabupatens] = useState([]);
  const [kecamatans, setKecamatans] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [importing, setImporting] = useState(false);
  const [formData, setFormData] = useState({ nama_siswa: '', id_kota_kabupaten: '', id_kecamatan: '', alamat: '' });
  const fileInputRef = useRef();
  const exportMenuRef = useRef();
  const { addToast, showConfirm } = useToast();

  useEffect(() => { fetchData(); fetchKabupatens(); fetchKecamatans(); }, []);

  useEffect(() => {
    const handler = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) setShowExportMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchData = async () => {
    try { const res = await api.get('/siswas'); setData(res.data); }
    catch (err) { console.error(err); }
  };
  const fetchKabupatens = async () => {
    try { const res = await api.get('/kabupatens'); setKabupatens(res.data); }
    catch (err) { console.error(err); }
  };
  const fetchKecamatans = async () => {
    try { const res = await api.get('/kecamatans'); setKecamatans(res.data); }
    catch (err) { console.error(err); }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id_siswa);
      setFormData({ nama_siswa: item.nama_siswa, id_kota_kabupaten: item.id_kota_kabupaten, id_kecamatan: item.id_kecamatan, alamat: item.alamat });
    } else {
      setEditingId(null);
      setFormData({ nama_siswa: '', id_kota_kabupaten: '', id_kecamatan: '', alamat: '' });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData({ nama_siswa: '', id_kota_kabupaten: '', id_kecamatan: '', alamat: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nama_siswa: formData.nama_siswa,
        id_kota_kabupaten: parseInt(formData.id_kota_kabupaten),
        id_kecamatan: parseInt(formData.id_kecamatan),
        alamat: formData.alamat,
      };
      if (editingId) {
        await api.put(`/siswas/${editingId}`, payload);
        addToast('Data siswa berhasil diupdate!', 'success');
      } else {
        await api.post('/siswas', payload);
        addToast('Siswa berhasil ditambahkan!', 'success');
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      addToast(err.response?.data?.error || 'Error menyimpan data', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm('Yakin ingin menghapus data siswa ini?');
    if (confirmed) {
      try {
        await api.delete(`/siswas/${id}`);
        addToast('Siswa berhasil dihapus!', 'success');
        fetchData();
      } catch (err) {
        addToast(err.response?.data?.error || 'Error menghapus data', 'error');
      }
    }
  };

  const getKabupatenName = (id) => { const k = kabupatens.find(k => k.id_kota_kabupaten === id); return k ? k.nama : String(id); };
  const getKecamatanName = (id) => { const k = kecamatans.find(k => k.id_kecamatan === id); return k ? k.nama : String(id); };
  const filteredKecamatans = formData.id_kota_kabupaten
    ? kecamatans.filter(k => k.id_kota_kabupaten === parseInt(formData.id_kota_kabupaten))
    : [];

  // ── Import Excel ──────────────────────────────────────────
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImporting(true);
    try {
      const rows = await importFromExcel(file);
      if (!rows.length) { addToast('File Excel kosong', 'error'); return; }

      let success = 0, failed = 0;
      for (const row of rows) {
        const nama_siswa = String(row['nama_siswa'] || '').trim();
        const alamat = String(row['alamat'] || '').trim();
        const id_kota_kabupaten = parseInt(row['id_kota_kabupaten']);
        const id_kecamatan = parseInt(row['id_kecamatan']);
        if (!nama_siswa || !alamat || isNaN(id_kota_kabupaten) || isNaN(id_kecamatan)) { failed++; continue; }
        try {
          await api.post('/siswas', { nama_siswa, alamat, id_kota_kabupaten, id_kecamatan });
          success++;
        } catch { failed++; }
      }
      fetchData();
      addToast(`Import selesai: ${success} berhasil${failed ? `, ${failed} gagal` : ''}`, success ? 'success' : 'error');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setImporting(false);
    }
  };

  // ── Filters & Pagination ──────────────────────────────────
  const filtered = data.filter(item => {
    const q = search.toLowerCase();
    return (
      item.nama_siswa?.toLowerCase().includes(q) ||
      item.alamat?.toLowerCase().includes(q) ||
      (item.Kabupaten?.nama || getKabupatenName(item.id_kota_kabupaten))?.toLowerCase().includes(q) ||
      (item.Kecamatan?.nama || getKecamatanName(item.id_kecamatan))?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);
  const handleSearch = (val) => { setSearch(val); setCurrentPage(1); };

  return (
    <div>
      {/* ── Header ── */}
      <div className="header-actions">
        <h2>Data Siswa</h2>
        <div className="header-btn-group">
          <button className="btn btn-import" onClick={() => fileInputRef.current?.click()} disabled={importing} title="Import dari Excel">
            <FileUp size={16} /> {importing ? 'Importing…' : 'Import Excel'}
          </button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImport} />

          <button className="btn btn-template" onClick={() => downloadTemplate(IMPORT_TEMPLATE_COLS, 'siswa')} title="Download template">
            <Download size={16} /> Template
          </button>

          <div ref={exportMenuRef} style={{ position: 'relative' }}>
            <button className="btn btn-export" onClick={() => setShowExportMenu(v => !v)}>
              <FileDown size={16} /> Export ▾
            </button>
            {showExportMenu && (
              <div className="export-menu">
                <button onClick={() => { exportToExcel(filtered, COLUMNS_EXPORT, 'siswa', 'Data Siswa'); setShowExportMenu(false); }}>
                  <FileDown size={14} /> Export Excel
                </button>
                <button onClick={() => { exportToPDF(filtered, COLUMNS_EXPORT, 'siswa', 'Data Siswa'); setShowExportMenu(false); }}>
                  <FileText size={14} /> Export PDF
                </button>
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ width: 'auto' }}>
            <Plus size={16} /> Tambah
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="search-bar">
        <Search size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Cari nama, alamat, kabupaten, kecamatan..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
        />
        <span className="search-count">{filtered.length} hasil</span>
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style={{ width: '55px' }}>No</th>
              <th style={{ width: '70px' }}>ID</th>
              <th>Nama Siswa</th>
              <th>Alamat</th>
              <th>Kabupaten</th>
              <th>Kecamatan</th>
              <th style={{ width: '110px' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((item, idx) => (
              <tr key={item.id_siswa}>
                <td className="td-center td-muted">{(safePage - 1) * itemsPerPage + idx + 1}</td>
                <td className="td-center"><span className="id-badge">{item.id_siswa}</span></td>
                <td className="td-bold">{item.nama_siswa}</td>
                <td className="td-alamat">{item.alamat}</td>
                <td><span className="badge">{item.Kabupaten?.nama || getKabupatenName(item.id_kota_kabupaten)}</span></td>
                <td><span className="badge badge-kecamatan">{item.Kecamatan?.nama || getKecamatanName(item.id_kecamatan)}</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-ghost btn-icon" onClick={() => handleOpenModal(item)} title="Edit">
                      <Edit2 size={15} />
                    </button>
                    <button className="btn btn-danger btn-icon" onClick={() => handleDelete(item.id_siswa)} title="Hapus">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan="7" className="td-empty">
                  {search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada data siswa'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* ── Modal ── */}
      {isModalOpen && createPortal(
        <div className="modal-overlay">
          <div className="glass-panel modal-panel" style={{ position: 'relative' }}>
            <button className="btn btn-ghost btn-icon modal-close" onClick={handleCloseModal}>
              <X size={20} />
            </button>
            <h3>{editingId ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama Siswa</label>
                <input type="text" className="form-control" placeholder="cth: Budi Santoso"
                  value={formData.nama_siswa}
                  onChange={e => setFormData({ ...formData, nama_siswa: e.target.value })}
                  required />
              </div>
              <div className="form-group">
                <label>Alamat</label>
                <textarea className="form-control" placeholder="cth: Jl. Merdeka No. 1"
                  value={formData.alamat}
                  onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                  required rows="3" />
              </div>
              <div className="form-group">
                <label>Kabupaten / Kota</label>
                <select className="form-control"
                  value={formData.id_kota_kabupaten}
                  onChange={e => setFormData({ ...formData, id_kota_kabupaten: e.target.value, id_kecamatan: '' })}
                  required>
                  <option value="">Pilih Kabupaten</option>
                  {kabupatens.map(kab => (
                    <option key={kab.id_kota_kabupaten} value={kab.id_kota_kabupaten}>{kab.nama}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Kecamatan</label>
                <select className="form-control"
                  value={formData.id_kecamatan}
                  onChange={e => setFormData({ ...formData, id_kecamatan: e.target.value })}
                  required
                  disabled={!formData.id_kota_kabupaten}>
                  <option value="">Pilih Kecamatan</option>
                  {filteredKecamatans.map(kec => (
                    <option key={kec.id_kecamatan} value={kec.id_kecamatan}>{kec.nama}</option>
                  ))}
                </select>
                {!formData.id_kota_kabupaten && (
                  <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                    * Pilih Kabupaten terlebih dahulu
                  </small>
                )}
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                Simpan Data
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Siswa;
