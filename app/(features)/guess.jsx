import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// For DOCX creation

const API_KEY = "AIzaSyCIhLsGzLC2KhzMOGmAvZqt4pj5FXSilY0";
const MAX_QUESTIONS = 20;
const { width } = Dimensions.get("window");

const HealthAssessmentScreen = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [result, setResult] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchQuestion();
  }, []);

  const fetchQuestion = async () => {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          contents: [{ parts: [{ text: "Ask a health-related question with No, Mild, Severe as options." }] }],
        }
      );
      const questionText = response.data.candidates[0].content.parts[0].text;
      setQuestions((prev) => [...prev, questionText]);
    } catch (error) {
      console.error("Error fetching question:", error);
      Alert.alert("Error", "Failed to fetch question.");
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  };

  const handleAnswer = async (answer) => {
    setLoading(true);
    
    const newResponses = [...responses, { question: questions[currentQuestionIndex], answer }];
    setResponses(newResponses);

    if (newResponses.length >= MAX_QUESTIONS || currentQuestionIndex >= 19) {
      await getPrediction(newResponses);
      return;
    }

    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          contents: [{ parts: [{ text: `Based on previous answers: ${JSON.stringify(newResponses)} ask another health-related question. Also the user will input only NO or mild or Severe so ask questions based on that. Also You are a health assessment AI. I need you to create a series of up to 20 health-related questions 
        to identify potential health issues. For each question, I will respond with either "No", "Mild", or "Severe".
        
        Please ask one question at a time. After I answer, ask the next relevant question based on my previous answers.
        After no more than 20 questions, provide three potential health conditions
        that match my symptoms in order of likelihood.
        
        In your responses, ONLY include the question text by itself so it can be displayed to the user. 
        Do not include any other explanation or text.
        
        Please start with your first general health question now.
        Also generate *7 relevant follow-up symptom-related questions*.
    - Each question must have 3 answer choices: ["No", "Mild", "Severe"].
    - The questions should help in diagnosing diseases accurately.
    - Format the response as a valid JSON list without any extra text.` }] }],
        }
      );
      const nextQuestion = response.data.candidates[0].content.parts[0].text;
      setQuestions((prev) => [...prev, nextQuestion]);
    } catch (error) {
      console.error("Error fetching next question:", error);
      Alert.alert("Error", "Failed to fetch next question.");
    } finally {
      setLoading(false);
    }
  };

  const getPrediction = async (responses) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          contents: [{ parts: [{ text: `Based on these responses, predict 3 possible diseases in order of likelihood. Format your response as follows:
          "1. [First condition name]: Brief description
          2. [Second condition name]: Brief description
          3. [Third condition name]: Brief description"
          
          Responses: ${JSON.stringify(responses)}` }] }],
        }
      );
      const prediction = response.data.candidates[0].content.parts[0].text;
      setResult(prediction);
    } catch (error) {
      console.error("Error getting prediction:", error);
      Alert.alert("Error", "Failed to get prediction.");
    } finally {
      setLoading(false);
    }
  };

  const generatePdfReport = async (responses, result) => {
    try {
      const htmlContent = `
        <html>
          <body style="font-family: sans-serif; padding: 20px;">
            <h1 style="text-align: center; color: #2E5A88;">Health Assessment Report</h1>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            
            <h2>Questions and Responses</h2>
            <ul>
              ${responses.map((res, i) => `
                <li>
                  <strong>Q${i + 1}:</strong> ${res.question}<br />
                  <strong>Response:</strong> ${res.answer}
                </li>
              `).join('')}
            </ul>
  
            <h2>Assessment Results</h2>
            <pre style="white-space: pre-wrap; background-color: #f4f4f4; padding: 10px;">${result}</pre>
  
            <p><strong>DISCLAIMER:</strong> This assessment is for informational purposes only and does not replace professional medical advice.</p>
          </body>
        </html>
      `;
  
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
  
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Health Assessment Report',
        });
      } else {
        Alert.alert("Error", "Sharing not available on this device.");
      }
  
    } catch (error) {
      console.error('PDF generation failed:', error);
      Alert.alert("Error", "Failed to generate PDF report.");
    }
  };

  const handleGenerateReport = () => {
    generatePdfReport(responses, result);
  };
  

  const restartAssessment = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setResponses([]);
    setResult(null);
    setLoading(true);
    setInitializing(true);
    fetchQuestion();
  };

  const renderSeverityButton = (option) => {
    let buttonStyle, textStyle, iconName;
    
    switch(option) {
      case "No":
        buttonStyle = styles.noButton;
        textStyle = styles.noText;
        break;
      case "Mild":
        buttonStyle = styles.mildButton;
        textStyle = styles.mildText;
        break;
      case "Severe":
        buttonStyle = styles.severeButton;
        textStyle = styles.severeText;
        break;
    }
    
    return (
      <TouchableOpacity
        key={option}
        onPress={() => handleAnswer(option)}
        style={[styles.optionButton, buttonStyle]}
        disabled={loading}
      >
        <Text style={[styles.optionText, textStyle]}>{option}</Text>
      </TouchableOpacity>
    );
  };

  if (initializing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#4a6fa5" />
          <Text style={styles.loadingText}>Initializing Health Assessment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <LinearGradient
        colors={['#f8f9fa', '#e9ecef']}
        style={styles.gradientBackground}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Health Assessment</Text>
            {!result && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  Question {currentQuestionIndex + 1} of {MAX_QUESTIONS}
                </Text>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${((currentQuestionIndex + 1) / MAX_QUESTIONS) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            )}
          </View>

          {result ? (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Assessment Complete</Text>
                <Text style={styles.resultSubtitle}>Potential conditions based on your symptoms:</Text>
              </View>
              
              <View style={styles.diagnosisContainer}>
                <Text style={styles.diagnosisText}>{result}</Text>
              </View>
              
              <View style={styles.disclaimerContainer}>
                <Text style={styles.disclaimerText}>
                  Note: This assessment is for informational purposes only and does not replace professional medical advice.
                  Please consult with a healthcare provider for proper diagnosis and treatment.
                </Text>
              </View>
              
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  onPress={handleGenerateReport}
                  style={styles.downloadButton}
                  disabled={generating}
                >
                  {generating ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.downloadButtonText}>Download Report </Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={restartAssessment}
                  style={styles.restartButton}
                >
                  <Text style={styles.restartButtonText}>New Assessment</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.questionContainer}>
              {loading ? (
                <View style={styles.loadingQuestionContainer}>
                  <ActivityIndicator size="large" color="#4a6fa5" />
                  <Text style={styles.loadingQuestionText}>Processing...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.questionText}>{questions[currentQuestionIndex]}</Text>
                  <View style={styles.optionsContainer}>
                    {["No", "Mild", "Severe"].map(option => renderSeverityButton(option))}
                  </View>
                </>
              )}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: "#4a6fa5",
    fontWeight: "500",
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 16,
    textAlign: "center",
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 6,
    textAlign: "center",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e9ecef",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4a6fa5",
    borderRadius: 4,
  },
  questionContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  loadingQuestionContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingQuestionText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6c757d",
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    color: "#2c3e50",
    marginBottom: 24,
  },
  optionsContainer: {
    marginTop: 16,
  },
  optionButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  noButton: {
    backgroundColor: "#f1f8e9",
    borderWidth: 1,
    borderColor: "#7cb342",
  },
  noText: {
    color: "#558b2f",
  },
  mildButton: {
    backgroundColor: "#fff3e0",
    borderWidth: 1,
    borderColor: "#ffb74d",
  },
  mildText: {
    color: "#ef6c00",
  },
  severeButton: {
    backgroundColor: "#ffebee",
    borderWidth: 1,
    borderColor: "#ef5350",
  },
  severeText: {
    color: "#c62828",
  },
  resultContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4a6fa5",
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
  },
  diagnosisContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  diagnosisText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#2c3e50",
  },
  disclaimerContainer: {
    marginBottom: 24,
  },
  disclaimerText: {
    fontSize: 14,
    color: "#6c757d",
    fontStyle: "italic",
    lineHeight: 20,
  },
  actionButtonsContainer: {
    marginTop: 8,
  },
  downloadButton: {
    backgroundColor: "#4a6fa5",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  restartButton: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ced4da",
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6c757d",
  }
});

export default HealthAssessmentScreen;