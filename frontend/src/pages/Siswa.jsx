import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useToast } from '../components/Toast';

const Siswa = () => {
  const [data, setData] = useState([]);
  const [kabupatens, setKabupatens] = useState([]);
  const [kecamatans, setKecamatans] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { addToast, showConfirm } = useToast();
  const [formData, setFormData] = useState({ 
    nama_siswa: '', 
    id_kota_kabupaten: '', 
    id_kecamatan: '', 
    alamat: '' 
  });

  useEffect(() => {
    fetchData();
    fetchKabupatens();
    fetchKecamatans();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/siswas');
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchKabupatens = async () => {
    try {
      const res = await api.get('/kabupatens');
      setKabupatens(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchKecamatans = async () => {
    try {
      const res = await api.get('/kecamatans');
      setKecamatans(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id_siswa);
      setFormData({ 
        nama_siswa: item.nama_siswa,
        id_kota_kabupaten: item.id_kota_kabupaten, 
        id_kecamatan: item.id_kecamatan,
        alamat: item.alamat
      });
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
        alamat: formData.alamat
      };

      if (editingId) {
        await api.put(`/siswas/${editingId}`, payload);
        addToast('Siswa updated successfully!', 'success');
      } else {
        await api.post('/siswas', payload);
        addToast('Siswa created successfully!', 'success');
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      addToast(err.response?.data?.error || 'Error saving data', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm('Are you sure you want to delete this Siswa?');
    if (confirmed) {
      try {
        await api.delete(`/siswas/${id}`);
        addToast('Siswa deleted successfully!', 'success');
        fetchData();
      } catch (err) {
        addToast(err.response?.data?.error || 'Error deleting data', 'error');
      }
    }
  };

  const getKabupatenName = (id) => {
    const kab = kabupatens.find(k => k.id_kota_kabupaten === id);
    return kab ? kab.nama : id;
  };

  const getKecamatanName = (id) => {
    const kec = kecamatans.find(k => k.id_kecamatan === id);
    return kec ? kec.nama : id;
  };

  // filter kecamatan based on selected kabupaten
  const filteredKecamatans = formData.id_kota_kabupaten 
    ? kecamatans.filter(k => k.id_kota_kabupaten === parseInt(formData.id_kota_kabupaten))
    : [];

  return (
    <div>
      <div className="header-actions">
        <h2>Data Siswa</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ width: 'auto' }}>
          <Plus size={18} /> Add Siswa
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Siswa</th>
            <th>Alamat</th>
            <th>Kabupaten</th>
            <th>Kecamatan</th>
            <th style={{ width: '150px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id_siswa}>
              <td>{item.id_siswa}</td>
              <td>{item.nama_siswa}</td>
              <td>{item.alamat}</td>
              <td>
                <span className="badge">{item.Kabupaten?.nama || getKabupatenName(item.id_kota_kabupaten)}</span>
              </td>
              <td>
                <span className="badge">{item.Kecamatan?.nama || getKecamatanName(item.id_kecamatan)}</span>
              </td>
              <td>
                <div className="action-buttons">
                  <button className="btn btn-ghost btn-icon" onClick={() => handleOpenModal(item)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn btn-danger btn-icon" onClick={() => handleDelete(item.id_siswa)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No data found</td>
            </tr>
          )}
        </tbody>
      </table>

      {isModalOpen && createPortal(
        <div className="modal-overlay">
          <div className="glass-panel" style={{ position: 'relative' }}>
            <button 
              className="btn btn-ghost btn-icon" 
              onClick={handleCloseModal}
              style={{ position: 'absolute', top: '1rem', right: '1rem' }}
            >
              <X size={20} />
            </button>
            <h3>{editingId ? 'Edit Siswa' : 'Add Siswa'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama Siswa</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.nama_siswa}
                  onChange={(e) => setFormData({ ...formData, nama_siswa: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Alamat</label>
                <textarea 
                  className="form-control" 
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  required
                  rows="3"
                ></textarea>
              </div>

              <div className="form-group">
                <label>Kabupaten</label>
                <select 
                  className="form-control" 
                  value={formData.id_kota_kabupaten}
                  onChange={(e) => {
                    setFormData({ ...formData, id_kota_kabupaten: e.target.value, id_kecamatan: '' })
                  }}
                  required
                >
                  <option value="">Select Kabupaten</option>
                  {kabupatens.map(kab => (
                    <option key={kab.id_kota_kabupaten} value={kab.id_kota_kabupaten}>
                      {kab.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Kecamatan</label>
                <select 
                  className="form-control" 
                  value={formData.id_kecamatan}
                  onChange={(e) => setFormData({ ...formData, id_kecamatan: e.target.value })}
                  required
                  disabled={!formData.id_kota_kabupaten}
                >
                  <option value="">Select Kecamatan</option>
                  {filteredKecamatans.map(kec => (
                    <option key={kec.id_kecamatan} value={kec.id_kecamatan}>
                      {kec.nama}
                    </option>
                  ))}
                </select>
                {!formData.id_kota_kabupaten && (
                  <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                    * Please select Kabupaten first
                  </small>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Save
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
