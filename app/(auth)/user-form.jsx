import { useGlobalContext } from "@/context/globalprovider";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { addUserDetails } from "../../lib/firebasedata";


const { width, height } = Dimensions.get("window");

const HealthProfileForm = () => {
  // State for form fields
  const [formData, setFormData] = useState({
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
    termsAccepted: false,
  });
  const [isSubmitting, setSubmitting] = useState(false);
  const { user, setUser, setIsLogged } = useGlobalContext();

  // State for dropdown
  const [genderOpen, setGenderOpen] = useState(false);
  const [bloodGroupOpen, setBloodGroupOpen] = useState(false);
  const [dietaryOpen, setDietaryOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const userId = user.$id;

  const handleSubmit = async () => {
    // Handle form submission here
    // Navigate to next screen or show confirmation
    if (
        formData.firstName === "" ||
        formData.lastName === "" ||
        formData.gender == "" ||
        formData.height == "" ||
        formData.weight == "" ||
        formData.bloodGroup == "" ||
        formData.emergencyContact == "" ||
        formData.allergies == "" ||
        formData.medications == "" 
    ) {
        Alert.alert("Error", "Please fill in all fields");
    
    }else {
    
    setSubmitting(true);
    // console.log("Form submitted:", formData);
    try {
      await addUserDetails(userId, formData);

      setIsLogged(true);

      router.replace("/home");
      // console.log("user");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }}
  };

  // Medical conditions checkboxes
  const conditions = [
    "Diabetes",
    "Hypertension",
    "Asthma",
    "Heart Disease",
    "Thyroid Disorder",
    "Arthritis",
    "None of the above",
  ];

  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Non-binary", value: "non-binary" },
    { label: "Prefer not to say", value: "not-specified" },
  ];

  const bloodGroupOptions = [
    { label: "A+", value: "A+" },
    { label: "A-", value: "A-" },
    { label: "B+", value: "B+" },
    { label: "B-", value: "B-" },
    { label: "AB+", value: "AB+" },
    { label: "AB-", value: "AB-" },
    { label: "O+", value: "O+" },
    { label: "O-", value: "O-" },
    { label: "Unknown", value: "unknown" },
  ];

  const dietaryOptions = [
    { label: "No restrictions", value: "none" },
    { label: "Vegetarian", value: "vegetarian" },
    { label: "Vegan", value: "vegan" },
    { label: "Pescatarian", value: "pescatarian" },
    { label: "Gluten-free", value: "gluten-free" },
    { label: "Keto", value: "keto" },
    { label: "Paleo", value: "paleo" },
  ];

  const handleConditionToggle = (condition) => {
    let updatedConditions = [...formData.conditions];

    if (condition === "None of the above") {
      // If selecting "None", clear all other selections
      updatedConditions = updatedConditions.includes(condition)
        ? []
        : ["None of the above"];
    } else {
      // If selecting a specific condition, remove "None" if it's selected
      if (updatedConditions.includes("None of the above")) {
        updatedConditions = updatedConditions.filter(
          (c) => c !== "None of the above"
        );
      }

      // Toggle the selected condition
      if (updatedConditions.includes(condition)) {
        updatedConditions = updatedConditions.filter((c) => c !== condition);
      } else {
        updatedConditions.push(condition);
      }
    }

    setFormData({ ...formData, conditions: updatedConditions });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <LinearGradient
          colors={["#4568DC", "#B06AB3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Complete Your Health Profile</Text>
            <Text style={styles.headerSubtitle}>
              Help us personalize your healthcare experience
            </Text>
          </View>
        </LinearGradient>

        <KeyboardAwareScrollView
          style={styles.formContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          enableOnAndroid={true}
          extraScrollHeight={100}
        >
        {/* <ScrollView
          style={styles.formContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        > */}
          


          {/* Form Sections */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="account-details"
                size={22}
                color="#4568DC"
              />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Your first name"
                  value={formData.firstName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, firstName: text })
                  }
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Your last name"
                  value={formData.lastName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, lastName: text })
                  }
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {formData.dateOfBirth.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar" size={20} color="#4568DC" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                
                  value={formData.dateOfBirth}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setFormData({ ...formData, dateOfBirth: selectedDate });
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Gender</Text>
              <DropDownPicker
                open={genderOpen}
                value={formData.gender}
                items={genderOptions}
                setOpen={setGenderOpen}
                listMode="SCROLLVIEW"
                setValue={(callback) => {
                  setFormData((state) => ({
                    ...state,
                    gender: callback(state.gender),
                  }));
                }}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                placeholderStyle={styles.dropdownPlaceholder}
                placeholder="Select your gender"
                zIndex={3000}
                zIndexInverse={1000}
                elevation={5}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Height"
                  keyboardType="numeric"
                  value={formData.height}
                  onChangeText={(text) =>
                    setFormData({ ...formData, height: text })
                  }
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Weight"
                  keyboardType="numeric"
                  value={formData.weight}
                  onChangeText={(text) =>
                    setFormData({ ...formData, weight: text })
                  }
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Blood Group</Text>
              <DropDownPicker
                open={bloodGroupOpen}
                value={formData.bloodGroup}
                items={bloodGroupOptions}
                setOpen={setBloodGroupOpen}
                listMode="SCROLLVIEW"
                setValue={(callback) => {
                  setFormData((state) => ({
                    ...state,
                    bloodGroup: callback(state.bloodGroup),
                  }));
                }}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                placeholderStyle={styles.dropdownPlaceholder}
                placeholder="Select your blood group"
                zIndex={2000}
                zIndexInverse={2000}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Emergency Contact</Text>
              <TextInput
                      style={styles.textInput}
                      placeholder="Phone number"
                      keyboardType="phone-pad"
                      value={formData.emergencyContact}
                      onChangeText={(text) => {
                        // Remove non-numeric characters
                        const numericText = text.replace(/[^0-9]/g, "");

                        // Limit to 10 digits
                        if (numericText.length <= 10) {
                          setFormData({ ...formData, emergencyContact: numericText });
                        }
                      }}
                      maxLength={10} // Prevents entering more than 10 digits
                    />

                    {/* 🔹 Show validation message if input is less than 10 digits */}
                    {formData.emergencyContact.length > 0 && formData.emergencyContact.length < 10 && (
                      <Text style={{ color: "red", marginTop: 5 }}>
                        Phone number must be exactly 10 digits!
                    </Text>
                    )}

            </View>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 name="notes-medical" size={20} color="#4568DC" />
              <Text style={styles.sectionTitle}>Medical Information</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Allergies</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="List any allergies you have"
                multiline
                numberOfLines={3}
                value={formData.allergies}
                onChangeText={(text) =>
                  setFormData({ ...formData, allergies: text })
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Current Medications</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="List any medications you are taking"
                multiline
                numberOfLines={3}
                value={formData.medications}
                onChangeText={(text) =>
                  setFormData({ ...formData, medications: text })
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Medical Conditions</Text>
              <Text style={styles.inputHelper}>Select all that apply</Text>

              {conditions.map((condition, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.checkboxContainer}
                  onPress={() => handleConditionToggle(condition)}
                >
                  <View style={styles.checkbox}>
                    {formData.conditions.includes(condition) && (
                      <Ionicons name="checkmark" size={18} color="#4568DC" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{condition}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="heart-pulse"
                size={22}
                color="#4568DC"
              />
              <Text style={styles.sectionTitle}>Lifestyle Information</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Exercise Frequency</Text>
              <Text style={styles.sliderValue}>
                {formData.exerciseFrequency === 0
                  ? "Never"
                  : formData.exerciseFrequency === 7
                  ? "Daily"
                  : `${formData.exerciseFrequency} days per week`}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={7}
                step={1}
                value={formData.exerciseFrequency}
                onValueChange={(value) =>
                  setFormData({ ...formData, exerciseFrequency: value })
                }
                minimumTrackTintColor="#4568DC"
                maximumTrackTintColor="#D1D5DB"
                thumbTintColor="#4568DC"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Average Sleep (hours)</Text>
              <Text style={styles.sliderValue}>
                {formData.sleepHours} hours
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={4}
                maximumValue={12}
                step={0.5}
                value={formData.sleepHours}
                onValueChange={(value) =>
                  setFormData({ ...formData, sleepHours: value })
                }
                minimumTrackTintColor="#4568DC"
                maximumTrackTintColor="#D1D5DB"
                thumbTintColor="#4568DC"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Dietary Preference</Text>
              <DropDownPicker
                open={dietaryOpen}
                value={formData.dietaryPreference}
                items={dietaryOptions}
                setOpen={setDietaryOpen}
                listMode="SCROLLVIEW"
                setValue={(callback) => {
                  setFormData((state) => ({
                    ...state,
                    dietaryPreference: callback(state.dietaryPreference),
                  }));
                }}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                placeholderStyle={styles.dropdownPlaceholder}
                placeholder="Select your dietary preference"
                zIndex={1000}
                zIndexInverse={3000}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Stress Level</Text>
              <Text style={styles.sliderValue}>
                {formData.stressLevel <= 2
                  ? "Very Low"
                  : formData.stressLevel <= 4
                  ? "Low"
                  : formData.stressLevel <= 6
                  ? "Moderate"
                  : formData.stressLevel <= 8
                  ? "High"
                  : "Very High"}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={formData.stressLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, stressLevel: value })
                }
                minimumTrackTintColor="#4568DC"
                maximumTrackTintColor="#D1D5DB"
                thumbTintColor="#4568DC"
              />
            </View>
          </View>

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() =>
                setFormData({
                  ...formData,
                  termsAccepted: !formData.termsAccepted,
                })
              }
            >
              <View style={styles.checkbox}>
                {formData.termsAccepted && (
                  <Ionicons name="checkmark" size={18} color="#4568DC" />
                )}
              </View>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>Terms and Conditions</Text> and
                <Text style={styles.termsLink}> Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              !formData.termsAccepted && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!formData.termsAccepted && isSubmitting}
          >
            <LinearGradient
              colors={
                formData.termsAccepted
                  ? ["#4568DC", "#B06AB3"]
                  : ["#A0A0A0", "#C0C0C0"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              <Text style={styles.submitText}>Submit Profile</Text>
              <Ionicons name="arrow-forward" size={22} color="white" />
            </LinearGradient>
          </TouchableOpacity>
          </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F8FF",
  },
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
    color: "#333",
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputContainer: {
    marginBottom: 18,
  },
  halfWidth: {
    width: "48%",
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 8,
    color: "#4A5568",
  },
  inputHelper: {
    fontSize: 13,
    color: "#718096",
    marginBottom: 10,
    marginTop: -5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F8FAFC",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
  },
  datePickerText: {
    fontSize: 16,
    color: "#333",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
  },
  dropdownContainer: {
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "white",
  },
  dropdownPlaceholder: {
    color: "#A0AEC0",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#F8FAFC",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#4A5568",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderValue: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: "#4568DC",
    marginBottom: 5,
  },
  termsContainer: {
    marginBottom: 25,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: "#4A5568",
  },
  termsLink: {
    color: "#4568DC",
    fontWeight: "500",
  },
  submitButton: {
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    paddingVertical: 16,
  },
  submitText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
});

export default HealthProfileForm;
