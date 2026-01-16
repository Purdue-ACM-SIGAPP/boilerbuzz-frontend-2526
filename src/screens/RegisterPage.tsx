// src/screens/RegisterPage.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "../theme"
import { useSignUp } from "@clerk/clerk-expo";

const COLORS = {
  background: "#faf7ef",
  headerBackground: "#0b142a",
  headerText: "#fff",
  filledProgressBar: "#f5c14e",
  unfilledProgressBar: "#333",
  inputBackground: "#f9f6ed",
  border: "#000",
  text: "#000",
};

export default function RegisterPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(1);
  
  // Form State
  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  const [birthdayDay, setBirthdayDay] = useState("");
  const [birthdayMonth, setBirthdayMonth] = useState("");
  const [birthdayYear, setBirthdayYear] = useState("");
  const [gender, setGender] = useState("");
  const [classYear, setClassYear] = useState("");
  const [major, setMajor] = useState("");

  // Auth State
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const handleBackPress = () => {
    if (pendingVerification) {
      setPendingVerification(false);
      return;
    }
    if (step === 1) {
      navigation.navigate("Login" as never);
    } else {
      setStep(step - 1);
    }
  };

  // Step 1 Action: Create Account & Send Email
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      // Create the user on Clerk
      await signUp.create({
        emailAddress: email,
        password,
        username,
        firstName,
        lastName
      });

      // Send verification email
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Show verification input
      setPendingVerification(true);
    } catch (err: any) {
      Alert.alert("Registration Error", err.errors[0].message);
    }
  };

  // Verification Action: Verify Code & Move to Step 2
  const onPressVerify = async () => {
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        // Verification successful! Move to next profile step.
        // We do NOT set active yet, so the user can finish the form.
        setPendingVerification(false);
        setStep(2);
      } else {
        Alert.alert("Error", "Verification failed. Please try again.");
      }
    } catch (err: any) {
      Alert.alert("Verification Error", err.errors[0].message);
    }
  };

  // Step 3 Action: Finalize & Login
  const onFinalizeSignUp = async () => {
    if (!isLoaded || !signUp) return;
    
    try {
      // Now we actually log the user in
      if (signUp.status === 'complete') {
        await setActive({ session: signUp.createdSessionId });
        // Navigation to Tabs happens automatically via RootStack or:
        navigation.navigate("Tabs");
      }
    } catch (err: any) {
      Alert.alert("Error", "Failed to sign in.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={[styles.headerBannerContainer, { paddingTop: insets.top }]}>
        <View style={styles.headerBannerBackground} />
        <Text style={styles.headerBannerTitle}>SIGN UP</Text>
        <View style={styles.progressContainer}>
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.progressStep,
                i <= step && { backgroundColor: COLORS.filledProgressBar },
              ]}
            />
          ))}
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <SafeAreaView edges={["bottom", "left", "right"]} style={styles.formArea}>

          {/* STEP 1: Credentials */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              {!pendingVerification ? (
                <>
                  <Text style={styles.label}>Username</Text>
                  <TextInput style={styles.input} value={username} onChangeText={setusername} autoCapitalize="none" />

                  <Text style={styles.label}>Password</Text>
                  <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

                  <Text style={styles.label}>Email</Text>
                  <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                
                  <View style={styles.mutlipleFieldsRow}>
                    <View style={{flex: 1}}>
                      <Text style={styles.fieldLabel}>First Name</Text> 
                      <TextInput style={[styles.input, { marginBottom: 0 }]} value={firstName} onChangeText={setFirstName} />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.fieldLabel}>Last Name</Text>
                      <TextInput style={[styles.input, { marginBottom: 0 }]} value={lastName} onChangeText={setLastName} />
                    </View>
                  </View>

                  <TouchableOpacity style={styles.nextButton} onPress={onSignUpPress}>
                    <Text style={styles.nextText}>Next</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.label}>Verification Code</Text>
                  <Text style={{marginBottom: 20}}>We sent a code to {email}</Text>
                  <TextInput 
                    style={styles.input} 
                    value={code} 
                    onChangeText={setCode} 
                    placeholder="Enter code..." 
                    keyboardType="number-pad"
                  />
                  <TouchableOpacity style={styles.nextButton} onPress={onPressVerify}>
                    <Text style={styles.nextText}>Verify</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity style={styles.nextButton} onPress={handleBackPress}>
                <Text style={styles.nextText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}
            
          {/* STEP 2: Demographics */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.label}>Birthday</Text>
              <View style={styles.mutlipleFieldsRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.subFieldLabel}>Month</Text>
                  <TextInput style={[styles.input, { marginBottom: 0 }]} placeholder="MM" value={birthdayMonth} onChangeText={setBirthdayMonth} keyboardType="numeric"/>
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.subFieldLabel}>Day</Text>
                  <TextInput style={[styles.input, { marginBottom: 0 }]} placeholder="DD" value={birthdayDay} onChangeText={setBirthdayDay} keyboardType="numeric"/>
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.subFieldLabel}>Year</Text>
                  <TextInput style={[styles.input, { marginBottom: 0 }]} placeholder="YYYY" value={birthdayYear} onChangeText={setBirthdayYear} keyboardType="numeric"/>
                </View>
              </View>

              <View style={styles.mutlipleFieldsRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.fieldLabel}>Gender</Text> 
                  <TextInput style={[styles.input, { marginBottom: 0 }]} value={gender} onChangeText={setGender} />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.fieldLabel}>Class of</Text>
                  <TextInput style={[styles.input, { marginBottom: 0 }]} placeholder="YYYY" value={classYear} onChangeText={setClassYear} keyboardType="numeric"/>
                </View>
              </View>
                  
              <Text style={styles.label}>Major</Text>
              <TextInput style={styles.input} value={major} onChangeText={setMajor} />
                
              <TouchableOpacity style={styles.nextButton} onPress={() => setStep(3)}>
                <Text style={styles.nextText}>Next</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.nextButton} onPress={handleBackPress}>
                <Text style={styles.nextText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <View style={styles.stepContainer}>
              <View style={styles.imageContainer}>
                <Image source={require("../../assets/templogo.png")} style={styles.confirmImage} resizeMode="contain" />
              </View>

              <Text style={styles.signUpText}>You’re Signed Up!</Text>
              <Text>Explore what events Purdue has to offer</Text>

              <TouchableOpacity style={styles.nextButton} onPress={onFinalizeSignUp}>
                <Text style={styles.nextText}>Let's Go!</Text>
              </TouchableOpacity>
            </View>
          )}
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerBannerContainer: { width: "100%", backgroundColor: COLORS.headerBackground, paddingBottom: 20 },
  headerBannerBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COLORS.headerBackground },
  headerBannerTitle: { color: COLORS.headerText, fontSize: 40, fontWeight: "bold", letterSpacing: 3, marginTop: 20, marginLeft: 25, fontFamily: theme.fonts.heading },
  progressContainer: { flexDirection: "row", justifyContent: "center", marginTop: 15 },
  progressStep: { width: 120, height: 20, borderRadius: 100, backgroundColor: COLORS.unfilledProgressBar, marginHorizontal: 4 },
  formArea: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  stepContainer: { width: "100%", alignItems: "center" },
  label: { fontSize: 20, color: COLORS.text, marginBottom: 6, alignSelf: "flex-start", fontFamily: theme.fonts.body },
  input: { backgroundColor: COLORS.inputBackground, borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, width: "100%", marginBottom: 20, fontFamily: theme.fonts.body },
  mutlipleFieldsRow: { flexDirection: "row", justifyContent: "flex-start", gap: 20, width: "100%", marginBottom: 20 },
  fieldLabel: { fontSize: 20, color: COLORS.text, marginBottom: 6, fontFamily: theme.fonts.body },
  subFieldLabel: { fontSize: 16, color: "#a1a1a1", marginBottom: 6, fontFamily: theme.fonts.body },
  nextButton: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 25, width: 120, height: 48, alignItems: "center", justifyContent: "center", marginTop: 25 },
  nextText: { fontSize: 17, fontWeight: "600", color: COLORS.text, fontFamily: theme.fonts.body },
  imageContainer: { backgroundColor: COLORS.inputBackground, width: 140, height: 140, alignItems: "center", justifyContent: "center", marginBottom: 30, borderColor: COLORS.border },
  confirmImage: { width: 200, height: 200 },
  signUpText: { fontSize: 35, fontWeight: "700", color: COLORS.text, marginBottom: 10, textAlign: "center", fontFamily: theme.fonts.heading },
});
