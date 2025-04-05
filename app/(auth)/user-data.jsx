import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, View, TouchableOpacity, Button, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';
import { useFonts } from 'expo-font';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

const Aftersignup = () => {
  // Optional: Load custom fonts if needed
//   const [fontsLoaded] = useFonts({
//     'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
//     'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
//   });

const [isSubmitting, setSubmitting] = useState(false);

const submit = async () => {
      
      setSubmitting(true);
  
      try {
        
        router.replace("/user-form");
      } catch (error) {
        Alert.alert("Error", error.message);
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#6A11CB', '#2575FC']}  // More modern gradient colors
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}>
          
          <View style={styles.headerContainer}>
            <Text style={styles.welcomeText}>Welcome!</Text>
            <Text style={styles.subtitleText}>Your account has been created</Text>
          </View>
          
          <Svg height="120" width={width} viewBox={`0 0 ${width} 120`} style={styles.curve}>
            <Path
              fill="#F5F7FA"  // Match the container background
              d={`M0,120 Q${width / 2},30 ${width},120 L${width},120 L0,120 Z`}
            />
          </Svg>
        </LinearGradient>
        
        <View style={styles.contentContainer}>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="person-outline" size={36} color="#2575FC" />
            </View>
            <Text style={styles.cardTitle}>Complete Your Profile</Text>
            <Text style={styles.cardDescription}>
              Provide your details to enhance the accuracy of our predictions and get personalized recommendations.
            </Text>
            
            <TouchableOpacity style={styles.button} onPress={submit} disabled={isSubmitting}>
                
              <Text style={styles.buttonText}  >Get Started</Text>
             
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <MaterialIcons name="security" size={24} color="#6A11CB" />
              <Text style={styles.infoText}>Your data is secure and private</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="update" size={24} color="#6A11CB" />
              <Text style={styles.infoText}>Update your profile anytime</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Aftersignup;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',  // Light background color
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  gradient: {
    width: width,
    height: height * 0.35,  // Make height responsive
    paddingTop: 30,
    overflow: 'hidden',
  },
  headerContainer: {
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  welcomeText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    // fontFamily: 'Poppins-Bold',
    marginBottom: 5,
  },
  subtitleText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    // fontFamily: 'Poppins-Medium',
  },
  curve: {
    position: 'absolute',
    bottom: -1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: -50,  // Overlap with the gradient
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(37, 117, 252, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    // fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    // fontFamily: 'Poppins-Medium',
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#2575FC',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 10,
    shadowColor: "#2575FC",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    // fontFamily: 'Poppins-Bold',
  },
  infoSection: {
    marginTop: 30,
    paddingHorizontal: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#555',
    // fontFamily: 'Poppins-Medium',
  }
});