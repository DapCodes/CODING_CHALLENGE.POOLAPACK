import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react';
import { useToast } from '../components/Toast';

const Kabupaten = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nama: '' });
  const { addToast, showConfirm } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/kabupatens');
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
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
        addToast('Kabupaten updated successfully!', 'success');
      } else {
        await api.post('/kabupatens', formData);
        addToast('Kabupaten created successfully!', 'success');
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      addToast(err.response?.data?.error || 'Error saving data', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm('Are you sure you want to delete this Kabupaten?');
    if (confirmed) {
      try {
        await api.delete(`/kabupatens/${id}`);
        addToast('Kabupaten deleted successfully!', 'success');
        fetchData();
      } catch (err) {
        addToast(err.response?.data?.error || 'Error deleting data', 'error');
      }
    }
  };

  const filtered = data.filter(item =>
    item.nama?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="header-actions">
        <h2>Data Kabupaten</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ width: 'auto' }}>
          <Plus size={18} /> Add Kabupaten
        </button>
      </div>

      <div className="search-bar">
        <Search size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search kabupaten..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="search-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Kabupaten</th>
              <th style={{ width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id_kota_kabupaten}>
                <td>{item.id_kota_kabupaten}</td>
                <td>{item.nama}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-ghost btn-icon" onClick={() => handleOpenModal(item)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-danger btn-icon" onClick={() => handleDelete(item.id_kota_kabupaten)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No data found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
            <h3>{editingId ? 'Edit Kabupaten' : 'Add Kabupaten'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama Kabupaten</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
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

export default Kabupaten;
