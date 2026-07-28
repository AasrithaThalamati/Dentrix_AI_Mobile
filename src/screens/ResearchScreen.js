import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import DentrixLogo from '../components/DentrixLogo';
import { researchService } from '../services/api';

export default function ResearchScreen() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const data = await researchService.getAll();
      setArticles(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load research articles:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <DentrixLogo size={32} showText={true} />
        <Text style={styles.pageBadge}>Research & Guidelines</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Clinical Methodology & Research</Text>
        <Text style={styles.headerSubtitle}>
          Endodontic quality standards & aesthetic principles
        </Text>

        {loading ? (
          <ActivityIndicator color="#2563eb" style={{ marginTop: 40 }} />
        ) : (
          articles.map((item) => {
            const isExpanded = expandedId === item._id;
            return (
              <TouchableOpacity
                key={item._id}
                activeOpacity={0.9}
                onPress={() => toggleExpand(item._id)}
                style={styles.articleCard}
              >
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>

                <Text style={styles.articleTitle}>{item.title}</Text>
                <Text style={styles.articleMeta}>
                  By {item.author} ({item.year})
                </Text>

                <Text style={styles.articleSummary}>{item.summary}</Text>

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.divider} />
                    <Text style={styles.expandedTitle}>Full Reference Text</Text>
                    <Text style={styles.expandedText}>{item.content}</Text>
                  </View>
                )}

                <Text style={styles.expandToggle}>
                  {isExpanded ? 'Show Less ▲' : 'Read Guidelines ▼'}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e6e1',
  },
  pageBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1916',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b6760',
    marginTop: 4,
    marginBottom: 20,
  },
  articleCard: {
    backgroundColor: '#fafaf9',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8e6e1',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  categoryText: {
    color: '#2563eb',
    fontSize: 11,
    fontWeight: '700',
  },
  articleTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1a1916',
    lineHeight: 22,
  },
  articleMeta: {
    fontSize: 12,
    color: '#a8a49d',
    marginTop: 4,
    marginBottom: 10,
  },
  articleSummary: {
    fontSize: 13,
    color: '#6b6760',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#e8e6e1',
    marginVertical: 14,
  },
  expandedContent: {
    marginTop: 4,
  },
  expandedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 6,
  },
  expandedText: {
    fontSize: 13,
    color: '#1a1916',
    lineHeight: 20,
  },
  expandToggle: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
    alignSelf: 'flex-end',
  },
});
