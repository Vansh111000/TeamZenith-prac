import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Share,
  FlatList,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';

// Mock function for Gemini API integration
const analyzeWithGemini = async (userMessage) => {
  // This would be replaced with actual Gemini API call
  console.log("Sending to Gemini API:", userMessage);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate response based on keywords in message
  const response = {
    analysis: "Based on your message, I notice signs of stress related to work-life balance and sleep disruption.",
    solution: "I recommend establishing a consistent sleep schedule, practicing mindfulness meditation for 10 minutes before bed, and limiting screen time 1 hour before sleep. Consider journaling your thoughts before bedtime to clear your mind.",
    tips: [
      "Try deep breathing exercises when feeling overwhelmed",
      "Create a calming bedtime routine",
      "Limit caffeine after noon",
      "Use lavender essential oil for relaxation"
    ]
  };
  
  if (userMessage.toLowerCase().includes("sleep")) {
    response.analysis = "I notice you're experiencing difficulties with your sleep patterns and quality.";
    response.solution = "Consider establishing a consistent sleep schedule, creating a dark and cool sleeping environment, and practicing progressive muscle relaxation before bed.";
  } else if (userMessage.toLowerCase().includes("stress")) {
    response.analysis = "Your message indicates elevated stress levels that may be impacting your daily functioning.";
    response.solution = "Try implementing regular breaks throughout your day, practicing mindfulness meditation, and engaging in regular physical activity to reduce stress hormones.";
  }
  
  return response;
};

// Function to generate PDF content (mock)
const generatePDF = async (conversation) => {
  // This would connect to a PDF generation service
  // For now, we'll create a text file as a demonstration
  const fileName = `${FileSystem.documentDirectory}serenity-guide.txt`;
  
  let content = "SERENITY & REST PERSONALIZED GUIDE\n\n";
  content += "Your Conversation:\n\n";
  
  conversation.forEach((msg, i) => {
    if (msg.sender === 'user') {
      content += `YOU: ${msg.text}\n\n`;
    } else {
      content += `SERENITY GUIDE:\n`;
      content += `${msg.text}\n\n`;
      if (msg.tips) {
        content += "RECOMMENDED PRACTICES:\n";
        msg.tips.forEach((tip, i) => {
          content += `${i + 1}. ${tip}\n`;
        });
        content += "\n";
      }
    }
  });
  
  content += "\nThank you for using Serenity & Rest. Remember, consistency is key to finding peace.\n";
  
  try {
    await FileSystem.writeAsStringAsync(fileName, content);
    return fileName;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return null;
  }
};

// Component for chat messages
const ChatMessage = ({ message, isUser }) => {
  return (
    <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
      <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
        {message.text}
      </Text>
      {message.tips && !isUser && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsHeader}>Recommended Practices:</Text>
          {message.tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <FontAwesome5 name="leaf" size={12} color="#4CAF50" style={styles.tipIcon} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// Component for remedies card
const RemedyCard = ({ title, description, icon }) => {
  return (
    <BlurView intensity={80} tint="light" style={styles.remedyCard}>
      <View style={styles.remedyIconContainer}>
        <FontAwesome5 name={icon} size={24} color="#3E64FF" />
      </View>
      <Text style={styles.remedyTitle}>{title}</Text>
      <Text style={styles.remedyDescription}>{description}</Text>
    </BlurView>
  );
};

export default function SerenityRestApp() {
  const [activeTab, setActiveTab] = useState('chat');
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Animate component when loaded
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    const userMessage = userInput.trim();
    setUserInput('');
    
    // Add user message to conversation
    setConversation(prev => [...prev, { sender: 'user', text: userMessage }]);
    
    // Scroll to bottom
    scrollViewRef.current?.scrollToEnd({ animated: true });
    
    // Call Gemini API
    setIsLoading(true);
    try {
      const response = await analyzeWithGemini(userMessage);
      
      // Format the response
      const formattedResponse = {
        sender: 'bot',
        text: `${response.analysis}\n\n${response.solution}`,
        tips: response.tips
      };
      
      // Add bot response to conversation
      setConversation(prev => [...prev, formattedResponse]);
      
      // Scroll to bottom after a short delay to ensure rendering completes
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error with Gemini API:", error);
      setConversation(prev => [...prev, { 
        sender: 'bot', 
        text: "I'm sorry, I experienced an issue processing your request. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownloadPDF = async () => {
    if (conversation.length === 0) {
      alert("Please have a conversation first before generating a guide.");
      return;
    }
    
    setIsLoading(true);
    try {
      const fileUri = await generatePDF(conversation);
      if (fileUri) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          alert("Sharing is not available on this device");
        }
      }
    } catch (error) {
      console.error("Error sharing PDF:", error);
      alert("Failed to generate your guide. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Predefined remedies for the Remedies tab
  const remedies = [
    {
      id: '1',
      title: 'Deep Breathing',
      description: 'Practice 4-7-8 breathing: Inhale for 4 seconds, hold for 7, exhale for 8. Repeat 5 times to calm your nervous system.',
      icon: 'wind'
    },
    {
      id: '2',
      title: 'Sleep Sanctuary',
      description: 'Keep your bedroom cool (65-68°F), dark, and quiet. Remove electronic devices and use blackout curtains if needed.',
      icon: 'bed'
    },
    {
      id: '3',
      title: 'Digital Sunset',
      description: 'Turn off screens 1 hour before bedtime to allow melatonin production. Try reading a physical book instead.',
      icon: 'moon'
    },
    {
      id: '4',
      title: 'Progressive Relaxation',
      description: 'Tense and then release each muscle group from toes to head. Helps reduce physical tension stored in the body.',
      icon: 'hand-holding-heart'
    },
    {
      id: '5',
      title: 'Nature Sounds',
      description: 'Listen to gentle rain, ocean waves, or forest sounds to calm your mind and create a peaceful atmosphere for rest.',
      icon: 'tree'
    },
    {
      id: '6',
      title: 'Herbal Support',
      description: 'Try chamomile tea, valerian root, or lavender essential oil to promote natural relaxation before bedtime.',
      icon: 'leaf'
    },
    {
      id: '7',
      title: 'Gratitude Practice',
      description: 'Write down three things you re grateful for before bed to shift your mind toward positive thoughts.',
      icon: 'heart'
    },
    {
      id: '8',
      title: 'Body Scan Meditation',
      description: 'Mentally scan your body from head to toe, noticing sensations without judgment to release tension.',
      icon: 'search'
    }
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#192f6a', '#3b5998', '#4c669f']}
        style={styles.background}
      />
      
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.headerTitle}>Serenity & Rest</Text>
        <Text style={styles.headerSubtitle}>Find peace in your daily life</Text>
      </Animated.View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'chat' && styles.activeTabButton]}
          onPress={() => setActiveTab('chat')}
        >
          <Feather 
            name="message-circle" 
            size={20} 
            color={activeTab === 'chat' ? '#FFFFFF' : '#CCCCCC'} 
          />
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>AI Guide</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'remedies' && styles.activeTabButton]}
          onPress={() => setActiveTab('remedies')}
        >
          <Feather 
            name="heart" 
            size={20} 
            color={activeTab === 'remedies' ? '#FFFFFF' : '#CCCCCC'} 
          />
          <Text style={[styles.tabText, activeTab === 'remedies' && styles.activeTabText]}>Remedies</Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'chat' ? (
        <View style={styles.chatContainer}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
          >
            {conversation.length === 0 ? (
              <View style={styles.emptyChat}>
                <Image
                  source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }} // Replace with your own image
                  style={styles.emptyChatImage}
                />
                <Text style={styles.emptyChatText}>
                  Share your concerns about sleep, stress, or rest. I'll analyze your situation and provide personalized guidance.
                </Text>
              </View>
            ) : (
              conversation.map((message, index) => (
                <ChatMessage 
                  key={index} 
                  message={message} 
                  isUser={message.sender === 'user'} 
                />
              ))
            )}
            {isLoading && (
              <ActivityIndicator size="large" color="#3E64FF" style={styles.loader} />
            )}
          </ScrollView>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="Describe what you're experiencing..."
              placeholderTextColor="#999"
              multiline
              onSubmitEditing={handleSendMessage}
            />
            
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={handleSendMessage}
              disabled={isLoading || !userInput.trim()}
            >
              <MaterialIcons name="send" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {conversation.length > 0 && (
            <TouchableOpacity 
              style={styles.downloadButton}
              onPress={handleDownloadPDF}
              disabled={isLoading}
            >
              <Text style={styles.downloadButtonText}>
                {isLoading ? "Generating..." : "Download Personalized Guide"}
              </Text>
              {!isLoading && <Feather name="download" size={18} color="#FFFFFF" style={styles.downloadIcon} />}
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.remediesContainer}>
          <Text style={styles.remediesHeader}>
            Peaceful Practices for Better Rest
          </Text>
          
          <FlatList
            data={remedies}
            renderItem={({ item }) => (
              <RemedyCard 
                title={item.title} 
                description={item.description} 
                icon={item.icon} 
              />
            )}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.remediesList}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 5,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: 'rgba(62, 100, 255, 0.8)',
  },
  tabText: {
    color: '#CCCCCC',
    marginLeft: 8,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messagesContent: {
    paddingBottom: 20,
  },
  emptyChat: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 50,
  },
  emptyChatImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
    opacity: 0.7,
  },
  emptyChatText: {
    textAlign: 'center',
    color: '#E0E0E0',
    fontSize: 16,
    lineHeight: 24,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(62, 100, 255, 0.8)',
    borderBottomRightRadius: 5,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: '#F0F0F0',
  },
  tipsContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  tipsHeader: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  tipIcon: {
    marginRight: 8,
    marginTop: 3,
  },
  tipText: {
    color: '#F0F0F0',
    flex: 1,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#FFFFFF',
    maxHeight: 100,
  },
  sendButton: {
    width: 45,
    height: 45,
    backgroundColor: '#3E64FF',
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  downloadButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  downloadIcon: {
    marginLeft: 10,
  },
  loader: {
    marginVertical: 20,
  },
  remediesContainer: {
    flex: 1,
    padding: 15,
  },
  remediesHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  remediesList: {
    paddingBottom: 20,
  },
  remedyCard: {
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  remedyIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  remedyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  remedyDescription: {
    fontSize: 14,
    color: '#F0F0F0',
    lineHeight: 20,
  },
});