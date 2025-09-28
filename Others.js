import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, Alert, Clipboard } from "react-native";
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { getTitleIcon } from "./titleIcon";
import { db, auth } from "./firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import styles, { colors } from "./style";

// Fun medieval messages for each situation
const motivationMessages = {
  high: [
    "Your valor is unmatched! The kingdom sings your praises!",
    "You are a true knight of the realm! Keep leading the charge!",
    "The bards will write songs of your deeds!"
  ],
  good: [
    "Your shield is strong and your sword is sharp!",
    "The kingdom grows stronger with your every action!",
    "Your efforts inspire your allies!"
  ],
  average: [
    "Every step forward is a victory!",
    "The path is long, but you walk it with courage!",
    "Your persistence is the kingdom's hope!"
  ],
  low: [
    "The kingdom needs your strength—rise up, brave soul!",
    "Even the mightiest knights stumble. Tomorrow is a new day!",
    "Your allies believe in you! Rally to the cause!"
  ],
  positiveStreak: [
    "Your good deeds shine like a beacon!",
    "The light of your habits wards off the darkness!",
    "You are a paragon of virtue!"
  ],
  negativeStreak: [
    "Beware, the vampires grow stronger!",
    "Darkness creeps in—turn the tide!",
    "The kingdom needs your resolve to resist temptation!"
  ]
};

export default function Others() {
  const [showBattleInfo, setShowBattleInfo] = useState(false);
  const [members, setMembers] = useState([]);
  const [kingdom, setKingdom] = useState(null);
  const [userData, setUserData] = useState(null);
  const [progress, setProgress] = useState(0);
  // Calculate overall kingdom progress (same as in Main.js)
  useEffect(() => {
    if (!kingdom || !kingdom.members || !kingdom.habits) return setProgress(0);
    let score = 0;
    let maxScore = 0;
    kingdom.members.forEach(uid => {
      const userHabits = kingdom.habits?.[uid] || {};
      Object.values(userHabits).forEach(habit => {
        const freq = habit.frequency || 0;
        const diff = habit.difficulty || 1;
        const comp = habit.completed || 0;
        if (habit.type === 'good') {
          score += (comp * diff);
          maxScore += (freq * diff);
        } else {
          score -= (comp * diff);
          maxScore += (freq * diff);
        }
      });
    });
    let percent = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);
    percent = Math.max(0, Math.min(100, percent));
    setProgress(percent);
  }, [kingdom]);

  useEffect(() => {
    const fetchData = async () => {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      const user = userSnap.data();
      setUserData(user);
      if (user.kingdom) {
        const kingdomRef = doc(db, "kingdoms", user.kingdom);
        onSnapshot(kingdomRef, async (snap) => {
          const k = snap.data();
          setKingdom(k);
          if (k && k.members) {
            const memberData = await Promise.all(k.members.map(async (uid) => {
              const mSnap = await getDoc(doc(db, "users", uid));
              return { ...mSnap.data(), uid };
            }));
            setMembers(memberData);
          }
        });
      }
    };
    fetchData();
  }, []);

  const sendMotivation = async (uid, progress, posCount, negCount, senderName, senderAvatar) => {
    let msgList = [];
    if (progress >= 80) msgList = motivationMessages.high;
    else if (progress >= 60) msgList = motivationMessages.good;
    else if (progress >= 40) msgList = motivationMessages.average;
    else msgList = motivationMessages.low;
    if (posCount >= 5 && negCount === 0) msgList = msgList.concat(motivationMessages.positiveStreak);
    if (negCount >= 5 && posCount === 0) msgList = msgList.concat(motivationMessages.negativeStreak);
    const msg = msgList[Math.floor(Math.random() * msgList.length)];
    // Store only the message, sender name, and avatar (no signature in message)
    await updateDoc(doc(db, "users", uid), {
      motivation: {
        message: msg,
        from: senderName || 'Your Ally',
        avatarUrl: senderAvatar || '',
        timestamp: Date.now()
      }
    });
    Alert.alert("Sent!", "Motivation sent to your teammate!");
  };

  // Integrated battle status banner (non-card design)
  function ProgressBar({ percent, kingdom }) {
    const medievalSide = percent;
    const vampireSide = 100 - percent;
    const dominantColor = percent >= 50 ? colors.prussianBlue : colors.fireBrick;
    const secondaryColor = percent >= 50 ? colors.fireBrick : colors.prussianBlue;
    
    return (
      <View style={{ 
        marginBottom: 20,
        width: '100%',
      }}>
        {/* Battle Status Header */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: 12,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
          }}>
            <MaterialCommunityIcons 
              name="sword-cross" 
              size={24} 
              color={dominantColor}
              style={{ marginRight: 10 }}
            />
            <View>
              <Text style={{ 
                fontSize: 20, 
                fontWeight: 'bold', 
                color: colors.textDark,
                letterSpacing: -0.3,
              }}>
                Battle Status
              </Text>
              <Text style={{ 
                fontSize: 12, 
                color: colors.textMuted,
                fontWeight: '500',
              }}>
                {kingdom && kingdom.name ? kingdom.name : "Kingdom"} vs Vampires
              </Text>
            </View>
          </View>
          
          <View style={{ 
            backgroundColor: `${dominantColor}15`,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderWidth: 1.5,
            borderColor: dominantColor,
          }}>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: '800', 
              color: dominantColor,
              letterSpacing: -0.5,
              textAlign: 'center',
            }}>
              {percent}%
            </Text>
          </View>
        </View>

        {/* Battle Progress Bar */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          marginBottom: 12,
        }}>
          <View style={{
            backgroundColor: colors.prussianBlue,
            borderRadius: 20,
            padding: 6,
            marginRight: 12,
            shadowColor: colors.prussianBlue,
            shadowOpacity: 0.2,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}>
            <MaterialCommunityIcons name="shield-sword" size={16} color={colors.cultured} />
          </View>
          
          <View style={{ 
            flex: 1, 
            height: 8, 
            backgroundColor: colors.silver, 
            borderRadius: 4, 
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: `${colors.gunmetal}30`,
            flexDirection: 'row',
          }}>
            <View style={{ 
              width: `${medievalSide}%`, 
              backgroundColor: colors.prussianBlue, 
              height: '100%',
            }} />
            <View style={{ 
              width: `${vampireSide}%`, 
              backgroundColor: colors.fireBrick, 
              height: '100%',
            }} />
          </View>
          
          <View style={{
            backgroundColor: colors.fireBrick,
            borderRadius: 20,
            padding: 6,
            marginLeft: 12,
            shadowColor: colors.fireBrick,
            shadowOpacity: 0.2,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}>
            <MaterialCommunityIcons name="bat" size={16} color={colors.cultured} />
          </View>
        </View>

        {showBattleInfo && <BattleInfo percent={percent} />}
      </View>
    );
  // Helper to get days until next battle (e.g., next Sunday)
  function getDaysUntilBattle() {
    const today = new Date();
    // Battle every Sunday (0 = Sunday)
    const dayOfWeek = today.getDay();
    let days = (7 - dayOfWeek) % 7;
    if (days === 0) days = 7; // If today is Sunday, next battle is in 7 days
    return days;
  }

  // Clean BattleInfo that integrates with the banner design
  function BattleInfo({ percent }) {
    const days = getDaysUntilBattle();
    let message = '';
    let messageColor = colors.textDark;
    let iconName = "sword-cross";
    const dominantColor = percent >= 50 ? colors.prussianBlue : colors.fireBrick;
    
    if (percent >= 90) {
      message = `Victory is almost certain!`;
      messageColor = colors.prussianBlue;
      iconName = "crown";
    }
    else if (percent >= 70) {
      message = `The odds are in your favor!`;
      messageColor = colors.prussianBlue;
      iconName = "shield-check";
    }
    else if (percent >= 50) {
      message = `The battle will be fierce!`;
      messageColor = colors.textDark;
      iconName = "sword-cross";
    }
    else if (percent >= 30) {
      message = `The vampires are gaining ground...`;
      messageColor = colors.fireBrick;
      iconName = "alert-circle";
    }
    else {
      message = `The kingdom is in grave danger!`;
      messageColor = colors.fireBrick;
      iconName = "skull";
    }
    
  }
  }

  // Copy kingdom code to clipboard
  const copyKingdomCode = () => {
    if (kingdom && kingdom.code) {
      Clipboard.setString(kingdom.code);
      Alert.alert("Copied!", "Kingdom code copied to clipboard.");
    }
  };

  return (
    <View style={styles.safeArea}>
      <ProgressBar percent={progress} kingdom={kingdom} />
      
      {/* Header Section - Clean list header style */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: colors.prussianBlue,
      }}>
        <View style={{
          width: 4,
          height: 32,
          backgroundColor: colors.prussianBlue,
          borderRadius: 2,
          marginRight: 12,
        }} />
        
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: colors.textDark,
            marginBottom: 4,
            letterSpacing: -0.5,
          }}>
            Kingdom Allies
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: colors.textMuted,
            fontWeight: '500',
          }}>
            {kingdom && kingdom.name ? kingdom.name : "Your Kingdom"}
          </Text>
        </View>
        
        {kingdom && kingdom.code && (
          <TouchableOpacity 
            onPress={copyKingdomCode} 
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              backgroundColor: colors.prussianBlue,
              borderRadius: 10, 
              paddingHorizontal: 14,
              paddingVertical: 8,
              shadowColor: colors.prussianBlue,
              shadowOpacity: 0.25,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            }}
          >
            <MaterialCommunityIcons name="key-variant" size={16} color={colors.cultured} />
            <Text style={{ 
              color: colors.cultured, 
              marginLeft: 6, 
              fontWeight: '600',
              fontSize: 13,
            }}>
              Code
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={members.filter(m => m.uid !== auth.currentUser.uid)}
        keyExtractor={item => item.uid}
        renderItem={({ item }) => {
          // Calculate positive/negative stats
          let posCount = 0, posScore = 0, posMax = 0;
          let negCount = 0, negScore = 0, negMax = 0;
          if (item.habits) {
            Object.values(item.habits).forEach(h => {
              const comp = h.completed || 0;
              const diff = h.difficulty || 1;
              if (h.type === 'good') {
                posCount += comp;
                posScore += comp * diff;
                posMax += (h.frequency || 0) * diff;
              } else {
                negCount += comp;
                negScore += comp * diff;
                negMax += (h.frequency || 0) * diff;
              }
            });
          }
          // Calculate total kingdom maxScore (same as progress bar)
          let kingdomMaxScore = 0;
          if (kingdom && kingdom.members && kingdom.habits) {
            kingdom.members.forEach(uid => {
              const userHabits = kingdom.habits?.[uid] || {};
              Object.values(userHabits).forEach(habit => {
                const freq = habit.frequency || 0;
                const diff = habit.difficulty || 1;
                kingdomMaxScore += (freq * diff);
              });
            });
          }
          kingdomMaxScore = kingdomMaxScore || 1;
          // Net contribution to total progress bar
          const netPercent = ((posScore - negScore) / kingdomMaxScore) * 100;
          // Raw positive/negative before netting
          const posPercent = (posScore / kingdomMaxScore) * 100;
          const negPercent = (negScore / kingdomMaxScore) * 100;
          // Show this week's fun title if available
          let weekTitle = '';
          if (item.weeklyTitles) {
            const now = new Date();
            const y = now.getFullYear();
            const w = (function getWeekNumber(d) {
              d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
              d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
              const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
              const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
              return weekNo;
            })(now);
            weekTitle = item.weeklyTitles[`${y}-W${w}`];
          }
          return (
            <View style={{ 
              backgroundColor: colors.cultured,
              borderRadius: 18,
              padding: 18,
              marginBottom: 16,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
              borderWidth: 2,
              borderColor: netPercent >= 0 ? colors.prussianBlue : colors.fireBrick,
            }}>
              {/* Member Header */}
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginBottom: 16,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.silver,
              }}>
                <View style={{
                  borderRadius: 50,
                  padding: 2,
                  backgroundColor: netPercent >= 0 ? colors.airSuperiorityBlue : colors.cultured,
                  borderWidth: 2,
                  borderColor: netPercent >= 0 ? colors.prussianBlue : colors.fireBrick,
                }}>
                  {item.avatarUrl ? (
                    <Image source={{ uri: item.avatarUrl }} style={[styles.avatarSmall, {
                      borderColor: netPercent >= 0 ? colors.prussianBlue : colors.fireBrick,
                    }]} />
                  ) : (
                    <View style={[styles.avatarSmall, {
                      backgroundColor: colors.gunmetal,
                      borderColor: netPercent >= 0 ? colors.prussianBlue : colors.fireBrick,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }]}>
                      <MaterialCommunityIcons 
                        name="account" 
                        size={32} 
                        color={netPercent >= 0 ? colors.prussianBlue : colors.fireBrick} 
                      />
                    </View>
                  )}
                </View>
                
                <View style={{ flex: 1, marginLeft: 14 }}>
                  {/* Name and Motivate Button Row */}
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}>
                    <Text style={{ 
                      fontSize: 18, 
                      fontWeight: 'bold',
                      color: colors.richBlack,
                      flex: 1,
                    }}>
                      {item.displayName || 'User'}
                    </Text>
                    
                    <TouchableOpacity 
                      onPress={() => sendMotivation(item.uid, netPercent, posCount, negCount, userData?.displayName, userData?.avatarUrl)} 
                      style={{ 
                        backgroundColor: colors.fireBrick,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        shadowColor: colors.fireBrick,
                        shadowOpacity: 0.25,
                        shadowRadius: 6,
                        shadowOffset: { width: 0, height: 2 },
                        elevation: 3,
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginLeft: 12,
                      }}
                    >
                      <MaterialCommunityIcons 
                        name="heart" 
                        size={13} 
                        color={colors.cultured}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={{ 
                        color: colors.cultured,
                        fontWeight: '600',
                        fontSize: 10,
                      }}>
                        Motivate
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Percentage Badge */}
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    backgroundColor: netPercent >= 0 ? colors.airSuperiorityBlue : colors.cultured,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                    alignSelf: 'flex-start',
                    borderWidth: 1,
                    borderColor: netPercent >= 0 ? colors.prussianBlue : colors.fireBrick,
                    marginBottom: 6,
                  }}>
                    <MaterialCommunityIcons 
                      name={netPercent >= 0 ? "trending-up" : "trending-down"} 
                      size={14} 
                      color={netPercent >= 0 ? colors.prussianBlue : colors.fireBrick}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={{ 
                      fontSize: 12,
                      fontWeight: 'bold',
                      color: netPercent >= 0 ? colors.prussianBlue : colors.fireBrick,
                    }}>
                      {netPercent >= 0 ? '+' : ''}{netPercent.toFixed(1)}%
                    </Text>
                  </View>
                  
                  {/* Weekly Title */}
                  {weekTitle && (
                    <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center',
                      backgroundColor: colors.airSuperiorityBlue,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                      alignSelf: 'flex-start',
                      borderWidth: 1,
                      borderColor: colors.prussianBlue,
                    }}>
                      {getTitleIcon(weekTitle, 12)}
                      <Text style={{ 
                        color: colors.cultured, 
                        fontSize: 12, 
                        fontWeight: '600',
                        marginLeft: 4,
                      }}>
                        {weekTitle}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              {/* Stats Section */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ 
                  flex: 1, 
                  alignItems: 'center', 
                  marginRight: 8, 
                  backgroundColor: colors.airSuperiorityBlue,
                  borderRadius: 14,
                  padding: 14,
                  borderWidth: 2,
                  borderColor: colors.prussianBlue,
                }}>
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    marginBottom: 8,
                    backgroundColor: colors.prussianBlue,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}>
                    <MaterialCommunityIcons name="shield-sword" size={16} color={colors.cultured} style={{ marginRight: 4 }} />
                    <Text style={{ 
                      color: colors.cultured, 
                      fontWeight: 'bold', 
                      fontSize: 13,
                    }}>
                      Medieval
                    </Text>
                  </View>
                  
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ 
                      color: colors.richBlack, 
                      fontSize: 20,
                      fontWeight: 'bold',
                      marginBottom: 2,
                    }}>
                      {posCount}
                    </Text>
                    <Text style={{ 
                      color: colors.gunmetal, 
                      fontSize: 11,
                      marginBottom: 4,
                      textAlign: 'center',
                    }}>
                      habits completed
                    </Text>
                    <Text style={{ 
                      color: colors.prussianBlue, 
                      fontSize: 14,
                      fontWeight: 'bold',
                    }}>
                      +{posPercent.toFixed(1)}%
                    </Text>
                  </View>
                </View>
                
                <View style={{ 
                  flex: 1, 
                  alignItems: 'center', 
                  marginLeft: 8, 
                  backgroundColor: colors.barnRed,
                  borderRadius: 14,
                  padding: 14,
                  borderWidth: 2,
                  borderColor: colors.fireBrick,
                }}>
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    marginBottom: 8,
                    backgroundColor: colors.fireBrick,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}>
                    <MaterialCommunityIcons name="bat" size={16} color={colors.cultured} style={{ marginRight: 4 }} />
                    <Text style={{ 
                      color: colors.cultured, 
                      fontWeight: 'bold', 
                      fontSize: 13,
                    }}>
                      Vampire
                    </Text>
                  </View>
                  
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ 
                      color: colors.richBlack, 
                      fontSize: 20,
                      fontWeight: 'bold',
                      marginBottom: 2,
                    }}>
                      {negCount}
                    </Text>
                    <Text style={{ 
                      color: colors.gunmetal, 
                      fontSize: 11,
                      marginBottom: 4,
                      textAlign: 'center',
                    }}>
                      habits completed
                    </Text>
                    <Text style={{ 
                      color: colors.fireBrick, 
                      fontSize: 14,
                      fontWeight: 'bold',
                    }}>
                      -{negPercent.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{
            backgroundColor: colors.cultured,
            borderRadius: 16,
            padding: 32,
            alignItems: 'center',
            marginTop: 20,
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
            elevation: 2,
            borderWidth: 2,
            borderColor: colors.airSuperiorityBlue,
          }}>
            <View style={{
              backgroundColor: colors.airSuperiorityBlue,
              borderRadius: 50,
              padding: 16,
              marginBottom: 16,
            }}>
              <MaterialCommunityIcons 
                name="account-group-outline" 
                size={48} 
                color={colors.cultured}
              />
            </View>
            <Text style={{ 
              color: colors.richBlack, 
              fontSize: 18,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 8,
            }}>
              No Kingdom Members Yet
            </Text>
            <Text style={{ 
              color: colors.gunmetal, 
              fontSize: 14,
              textAlign: 'center',
              lineHeight: 20,
            }}>
              Share your kingdom code to invite allies to join your quest!
            </Text>
          </View>
        }
      />
    </View>
  );
}
