import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const DiseaseInfo = () => {
  const [diseaseName, setDiseaseName] = useState('');
  const [diseaseInfo, setDiseaseInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [recentSearches, setRecentSearches] = useState([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scrollViewRef = useRef();

  const fetchDiseaseInfo = async () => {
    if (!diseaseName.trim()) {
      Alert.alert('Error', 'Please enter a disease name');
      return;
    }
  
    setIsLoading(true);
    try {
      const genAI = new GoogleGenerativeAI("AIzaSyCckJqoHEUlJmOUDstkiTPG0p-0Xru9Xyo");
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
      const prompt = `Provide a structured, easy-to-understand explanation of ${diseaseName}.
      Format it as follows:
      Overview: (Brief description)
      Symptoms: (Comma-separated list)
      Treatment: (Short explanation)
      Prevention: (Comma-separated list)
      Risk Factors: (Comma-separated list)
      When to See a Doctor: (Brief explanation)`;
  
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
  
      let info = { raw: response };

      // Extract structured data from response
      const lines = response.split("\n").map(line => line.trim());
      lines.forEach(line => {
        if (line.startsWith("Overview:")) {
          info.overview = line.replace("Overview:", "").trim();
        } else if (line.startsWith("Symptoms:")) {
          info.symptoms = line.replace("Symptoms:", "").split(",").map(s => s.trim()).filter(Boolean);
        } else if (line.startsWith("Treatment:")) {
          info.treatment = line.replace("Treatment:", "").trim();
        } else if (line.startsWith("Prevention:")) {
          info.prevention = line.replace("Prevention:", "").split(",").map(p => p.trim()).filter(Boolean);
        } else if (line.startsWith("Risk Factors:")) {
          info.riskFactors = line.replace("Risk Factors:", "").split(",").map(r => r.trim()).filter(Boolean);
        } else if (line.startsWith("When to See a Doctor:")) {
          info.whenToSeeDoctor = line.replace("When to See a Doctor:", "").trim();
        }
      });

      // Add to recent searches if not already there
      if (!recentSearches.includes(diseaseName)) {
        setRecentSearches(prev => [diseaseName, ...prev].slice(0, 5));
      }

      setDiseaseInfo(info);
      setActiveTab('overview');
      
      // Animate results appearance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Scroll to results
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 250, animated: true });
      }, 300);
    } catch (error) {
      console.error("Disease Info Fetch Error:", error);
      Alert.alert("Error", "Unable to fetch disease information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentSearchPress = (disease) => {
    setDiseaseName(disease);
    setTimeout(() => fetchDiseaseInfo(), 100);
  };

  const renderTabContent = () => {
    if (!diseaseInfo) return null;
    
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.infoText}>{diseaseInfo.overview || 'No overview available'}</Text>
          </View>
        );
      case 'symptoms':
        return (
          <View style={styles.tabContent}>
            {diseaseInfo.symptoms && diseaseInfo.symptoms.length > 0 ? (
              diseaseInfo.symptoms.map((symptom, index) => (
                <View key={index} style={styles.bulletItem}>
                  <View style={styles.bulletPoint}/>
                  <Text style={styles.bulletText}>{symptom}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.infoText}>No symptoms information available</Text>
            )}
          </View>
        );
      case 'treatment':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.infoText}>{diseaseInfo.treatment || 'No treatment information available'}</Text>
          </View>
        );
      case 'prevention':
        return (
          <View style={styles.tabContent}>
            {diseaseInfo.prevention && diseaseInfo.prevention.length > 0 ? (
              diseaseInfo.prevention.map((item, index) => (
                <View key={index} style={styles.bulletItem}>
                  <MaterialCommunityIcons name="shield-check" size={20} color="#22C55E" />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.infoText}>No prevention information available</Text>
            )}
          </View>
        );
      case 'risks':
        return (
          <View style={styles.tabContent}>
            {diseaseInfo.riskFactors && diseaseInfo.riskFactors.length > 0 ? (
              diseaseInfo.riskFactors.map((item, index) => (
                <View key={index} style={styles.bulletItem}>
                  <MaterialCommunityIcons name="alert-circle" size={20} color="#EF4444" />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.infoText}>No risk factor information available</Text>
            )}
          </View>
        );
      case 'doctor':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.infoText}>{diseaseInfo.whenToSeeDoctor || 'No information available on when to see a doctor'}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Animated Header */}
      <LinearGradient 
        colors={['#4F46E5', '#3B82F6']} 
        start={{x: 0, y: 0}} 
        end={{x: 1, y: 0}} 
        style={styles.header}
      >
        <Text style={styles.headerText}>Medical Explorer</Text>
        <Text style={styles.headerSubtext}>Learn about health conditions</Text>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{flex: 1}}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Search Container */}
          <View style={styles.searchContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="search" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput 
                placeholder="Search a disease or condition"
                placeholderTextColor="#9CA3AF"
                style={styles.inputBox}
                value={diseaseName}
                onChangeText={setDiseaseName}
              />
              {diseaseName.length > 0 && (
                <TouchableOpacity onPress={() => setDiseaseName('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity 
              onPress={fetchDiseaseInfo}
              disabled={isLoading}
              style={[styles.button, isLoading && styles.buttonDisabled]}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Recent Searches */}
          {recentSearches.length > 0 && !diseaseInfo && (
            <View style={styles.recentSearches}>
              <Text style={styles.recentTitle}>Recent Searches</Text>
              <View style={styles.recentChips}>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.recentChip}
                    onPress={() => handleRecentSearchPress(search)}
                  >
                    <Ionicons name="time-outline" size={16} color="#4F46E5" />
                    <Text style={styles.recentChipText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Disease Information */}
          {diseaseInfo && (
            <Animated.View 
              style={[
                styles.infoContainer, 
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.diseaseHeader}>
                <Text style={styles.infoTitle}>{diseaseName}</Text>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={() => {
                    setDiseaseInfo(null);
                    setDiseaseName('');
                  }}
                >
                  <Ionicons name="refresh" size={22} color="#4F46E5" />
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.tabsContainer}
              >
                <TouchableOpacity 
                  style={[styles.tab, activeTab === 'overview' && styles.activeTab]} 
                  onPress={() => setActiveTab('overview')}
                >
                  <Ionicons name="information-circle" size={20} color={activeTab === 'overview' ? "#4F46E5" : "#6B7280"} />
                  <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.tab, activeTab === 'symptoms' && styles.activeTab]} 
                  onPress={() => setActiveTab('symptoms')}
                >
                  <MaterialCommunityIcons name="thermometer" size={20} color={activeTab === 'symptoms' ? "#4F46E5" : "#6B7280"} />
                  <Text style={[styles.tabText, activeTab === 'symptoms' && styles.activeTabText]}>Symptoms</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.tab, activeTab === 'treatment' && styles.activeTab]}
                  onPress={() => setActiveTab('treatment')}
                >
                  <Ionicons name="medkit" size={20} color={activeTab === 'treatment' ? "#4F46E5" : "#6B7280"} />
                  <Text style={[styles.tabText, activeTab === 'treatment' && styles.activeTabText]}>Treatment</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.tab, activeTab === 'prevention' && styles.activeTab]}
                  onPress={() => setActiveTab('prevention')}
                >
                  <MaterialCommunityIcons name="shield-check" size={20} color={activeTab === 'prevention' ? "#4F46E5" : "#6B7280"} />
                  <Text style={[styles.tabText, activeTab === 'prevention' && styles.activeTabText]}>Prevention</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.tab, activeTab === 'risks' && styles.activeTab]}
                  onPress={() => setActiveTab('risks')}
                >
                  <MaterialCommunityIcons name="alert-circle" size={20} color={activeTab === 'risks' ? "#4F46E5" : "#6B7280"} />
                  <Text style={[styles.tabText, activeTab === 'risks' && styles.activeTabText]}>Risk Factors</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.tab, activeTab === 'doctor' && styles.activeTab]}
                  onPress={() => setActiveTab('doctor')}
                >
                  <Ionicons name="person" size={20} color={activeTab === 'doctor' ? "#4F46E5" : "#6B7280"} />
                  <Text style={[styles.tabText, activeTab === 'doctor' && styles.activeTabText]}>When to See Doctor</Text>
                </TouchableOpacity>
              </ScrollView>
              
              {/* Tab Content */}
              <View style={styles.contentContainer}>
                {renderTabContent()}
              </View>

              {/* Disclaimer */}
              <View style={styles.disclaimer}>
                <Ionicons name="warning-outline" size={16} color="#6B7280" />
                <Text style={styles.disclaimerText}>
                  This information is for educational purposes only. Always consult a healthcare professional.
                </Text>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 22,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerText: {
    fontSize: 26,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  searchContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 52,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginRight: 10,
  },
  inputBox: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: '#374151',
  },
  clearButton: {
    padding: 4,
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    height: 52,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  recentSearches: {
    marginTop: 20,
    marginBottom: 8,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
  },
  recentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  recentChipText: {
    color: '#4F46E5',
    marginLeft: 6,
    fontSize: 14,
  },
  infoContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  diseaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  refreshButton: {
    padding: 8,
  },
  tabsContainer: {
    paddingBottom: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 50,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  activeTab: {
    backgroundColor: '#EEF2FF',
  },
  tabText: {
    marginLeft: 6,
    color: '#6B7280',
    fontSize: 14,
  },
  activeTabText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  contentContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  tabContent: {
    minHeight: 100,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4F46E5',
    marginTop: 8,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginLeft: 8,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
});

export default DiseaseInfo;