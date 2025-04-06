import { useGlobalContext } from "@/context/globalprovider";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import * as Animatable from "react-native-animatable";
import { SafeAreaView } from "react-native-safe-area-context";
import { addUserDetails, getUserDetails } from "../lib/firebasedata";

const UserProfile = () => {
  const { user, setUser } = useGlobalContext();
  const userId = user?.$id;
  
  // State for user profile details
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: new Date(),
    gender: "",
    height: "",
    weight: "",
    bloodGroup: "",
    emergencyContact: "",
    allergies: "",
    medications: "",
    conditions: [],
    exerciseFrequency: 3,
    sleepHours: 7,
    dietaryPreference: "",
    stressLevel: 5,
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user details on component mount
  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      const data = await getUserDetails(userId);
      if (data) {
        setProfileData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(),
          gender: data.gender || "",
          height: data.height ? data.height.toString() : "",
          weight: data.weight ? data.weight.toString() : "",
          bloodGroup: data.bloodGroup || "",
          emergencyContact: data.emergencyContact || "",
          allergies: data.allergies || "",
          medications: data.medications || "",
          conditions: data.conditions || [],
          exerciseFrequency: data.exerciseFrequency || 3,
          sleepHours: data.sleepHours || 7,
          dietaryPreference: data.dietaryPreference || "",
          stressLevel: data.stressLevel || 5,
        });
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserDetails = async () => {
    setIsSaving(true);
    try {
      await addUserDetails(userId, {
        ...profileData,
        height: Number(profileData.height),
        weight: Number(profileData.weight),
        exerciseFrequency: Number(profileData.exerciseFrequency),
        sleepHours: Number(profileData.sleepHours),
        stressLevel: Number(profileData.stressLevel),
        dateOfBirth: profileData.dateOfBirth.toISOString(),
      });
      
      setIsEditing(false);
      Alert.alert("Success", "Your profile has been updated successfully!");
    } catch (error) {
      console.error("Error saving user details:", error);
      Alert.alert("Error", "Failed to update your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleCondition = (condition) => {
    const updatedConditions = [...profileData.conditions];
    
    if (updatedConditions.includes(condition)) {
      const index = updatedConditions.indexOf(condition);
      updatedConditions.splice(index, 1);
    } else {
      updatedConditions.push(condition);
    }
    
    handleChange("conditions", updatedConditions);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderInfoItem = (label, value, icon) => (
    <View style={styles.infoItem}>
      {icon}
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "Not provided"}</Text>
      </View>
    </View>
  );

  const getGenderLabel = (code) => {
    const genders = {
      "male": "Male",
      "female": "Female",
      "non-binary": "Non-binary",
      "not-specified": "Prefer not to say"
    };
    return genders[code] || code || "Not specified";
  };

  const getDietaryLabel = (code) => {
    const diets = {
      "none": "No restrictions",
      "vegetarian": "Vegetarian",
      "vegan": "Vegan",
      "pescatarian": "Pescatarian",
      "gluten-free": "Gluten-free",
      "keto": "Keto",
      "paleo": "Paleo"
    };
    return diets[code] || code || "Not specified";
  };

  const getStressLabel = (level) => {
    if (level <= 2) return "Very Low";
    if (level <= 4) return "Low";
    if (level <= 6) return "Moderate";
    if (level <= 8) return "High";
    return "Very High";
  };

  const medicalConditions = [
    'Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 
    'Thyroid Disorder', 'Arthritis', 'None of the above'
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </SafeAreaView>
    );
  }

  const ExerciseFrequencySlider = ({ profileData, handleChange }) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>Exercise Frequency</Text>
      <Text style={styles.sliderValue}>
        {profileData.exerciseFrequency === 0
          ? "Never"
          : profileData.exerciseFrequency === 7
          ? "Daily"
          : `${profileData.exerciseFrequency} days per week`}
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={7}
        step={1}
        value={profileData.exerciseFrequency}
        onValueChange={(value) => handleChange("exerciseFrequency", value)}
        minimumTrackTintColor="#4568DC"
        maximumTrackTintColor="#D1D5DB"
        thumbTintColor="#4568DC"
      />
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabelText}>Never</Text>
        <Text style={styles.sliderLabelText}>Daily</Text>
      </View>
    </View>
  );
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <LinearGradient
          colors={['#4568DC', '#B06AB3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.profileImageContainer}>
              <Text style={styles.profileInitials}>
                {profileData.firstName ? profileData.firstName.charAt(0).toUpperCase() : ""}
                {profileData.lastName ? profileData.lastName.charAt(0).toUpperCase() : ""}
              </Text>
            </View>
            <Text style={styles.profileName}>
              {profileData.firstName} {profileData.lastName}
            </Text>
            <Text style={styles.profileSubtitle}>
              {profileData.bloodGroup ? `Blood Type: ${profileData.bloodGroup}` : "Complete your profile"}
            </Text>
          </View>
        </LinearGradient>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, isEditing ? styles.cancelButton : {}]}
            onPress={() => {
              if (isEditing) {
                // Cancel editing
                fetchUserDetails();
                setIsEditing(false);
              } else {
                // Start editing
                setIsEditing(true);
              }
            }}
          >
            <Ionicons 
              name={isEditing ? "close" : "create-outline"} 
              size={20} 
              color={isEditing ? "#e74c3c" : "#4568DC"} 
            />
            <Text style={[styles.actionButtonText, isEditing ? {color: "#e74c3c"} : {}]}>
              {isEditing ? "Cancel" : "Edit Profile"}
            </Text>
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.saveButton]}
              onPress={saveUserDetails}
              disabled={isSaving}
            >
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={[styles.actionButtonText, {color: "#fff"}]}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Personal Information */}
        <Animatable.View 
          animation="fadeIn" 
          duration={800} 
          style={styles.sectionContainer}
        >
          <View style={styles.sectionHeader}>
            <FontAwesome5 name="user-alt" size={18} color="#4568DC" />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>

          {isEditing ? (
            <View style={styles.editContainer}>
              <View style={styles.editRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={profileData.firstName}
                    onChangeText={(text) => handleChange("firstName", text)}
                    placeholder="First Name"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={profileData.lastName}
                    onChangeText={(text) => handleChange("lastName", text)}
                    placeholder="Last Name"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>{formatDate(profileData.dateOfBirth)}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#4568DC" />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={profileData.dateOfBirth}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        handleChange("dateOfBirth", selectedDate);
                      }
                    }}
                  />
                )}
              </View>

              {/* <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.segmentedControl}>
                  {['male', 'female', 'non-binary', 'not-specified'].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.segmentItem,
                        profileData.gender === gender && styles.segmentActive
                      ]}
                      onPress={() => handleChange("gender", gender)}
                    >
                      <Text 
                        style={[
                          styles.segmentText,
                          profileData.gender === gender && styles.segmentTextActive
                        ]}
                      >
                        {getGenderLabel(gender)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View> */}

              <View style={styles.editRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Height (cm)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={profileData.height}
                    onChangeText={(text) => handleChange("height", text)}
                    keyboardType="numeric"
                    placeholder="Height"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Weight (kg)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={profileData.weight}
                    onChangeText={(text) => handleChange("weight", text)}
                    keyboardType="numeric"
                    placeholder="Weight"
                  />
                </View>
              </View>

              {/* <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Blood Group</Text>
                <View style={styles.chipContainer}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((blood) => (
                    <TouchableOpacity
                      key={blood}
                      style={[
                        styles.chip,
                        profileData.bloodGroup === blood && styles.chipActive
                      ]}
                      onPress={() => handleChange("bloodGroup", blood)}
                    >
                      <Text 
                        style={[
                          styles.chipText,
                          profileData.bloodGroup === blood && styles.chipTextActive
                        ]}
                      >
                        {blood}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View> */}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Emergency Contact</Text>
                <TextInput
                  style={styles.textInput}
                  value={profileData.emergencyContact}
                  onChangeText={(text) => handleChange("emergencyContact", text)}
                  keyboardType="phone-pad"
                  placeholder="Emergency Contact Number"
                />
              </View>
            </View>
          ) : (
            <View style={styles.infoContainer}>
              {renderInfoItem("Full Name", 
                `${profileData.firstName} ${profileData.lastName}`,
                <Ionicons name="person" size={20} color="#4568DC" />
              )}
              {renderInfoItem("Date of Birth", 
                formatDate(profileData.dateOfBirth),
                <Ionicons name="calendar" size={20} color="#4568DC" />
              )}
              {renderInfoItem("Gender", 
                getGenderLabel(profileData.gender),
                <Ionicons name="male-female" size={20} color="#4568DC" />
              )}
              {renderInfoItem("Height", 
                profileData.height ? `${profileData.height} cm` : "Not provided",
                <MaterialCommunityIcons name="human-male-height" size={20} color="#4568DC" />
              )}
              {renderInfoItem("Weight", 
                profileData.weight ? `${profileData.weight} kg` : "Not provided",
                <FontAwesome5 name="weight" size={18} color="#4568DC" />
              )}
              {renderInfoItem("Blood Group", 
                profileData.bloodGroup,
                <FontAwesome5 name="tint" size={18} color="#4568DC" />
              )}
              {renderInfoItem("Emergency Contact", 
                profileData.emergencyContact,
                <Ionicons name="call" size={20} color="#4568DC" />
              )}
            </View>
          )}
        </Animatable.View>

        {/* Medical Information */}
        <Animatable.View 
          animation="fadeIn" 
          duration={800} 
          delay={200}
          style={styles.sectionContainer}
        >
          <View style={styles.sectionHeader}>
            <FontAwesome5 name="notes-medical" size={18} color="#4568DC" />
            <Text style={styles.sectionTitle}>Medical Information</Text>
          </View>

          {isEditing ? (
            <View style={styles.editContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Allergies</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={profileData.allergies}
                  onChangeText={(text) => handleChange("allergies", text)}
                  placeholder="List any allergies you have"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Current Medications</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={profileData.medications}
                  onChangeText={(text) => handleChange("medications", text)}
                  placeholder="List any medications you are taking"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Medical Conditions</Text>
                <Text style={styles.inputHelper}>Select all that apply</Text>
                
                {medicalConditions.map((condition) => (
                  <TouchableOpacity 
                    key={condition}
                    style={styles.checkboxContainer}
                    onPress={() => toggleCondition(condition)}
                  >
                    <View style={styles.checkbox}>
                      {profileData.conditions.includes(condition) && (
                        <Ionicons name="checkmark" size={18} color="#4568DC" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{condition}</Text>
                  </TouchableOpacity>
                ))}
              </View> */}
            </View>
          ) : (
            <View style={styles.infoContainer}>
              {renderInfoItem("Allergies", 
                profileData.allergies || "None specified",
                <FontAwesome5 name="allergies" size={18} color="#4568DC" />
              )}
              {renderInfoItem("Current Medications", 
                profileData.medications || "None specified",
                <MaterialCommunityIcons name="pill" size={20} color="#4568DC" />
              )}
              
              <View style={styles.infoItem}>
                <FontAwesome5 name="heartbeat" size={18} color="#4568DC" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Medical Conditions</Text>
                  {profileData.conditions && profileData.conditions.length > 0 ? (
                    <View style={styles.conditionsList}>
                      {profileData.conditions.map((condition, index) => (
                        <View key={index} style={styles.conditionChip}>
                          <Text style={styles.conditionChipText}>{condition}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.infoValue}>None specified</Text>
                  )}
                </View>
              </View>
            </View>
          )}
        </Animatable.View>

        {/* Lifestyle Information */}
        <Animatable.View 
          animation="fadeIn" 
          duration={800} 
          delay={400}
          style={styles.sectionContainer}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="heart-pulse" size={20} color="#4568DC" />
            <Text style={styles.sectionTitle}>Lifestyle Information</Text>
          </View>
         
          {isEditing ? (
            <View style={styles.editContainer}>
              

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Average Sleep (hours)</Text>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderValue}>{profileData.sleepHours}</Text>
                  <View style={styles.slider}>
                    {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((value) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.sliderPoint,
                          parseFloat(profileData.sleepHours) >= value && styles.sliderPointActive
                        ]}
                        onPress={() => handleChange("sleepHours", value)}
                      />
                    ))}
                  </View>
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabelText}>4</Text>
                    <Text style={styles.sliderLabelText}>12</Text>
                  </View>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Dietary Preference</Text>
                <View style={styles.chipContainer}>
                  {[
                    {label: "No restrictions", value: "none"},
                    {label: "Vegetarian", value: "vegetarian"},
                    {label: "Vegan", value: "vegan"},
                    {label: "Keto", value: "keto"},
                    {label: "Gluten-free", value: "gluten-free"}
                  ].map((diet) => (
                    <TouchableOpacity
                      key={diet.value}
                      style={[
                        styles.dietChip,
                        profileData.dietaryPreference === diet.value && styles.chipActive
                      ]}
                      onPress={() => handleChange("dietaryPreference", diet.value)}
                    >
                      <Text 
                        style={[
                          styles.chipText,
                          profileData.dietaryPreference === diet.value && styles.chipTextActive
                        ]}
                      >
                        {diet.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Stress Level</Text>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderValue}>{getStressLabel(profileData.stressLevel)}</Text>
                  <View style={styles.slider}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.sliderPoint,
                          parseInt(profileData.stressLevel) >= value && styles.sliderPointActive
                        ]}
                        onPress={() => handleChange("stressLevel", value)}
                      />
                    ))}
                  </View>
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabelText}>Low</Text>
                    <Text style={styles.sliderLabelText}>High</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.infoContainer}>
              {renderInfoItem("Exercise Frequency", 
                `${profileData.exerciseFrequency} days per week`,
                <MaterialCommunityIcons name="run" size={20} color="#4568DC" />
              )}
              {renderInfoItem("Sleep Duration", 
                `${profileData.sleepHours} hours`,
                <Ionicons name="bed" size={20} color="#4568DC" />
              )}
              {renderInfoItem("Dietary Preference", 
                getDietaryLabel(profileData.dietaryPreference),
                <MaterialCommunityIcons name="food-apple" size={20} color="#4568DC" />
              )}
              {renderInfoItem("Stress Level", 
                getStressLabel(profileData.stressLevel),
                <MaterialCommunityIcons name="brain" size={20} color="#4568DC" />
              )}
            </View>
          )}
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: "#4568DC",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  profileInitials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  profileSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -20,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#fff1f0',
  },
  saveButton: {
    backgroundColor: '#4568DC',
  },
  actionButtonText: {
    marginLeft: 5,
    fontWeight: '500',
    color: '#4568DC',
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  infoContainer: {
    paddingTop: 5,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#777',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  editContainer: {
    // Container for the entire edit section
    padding: 16,
  },
  
  inputContainer: {
    // Container for each input group
    marginBottom: 24,
  },
  
  inputLabel: {
    // Style for input labels
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  
  sliderContainer: {
    // Container for slider components
    width: '100%',
  },
  
  sliderValue: {
    // Text showing the current slider value
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  
  slider: {
    // The slider track container
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: 20,
    alignItems: 'center',
    marginVertical: 8,
  },
  
  sliderPoint: {
    // Individual points on the slider
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D1D5DB', // Light gray for inactive points
  },
  
  sliderPointActive: {
    // Active points on the slider
    backgroundColor: '#4568DC', // Blue color for active points
  },
  
  sliderLabels: {
    // Container for min/max labels
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  
  sliderLabelText: {
    // Text style for slider labels
    fontSize: 12,
    color: '#6B7280', // Medium gray
  },
  
  chipContainer: {
    // Container for diet preference chips
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  dietChip: {
    // Individual diet preference chip
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6', // Light gray background
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    marginBottom: 8,
  },
  
  chipActive: {
    // Active chip style
    backgroundColor: '#4568DC', // Blue background
    borderColor: '#4568DC',
  },
  
  chipText: {
    // Text inside chips
    fontSize: 14,
    color: '#4B5563',
  },
  
  chipTextActive: {
    // Text inside active chips
    color: '#FFFFFF', // White text
  }
})