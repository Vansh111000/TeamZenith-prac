import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const HomeScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  // const { user, setUser, setIsLogged } = useGlobalContext();

  // useEffect(() => {
  //     if (!user) {
  //       console.log("User is null, redirecting to sign-in...");
  //       router.push('/(auth)/sign-in');  // Ensure navigation updates
  //     }
  //   }, [user]);

  // Common health tips
  const healthTips = [
    {
      id: '1',
      title: 'Stay Hydrated',
      description: 'Drink at least 8 glasses of water daily to maintain proper hydration.',
      category: 'General',
      icon: 'water-outline'
    },
    {
      id: '2',
      title: 'Regular Exercise',
      description: 'Aim for at least 30 minutes of moderate exercise 5 days a week.',
      category: 'Fitness',
      icon: 'fitness-outline'
    },
    {
      id: '3',
      title: 'Balanced Diet',
      description: 'Include fruits, vegetables, whole grains, and lean proteins in your meals.',
      category: 'Nutrition',
      icon: 'nutrition-outline'
    },
    {
      id: '4',
      title: 'Adequate Sleep',
      description: 'Get 7-9 hours of quality sleep every night for optimal health.',
      category: 'Rest',
      icon: 'bed-outline'
    },
    {
      id: '5',
      title: 'Stress Management',
      description: 'Practice meditation, deep breathing, or yoga to reduce stress levels.',
      category: 'Mental Health',
      icon: 'happy-outline'
    }
  ];

  // Common diseases information
  const commonDiseases = [
    {
      id: '1',
      name: 'Hypertension',
      symptoms: 'Headaches, shortness of breath, nosebleeds',
      category: 'Cardiovascular'
    },
    {
      id: '2',
      name: 'Type 2 Diabetes',
      symptoms: 'Increased thirst, frequent urination, unexplained weight loss',
      category: 'Endocrine'
    },
    {
      id: '3',
      name: 'Common Cold',
      symptoms: 'Runny nose, sore throat, cough, congestion',
      category: 'Respiratory'
    },
    {
      id: '4',
      name: 'Anxiety Disorder',
      symptoms: 'Excessive worry, restlessness, fatigue, difficulty concentrating',
      category: 'Mental Health'
    }
  ];

  // Categories for filtering
  const categories = ['All', 'General', 'Fitness', 'Nutrition', 'Rest', 'Mental Health'];

  const filteredTips = selectedCategory === 'All' 
    ? healthTips 
    : healthTips.filter(tip => tip.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      
      
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#4b6cb7', '#182848']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.appName}>No Mild Severe Healthcare</Text>
        </View>
        
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            Welcome to No Mild Severe Health Care app, we will help you find the health problems or disease you are currently facing
          </Text>
        </View>
      </LinearGradient>



      {/* Main content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Health Assessment Card */}
        <TouchableOpacity style={styles.assessmentCard}>
  <Link href="/guess">
    <LinearGradient
      colors={['#43cea2', '#185a9d']}
      style={styles.assessmentCardGradient}
    >
      <View style={styles.assessmentCardContent}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.assessmentCardTitle}>Guess Your Illness</Text>
          <Text style={[styles.assessmentCardSubtitle, { display: 'flex', marginRight: '0', paddingRight: 0 }]}>
            Unveil Your Inner Mystery: The Disease You Never Knew You Had
            {"\n"}
            If you are not sure about the symptoms you are facing, choose this model{"\n"}
          
            {/* Model :1
            choose based on the symptoms you know you are facing */}
            {/* Model :2
            choose based on the symptoms you know you are facing */}
          </Text>
          <Text style={{ color: "#FFA07A", fontSize: 10, fontWeight: "bold", margin: "20px" }}>
  More updates coming your way soon!
</Text>
        </View>
        <Ionicons name="arrow-forward-circle" size={40} color="white" />
      </View>
    </LinearGradient>
  </Link>
</TouchableOpacity>
        <TouchableOpacity style={styles.assessmentCard}>
  <Link href="/guessmodel">
    <LinearGradient
      colors={['#43cea2', '#185a9d']}
      style={styles.assessmentCardGradient}
    >
      <View style={styles.assessmentCardContent}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.assessmentCardTitle}>Guess Your Illness</Text>
          <Text style={[styles.assessmentCardSubtitle, { display: 'flex', marginRight: '0', paddingRight: 0 }]}>
            {/* Unveil Your Inner Mystery: The Disease You Never Knew You Had{'\n'} */}
            Unique 22 Symptoms Model {'\n'}
            If you are sure about the symptoms you are facing, choose this model
            {/* Model :2
            choose based on the symptoms you know you are facing */}
          </Text>
          <Text style={{ color: "#FFA07A", fontSize: 10, fontWeight: "bold", margin: "20px" }}>
  More updates coming your way soon!
</Text>
        </View>
        <Ionicons name="arrow-forward-circle" size={40} color="white" />
      </View>
    </LinearGradient>
  </Link>
</TouchableOpacity>


        <TouchableOpacity style={styles.assessmentCard}>
  <Link href="/workout">
          <LinearGradient
            colors={['#43cea2', '#185a9d']}
            style={styles.assessmentCardGradient}
          >
            <View style={styles.assessmentCardContent}>
            <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.assessmentCardTitle}> Diet plan</Text>
                <Text style={styles.assessmentCardSubtitle}>
                Transform your plate, transform your life: nourish your body, ignite your spirit!
                </Text>
                <Text style={{ color: "#FFA07A", fontSize: 10, fontWeight: "bold", margin: "20px" }}>
  More updates coming your way soon!
</Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={40} color="white" />
            </View>
          </LinearGradient>
  </Link>
        </TouchableOpacity>

        <TouchableOpacity style={styles.assessmentCard}>
        <Link href="/stress">
          <LinearGradient
            colors={['#43cea2', '#185a9d']}
            style={styles.assessmentCardGradient}
          >
            <View style={styles.assessmentCardContent}>
              <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.assessmentCardTitle}>Serenity & Rest</Text>
                <Text style={[styles.assessmentCardSubtitle, { display: 'flex', marginRight: '0' , paddingRight: 0 }]}>
                Master Your Mind, Embrace Deep Sleep
                </Text>
                <Text style={{ color: "#FFA07A", fontSize: 10, fontWeight: "bold", margin: "20px" }}>
  More updates coming your way soon!
</Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={40} color="white" />
            </View>
          </LinearGradient>
          </Link>
        </TouchableOpacity>



        {/* Categories */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.selectedCategoryButtonText
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Health Tips */}
        <Text style={styles.sectionTitle}>Health Tips</Text>
        <View style={styles.tipsContainer}>
          {filteredTips.map((tip) => (
            <View key={tip.id} style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <Ionicons name={tip.icon} size={30} color="#4b6cb7" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Common Diseases */}
        <Text style={styles.sectionTitle}>Common Diseases</Text>
        <View style={styles.diseasesContainer}>
          {commonDiseases.map((disease) => (
            <TouchableOpacity key={disease.id} style={styles.diseaseCard}>
              <View style={styles.diseaseCardHeader}>
                <Text style={styles.diseaseName}>{disease.name}</Text>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>{disease.category}</Text>
                </View>
              </View>
              <Text style={styles.diseaseSymptoms}>
                <Text style={styles.symptomsLabel}>Symptoms: </Text>
                {disease.symptoms}
              </Text>
              
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
     
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    paddingTop: 40,
  },
  welcomeContainer: {
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  assessmentCard: {
    width: "100%",
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 15, // Adjust spacing
    backgroundColor: "white",
  },
  assessmentCardGradient: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 80, // Ensures a consistent height
  },
  assessmentCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1, // Ensures content fills available space
  },
  assessmentCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  assessmentCardSubtitle: {
    fontSize: 14,
    color: "white",
    maxWidth: "90%", // Prevents text from wrapping oddly
    flexWrap: "wrap",
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 15,
    color: '#333',
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
  },
  selectedCategoryButton: {
    backgroundColor: '#4b6cb7',
  },
  categoryButtonText: {
    color: '#555',
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: 'white',
  },
  tipsContainer: {
    marginBottom: 20,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  tipIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e9f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  diseasesContainer: {
    marginBottom: 80,
  },
  diseaseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  diseaseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryTag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  categoryTagText: {
    fontSize: 12,
    color: '#4b6cb7',
  },
  diseaseSymptoms: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  symptomsLabel: {
    fontWeight: '500',
  },

  
});

export default HomeScreen;