import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { db, auth } from "./firebase";
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles, { colors } from "./style";

export default function Kingdom({ navigation }) {
  const [kingdomCode, setKingdomCode] = useState("");
  const [kingdomName, setKingdomName] = useState("");
  const [creating, setCreating] = useState(false);
  const [kingdomImage, setKingdomImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleJoin = async () => {
    if (!kingdomCode.trim()) return Alert.alert("Enter a kingdom code");
    try {
      const kingdomRef = doc(db, "kingdoms", kingdomCode.toUpperCase());
      const kingdomSnap = await getDoc(kingdomRef);
      if (kingdomSnap.exists()) {
        await updateDoc(kingdomRef, { members: arrayUnion(auth.currentUser.uid) });
        await updateDoc(doc(db, "users", auth.currentUser.uid), { kingdom: kingdomCode.toUpperCase() });
        navigation.replace("MainTabs");
      } else {
        Alert.alert("Kingdom Not Found", "Please check the code and try again.");
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleCreate = async () => {
    if (!kingdomName.trim()) return Alert.alert("Enter a kingdom name");
    if (!kingdomImage) return Alert.alert("Please upload a kingdom image");
    setUploading(true);
    try {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      await setDoc(doc(db, "kingdoms", newCode), {
        name: kingdomName.trim(),
        pfp: kingdomImage,
        code: newCode,
        members: [auth.currentUser.uid],
        progress: {},
        medievalWins: 0,
        vampireWins: 0,
        winStreak: 0,
      });
      await updateDoc(doc(db, "users", auth.currentUser.uid), { kingdom: newCode });
      setUploading(false);
      navigation.replace("MainTabs");
    } catch (err) {
      setUploading(false);
      Alert.alert("Error", err.message);
    }
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

  return (
    <View style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{
          alignItems: 'center',
          marginBottom: 32,
          marginTop: 20,
        }}>
          <View style={{
            backgroundColor: colors.prussianBlue,
            borderRadius: 30,
            padding: 16,
            marginBottom: 16,
            shadowColor: colors.prussianBlue,
            shadowOpacity: 0.2,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}>
            <MaterialCommunityIcons 
              name="castle" 
              size={48} 
              color={colors.cultured}
            />
          </View>
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: colors.richBlack,
            textAlign: 'center',
            marginBottom: 8,
          }}>
            Enter the Realm
          </Text>
          <Text style={{
            fontSize: 15,
            color: colors.textMuted,
            textAlign: 'center',
            fontWeight: '500',
          }}>
            Join an existing kingdom or forge your own
          </Text>
        </View>

        {/* Join Kingdom Card */}
        <View style={{
          backgroundColor: colors.cultured,
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 5,
          borderWidth: 2,
          borderColor: colors.prussianBlue,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <View style={{
              backgroundColor: colors.airSuperiorityBlue,
              borderRadius: 12,
              padding: 10,
              marginRight: 12,
            }}>
              <MaterialCommunityIcons 
                name="key-variant" 
                size={24} 
                color={colors.prussianBlue}
              />
            </View>
            <View>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.richBlack,
                marginBottom: 4,
              }}>
                Join Kingdom
              </Text>
              <Text style={{
                fontSize: 13,
                color: colors.textMuted,
                fontWeight: '500',
              }}>
                Enter your invitation code
              </Text>
            </View>
          </View>

          <View style={{
            backgroundColor: colors.white,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: kingdomCode ? colors.prussianBlue : colors.silver,
            marginBottom: 16,
          }}>
            <TextInput
              placeholder="Kingdom Code (e.g. ABC123)"
              placeholderTextColor={colors.textMuted}
              style={{
                fontSize: 16,
                color: colors.textMuted,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontWeight: '500',
              }}
              value={kingdomCode}
              onChangeText={(text) => setKingdomCode(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={6}
            />
          </View>

          <TouchableOpacity
            onPress={handleJoin}
            style={{
              backgroundColor: colors.prussianBlue,
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 20,
              shadowColor: colors.prussianBlue,
              shadowOpacity: 0.25,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: 4,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons 
              name="shield-sword" 
              size={18} 
              color={colors.cultured}
              style={{ marginRight: 8 }}
            />
            <Text style={{
              color: colors.cultured,
              fontSize: 16,
              fontWeight: 'bold',
            }}>
              Join Kingdom
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 24,
        }}>
          <View style={{ 
            flex: 1, 
            height: 2, 
            backgroundColor: colors.silver,
            borderRadius: 1,
          }} />
          <View style={{
            backgroundColor: colors.gunmetal,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginHorizontal: 16,
          }}>
            <Text style={{
              color: colors.cultured,
              fontSize: 12,
              fontWeight: 'bold',
            }}>
              OR
            </Text>
          </View>
          <View style={{ 
            flex: 1, 
            height: 2, 
            backgroundColor: colors.silver,
            borderRadius: 1,
          }} />
        </View>

        {/* Create Kingdom Card */}
        <View style={{
          backgroundColor: colors.cultured,
          borderRadius: 20,
          padding: 24,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 5,
          borderWidth: 2,
          borderColor: colors.fireBrick,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <View style={{
              backgroundColor: colors.barnRed,
              borderRadius: 12,
              padding: 10,
              marginRight: 12,
            }}>
              <MaterialCommunityIcons 
                name="crown" 
                size={24} 
                color={colors.fireBrick}
              />
            </View>
            <View>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.richBlack,
                marginBottom: 4,
              }}>
                Create Kingdom
              </Text>
              <Text style={{
                fontSize: 13,
                color: colors.textMuted,
                fontWeight: '500',
              }}>
                Establish your own realm
              </Text>
            </View>
          </View>

          {/* Kingdom Image Picker */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity 
              onPress={pickKingdomImage} 
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: kingdomImage ? 'transparent' : colors.barnRed,
                borderWidth: 3,
                borderColor: colors.fireBrick,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                shadowColor: colors.fireBrick,
                shadowOpacity: 0.2,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 3,
              }}
            >
              {kingdomImage ? (
                <Image
                  source={{ uri: kingdomImage }}
                  style={{
                    width: 114,
                    height: 114,
                    borderRadius: 57,
                  }}
                />
              ) : (
                <MaterialCommunityIcons 
                  name="image-plus" 
                  size={40} 
                  color={colors.cultured} 
                />
              )}
            </TouchableOpacity>
            <Text style={{
              fontSize: 13,
              color: colors.textMuted,
              textAlign: 'center',
              fontWeight: '500',
            }}>
              {kingdomImage ? 'Tap to change kingdom image' : 'Tap to upload kingdom image'}
            </Text>
          </View>

          {/* Kingdom Name Input */}
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: kingdomName ? colors.fireBrick : colors.silver,
            marginBottom: 16,
          }}>
            <TextInput
              placeholder="Enter Kingdom Name"
              placeholderTextColor={colors.textMuted}
              style={{
                fontSize: 16,
                color: colors.richBlack,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontWeight: '500',
              }}
              color={colors.textMuted}
              value={kingdomName}
              onChangeText={setKingdomName}
              maxLength={30}
            />
          </View>

          <TouchableOpacity
            onPress={handleCreate}
            disabled={uploading}
            style={{
              backgroundColor: uploading ? colors.textMuted : colors.fireBrick,
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 20,
              shadowColor: colors.fireBrick,
              shadowOpacity: uploading ? 0.1 : 0.25,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: 4,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {uploading ? (
              <ActivityIndicator color={colors.cultured} size="small" />
            ) : (
              <>
                <MaterialCommunityIcons 
                  name="castle" 
                  size={18} 
                  color={colors.cultured}
                  style={{ marginRight: 8 }}
                />
                <Text style={{
                  color: colors.cultured,
                  fontSize: 16,
                  fontWeight: 'bold',
                }}>
                  Create Kingdom
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <View style={{
          backgroundColor: colors.airSuperiorityBlue,
          borderRadius: 16,
          padding: 16,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.prussianBlue,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}>
            <MaterialCommunityIcons 
              name="information" 
              size={20} 
              color={colors.prussianBlue}
              style={{ marginRight: 8 }}
            />
            <Text style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: colors.prussianBlue,
            }}>
              About Kingdoms
            </Text>
          </View>
          <Text style={{
            fontSize: 13,
            color: colors.gunmetal,
            lineHeight: 18,
            fontWeight: '500',
          }}>
            Kingdoms are collaborative spaces where allies battle together against vampire habits. Share progress, motivate each other, and compete in weekly battles!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
