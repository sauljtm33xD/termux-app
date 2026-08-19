import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Pages.css';

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', segment: 'general' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/contacts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(response.data || []);
    } catch (err) {
      setError('Error al cargar contactos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/contacts', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({ name: '', email: '', phone: '', segment: 'general' });
      setShowModal(false);
      fetchContacts();
    } catch (err) {
      setError('Error al agregar contacto');
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h1>🚀 Marketing</h1>
        <nav>
          <Link to="/" className="nav-link">📊 Dashboard</Link>
          <Link to="/campaigns" className="nav-link">📢 Campañas</Link>
          <Link to="/contacts" className="nav-link active">👥 Contactos</Link>
          <Link to="/analytics" className="nav-link">📈 Analytics</Link>
        </nav>
      </div>

      <div className="main-content">
        <div className="header">
          <h2>👥 Mis Contactos</h2>
          <button className="btn btn-success" onClick={() => setShowModal(true)}>
            + Agregar Contacto
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          {loading ? (
            <p>Cargando...</p>
          ) : contacts.length === 0 ? (
            <p>No hay contactos. ¡Agrega tu primer contacto!</p>
          ) : (
            <div className="table-responsive">
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
                  {contacts.map(contact => (
                    <tr key={contact.id}>
                      <td>{contact.name}</td>
                      <td>{contact.email}</td>
                      <td>{contact.phone || 'N/A'}</td>
                      <td><span className="badge" style={{background: '#ecf0f1', color: '#34495e'}}>{contact.segment}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal show">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Nuevo Contacto</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleAddContact}>
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="juan@email.com"
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+34 612 345 678"
                  />
                </div>
                <div className="form-group">
                  <label>Segmento</label>
                  <select
                    value={formData.segment}
                    onChange={(e) => setFormData({...formData, segment: e.target.value})}
                  >
                    <option value="general">General</option>
                    <option value="vip">VIP</option>
                    <option value="nuevo">Nuevo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">Agregar</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Contacts;
