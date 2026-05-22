import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';
import { Plus, Edit2, Trash2, X, Search, FileDown, FileUp, FileText, Download } from 'lucide-react';
import { useToast } from '../components/Toast';
import Pagination from '../components/Pagination';
import { exportToExcel, exportToPDF, importFromExcel, downloadTemplate } from '../utils/exportUtils';

const COLUMNS_EXPORT = [
  { label: 'ID', value: r => r.id_kota_kabupaten, width: 8, pdfWidth: 15, align: 'center' },
  { label: 'Nama Kabupaten / Kota', value: r => r.nama, width: 35, pdfWidth: 'auto' },
];
const IMPORT_TEMPLATE_COLS = [
  { label: 'nama', width: 30, example: 'Kota Bandung' },
];

const Kabupaten = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nama: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef();
  const exportMenuRef = useRef();
  const { addToast, showConfirm } = useToast();

  useEffect(() => { fetchData(); }, []);


  useEffect(() => {
    const handler = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) setShowExportMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/kabupatens');
      setData(res.data);
    } catch (err) { console.error(err); }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id_kota_kabupaten);
      setFormData({ nama: item.nama });
    } else {
      setEditingId(null);
      setFormData({ nama: '' });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData({ nama: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/kabupatens/${editingId}`, formData);
        addToast('Kabupaten berhasil diupdate!', 'success');
      } else {
        await api.post('/kabupatens', formData);
        addToast('Kabupaten berhasil ditambahkan!', 'success');
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      addToast(err.response?.data?.error || 'Error menyimpan data', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm('Yakin ingin menghapus Kabupaten ini?');
    if (confirmed) {
      try {
        await api.delete(`/kabupatens/${id}`);
        addToast('Kabupaten berhasil dihapus!', 'success');
        fetchData();
      } catch (err) {
        addToast(err.response?.data?.error || 'Error menghapus data', 'error');
      }
    }
  };


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
        const nama = String(row['nama'] || '').trim();
        if (!nama) { failed++; continue; }
        try {
          await api.post('/kabupatens', { nama });
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


  const filtered = data.filter(item =>
    item.nama?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const handleSearch = (val) => { setSearch(val); setCurrentPage(1); };

  return (
    <div>
      {}
      <div className="header-actions">
        <h2>Data Kabupaten / Kota</h2>
        <div className="header-btn-group">
          {}
          <button className="btn btn-import" onClick={() => fileInputRef.current?.click()} disabled={importing} title="Import dari Excel">
            <FileUp size={16} /> {importing ? 'Importing…' : 'Import Excel'}
          </button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImport} />

          {}
          <button
            className="btn btn-template"
            onClick={() => downloadTemplate(IMPORT_TEMPLATE_COLS, 'kabupaten')}
            title="Download template Excel"
          >
            <Download size={16} /> Template
          </button>

          {}
          <div ref={exportMenuRef} style={{ position: 'relative' }}>
            <button className="btn btn-export" onClick={() => setShowExportMenu(v => !v)}>
              <FileDown size={16} /> Export ▾
            </button>
            {showExportMenu && (
              <div className="export-menu">
                <button onClick={() => { exportToExcel(filtered, COLUMNS_EXPORT, 'kabupaten', 'Kabupaten'); setShowExportMenu(false); }}>
                  <FileDown size={14} /> Export Excel
                </button>
                <button onClick={() => { exportToPDF(filtered, COLUMNS_EXPORT, 'kabupaten', 'Data Kabupaten / Kota'); setShowExportMenu(false); }}>
                  <FileText size={14} /> Export PDF
                </button>
              </div>
            )}
          </div>

          {}
          <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ width: 'auto' }}>
            <Plus size={16} /> Tambah
          </button>
        </div>
      </div>

      {}
      <div className="search-bar">
        <Search size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Cari kabupaten..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
        />
        <span className="search-count">{filtered.length} hasil</span>
      </div>

      {}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style={{ width: '60px' }}>No</th>
              <th style={{ width: '80px' }}>ID</th>
              <th>Nama Kabupaten / Kota</th>
              <th style={{ width: '110px' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((item, idx) => (
              <tr key={item.id_kota_kabupaten}>
                <td className="td-center td-muted">{(safePage - 1) * itemsPerPage + idx + 1}</td>
                <td className="td-center"><span className="id-badge">{item.id_kota_kabupaten}</span></td>
                <td className="td-bold">{item.nama}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-ghost btn-icon" onClick={() => handleOpenModal(item)} title="Edit">
                      <Edit2 size={15} />
                    </button>
                    <button className="btn btn-danger btn-icon" onClick={() => handleDelete(item.id_kota_kabupaten)} title="Hapus">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan="4" className="td-empty">
                  {search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada data kabupaten'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {}
      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {}
      {isModalOpen && createPortal(
        <div className="modal-overlay">
          <div className="glass-panel modal-panel" style={{ position: 'relative' }}>
            <button className="btn btn-ghost btn-icon modal-close" onClick={handleCloseModal}>
              <X size={20} />
            </button>
            <h3>{editingId ? 'Edit Kabupaten' : 'Tambah Kabupaten'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama Kabupaten / Kota</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="cth: Kota Bandung"
                  value={formData.nama}
                  onChange={e => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                Simpan
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Kabupaten;
