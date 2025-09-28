import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import styles, { colors } from "./style";

export default function Signup({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);

  const handleSignup = async () => {
    if (!email || !password || !name) return Alert.alert("Error", "Fill all fields");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        displayName: name,
        email,
        avatarUrl: avatar || null,
        createdAt: new Date(),
        kingdom: null,
        streak: 0,
        habits: {},
      });

      const userSnap = await getDoc(doc(db, "users", user.uid));
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setAvatar(result.assets[0].uri);
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
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.prussianBlue, marginBottom: 4 }}>
              Create Account
            </Text>
            <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
              Join the kingdom's ranks
            </Text>
          </View>

          {/* Avatar Picker */}
          <TouchableOpacity
            onPress={pickImage}
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              borderWidth: 3,
              borderColor: colors.prussianBlue,
              justifyContent: 'center',
              alignItems: 'center',
              marginVertical: 12,
              backgroundColor: colors.cultured,
              alignSelf: 'center',
            }}
          >
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                }}
              />
            ) : (
              <MaterialCommunityIcons name="camera-plus" size={32} color={colors.textMuted} />
            )}
          </TouchableOpacity>
          <Text style={{ color: colors.textMuted, textAlign: 'center', fontSize: 12, marginBottom: 16 }}>
            Tap to add your avatar
          </Text>

          {/* Form */}
          <TextInput
            placeholder="Name"
            placeholderTextColor={colors.textMuted}
            style={[styles.input2, { borderColor: colors.silver }]}
            value={name}
            onChangeText={setName}
          />
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
              backgroundColor: colors.fireBrick,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 8,
            }}
            onPress={handleSignup}
          >
            <MaterialCommunityIcons name="account-plus" size={20} color={colors.buttonText} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.buttonText, fontWeight: '700', fontSize: 16 }}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.textMuted, textAlign: "center" }}>
              Already have an account?{" "}
              <Text style={{ color: colors.prussianBlue, fontWeight: '600' }}>Login</Text>
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
