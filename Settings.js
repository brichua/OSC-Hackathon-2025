import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { auth, db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import styles, { colors } from "./style";
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Settings({ navigation }) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [userData, setUserData] = useState(null);
  const [kingdom, setKingdom] = useState(null);
  const [kingdomName, setKingdomName] = useState("");
  const [kingdomImage, setKingdomImage] = useState(null);
  const [savingKingdom, setSavingKingdom] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();
      setUserData(data);
      setName(data.displayName || "");
      setAvatar(data.avatarUrl || null);
      if (data.kingdom) {
        const kingdomRef = doc(db, "kingdoms", data.kingdom);
        const kingdomSnap = await getDoc(kingdomRef);
        const k = kingdomSnap.data();
        setKingdom(k);
        setKingdomName(k?.name || "");
        setKingdomImage(k?.pfp || null);
      }
    };
    fetchUser();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setAvatar(result.assets[0].uri);
  };

  const pickKingdomImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setKingdomImage(result.assets[0].uri);
  };

  const saveChanges = async () => {
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      displayName: name,
      avatarUrl: avatar,
    });
    Alert.alert("Saved!", "Your changes have been saved.");
  };

  const saveKingdomChanges = async () => {
    if (!userData || !userData.kingdom) return;
    setSavingKingdom(true);
    await updateDoc(doc(db, "kingdoms", userData.kingdom), {
      name: kingdomName,
      pfp: kingdomImage,
    });
    setSavingKingdom(false);
    Alert.alert("Saved!", "Kingdom changes have been saved.");
  };

  const leaveKingdom = async () => {
    if (!userData || !userData.kingdom) return;
    await updateDoc(doc(db, "users", auth.currentUser.uid), { kingdom: null });
    Alert.alert("Left Kingdom", "You have left your kingdom.");
    navigation.replace("Kingdom");
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace("Login");
  };

  // Enhanced bento-style card with better theming
  const Card = ({ children, style: s, full, accent, variant = 'default' }) => {
    const cardStyles = {
      default: {
        backgroundColor: colors.white,
        borderColor: colors.silver,
      },
      medieval: {
        backgroundColor: `${colors.airSuperiorityBlue}08`,
        borderColor: colors.prussianBlue,
        borderWidth: 2,
      },
      vampire: {
        backgroundColor: `${colors.fireBrick}08`,
        borderColor: colors.fireBrick,
        borderWidth: 2,
      },
      highlight: {
        backgroundColor: `${colors.airSuperiorityBlue}12`,
        borderColor: colors.airSuperiorityBlue,
        borderWidth: 2,
      }
    };

    return (
      <View
        style={{
          ...cardStyles[variant],
          borderRadius: 16,
          borderWidth: cardStyles[variant].borderWidth || 1,
          padding: 14,
          marginBottom: 12,
          width: full ? '100%' : '48%',
          ...(s || {}),
          shadowColor: variant === 'highlight' ? colors.airSuperiorityBlue : 
                      variant === 'medieval' ? colors.prussianBlue :
                      variant === 'vampire' ? colors.fireBrick : '#000',
          shadowOpacity: variant !== 'default' ? 0.12 : 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: variant !== 'default' ? 3 : 2,
        }}
      >
        {accent}
        {children}
      </View>
    );
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with gradient accent */}
        <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      marginBottom: 20,
                      paddingBottom: 14,
                      borderBottomWidth: 2,
                      borderBottomColor: colors.prussianBlue,
                    }}>
                      <View style={{
                        width: 4,
                        height: 28,
                        backgroundColor: colors.prussianBlue,
                        borderRadius: 2,
                        marginRight: 12,
                      }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 22,
                          fontWeight: 'bold',
                          color: colors.textDark,
                          letterSpacing: -0.3,
                        }}>
              Settings
            </Text>
            <Text style={{ 
              fontSize: 12, 
              color: colors.textMuted,
              fontWeight: '600',
            }}>
              Control your profile and kingdom details
            </Text>
          </View>
        </View>

        {/* Grid container with better spacing */}
        <View style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          justifyContent: 'space-between',
          gap: 6,
        }}>
          {/* Profile (full width with highlight) */}
          <Card full variant="highlight">
            <View style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginBottom: 2,
            }}>
              <MaterialCommunityIcons 
                name="account-circle" 
                size={20} 
                color={colors.prussianBlue} 
                style={{ marginRight: 8 }}
              />
              <Text style={{ 
                color: colors.textDark, 
                fontWeight: 'bold',
                fontSize: 16,
                flex: 1,
              }}>
                Your Profile
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
              <TouchableOpacity 
                onPress={pickImage} 
                style={[styles.avatarPickerSmall, { 
                  marginVertical: 0, 
                  marginRight: 14,
                  borderColor: colors.prussianBlue,
                  backgroundColor: `${colors.prussianBlue}10`,
                }]}
              >
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatarSmall} />
                ) : (
                  <MaterialCommunityIcons name="camera-plus" size={24} color={colors.prussianBlue} />
                )}
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  color: colors.textMuted, 
                  fontSize: 12,
                  marginBottom: 6,
                  fontWeight: '500',
                }}>
                  Display Name
                </Text>
                <TextInput
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.inputSmall, { 
                    marginVertical: 0,
                    backgroundColor: colors.gunmetal,
                    borderColor: colors.airSuperiorityBlue,
                    color: colors.textDark,
                  }]}
                  value={name}
                  onChangeText={setName}
                />
                <TouchableOpacity 
                  onPress={saveChanges} 
                  style={[styles.buttonSmall, { 
                    backgroundColor: colors.prussianBlue, 
                    width: '100%', 
                    marginTop: 8,
                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }]}
                >
                  <MaterialCommunityIcons name="content-save" size={16} color={colors.buttonText} style={{ marginRight: 6 }} />
                  <Text style={[styles.buttonTextSmall, { fontWeight: '600' }]}>
                    Save Profile
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          {/* Kingdom Editor (full width with medieval theme) */}
          {kingdom && (
            <Card full variant="medieval">
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}>
                <MaterialCommunityIcons 
                  name="castle" 
                  size={20} 
                  color={colors.prussianBlue} 
                  style={{ marginRight: 8 }}
                />
                <Text style={{ 
                  color: colors.textDark, 
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                  Your Kingdom
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity 
                  onPress={pickKingdomImage} 
                  style={[styles.avatarPickerSmall, { 
                    marginVertical: 0, 
                    marginRight: 14,
                    borderColor: colors.prussianBlue,
                    backgroundColor: `${colors.prussianBlue}10`,
                  }]}
                >
                  {kingdomImage ? (
                    <Image source={{ uri: kingdomImage }} style={styles.avatarSmall} />
                  ) : (
                    <MaterialCommunityIcons name="image-plus" size={24} color={colors.prussianBlue} />
                  )}
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    color: colors.textMuted, 
                    fontSize: 12,
                    marginBottom: 6,
                    fontWeight: '500',
                  }}>
                    Kingdom Name
                  </Text>
                  <TextInput
                    placeholder="Enter kingdom name"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.inputSmall, { 
                      marginVertical: 0,
                      backgroundColor: colors.gunmetal,
                      borderColor: colors.prussianBlue,
                      color: colors.textDark,
                    }]}
                    value={kingdomName}
                    onChangeText={setKingdomName}
                  />
                  <TouchableOpacity
                    onPress={saveKingdomChanges}
                    style={[styles.buttonSmall, { 
                      backgroundColor: savingKingdom ? colors.textMuted : colors.prussianBlue, 
                      width: '100%', 
                      marginTop: 8,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }]}
                    disabled={savingKingdom}
                  >
                    <MaterialCommunityIcons 
                      name={savingKingdom ? "loading" : "crown"} 
                      size={16} 
                      color={colors.buttonText} 
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.buttonTextSmall, { fontWeight: '600' }]}>
                      {savingKingdom ? 'Saving…' : 'Save Kingdom'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          )}

          {/* Quick Actions */}
          <Card variant="medieval">
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}>
              <MaterialCommunityIcons 
                name="lightning-bolt" 
                size={18} 
                color={colors.prussianBlue} 
                style={{ marginRight: 8 }}
              />
              <Text style={{ 
                color: colors.textDark, 
                fontWeight: 'bold',
                fontSize: 14,
              }}>
                Quick Action
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleLogout} 
              style={[styles.buttonSmall, { 
                backgroundColor: colors.prussianBlue, 
                width: '100%',
                borderRadius: 8,
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }]}
            >
              <MaterialCommunityIcons name="logout" size={14} color={colors.buttonText} style={{ marginRight: 4 }} />
              <Text style={[styles.buttonTextSmall, { fontSize: 12, fontWeight: '600' }]}>
                Logout
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Danger Zone */}
          <Card variant="vampire">
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}>
              <MaterialCommunityIcons 
                name="alert-circle" 
                size={18} 
                color={colors.fireBrick} 
                style={{ marginRight: 8 }}
              />
              <Text style={{ 
                color: colors.textDark, 
                fontWeight: 'bold',
                fontSize: 14,
              }}>
                Danger Zone
              </Text>
            </View>
            <TouchableOpacity 
              onPress={leaveKingdom} 
              style={[styles.buttonSmall, { 
                backgroundColor: colors.fireBrick, 
                width: '100%',
                borderRadius: 8,
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }]}
            >
              <MaterialCommunityIcons name="exit-run" size={14} color={colors.buttonText} style={{ marginRight: 4 }} />
              <Text style={[styles.buttonTextSmall, { fontSize: 12, fontWeight: '600' }]}>
                Leave Kingdom
              </Text>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
