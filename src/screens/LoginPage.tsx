// src/screens/LoginPage.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  View
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import theme from "../theme"
import { useSignIn } from "@clerk/clerk-expo";

const { width, height } = Dimensions.get("window");

const CURVEDBANNER_HEIGHT = height * 0.66;
const CURVEDBANNER_SLIDE_TARGET = -CURVEDBANNER_HEIGHT * 0.33;
const LOGO_SIZE = 300;
const LOGO_MARGIN_TOP = 200;

const COLORS = {
  background: "#edecdd",
  curvedBanner: "#fffaf1",
  primaryText: "#000",
  smallText: "#555",
};

export default function LoginPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(CURVEDBANNER_SLIDE_TARGET)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 900,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const [showLoginInputs, setShowLoginInputs] = useState(false);
  
  const handleLoginPress = () => {
    Animated.timing(slideAnim, {
      toValue: -CURVEDBANNER_HEIGHT,
      duration: 600,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setShowLoginInputs(true); // show inputs after animation
    });
  };

  return (
    <View style={styles.container}>
      <CurvedBanner slideAnim={slideAnim} />
      <LoginSection
        navigation={navigation}
        onLoginPress={handleLoginPress}
        showInputs={showLoginInputs}
        slideAnim={slideAnim}
        signIn={signIn}
        setActive={setActive}
        isLoaded={isLoaded}
      />
    </View>
  );
}

/* Component for Curved banner */
function CurvedBanner({ slideAnim }: { slideAnim: Animated.Value }) {
  return (
    <Animated.View
      style={[styles.curvedBannerWrapper, { transform: [{ translateY: slideAnim }] }]}
    >
      <View style={styles.curvedBannerShape} />

      {/* Logo slides down with the curved banner */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: LOGO_MARGIN_TOP,
            alignSelf: "center",
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Image of logo */}
        <Image
          source={require("../../assets/templogo.png")}
          style={styles.logo}
          resizeMode="cover"
        />
      </Animated.View>
    </Animated.View>
  );
}

// Bottom section / login area
function LoginSection({ navigation, onLoginPress, showInputs, slideAnim, signIn, setActive, isLoaded }: any) {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
      if (!isLoaded) return;

      if (!emailAddress || !password) {
        Alert.alert("Error", "Please fill out all fields.");
        return;
      }

      try {
        const completeSignIn = await signIn.create({
          identifier: emailAddress,
          password,
        });
        
        await setActive({ session: completeSignIn.createdSessionId });
        // Navigation is handled automatically by RootStack when isSignedIn becomes true
      } catch (err: any) {
        console.error(JSON.stringify(err, null, 2));
        Alert.alert("Login Failed", err.errors ? err.errors[0].message : "Invalid credentials");
      }
    };

  const loginSlide = slideAnim.interpolate({
    inputRange: [-CURVEDBANNER_HEIGHT, 0],
    outputRange: [-height * 0.5, 0],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.loginSection,
        showInputs && styles.inputs,
        { transform: [{ translateY: loginSlide }] },
      ]}
    >
      <Text style={styles.appTitle}>BoilerBuzz</Text>

      {!showInputs && (
        <TouchableOpacity style={styles.loginButton} onPress={onLoginPress}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      )}
        
      {showInputs && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email / Username</Text>
          <TextInput 
            style={styles.input}
            value={emailAddress}
            onChangeText={setEmailAddress}
            autoCapitalize="none"
          />

          {/* Password textbox */}
          <Text style={styles.label}>Password</Text>
          <TextInput 
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
           
          <TouchableOpacity style={styles.loginButton} onPress={handleSignIn}>
            <Text style={styles.loginText}>Submit</Text>
          </TouchableOpacity>

          {/* Register text & button that appears only when login button is pressed*/}
          <Text style={styles.signupPrompt}>Don’t have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      )}
      

      {/* Register text & button that appears by default */}
      {!showInputs && (
        <>
          <Text style={styles.signupPrompt}>Don’t have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
  },
  curvedBannerWrapper: {
    width: "100%",
    alignItems: "center",
    overflow: "hidden",
  },
  curvedBannerShape: {
    width: width * 1.2,
    height: CURVEDBANNER_HEIGHT,
    backgroundColor: COLORS.curvedBanner,
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 20,
  },
  loginSection: {
    alignItems: "center",
    marginTop: 40,
    justifyContent: "center",
  },
  inputContainer: { 
    width: "80%",
    alignItems: "center" 
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.primaryText,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontFamily: theme.fonts.body,
  },
  inputs: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  appTitle: {
    fontSize: theme.title.fontSize,
    fontWeight: "bold",
    fontFamily: theme.fonts.heading,
    color: COLORS.primaryText,
    marginBottom: 40,
    textAlign: "center",
  },
  loginButton: {
    width: 150,
    height: 50,
    borderWidth: 2,
    borderColor: COLORS.primaryText,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
    backgroundColor: "transparent",
    fontFamily: theme.fonts.body,
  },
  loginText: {
    fontSize: 18,
    color: COLORS.primaryText,
    fontWeight: "600",
    fontFamily: theme.fonts.body,
  },
  label: {
    fontSize: 16,
    color: COLORS.primaryText,
    marginBottom: 6,
    alignSelf: "flex-start",
    fontFamily: theme.fonts.body,
  },
  signupPrompt: {
    fontSize: 14,
    color: COLORS.smallText,
    fontFamily: theme.fonts.body,
  },
  signupLink: {
    fontSize: 18,
    color: COLORS.primaryText,
    fontWeight: "700",
    marginTop: 5,
    fontFamily: theme.fonts.body,
  },
});
