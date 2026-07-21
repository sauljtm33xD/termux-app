import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5001/api';

export default function AnalyticsScreen() {
  const [metrics, setMetrics] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const campaignsRes = await axios.get(`${API_URL}/campaigns`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCampaigns(campaignsRes.data || []);

      if (campaignsRes.data && campaignsRes.data.length > 0) {
        const metricsRes = await axios.get(
          `${API_URL}/metrics/${campaignsRes.data[0].id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMetrics(metricsRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalImpressions = metrics.reduce((sum, m) => sum + (m.impressions || 0), 0);
  const totalClicks = metrics.reduce((sum, m) => sum + (m.clicks || 0), 0);
  const totalConversions = metrics.reduce((sum, m) => sum + (m.conversions || 0), 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

  const StatCard = ({ title, number, icon, color }) => (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statNumber, { color }]}>{number}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsGrid}>
        <StatCard
          title="Impresiones"
          number={totalImpressions.toLocaleString()}
          icon="👁️"
          color="#3498db"
        />
        <StatCard
          title="Clicks"
          number={totalClicks.toLocaleString()}
          icon="🖱️"
          color="#2ecc71"
        />
        <StatCard
          title="Conversiones"
          number={totalConversions.toLocaleString()}
          icon="✅"
          color="#e74c3c"
        />
        <StatCard
          title="CTR %"
          number={ctr}
          icon="📊"
          color="#f39c12"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen General</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Campañas</Text>
            <Text style={styles.summaryValue}>{campaigns.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>En Ejecución</Text>
            <Text style={styles.summaryValue}>
              {campaigns.filter(c => c.status === 'active').length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Borradores</Text>
            <Text style={styles.summaryValue}>
              {campaigns.filter(c => c.status === 'draft').length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ratio Conversión</Text>
            <Text style={styles.summaryValue}>
              {totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : 0}%
            </Text>
          </View>
        </View>
      </View>

      {campaigns.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Campañas</Text>
          {campaigns.slice(0, 3).map((campaign, index) => (
            <View key={campaign.id} style={styles.campaignCard}>
              <View style={[styles.rank, { backgroundColor: ['#3498db', '#2ecc71', '#f39c12'][index] }]}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <View style={styles.campaignInfo}>
                <Text style={styles.campaignName}>{campaign.name}</Text>
                <Text style={styles.campaignPlatform}>{campaign.platform}</Text>
              </View>
              <Text style={[styles.campaignStatus, campaign.status === 'active' ? styles.active : styles.draft]}>
                {campaign.status}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 4,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  campaignCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  campaignInfo: {
    flex: 1,
  },
  campaignName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  campaignPlatform: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  campaignStatus: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  active: {
    backgroundColor: '#d5f4e6',
    color: '#27ae60',
  },
  draft: {
    backgroundColor: '#ecf0f1',
    color: '#34495e',
  },
  spacer: {
    height: 20,
  },
});
