import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './Pages.css';

function Analytics() {
  const [metrics, setMetrics] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const campaignsRes = await axios.get('http://localhost:5001/api/campaigns', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(campaignsRes.data || []);

      if (campaignsRes.data && campaignsRes.data.length > 0) {
        const metricsRes = await axios.get(
          `http://localhost:5001/api/metrics/${campaignsRes.data[0].id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMetrics(metricsRes.data || []);
      }
    } catch (err) {
      setError('Error al cargar analytics');
    } finally {
      setLoading(false);
    }
  };

  const totalImpressions = metrics.reduce((sum, m) => sum + (m.impressions || 0), 0);
  const totalClicks = metrics.reduce((sum, m) => sum + (m.clicks || 0), 0);
  const totalConversions = metrics.reduce((sum, m) => sum + (m.conversions || 0), 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

  const chartData = [
    { name: 'Impresiones', value: totalImpressions },
    { name: 'Clicks', value: totalClicks },
    { name: 'Conversiones', value: totalConversions }
  ];

  const COLORS = ['#3498db', '#2ecc71', '#e74c3c'];

  return (
    <div className="app-container">
      <div className="sidebar">
        <h1>🚀 Marketing</h1>
        <nav>
          <Link to="/" className="nav-link">📊 Dashboard</Link>
          <Link to="/campaigns" className="nav-link">📢 Campañas</Link>
          <Link to="/contacts" className="nav-link">👥 Contactos</Link>
          <Link to="/analytics" className="nav-link active">📈 Analytics</Link>
        </nav>
      </div>

      <div className="main-content">
        <div className="header">
          <h2>📈 Analytics</h2>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Impresiones</h3>
            <div className="number">{totalImpressions.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <h3>Clicks</h3>
            <div className="number">{totalClicks.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <h3>Conversiones</h3>
            <div className="number">{totalConversions.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <h3>CTR (%)</h3>
            <div className="number">{ctr}%</div>
          </div>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <>
            <div className="card">
              <h3>Distribución de Métricas</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {campaigns.length > 0 && (
              <div className="card">
                <h3>Rendimiento por Plataforma</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={campaigns}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="id" fill="#3498db" name="Campañas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Analytics;
