import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const DietPlanPage = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: '1',
      type: 'system',
      text: "Welcome to your personal diet planner! Tell me about your current eating habits, any dietary restrictions, health goals, or specific questions you have about nutrition."
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [dietPlan, setDietPlan] = useState(null);
  const [showDietPlan, setShowDietPlan] = useState(false);
  const flatListRef = useRef(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (showDietPlan) {
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
    }
  }, [showDietPlan]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (chatHistory.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatHistory]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage = {
      id: String(Date.now()),
      type: 'user',
      text: message
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      const genAI = new GoogleGenerativeAI("AIzaSyCckJqoHEUlJmOUDstkiTPG0p-0Xru9Xyo");
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      // Compile chat history for context
      const chatContext = chatHistory
        .filter(msg => msg.type !== 'system')
        .map(msg => msg.text)
        .join('\n');
      
      const dietPrompt = `Based on this information about the user's eating habits and preferences: "${message} ${chatContext ? '\nPrevious context: ' + chatContext : ''}", 
      please provide a brief, helpful response about their diet. If they've shared enough information about their eating habits, health goals, and preferences, 
      also include a simple personalized recommendation. Keep your response conversational and supportive.`;
      
      const result = await model.generateContent(dietPrompt);
      const response = await result.response.text();
      
      // Add response to chat
      setChatHistory(prev => [...prev, {
        id: String(Date.now() + 1),
        type: 'assistant',
        text: response
      }]);
      
      // If this is the second user message or more, offer to create a full diet plan
      if (chatHistory.filter(msg => msg.type === 'user').length >= 1) {
        // Only generate a diet plan if not already showing one
        if (!dietPlan) {
          const dietPlanPrompt = `Based on this conversation with the user about their eating habits and preferences: "${message} ${chatContext ? '\nPrevious context: ' + chatContext : ''}", 
          create a personalized diet plan. Format as follows:
          
          DIETARY_PROFILE: Brief summary of their needs
          RECOMMENDATIONS: 3-5 bullet points of general advice
          MEAL_PLAN:
          - Breakfast: 2-3 options
          - Lunch: 2-3 options
          - Dinner: 2-3 options
          - Snacks: 2-3 options
          FOODS_TO_INCLUDE: Comma-separated list
          FOODS_TO_LIMIT: Comma-separated list`;
          
          const planResult = await model.generateContent(dietPlanPrompt);
          const planResponse = await planResult.response.text();
          
          // Parse the diet plan
          const planInfo = parseDietPlan(planResponse);
          setDietPlan(planInfo);
          
          // Add a system message offering to view the diet plan
          setChatHistory(prev => [...prev, {
            id: String(Date.now() + 2),
            type: 'system',
            text: "I've created a personalized diet plan based on our conversation. Would you like to view it?",
            hasAction: true
          }]);
        }
      }
    } catch (error) {
      console.error("Diet Chat Error:", error);
      setChatHistory(prev => [...prev, {
        id: String(Date.now() + 1),
        type: 'system',
        text: "Sorry, there was an error processing your request. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const parseDietPlan = (text) => {
    const lines = text.split('\n').map(line => line.trim());
    let currentSection = '';
    const plan = {
      profile: '',
      recommendations: [],
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      },
      includeFood: [],
      limitFood: []
    };
    
    lines.forEach(line => {
      if (line.startsWith('DIETARY_PROFILE:')) {
        currentSection = 'profile';
        plan.profile = line.replace('DIETARY_PROFILE:', '').trim();
      } else if (line.startsWith('RECOMMENDATIONS:')) {
        currentSection = 'recommendations';
      } else if (line.startsWith('MEAL_PLAN:')) {
        currentSection = 'meal_plan';
      } else if (line.startsWith('- Breakfast:')) {
        currentSection = 'breakfast';
        const options = line.replace('- Breakfast:', '').trim();
        if (options) plan.meals.breakfast.push(options);
      } else if (line.startsWith('- Lunch:')) {
        currentSection = 'lunch';
        const options = line.replace('- Lunch:', '').trim();
        if (options) plan.meals.lunch.push(options);
      } else if (line.startsWith('- Dinner:')) {
        currentSection = 'dinner';
        const options = line.replace('- Dinner:', '').trim();
        if (options) plan.meals.dinner.push(options);
      } else if (line.startsWith('- Snacks:')) {
        currentSection = 'snacks';
        const options = line.replace('- Snacks:', '').trim();
        if (options) plan.meals.snacks.push(options);
      } else if (line.startsWith('FOODS_TO_INCLUDE:')) {
        currentSection = 'include';
        plan.includeFood = line.replace('FOODS_TO_INCLUDE:', '').split(',').map(item => item.trim()).filter(Boolean);
      } else if (line.startsWith('FOODS_TO_LIMIT:')) {
        currentSection = 'limit';
        plan.limitFood = line.replace('FOODS_TO_LIMIT:', '').split(',').map(item => item.trim()).filter(Boolean);
      } else if (line) {
        // Add content to current section
        switch (currentSection) {
          case 'recommendations':
            if (line.startsWith('-')) {
              plan.recommendations.push(line.substring(1).trim());
            }
            break;
          case 'breakfast':
            if (!line.startsWith('-')) {
              plan.meals.breakfast.push(line);
            }
            break;
          case 'lunch':
            if (!line.startsWith('-')) {
              plan.meals.lunch.push(line);
            }
            break;
          case 'dinner':
            if (!line.startsWith('-')) {
              plan.meals.dinner.push(line);
            }
            break;
          case 'snacks':
            if (!line.startsWith('-')) {
              plan.meals.snacks.push(line);
            }
            break;
        }
      }
    });
    
    return plan;
  };
  
  const viewDietPlan = () => {
    setShowDietPlan(true);
  };
  
  const closeDietPlan = () => {
    setShowDietPlan(false);
  };

  const renderChatItem = ({ item }) => {
    if (item.type === 'user') {
      return (
        <View style={styles.userMessageContainer}>
          <View style={styles.userMessage}>
            <Text style={styles.userMessageText}>{item.text}</Text>
          </View>
        </View>
      );
    } else if (item.type === 'assistant') {
      return (
        <View style={styles.assistantMessageContainer}>
          <View style={styles.assistantAvatar}>
            <MaterialCommunityIcons name="food-apple" size={16} color="#FFFFFF" />
          </View>
          <View style={styles.assistantMessage}>
            <Text style={styles.assistantMessageText}>{item.text}</Text>
          </View>
        </View>
      );
    } else if (item.type === 'system') {
      return (
        <View style={styles.systemMessageContainer}>
          <View style={styles.systemMessage}>
            <Text style={styles.systemMessageText}>{item.text}</Text>
            {item.hasAction && (
              <TouchableOpacity style={styles.actionButton} onPress={viewDietPlan}>
                <Text style={styles.actionButtonText}>View Diet Plan</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }
    return null;
  };
  
  const renderMealSection = (title, meals, icon) => {
    if (!meals || meals.length === 0) return null;
    
    return (
      <View style={styles.mealSection}>
        <View style={styles.mealHeader}>
          <MaterialCommunityIcons name={icon} size={22} color="#4F46E5" />
          <Text style={styles.mealTitle}>{title}</Text>
        </View>
        <View style={styles.mealOptions}>
          {meals.map((meal, index) => (
            <View key={index} style={styles.mealOption}>
              <View style={styles.mealBullet} />
              <Text style={styles.mealText}>{meal}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient 
        colors={['#10B981', '#059669']} 
        start={{x: 0, y: 0}} 
        end={{x: 1, y: 0}} 
        style={styles.header}
      >
        <Text style={styles.headerText}>Personalized Diet Plan</Text>
        <Text style={styles.headerSubtext}>Chat with your nutrition assistant</Text>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.contentContainer}>
          <FlatList
            ref={flatListRef}
            data={chatHistory}
            renderItem={renderChatItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.chatContainer}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Tell me about your eating habits..."
              placeholderTextColor="#9CA3AF"
              value={message}
              onChangeText={setMessage}
              multiline
              maxHeight={100}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!message.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Ionicons name="send" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      
      {/* Diet Plan Modal */}
      {showDietPlan && dietPlan && (
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.dietPlanModal,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Personalized Diet Plan</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeDietPlan}>
                <Ionicons name="close" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Profile Section */}
              <View style={styles.profileSection}>
                <Text style={styles.profileTitle}>Your Dietary Profile</Text>
                <Text style={styles.profileText}>{dietPlan.profile}</Text>
              </View>
              
              {/* Recommendations */}
              <View style={styles.recommendationsSection}>
                <Text style={styles.sectionTitle}>Recommendations</Text>
                {dietPlan.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </View>
              
              {/* Meal Plan */}
              <View style={styles.mealPlanSection}>
                <Text style={styles.sectionTitle}>Meal Plan</Text>
                {renderMealSection('Breakfast', dietPlan.meals.breakfast, 'coffee-outline')}
                {renderMealSection('Lunch', dietPlan.meals.lunch, 'food-variant')}
                {renderMealSection('Dinner', dietPlan.meals.dinner, 'food')}
                {renderMealSection('Snacks', dietPlan.meals.snacks, 'fruit-cherries')}
              </View>
              
              {/* Foods Lists */}
              <View style={styles.foodsSection}>
                <View style={styles.foodsInclude}>
                  <Text style={styles.foodsTitle}>Foods to Include</Text>
                  <View style={styles.foodTags}>
                    {dietPlan.includeFood.map((food, index) => (
                      <View key={index} style={styles.foodTag}>
                        <Text style={styles.foodTagText}>{food}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                <View style={styles.foodsLimit}>
                  <Text style={styles.foodsTitle}>Foods to Limit</Text>
                  <View style={styles.foodTags}>
                    {dietPlan.limitFood.map((food, index) => (
                      <View key={index} style={[styles.foodTag, styles.foodTagLimit]}>
                        <Text style={styles.foodTagTextLimit}>{food}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              
              <View style={styles.disclaimer}>
                <Ionicons name="information-circle" size={16} color="#6B7280" />
                <Text style={styles.disclaimerText}>
                  This plan is a general recommendation based on the information provided. For personalized medical nutrition advice, please consult with a registered dietitian or healthcare provider.
                </Text>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerText: {
    fontSize: 24,
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
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 16,
  },
  userMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  userMessage: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
    maxWidth: '80%',
  },
  userMessageText: {
    color: '#374151',
    fontSize: 16,
  },
  assistantMessageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  assistantAvatar: {
    backgroundColor: '#10B981',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  assistantMessage: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  assistantMessageText: {
    color: '#374151',
    fontSize: 16,
  },
  systemMessageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  systemMessage: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 12,
    maxWidth: '90%',
    alignItems: 'center',
  },
  systemMessageText: {
    color: '#4B5563',
    fontSize: 14,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
    marginTop: 10,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    color: '#374151',
    fontSize: 16,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#10B981',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dietPlanModal: {
    backgroundColor: 'white',
    borderRadius: 24,
    width: width * 0.9,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  profileSection: {
    marginTop: 16,
    marginBottom: 20,
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  profileText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  recommendationText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#374151',
    flex: 1,
    lineHeight: 22,
  },
  mealPlanSection: {
    marginBottom: 20,
  },
  mealSection: {
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  mealOptions: {
    paddingLeft: 4,
  },
  mealOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mealBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginTop: 8,
    marginRight: 8,
  },
  mealText: {
    flex: 1,
    fontSize: 15,
    color: '#4B5563',
  },
  foodsSection: {
    marginBottom: 20,
  },
  foodsInclude: {
    marginBottom: 16,
  },
  foodsLimit: {
    marginBottom: 16,
  },
  foodsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  foodTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  foodTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
  },
  foodTagText: {
    color: '#10B981',
    fontSize: 14,
  },
  foodTagLimit: {
    backgroundColor: '#FEF2F2',
  },
  foodTagTextLimit: {
    color: '#EF4444',
    fontSize: 14,
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  disclaimerText: {
    color: '#6B7280',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
});

export default DietPlanPage;