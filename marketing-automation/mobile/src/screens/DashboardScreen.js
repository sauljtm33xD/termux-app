import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5001/api';

export default function DashboardScreen() {
  const [campaigns, setCampaigns] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [campaignsRes, contactsRes] = await Promise.all([
        axios.get(`${API_URL}/campaigns`, { headers }),
        axios.get(`${API_URL}/contacts`, { headers }),
      ]);

      setCampaigns(campaignsRes.data || []);
      setContacts(contactsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, number }) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statNumber}>{number}</Text>
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
        <StatCard title="Campañas" number={campaigns.length} />
        <StatCard title="Contactos" number={contacts.length} />
        <StatCard title="En Ejecución" number={campaigns.filter(c => c.status === 'active').length} />
        <StatCard title="Borradores" number={campaigns.filter(c => c.status === 'draft').length} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Campañas Recientes</Text>
        {campaigns.length === 0 ? (
          <Text style={styles.emptyText}>No hay campañas</Text>
        ) : (
          <FlatList
            data={campaigns.slice(0, 5)}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.itemCard}>
                <View>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  <Text style={styles.itemSubtitle}>{item.platform}</Text>
                  <Text style={[styles.badge, styles[`badge_${item.status}`]]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contactos Recientes</Text>
        {contacts.length === 0 ? (
          <Text style={styles.emptyText}>No hay contactos</Text>
        ) : (
          <FlatList
            data={contacts.slice(0, 5)}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.itemCard}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemSubtitle}>{item.email}</Text>
                <Text style={styles.itemSubtitle}>{item.phone}</Text>
              </View>
            )}
          />
        )}
      </View>
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
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statTitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3498db',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 4,
  },
  badge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 'bold',
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  badge_draft: {
    backgroundColor: '#ecf0f1',
    color: '#34495e',
  },
  badge_active: {
    backgroundColor: '#d5f4e6',
    color: '#27ae60',
  },
  emptyText: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
