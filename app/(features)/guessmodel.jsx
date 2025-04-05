import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, Alert, Linking } from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.1.x:5000'; // 🔁 Replace with your local Flask IP address

export default function App() {
  const [symptoms, setSymptoms] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [predictions, setPredictions] = useState([]);
  const [reportUrl, setReportUrl] = useState(null);

  const handleGetQuestions = async () => {
    try {
      const res = await axios.post(`${API_URL}/questions`, {
        symptoms: symptoms.split(',').map(s => s.trim()),
      });
      setQuestions(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch questions.');
    }
  };

  const handleAnswerChange = (index, answer) => {
    const updated = { ...answers, [index]: answer };
    setAnswers(updated);
  };

  const handlePredict = async () => {
    try {
      const answerList = questions.map((q, i) => ({
        question: q.question,
        answer: answers[i] || 'No',
      }));

      const predictRes = await axios.post(`${API_URL}/predict`, {
        symptoms: symptoms.split(',').map(s => s.trim()),
      });

      setPredictions(predictRes.data);

      const reportRes = await axios.post(`${API_URL}/report`, {
        answers: answerList,
        symptoms: symptoms.split(',').map(s => s.trim()),
        predictions: predictRes.data,
      });

      setReportUrl(`${API_URL}${reportRes.data.file}`);
      Alert.alert('✅ Report Generated', 'Tap "Download Report" to open the file.');
    } catch (err) {
      Alert.alert('Error', 'Prediction or report failed.');
    }
  };

  const handleDownload = () => {
    if (reportUrl) Linking.openURL(reportUrl);
    else Alert.alert('No report available yet.');
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>🩺 Symptom Checker</Text>

      <TextInput
        placeholder="Enter symptoms (comma separated)"
        value={symptoms}
        onChangeText={setSymptoms}
        style={{ marginVertical: 15, borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      <Button title="Get Follow-Up Questions" onPress={handleGetQuestions} />

      {questions.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>❓ Questions</Text>
          {questions.map((q, i) => (
            <View key={i} style={{ marginVertical: 10 }}>
              <Text>{i + 1}. {q.question}</Text>
              {q.answers.map((ans, idx) => (
                <Button
                  key={idx}
                  title={`${ans}`}
                  color={answers[i] === ans ? 'green' : 'gray'}
                  onPress={() => handleAnswerChange(i, ans)}
                />
              ))}
            </View>
          ))}
          <Button title="Predict Disease & Generate Report" onPress={handlePredict} />
        </View>
      )}

      {predictions.length > 0 && (
        <View style={{ marginTop: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>🧠 Predictions</Text>
          {predictions.map((d, i) => (
            <View key={i} style={{ marginVertical: 10 }}>
              <Text style={{ fontWeight: 'bold' }}>{i + 1}. {d.disease} ({d.probability})</Text>
              <Text>📝 {d.reason}</Text>
              <Text>⚠️ {d.precautions}</Text>
              <Text>🛠️ {d.remedies}</Text>
            </View>
          ))}
          <Button title="📄 Download Report" onPress={handleDownload} />
        </View>
      )}
    </ScrollView>
  );
}
