import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles, { colors } from "./style";

export default function Landing({ navigation }) {
  return (
    <View style={styles.safeArea}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{
          backgroundColor: colors.white,
          borderRadius: 18,
          padding: 22,
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
          {/* Emblem */}
          <View style={{ alignItems: 'center', marginBottom: 14 }}>
            <View style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: colors.cultured,
              borderWidth: 3,
              borderColor: colors.prussianBlue,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}>
              <MaterialCommunityIcons name="shield-sword" size={44} color={colors.prussianBlue} />
              <MaterialCommunityIcons name="bat" size={20} color={colors.fireBrick} style={{ position: 'absolute', right: 12, bottom: 12 }} />
            </View>
            <Text style={{ fontSize: 26, fontWeight: '800', color: colors.prussianBlue }}>
              Crown & Coven
            </Text>
            <Text style={{ color: colors.textMuted, marginTop: 6, textAlign: 'center' }}>
              Kingdoms thrive, covens whisper… your habits decide
            </Text>
          </View>

          {/* Actions */}
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
            onPress={() => navigation.navigate('Login')}
          >
            <MaterialCommunityIcons name="login-variant" size={20} color={colors.buttonText} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.buttonText, fontWeight: '700', fontSize: 16 }}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: colors.fireBrick,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 10,
            }}
            onPress={() => navigation.navigate('Signup')}
          >
            <MaterialCommunityIcons name="account-plus" size={20} color={colors.buttonText} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.buttonText, fontWeight: '700', fontSize: 16 }}>Sign Up</Text>
          </TouchableOpacity>

          {/* Footer hint */}
          <View style={{ alignItems: 'center', marginTop: 14 }}>
            <View style={{ height: 3, width: 54, backgroundColor: colors.airSuperiorityBlue, borderRadius: 2 }} />
          </View>
        </View>
      </View>
    </View>
  );
}
