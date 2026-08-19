import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Pages.css';

function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', platform: 'facebook' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/campaigns', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(response.data || []);
    } catch (err) {
      setError('Error al cargar campañas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/campaigns', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({ name: '', platform: 'facebook' });
      setShowModal(false);
      fetchCampaigns();
    } catch (err) {
      setError('Error al crear campaña');
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('¿Estás seguro?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCampaigns();
    } catch (err) {
      setError('Error al eliminar campaña');
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h1>🚀 Marketing</h1>
        <nav>
          <Link to="/" className="nav-link">📊 Dashboard</Link>
          <Link to="/campaigns" className="nav-link active">📢 Campañas</Link>
          <Link to="/contacts" className="nav-link">👥 Contactos</Link>
          <Link to="/analytics" className="nav-link">📈 Analytics</Link>
        </nav>
      </div>

      <div className="main-content">
        <div className="header">
          <h2>📢 Mis Campañas</h2>
          <button className="btn btn-success" onClick={() => setShowModal(true)}>
            + Nueva Campaña
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <p>Cargando...</p>
        ) : campaigns.length === 0 ? (
          <div className="card">
            <p>No hay campañas. ¡Crea una para empezar!</p>
          </div>
        ) : (
          <div className="campaigns-grid">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="campaign-card">
                <h3>{campaign.name}</h3>
                <p><strong>Plataforma:</strong> {campaign.platform}</p>
                <p><strong>Estado:</strong> <span className={`badge badge-${campaign.status}`}>{campaign.status}</span></p>
                <p><strong>Creado:</strong> {new Date(campaign.created_at).toLocaleDateString()}</p>
                <div className="card-actions">
                  <button className="btn btn-primary btn-sm">Editar</button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteCampaign(campaign.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal show">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Nueva Campaña</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleCreateCampaign}>
                <div className="form-group">
                  <label>Nombre de la Campaña</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="Mi primera campaña"
                  />
                </div>
                <div className="form-group">
                  <label>Plataforma</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  >
                    <option value="facebook">Facebook</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">Crear</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Campaigns;
