import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useToast } from '../components/Toast';

const Kecamatan = () => {
  const [data, setData] = useState([]);
  const [kabupatens, setKabupatens] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ id_kota_kabupaten: '', nama: '' });
  const { addToast, showConfirm } = useToast();

  useEffect(() => {
    fetchData();
    fetchKabupatens();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/kecamatans');
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

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id_kecamatan);
      setFormData({ id_kota_kabupaten: item.id_kota_kabupaten, nama: item.nama });
    } else {
      setEditingId(null);
      setFormData({ id_kota_kabupaten: '', nama: '' });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData({ id_kota_kabupaten: '', nama: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { nama: formData.nama, id_kota_kabupaten: parseInt(formData.id_kota_kabupaten) };
      if (editingId) {
        await api.put(`/kecamatans/${editingId}`, payload);
        addToast('Kecamatan updated successfully!', 'success');
      } else {
        await api.post('/kecamatans', payload);
        addToast('Kecamatan created successfully!', 'success');
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      addToast(err.response?.data?.error || 'Error saving data', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm('Are you sure you want to delete this Kecamatan?');
    if (confirmed) {
      try {
        await api.delete(`/kecamatans/${id}`);
        addToast('Kecamatan deleted successfully!', 'success');
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

  return (
    <div>
      <div className="header-actions">
        <h2>Data Kecamatan</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ width: 'auto' }}>
          <Plus size={18} /> Add Kecamatan
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Kecamatan</th>
            <th>Kabupaten</th>
            <th style={{ width: '150px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id_kecamatan}>
              <td>{item.id_kecamatan}</td>
              <td>{item.nama}</td>
              <td>
                <span className="badge">{item.Kabupaten?.nama || getKabupatenName(item.id_kota_kabupaten)}</span>
              </td>
              <td>
                <div className="action-buttons">
                  <button className="btn btn-ghost btn-icon" onClick={() => handleOpenModal(item)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn btn-danger btn-icon" onClick={() => handleDelete(item.id_kecamatan)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No data found</td>
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
            <h3>{editingId ? 'Edit Kecamatan' : 'Add Kecamatan'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama Kecamatan</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Kabupaten</label>
                <select
                  className="form-control"
                  value={formData.id_kota_kabupaten}
                  onChange={(e) => setFormData({ ...formData, id_kota_kabupaten: e.target.value })}
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

export default Kecamatan;
