import { StyleSheet } from "react-native";

// Dark, minimal palette aligned to the requested scheme
// medieval (positive) = blue, vampire (negative) = red
// Provided colors:
// red-pantone: #e63946, honeydew: #f1faee, non-photo-blue: #a8dadc,
// cerulean: #457b9d, berkeley-blue: #1d3557
export const colors = {
  // Keep existing keys so screens update automatically
  // Accents / Faction colors
  fireBrick: "#e63946ff",       // vampire red (negative)
  barnRed: "#ffd4d4ff",         // secondary red use
  prussianBlue: "#457b9dff",    // medieval blue (positive)
  airSuperiorityBlue: "#a8dadcff", // soft blue highlight

  // App surfaces (dark theme)
  papayaWhip: "#1d3557ff",      // main app background (Berkeley Blue)
  white: "#2c2f33ff",           // card/surface on dark (Gunmetal)

  // Neutrals and helpers
  richBlack: "#0b0c10ff",
  gunmetal: "#2c2f33ff",
  silver: "#a8dadcff",          // borders/dividers (soft blue)
  cultured: "#f1faeeff",        // light accent (Honeydew)

  // Unused legacy accents (kept for compatibility if referenced)
  steelBlue: "#457b9dff",
  powderBlue: "#a8dadcff",
  cadetBlue: "#5f9ea0ff",
  amber: "#ffb703ff",
  saffron: "#f4a261ff",
  desertSand: "#e0c097ff",
  mutedRed: "#b23a48ff",
  mutedBlue: "#3b5d82ff",
  mutedGold: "#d4a373ff",

  // System cues
  successGreen: "#2e7d32ff",
  warningAmber: "#fbc02dff",
  infoBlue: "#1976d2ff",
  errorRed: "#e63946ff",

  // Text helpers (light text on dark surfaces)
  textDark: "#f1faeeff",        // honeydew
  textMuted2: "#23628bff", 
  textMuted: "#5e9cc3ff",       // non-photo-blue
  buttonText: "#f1faeeff",      // honeydew
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.papayaWhip,
    padding: 20,
    paddingTop: 50, // enhanced safe margin for status bar
  },
  button: {
    padding: 16,
    borderRadius: 14,
    marginVertical: 6,
    alignItems: "center",
    width: "80%", // consistent width
    alignSelf: "center",
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonText: {
    color: colors.buttonText,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  input2: {
    borderWidth: 1.5,
    borderColor: colors.silver,
    padding: 14,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.white,
    fontSize: 16,
    color: colors.textDark,
    fontWeight: '500',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  avatarPicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.prussianBlue,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 12,
    alignSelf: "center",
    backgroundColor: colors.gunmetal,
    shadowColor: colors.prussianBlue,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: colors.prussianBlue,
  },
  avatarSmall: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    borderWidth: 2,
    borderColor: colors.prussianBlue,
  },
  avatarPickerSmall: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.prussianBlue,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
    alignSelf: "center",
    backgroundColor: colors.gunmetal,
    shadowColor: colors.prussianBlue,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  buttonSmall: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
    alignItems: "center",
    width: "80%",
    alignSelf: "center",
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  buttonTextSmall: {
    color: colors.buttonText,
    fontWeight: "600",
    fontSize: 13,
    letterSpacing: 0.1,
  },
  inputSmall: {
    borderWidth: 1.5,
    borderColor: colors.silver,
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.white,
    fontSize: 14,
    color: colors.textDark,
    fontWeight: '500',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});

export default styles;
