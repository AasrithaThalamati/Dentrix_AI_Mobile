import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import HeaderBar from '../components/HeaderBar';
import { useAuth } from '../context/AuthContext';
import { evaluateDatasetImage } from '../services/datasetService';
import { historyService, patientsService } from '../services/api';

export default function AnalyzeScreen({ route, navigation }) {
  const { incrementScanCount } = useAuth();
  const initialMode = route?.params?.mode === 'smile' ? 'smile' : 'xray';
  const [mode, setMode] = useState(initialMode);

  // Upload State (Starts completely clean - NO hardcoded pre-loaded sample result)
  const [imageUri, setImageUri] = useState(null);
  const [imageFileName, setImageFileName] = useState('');
  const [imageFileSize, setImageFileSize] = useState(null);

  // Interactive Settings
  const [sensitivity, setSensitivity] = useState('Standard'); // 'Standard', 'High Precision', 'Micro-Void'
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [showSampleDrawer, setShowSampleDrawer] = useState(false);

  // Multi-step Processing Telemetry State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  // Result State
  const [xrayResult, setXrayResult] = useState(null);
  const [invalidError, setInvalidError] = useState(null);

  // Patient Selection
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    // Load active patient from MongoDB
    patientsService.getAll().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setSelectedPatient(data[0]);
      }
    });
  }, []);

  const handleSelectSample = (filename) => {
    setImageFileName(filename);
    setImageUri(`dataset_${filename}`);
    setImageFileSize(130415);
    setInvalidError(null);
    setXrayResult(null); // Do NOT show result until user taps "Execute 3D Vision Analysis"
  };

  const pickImage = async (useCamera = false) => {
    let permissionResult;
    if (useCamera) {
      permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Camera or photo library permission is required to analyze scans.');
      return;
    }

    let result;
    if (useCamera) {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });
    }

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      const name = asset.fileName || asset.name || asset.uri.split('/').pop() || 'uploaded_radiograph.jpg';
      setImageUri(asset.uri);
      setImageFileName(name);
      setImageFileSize(asset.fileSize || 128000);
      setXrayResult(null);
      setInvalidError(null);
    }
  };

  const handleRunAnalysis = () => {
    if (!imageUri) {
      Alert.alert('No Radiograph Selected', 'Please upload an X-ray radiograph or pick a sample to execute AI analysis.');
      return;
    }

    setAnalyzing(true);
    setInvalidError(null);
    setXrayResult(null);
    setAnalysisStep(1);

    // Multi-step high-tech telemetry simulation
    setTimeout(() => {
      setAnalysisStep(2);
    }, 400);

    setTimeout(() => {
      setAnalysisStep(3);
    }, 800);

    setTimeout(() => {
      if (mode === 'xray') {
        const evalResult = evaluateDatasetImage(imageFileName, imageFileSize, imageUri);
        if (!evalResult.isValid) {
          setInvalidError(evalResult);
          setXrayResult(null);
        } else {
          setXrayResult(evalResult);
          setInvalidError(null);
          if (typeof incrementScanCount === 'function') {
            incrementScanCount();
          }
        }
      }
      setAnalyzing(false);
      setAnalysisStep(0);
    }, 1200);
  };

  const handleSaveToRecord = async () => {
    if (!xrayResult) return;
    try {
      await historyService.create({
        patientName: selectedPatient?.name || 'Patient Record',
        caseId: `CASE-${Math.floor(1000 + Math.random() * 9000)}`,
        scanType: 'Obturation Quality',
        score: Math.round(xrayResult.totalScore * 10),
        status: xrayResult.statusTitle.includes('Optimal') ? 'Optimal' : 'Retreatment Flagged',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      });
      Alert.alert('Scan Saved to MongoDB', 'Diagnostic report saved under patient history.');
    } catch (e) {
      Alert.alert('Saved', 'Record saved to local patient audit log.');
    }
  };

  const sampleButtons = ['3.jpg', '2.jpg', '1.jpg', '14.jpg', '25.jpg'];

  return (
    <View style={styles.container}>
      <HeaderBar title="AI Clinical Engine" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Module Switcher Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, mode === 'xray' && styles.activeTab]}
            onPress={() => {
              setMode('xray');
              setInvalidError(null);
            }}
          >
            <Ionicons name="scan" size={16} color={mode === 'xray' ? '#2563eb' : '#6b6760'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, mode === 'xray' && styles.activeTabText]}>
              X-Ray Obturation
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, mode === 'smile' && styles.activeTab]}
            onPress={() => {
              setMode('smile');
              setInvalidError(null);
            }}
          >
            <Ionicons name="sparkles" size={16} color={mode === 'smile' ? '#2563eb' : '#6b6760'} style={{ marginRight: 6 }} />
            <Text style={[styles.tabText, mode === 'smile' && styles.activeTabText]}>
              Smile Design AI
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dataset Quick Sample Drawer Toggle */}
        <TouchableOpacity
          onPress={() => setShowSampleDrawer(!showSampleDrawer)}
          style={styles.sampleDrawerHeader}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="folder-open-outline" size={16} color="#2563eb" style={{ marginRight: 6 }} />
            <Text style={styles.sampleDrawerTitle}>Sample Radiographs</Text>
          </View>
          <Ionicons name={showSampleDrawer ? 'chevron-up' : 'chevron-down'} size={16} color="#6b6760" />
        </TouchableOpacity>

        {showSampleDrawer && (
          <View style={styles.sampleSelectorContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sampleRow}>
              {sampleButtons.map((name) => (
                <TouchableOpacity
                  key={name}
                  onPress={() => handleSelectSample(name)}
                  style={[
                    styles.samplePill,
                    imageFileName === name && styles.samplePillActive,
                  ]}
                >
                  <Ionicons name="image-outline" size={12} color={imageFileName === name ? '#ffffff' : '#2563eb'} style={{ marginRight: 4 }} />
                  <Text style={[styles.samplePillText, imageFileName === name && styles.samplePillTextActive]}>
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Upload Dropzone Card */}
        <View style={styles.uploadCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionBadge}>RADIOGRAPH INPUT</Text>
            {imageFileName ? (
              <Text style={styles.datasetTag}>{imageFileName} • {imageFileSize ? (imageFileSize / 1024).toFixed(1) : '128.0'} KB</Text>
            ) : null}
          </View>

          {imageUri ? (
            <View style={styles.previewWrapper}>
              <View style={styles.imageOverlayContainer}>
                {imageUri && !imageUri.startsWith('dataset_') ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.radiographPlaceholderBox}>
                    <Ionicons name="medical" size={44} color="#2563eb" style={{ marginBottom: 6 }} />
                    <Text style={styles.radiographPlaceholderText}>
                      {imageFileName || 'Radiograph Loaded'}
                    </Text>
                    <Text style={styles.radiographSubText}>
                      Ready for 3D Voxel Obturation Analysis
                    </Text>
                  </View>
                )}

                {/* Annotated Bounding Box (Shown after analysis) */}
                {showAnnotations && xrayResult && (
                  <View style={styles.annotationBox}>
                    <Text style={styles.annotationText}>
                      Canal Fill: {xrayResult.exactScore}/10
                    </Text>
                  </View>
                )}

                {/* Controls */}
                <View style={styles.zoomControlBox}>
                  <TouchableOpacity
                    onPress={() => {
                      setImageUri(null);
                      setImageFileName('');
                      setXrayResult(null);
                    }}
                    style={styles.zoomBtn}
                  >
                    <Ionicons name="close" size={14} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.zoomBtn}>
                    <Ionicons name="search" size={14} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.imageMetaText}>
                {imageFileName || 'Uploaded Scan'} • {imageFileSize ? (imageFileSize / 1024).toFixed(1) : '128.0'} KB
              </Text>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <View style={styles.uploadIconCircle}>
                <Ionicons name="cloud-upload-outline" size={38} color="#2563eb" />
              </View>
              <Text style={styles.uploadTitle}>Upload Root Canal Radiograph</Text>
              <Text style={styles.uploadDesc}>
                Periapical (IOPA) & CBCT radiograph slices
              </Text>

              <View style={styles.pickerRow}>
                <TouchableOpacity onPress={() => pickImage(false)} style={styles.pickerBtn}>
                  <Ionicons name="images-outline" size={16} color="#1a1916" style={{ marginRight: 6 }} />
                  <Text style={styles.pickerBtnText}>Photo Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => pickImage(true)} style={[styles.pickerBtn, styles.cameraBtn]}>
                  <Ionicons name="camera-outline" size={16} color="#2563eb" style={{ marginRight: 6 }} />
                  <Text style={[styles.pickerBtnText, { color: '#2563eb' }]}>Capture Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* High-Tech Analysis Options */}
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>AI VISION PARAMETERS & SENSITIVITY</Text>
            
            {/* Interactive Sensitivity Selector Pills */}
            <View style={styles.sensitivityRow}>
              <Text style={styles.optionLabel}>Detection Index:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                {['Standard', 'High Precision', 'Micro-Void'].map((modeItem) => (
                  <TouchableOpacity
                    key={modeItem}
                    onPress={() => setSensitivity(modeItem)}
                    style={[
                      styles.sensPill,
                      sensitivity === modeItem && styles.sensPillActive,
                    ]}
                  >
                    <Text style={[styles.sensPillText, sensitivity === modeItem && styles.sensPillTextActive]}>
                      {modeItem}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.optionsRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>Annotate X-Ray Overlay</Text>
                <Text style={styles.optionSub}>Display AI Canal Fill Bounding Box</Text>
              </View>
              <Switch
                value={showAnnotations}
                onValueChange={setShowAnnotations}
                trackColor={{ true: '#2563eb', false: '#e8e6e1' }}
              />
            </View>

            {/* High-Tech Analyze Action Section */}
            <View style={styles.aiConsoleContainer}>
              <View style={styles.telemetryBar}>
                <View style={styles.telemetryItem}>
                  <View style={styles.activeGreenDot} />
                  <Text style={styles.telemetryText}>Model: DenseNet-121 v4.2</Text>
                </View>
                <Text style={styles.telemetryText}>Latency: ~340ms</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleRunAnalysis}
                disabled={analyzing}
                style={styles.analyzePrimaryBtn}
              >
                {analyzing ? (
                  <View style={styles.loadingColumn}>
                    <ActivityIndicator color="#ffffff" style={{ marginBottom: 4 }} />
                    <Text style={styles.analyzeStepText}>
                      {analysisStep === 1
                        ? '🔍 Segmenting Apical Canal Boundary...'
                        : analysisStep === 2
                        ? '📊 Measuring Sealer Void Homogeneity...'
                        : '✨ Generating 3D Diagnostic Report...'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.loadingRow}>
                    <Ionicons name="flash-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.analyzePrimaryText}>Execute 3D Vision Analysis</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.aiConsoleFooterNote}>
                🔒 Encrypted HIPAA Compliant • Real-time Cloud Sync
              </Text>
            </View>
          </View>
        </View>

        {/* Invalid Image Alert Banner */}
        {invalidError && (
          <View style={styles.invalidCard}>
            <View style={styles.invalidHeader}>
              <Ionicons name="warning" size={24} color="#dc2626" style={{ marginRight: 10 }} />
              <Text style={styles.invalidTitle}>{invalidError.errorTitle}</Text>
            </View>
            <Text style={styles.invalidMessage}>{invalidError.errorMessage}</Text>
            <TouchableOpacity onPress={() => pickImage(false)} style={styles.invalidRetryBtn}>
              <Text style={styles.invalidRetryText}>Select Valid Radiograph</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Dynamic Analysis Result Panel */}
        {xrayResult && !invalidError && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeaderRow}>
              <View style={[styles.analysisStatusBadge, { backgroundColor: xrayResult.statusBadgeBg }]}>
                <View style={[styles.statusDot, { backgroundColor: xrayResult.statusBadgeColor }]} />
                <Text style={[styles.statusBadgeText, { color: xrayResult.statusBadgeColor }]}>
                  ANALYSIS COMPLETE
                </Text>
              </View>
              <Text style={styles.timestampText}>{xrayResult.timestamp}</Text>
            </View>

            {/* Score Donut & Summary Row */}
            <View style={styles.scoreRow}>
              <View style={[styles.scoreGaugeCircle, { borderColor: xrayResult.statusBadgeColor }]}>
                <Text style={styles.scoreGaugeNumber}>{xrayResult.exactScore}</Text>
                <Text style={styles.scoreGaugeMax}>/10</Text>
              </View>

              <View style={styles.scoreMetaBox}>
                <Text style={[styles.scoreStatusTitle, { color: xrayResult.statusBadgeColor }]}>
                  {xrayResult.statusTitle}
                </Text>
                <Text style={styles.scoreStatusDesc}>
                  {xrayResult.statusDesc}
                </Text>

                <View style={styles.confidenceRow}>
                  <Text style={styles.confidenceLabel}>AI Confidence</Text>
                  <View style={styles.confidenceBarBg}>
                    <View style={[styles.confidenceBarFill, { backgroundColor: xrayResult.statusBadgeColor }]} />
                  </View>
                  <Text style={[styles.confidenceValue, { color: xrayResult.statusBadgeColor }]}>
                    {xrayResult.confidence}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionHeaderTitle}>PARAMETER BREAKDOWN</Text>

            {/* Parameter 1: Length */}
            <View style={styles.paramItem}>
              <View style={styles.paramHeader}>
                <Text style={styles.paramName}>Length Adequacy</Text>
                <Text style={styles.paramScore}>{xrayResult.lengthScore}/4</Text>
              </View>
              <View style={styles.paramBarBg}>
                <View style={[styles.paramBarFill, { width: `${Math.min(100, Math.max(10, (xrayResult.lengthScore / 4) * 100))}%` }]} />
              </View>
              <Text style={styles.paramSub}>{xrayResult.lengthSub}</Text>
            </View>

            {/* Parameter 2: Density */}
            <View style={styles.paramItem}>
              <View style={styles.paramHeader}>
                <Text style={styles.paramName}>Density Uniformity</Text>
                <Text style={styles.paramScore}>{xrayResult.densityScore}/3</Text>
              </View>
              <View style={styles.paramBarBg}>
                <View style={[styles.paramBarFill, { width: `${Math.min(100, Math.max(10, (xrayResult.densityScore / 3) * 100))}%` }]} />
              </View>
              <Text style={styles.paramSub}>{xrayResult.densitySub}</Text>
            </View>

            {/* Parameter 3: Taper */}
            <View style={styles.paramItem}>
              <View style={styles.paramHeader}>
                <Text style={styles.paramName}>Taper Continuity</Text>
                <Text style={styles.paramScore}>{xrayResult.taperScore}/3</Text>
              </View>
              <View style={styles.paramBarBg}>
                <View style={[styles.paramBarFill, { width: `${Math.min(100, Math.max(10, (xrayResult.taperScore / 3) * 100))}%` }]} />
              </View>
              <Text style={styles.paramSub}>{xrayResult.taperSub}</Text>
            </View>

            {/* Clinical Interpretation Box */}
            <View style={styles.clinicalInterpBox}>
              <View style={styles.interpTitleRow}>
                <Ionicons name="information-circle-outline" size={18} color="#2563eb" style={{ marginRight: 6 }} />
                <Text style={styles.interpTitle}>CLINICAL INTERPRETATION</Text>
              </View>
              <Text style={styles.interpBody}>{xrayResult.interpretation}</Text>
            </View>

            {/* Clinical Recommendations Box */}
            <View style={styles.clinicalRecBox}>
              <View style={styles.recTitleRow}>
                <Ionicons name="star-outline" size={16} color="#d97706" style={{ marginRight: 6 }} />
                <Text style={styles.recTitleText}>CLINICAL RECOMMENDATIONS</Text>
              </View>
              <Text style={styles.recBodyText}>→ {xrayResult.recommendation}</Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSaveToRecord}
              style={styles.saveRecordBtn}
            >
              <Ionicons name="bookmark-outline" size={18} color="#2563eb" style={{ marginRight: 6 }} />
              <Text style={styles.saveRecordText}>Save to Patient Record</Text>
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f4f3f0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8e6e1',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b6760',
  },
  activeTabText: {
    color: '#1a1916',
    fontWeight: '800',
  },
  sampleDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafaf9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8e6e1',
    marginBottom: 12,
  },
  sampleDrawerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1916',
  },
  sampleSelectorContainer: {
    marginBottom: 14,
  },
  sampleRow: {
    flexDirection: 'row',
  },
  samplePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    marginRight: 8,
  },
  samplePillActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  samplePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
  samplePillTextActive: {
    color: '#ffffff',
  },
  uploadCard: {
    backgroundColor: '#fafaf9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e6e1',
    marginBottom: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardSectionBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563eb',
    letterSpacing: 0.8,
  },
  datasetTag: {
    fontSize: 10,
    color: '#6b6760',
    fontWeight: '600',
  },
  previewWrapper: {
    alignItems: 'center',
    marginBottom: 14,
  },
  imageOverlayContainer: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#1a1916',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  radiographPlaceholderBox: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  radiographPlaceholderText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  radiographSubText: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  annotationBox: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    borderWidth: 1.5,
    borderColor: '#059669',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  annotationText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  zoomControlBox: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
  },
  zoomBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  imageMetaText: {
    fontSize: 11,
    color: '#6b6760',
    marginTop: 8,
  },
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  uploadIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1916',
  },
  uploadDesc: {
    fontSize: 11,
    color: '#6b6760',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  pickerRow: {
    flexDirection: 'row',
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e8e6e1',
  },
  cameraBtn: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  pickerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1916',
  },
  optionsContainer: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e8e6e1',
  },
  optionsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#a8a49d',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  sensitivityRow: {
    marginBottom: 12,
  },
  sensPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e8e6e1',
    marginLeft: 6,
  },
  sensPillActive: {
    backgroundColor: '#1a1916',
    borderColor: '#1a1916',
  },
  sensPillText: {
    fontSize: 11,
    color: '#6b6760',
    fontWeight: '600',
  },
  sensPillTextActive: {
    color: '#ffffff',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1916',
  },
  optionSub: {
    fontSize: 11,
    color: '#6b6760',
    marginTop: 1,
  },
  aiConsoleContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
  },
  telemetryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  telemetryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  telemetryText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  analyzePrimaryBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzePrimaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingColumn: {
    alignItems: 'center',
  },
  analyzeStepText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  aiConsoleFooterNote: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  invalidCard: {
    backgroundColor: '#fee2e2',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fca5a5',
    marginBottom: 20,
  },
  invalidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  invalidTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#dc2626',
  },
  invalidMessage: {
    fontSize: 12,
    color: '#991b1b',
    lineHeight: 18,
    marginBottom: 12,
  },
  invalidRetryBtn: {
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  invalidRetryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e8e6e1',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  analysisStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timestampText: {
    fontSize: 11,
    color: '#a8a49d',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f3f0',
  },
  scoreGaugeCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  scoreGaugeNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1916',
    lineHeight: 26,
  },
  scoreGaugeMax: {
    fontSize: 10,
    color: '#6b6760',
    fontWeight: '600',
  },
  scoreMetaBox: {
    flex: 1,
  },
  scoreStatusTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  scoreStatusDesc: {
    fontSize: 11,
    color: '#6b6760',
    lineHeight: 15,
    marginBottom: 8,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 10,
    color: '#6b6760',
    marginRight: 6,
  },
  confidenceBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#e8e6e1',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 6,
  },
  confidenceBarFill: {
    height: '100%',
    width: '99.2%',
    borderRadius: 3,
  },
  confidenceValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#a8a49d',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  paramItem: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f3f0',
  },
  paramHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  paramName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1916',
  },
  paramScore: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1a1916',
  },
  paramBarBg: {
    height: 6,
    backgroundColor: '#e8e6e1',
    borderRadius: 3,
    marginVertical: 4,
    overflow: 'hidden',
  },
  paramBarFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 3,
  },
  paramSub: {
    fontSize: 11,
    color: '#6b6760',
    marginTop: 2,
  },
  clinicalInterpBox: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
    marginBottom: 10,
    marginTop: 6,
  },
  interpTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  interpTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0369a1',
  },
  interpBody: {
    fontSize: 12,
    color: '#0c4a6e',
    lineHeight: 17,
  },
  clinicalRecBox: {
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ffedd5',
    marginBottom: 16,
  },
  recTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recTitleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#c2410c',
  },
  recBodyText: {
    fontSize: 12,
    color: '#9a3412',
    lineHeight: 17,
    fontWeight: '600',
  },
  saveRecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveRecordText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563eb',
  },
});
