import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';

export default function DebugPanel({ visible, onClose, debugData }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🐛 Debug Panel</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {debugData && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📡 API Response</Text>
              <View style={styles.codeBlock}>
                <Text style={styles.codeText}>
                  {JSON.stringify(debugData, null, 2)}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Hướng dẫn Debug</Text>
            <Text style={styles.helpText}>
              1. Kiểm tra status code trong response{'\n'}
              2. Tìm token trong response data{'\n'}
              3. Kiểm tra message/error fields{'\n'}
              4. Verify API endpoint đang hoạt động{'\n'}
              5. Check network logs trong console
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔍 Các trường hợp có thể xảy ra</Text>
            <Text style={styles.helpText}>
              • API trả về 200 OK nhưng không có token{'\n'}
              • Server chấp nhận mọi request (dev mode){'\n'}
              • Response format không đúng như expected{'\n'}
              • CORS hoặc network issues{'\n'}
              • Backend chưa implement validation đúng
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  codeBlock: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
}); 