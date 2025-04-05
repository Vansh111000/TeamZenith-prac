import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Dimensions,
  Image
} from "react-native";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import { Buffer } from 'buffer';

// For DOCX creation
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, HeadingLevel, UnderlineType } from 'docx';

const API_KEY = "AIzaSyCckJqoHEUlJmOUDstkiTPG0p-0Xru9Xyo";
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
        After no more than 20 questions or when you have enough information, provide three potential health conditions
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

  const generateDocx = async () => {
    setGenerating(true);
    
    try {
      // Create document
      const doc = new Document({
        styles: {
          paragraphStyles: [
            {
              id: "Normal",
              run: {
                font: "Calibri",
                size: 24,
                color: "000000",
              },
              paragraph: {
                spacing: {
                  after: 200,
                },
              },
            },
            {
              id: "Heading1",
              name: "Heading 1",
              run: {
                font: "Calibri",
                size: 36,
                bold: true,
                color: "2E5A88"
              },
              paragraph: {
                spacing: {
                  before: 240,
                  after: 240,
                },
              },
            },
            {
              id: "Heading2",
              name: "Heading 2",
              run: {
                font: "Calibri",
                size: 30,
                bold: true,
                color: "2E5A88"
              },
              paragraph: {
                spacing: {
                  before: 240,
                  after: 120,
                },
              },
            },
          ],
        },
        sections: [
          {
            properties: {},
            children: [
              // Title
              new Paragraph({
                text: "Health Assessment Report",
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
              }),
              
              // Date
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Date: ${new Date().toLocaleDateString()}`,
                    size: 24,
                    italics: true,
                  }),
                ],
                spacing: { after: 400 },
              }),
              
              // Questions and Responses Section
              new Paragraph({
                text: "Questions and Responses",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400 },
              }),
              
              // Question Response Table
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
                  right: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
                  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
                  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" },
                },
                rows: [
                  // Table headers
                  new TableRow({
                    tableHeader: true,
                    children: [
                      new TableCell({
                        width: { size: 10, type: WidthType.PERCENTAGE },
                        shading: {
                          fill: "4A6FA5",
                        },
                        children: [new Paragraph({ 
                          text: "#", 
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: "#",
                              bold: true,
                              color: "FFFFFF",
                            }),
                          ],
                        })],
                      }),
                      new TableCell({
                        width: { size: 70, type: WidthType.PERCENTAGE },
                        shading: {
                          fill: "4A6FA5",
                        },
                        children: [new Paragraph({ 
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: "Question",
                              bold: true,
                              color: "FFFFFF",
                            }),
                          ],
                        })],
                      }),
                      new TableCell({
                        width: { size: 20, type: WidthType.PERCENTAGE },
                        shading: {
                          fill: "4A6FA5",
                        },
                        children: [new Paragraph({ 
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: "Response",
                              bold: true,
                              color: "FFFFFF",
                            }),
                          ],
                        })],
                      }),
                    ],
                  }),
                  // Data rows - dynamically add user responses
                  ...responses.map((res, index) => {
                    // Determine response color for styling
                    let responseColor = "000000"; // Default black
                    if (res.answer === "Mild") responseColor = "FF9800";  // Orange
                    if (res.answer === "Severe") responseColor = "F44336"; // Red
                    if (res.answer === "No") responseColor = "4CAF50"; // Green
                    
                    return new TableRow({
                      children: [
                        // Question number cell
                        new TableCell({
                          shading: {
                            fill: index % 2 === 0 ? "F9F9F9" : "FFFFFF",
                          },
                          children: [new Paragraph({ 
                            text: (index + 1).toString(),
                            alignment: AlignmentType.CENTER, 
                          })],
                        }),
                        // Question text cell
                        new TableCell({
                          shading: {
                            fill: index % 2 === 0 ? "F9F9F9" : "FFFFFF",
                          },
                          children: [new Paragraph({ text: res.question })],
                        }),
                        // Response cell
                        new TableCell({
                          shading: {
                            fill: index % 2 === 0 ? "F9F9F9" : "FFFFFF",
                          },
                          children: [new Paragraph({ 
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text: res.answer,
                                bold: true,
                                color: responseColor,
                              }),
                            ],
                          })],
                        }),
                      ],
                    });
                  }),
                ],
              }),
              
              // Assessment Results Section
              new Paragraph({
                text: "Assessment Results",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 },
              }),
              
              // Parse result to create formatted paragraphs
              ...result.split('\n').map(line => {
                // Check if this is a numbered item
                const match = line.match(/^(\d+)\.\s+(.+?):\s+(.+)$/);
                if (match) {
                  const number = match[1];
                  const condition = match[2];
                  const description = match[3];
                  
                  return new Paragraph({
                    children: [
                      new TextRun({
                        text: `${number}. `,
                        bold: true,
                        size: 28,
                      }),
                      new TextRun({
                        text: `${condition}: `,
                        bold: true,
                        underline: {
                          type: UnderlineType.SINGLE,
                        },
                        size: 28,
                      }),
                      new TextRun({
                        text: description,
                        size: 24,
                      }),
                    ],
                    spacing: { after: 240 },
                  });
                } else if (line.trim()) {
                  // If it's just a regular line and not empty
                  return new Paragraph({
                    text: line,
                    spacing: { after: 240 },
                  });
                }
              }).filter(para => para), // Filter out undefined items
              
              // Disclaimer
              new Paragraph({
                children: [
                  new TextRun({
                    text: "DISCLAIMER: ",
                    bold: true,
                    size: 24,
                  }),
                  new TextRun({
                    text: "This assessment is for informational purposes only and does not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.",
                    size: 24,
                    italics: true,
                  }),
                ],
                spacing: { before: 400 },
              }),
            ],
          },
        ],
      });

      // Generate the DOCX file as buffer
      const buffer = await Packer.toBuffer(doc);
      
      // Convert buffer to base64
      const base64 = Buffer.from(buffer).toString('base64');
      
      // Save as temp file
      const fileUri = `${FileSystem.documentDirectory}HealthAssessment.docx`;
      await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.BASE64 });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          dialogTitle: 'Health Assessment Report',
        });
      } else {
        Alert.alert("Error", "Sharing is not available on this device");
      }
    } catch (error) {
      console.error("Error generating DOCX report:", error);
      Alert.alert("Error", "Failed to generate DOCX report. Falling back to text file.");
      
      // Fallback to text file if DOCX creation fails
      const disclaimer = "DISCLAIMER: This assessment is for informational purposes only and does not replace professional medical advice.";
      let content = "HEALTH ASSESSMENT REPORT\n\n";
      content += `Date: ${new Date().toLocaleDateString()}\n\n`;
      content += "QUESTIONS AND RESPONSES:\n\n";
      
      responses.forEach((res, index) => {
        content += `Question ${index + 1}: ${res.question}\n`;
        content += `Response: ${res.answer}\n\n`;
      });
      
      content += "ASSESSMENT RESULTS:\n\n";
      content += `${result}\n\n`;
      content += disclaimer;
      
      const textFileUri = FileSystem.documentDirectory + "HealthAssessment.txt";

      try {
        await FileSystem.writeAsStringAsync(textFileUri, content, { encoding: FileSystem.EncodingType.UTF8 });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(textFileUri);
        }
      } catch (fallbackError) {
        console.error("Error with fallback text report:", fallbackError);
        Alert.alert("Error", "Failed to generate report.");
      }
    } finally {
      setGenerating(false);
    }
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
                  onPress={generateDocx}
                  style={styles.downloadButton}
                  disabled={generating}
                >
                  {generating ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.downloadButtonText}>Download Report (DOCX)</Text>
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