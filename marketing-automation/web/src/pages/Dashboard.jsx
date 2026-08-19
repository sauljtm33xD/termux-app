import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

function Dashboard({ onLogout }) {
  const [campaigns, setCampaigns] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [campaignsRes, contactsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/campaigns', { headers }),
        axios.get('http://localhost:5001/api/contacts', { headers })
      ]);

      setCampaigns(campaignsRes.data || []);
      setContacts(contactsRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h1>🚀 Marketing</h1>
        <nav>
          <Link to="/" className="nav-link active">📊 Dashboard</Link>
          <Link to="/campaigns" className="nav-link">📢 Campañas</Link>
          <Link to="/contacts" className="nav-link">👥 Contactos</Link>
          <Link to="/analytics" className="nav-link">📈 Analytics</Link>
          <button className="nav-link" onClick={handleLogout} style={{width: '100%', textAlign: 'left'}}>
            🚪 Salir
          </button>
        </nav>
      </div>

      <div className="main-content">
        <div className="header">
          <h2>📊 Dashboard</h2>
          <span style={{fontSize: '0.9em', color: '#7f8c8d'}}>¡Bienvenido!</span>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Campañas</h3>
            <div className="number">{campaigns.length}</div>
          </div>
          <div className="stat-card">
            <h3>Total Contactos</h3>
            <div className="number">{contacts.length}</div>
          </div>
          <div className="stat-card">
            <h3>En Ejecución</h3>
            <div className="number">{campaigns.filter(c => c.status === 'active').length}</div>
          </div>
          <div className="stat-card">
            <h3>Borradores</h3>
            <div className="number">{campaigns.filter(c => c.status === 'draft').length}</div>
          </div>
        </div>

        <div className="card">
          <h3>Campañas Recientes</h3>
          {loading ? (
            <p>Cargando...</p>
          ) : campaigns.length === 0 ? (
            <p>No hay campañas. <Link to="/campaigns">Crear una</Link></p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Plataforma</th>
                  <th>Estado</th>
                  <th>Creado</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.slice(0, 5).map(campaign => (
                  <tr key={campaign.id}>
                    <td>{campaign.name}</td>
                    <td>{campaign.platform || 'N/A'}</td>
                    <td>
                      <span className={`badge badge-${campaign.status}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td>{new Date(campaign.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3>Contactos Recientes</h3>
          {contacts.length === 0 ? (
            <p>No hay contactos. <Link to="/contacts">Agregar contactos</Link></p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Segmento</th>
                </tr>
              </thead>
              <tbody>
                {contacts.slice(0, 5).map(contact => (
                  <tr key={contact.id}>
                    <td>{contact.name}</td>
                    <td>{contact.email}</td>
                    <td>{contact.phone || 'N/A'}</td>
                    <td>{contact.segment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
