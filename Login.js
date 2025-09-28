import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from "./firebase";
import styles, { colors } from "./style";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Fill all fields");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (!userSnap.exists()) throw new Error("User data not found");

      const userData = userSnap.data();

      if (userData.kingdom) {
        navigation.replace("MainTabs"); 
      } else {
        navigation.replace("Kingdom"); 
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.safeArea}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{
          backgroundColor: colors.white,
          borderRadius: 18,
          padding: 24,
          borderWidth: 1,
          borderColor: colors.silver,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 3,
          alignSelf: 'center',
          width: '100%',
          maxWidth: 420,
        }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.cultured,
              borderWidth: 2,
              borderColor: colors.prussianBlue,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
            }}>
              <MaterialCommunityIcons name="shield-account" size={32} color={colors.prussianBlue} />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.prussianBlue, marginBottom: 4 }}>
              Welcome Back
            </Text>
            <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
              Sign in to your kingdom
            </Text>
          </View>

          {/* Form */}
          <TextInput
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            style={[styles.input2, { borderColor: colors.silver }]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            style={[styles.input2, { borderColor: colors.silver }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={{
              backgroundColor: colors.prussianBlue,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 8,
            }}
            onPress={handleLogin}
          >
            <MaterialCommunityIcons name="login-variant" size={20} color={colors.buttonText} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.buttonText, fontWeight: '700', fontSize: 16 }}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Signup")} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.textMuted, textAlign: "center" }}>
              Don't have an account?{" "}
              <Text style={{ color: colors.fireBrick, fontWeight: '600' }}>Sign Up</Text>
            </Text>
          </TouchableOpacity>

          {/* Footer accent */}
          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <View style={{ height: 3, width: 54, backgroundColor: colors.airSuperiorityBlue, borderRadius: 2 }} />
          </View>
        </View>
      </View>
    </View>
  );
}
