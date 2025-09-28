import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome6 } from "@expo/vector-icons";
import styles, { colors } from "./style";

import Main from "./Main";
import Others from "./Others";
import Stats from "./Stats";
import Settings from "./Settings";

const Tab = createBottomTabNavigator();

export default function MainTabs() {


  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { backgroundColor: colors.papayaWhip },
        tabBarActiveTintColor: colors.barnRed,
        tabBarInactiveTintColor: colors.prussianBlue,
        tabBarIcon: ({ color }) => {
          let name = "circle";
          let solid = false;
          if (route.name === "Main") name = "list";
          else if (route.name === "Others") name = "users";
          else if (route.name === "Stats") { name = "chess-rook"; solid = true; }
          else if (route.name === "Settings") name = "gear";
          return <FontAwesome6 name={name} size={24} color={color} solid={solid} />;
        },
      })}
    >
      <Tab.Screen name="Main" component={Main} />
      <Tab.Screen name="Others" component={Others} />
      <Tab.Screen name="Stats" component={Stats} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}
