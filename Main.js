import { getTitleIcon } from "./titleIcon";
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, Image, ScrollView, Animated, Modal } from "react-native";
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { db, auth } from "./firebase";
import { doc, getDoc, updateDoc, arrayUnion, setDoc, onSnapshot } from "firebase/firestore";
import styles, { colors } from "./style";

function ProgressBar({ percent, kingdom }) {
  const [showBattleInfo, setShowBattleInfo] = React.useState(false);
  const medievalSide = percent;
  const vampireSide = 100 - percent;
  const dominantColor = percent >= 50 ? colors.prussianBlue : colors.fireBrick;
  
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
              Today's Progress
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
  function getDaysUntilBattle() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    let days = (7 - dayOfWeek) % 7;
    if (days === 0) days = 7;
    return days;
  }
  
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
    
    return (
      <View style={{ 
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: `${colors.silver}40`,
      }}>
        {/* Battle Prediction */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}>
          <MaterialCommunityIcons 
            name={iconName} 
            size={18} 
            color={colors.cultured} 
            style={{ marginRight: 8 }}
          />
          <Text style={{ 
            color: colors.cultured, 
            fontWeight: 'bold', 
            fontSize: 16,
            letterSpacing: -0.1,
          }}>
            {percent}% Win Chance
          </Text>
        </View>
        
        <Text style={{ 
          color: messageColor, 
          fontSize: 14, 
          textAlign: 'center',
          marginBottom: 12,
          fontWeight: '500',
          lineHeight: 18,
        }}>
          {message}
        </Text>
        
        {/* Battle Countdown */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${dominantColor}10`,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: `${dominantColor}30`,
        }}>
          <MaterialCommunityIcons 
            name="clock-outline" 
            size={16} 
            color={colors.prussianBlue}
            style={{ marginRight: 6 }}
          />
          <Text style={{ 
            color: colors.prussianBlue, 
            fontSize: 13,
            fontWeight: '600',
          }}>
            Next battle in {days} day{days === 1 ? '' : 's'}
          </Text>
        </View>
      </View>
    );
  }
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export default function Main({ navigation }) {
  // Weekly Results Card State
  const [showWeeklyCard, setShowWeeklyCard] = useState(false);
  const [showWeeklyResults, setShowWeeklyResults] = useState(false);
  const [weeklyData, setWeeklyData] = useState(null);

  // Helper: Check if week ended (Sunday night)
  useEffect(() => {
    const now = new Date();
    // Check for forceEndWeek in kingdom doc
    const forceEnd = kingdom;
    console.log('forceEndWeek:', forceEnd);
    async function checkAndShow() {
      const shouldShow = forceEnd || (now.getDay() === 0 && now.getHours() >= 18);
      if (shouldShow) {
        // Only show if not already shown this week
        if (!weeklyData || weeklyData.week !== getCurrentWeekString()) {
          const data = await getWeeklyResults();
          setWeeklyData({ ...data, week: getCurrentWeekString() });
          setShowWeeklyCard(true);
          setShowWeeklyResults(false);
        }
      }
    }
    checkAndShow();
  }, [kingdom, progress, habits]);

  function getCurrentWeekString() {
    const now = new Date();
    const y = now.getFullYear();
    const w = getWeekNumber(now);
    return `${y}-W${w}`;
  }
  function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    return weekNo;
  }

  // Generate weekly results data
  async function getWeeklyResults() {
    if (!kingdom || !kingdom.members || !kingdom.habits) return {};
    // Fetch user data for all members
    const memberDocs = await Promise.all(
      kingdom.members.map(async uid => {
        const snap = await getDoc(doc(db, "users", uid));
        return { uid, ...snap.data() };
      })
    );
    let score = 0, maxScore = 0;
    let memberStats = [];
    for (const member of memberDocs) {
      const userHabits = kingdom.habits?.[member.uid] || {};
      let pos = 0, neg = 0, diff = 0, freq = 0, completed = 0;
      Object.values(userHabits).forEach(habit => {
        const comp = habit.completed || 0;
        const d = habit.difficulty || 1;
        if (habit.type === 'good') {
          pos += comp * d;
          maxScore += (habit.frequency || 0) * d;
        } else {
          neg += comp * d;
          maxScore += (habit.frequency || 0) * d;
        }
        completed += comp;
        diff += d;
        freq += habit.frequency || 0;
      });
      memberStats.push({
        uid: member.uid,
        pos,
        neg,
        completed,
        diff,
        freq,
        name: member.displayName || 'User',
        avatarUrl: member.avatarUrl || '',
        displayName: member.displayName || 'User',
      });
      score += pos - neg;
    }
    // Determine winner
    const percent = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);
    const winner = percent >= 50 ? 'kingdom' : 'vampires';
    // MVP: most positive contribution
    let mvp = memberStats[0];
    memberStats.forEach(m => {
      if ((m.pos - m.neg) > (mvp.pos - mvp.neg)) mvp = m;
    });
    // Win streak (if user completed all habits this week)
    let streak = false;
    if (habits.length > 0) {
      streak = habits.every(h => (h.week || []).every(v => v));
    }
    // Personal contribution
    const myStats = memberStats.find(m => m.uid === auth.currentUser.uid) || {};
    // Calculate percent contributed to survival rate (score/maxScore)
    const myPercent = maxScore === 0 ? 0 : Math.round(((myStats.pos - myStats.neg) / maxScore) * 100);
    const mvpPercent = maxScore === 0 ? 0 : Math.round(((mvp.pos - mvp.neg) / maxScore) * 100);
    // Weekly title (madlib, fun and unique for each user)
    let title = '';
    let funTitles = [
      'The Relentless', 'The Dawnbringer', 'The Shadowbane', 'The Habit Hero', 'The Unyielding',
      'The Night Conqueror', 'The Hopebringer', 'The Ironwilled', 'The Motivator', 'The Steadfast',
      'The Vampire Vanquisher', 'The Resilient', 'The Streakmaster', 'The Redeemer', 'The Unbreakable',
      'The Comeback Kid', 'The Consistent', 'The Phoenix', 'The Sanguine', 'The Lightkeeper'
    ];
    // Pick a random fun title for the user for this week
    const myFunTitle = funTitles[Math.floor(Math.random() * funTitles.length)];
    if (winner === 'kingdom') {
      title = `Defenders of the Realm: The Week of ${['Valor','Virtue','Unity','Courage','Glory'][Math.floor(Math.random()*5)]}`;
    } else {
      title = `Vampire Ascendancy: The Week of ${['Shadows','Temptation','Bloodlust','Nightfall','Despair'][Math.floor(Math.random()*5)]}`;
    }
    // MVP title
    const mvpTitle = winner === 'kingdom' ? 'Champion of the Realm' : 'Dread Lord of the Night';
    // Hook for new week
    const hook = winner === 'kingdom'
      ? 'A new week dawns—will your valor hold?'
      : 'The vampires grow bolder... can you turn the tide?';
    // Narrative intro
    const intro = winner === 'kingdom'
      ? 'The kingdom has triumphed over the darkness!'
      : 'The vampires have seized the night!';
    // Personalized message
    let personalMsg = '';
    if (streak) personalMsg = 'You completed every habit this week! Unstoppable!';
    else if ((myStats.pos - myStats.neg) > 0) personalMsg = 'Your efforts helped defend the kingdom!';
    else if ((myStats.pos - myStats.neg) < 0) personalMsg = 'Beware, your habits aided the vampires...';
    else personalMsg = 'Every bit counts—keep going!';
    return {
      winner, percent, memberStats, mvp, streak, myStats, myPercent, mvpPercent, title, mvpTitle, hook, intro, personalMsg, myFunTitle
    };
  }
  // Weekly Results Card as a full-screen modal popup
  function WeeklyResultsCard() {
    if (!weeklyData) return null;
    return (
      <>
        {/* Preview card, tap to open modal */}
        {!showWeeklyResults && showWeeklyCard && (
          <View style={{
            backgroundColor: colors.cultured,
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
            elevation: 4,
            borderWidth: 2,
            borderColor: weeklyData.winner === 'kingdom' ? colors.prussianBlue : colors.fireBrick,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <View style={{
                backgroundColor: weeklyData.winner === 'kingdom' ? colors.prussianBlue : colors.fireBrick,
                borderRadius: 12,
                padding: 8,
                marginRight: 12,
              }}>
                <MaterialCommunityIcons 
                  name={weeklyData.winner === 'kingdom' ? "crown" : "skull"} 
                  size={20} 
                  color={colors.cultured}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: colors.papayaWhip,
                  marginBottom: 2,
                }}>
                  Weekly Battle Results
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: weeklyData.winner === 'kingdom' ? colors.prussianBlue : colors.fireBrick,
                  fontWeight: '500',
                }}>
                  {weeklyData.winner === 'kingdom' ? 'Medieval Victory!' : 'Vampire Victory!'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowWeeklyResults(true)}
                style={{
                  backgroundColor: weeklyData.winner === 'kingdom' ? colors.prussianBlue : colors.fireBrick,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  shadowColor: weeklyData.winner === 'kingdom' ? colors.prussianBlue : colors.fireBrick,
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
              >
                <Text style={{ 
                  color: colors.cultured, 
                  fontWeight: '600', 
                  fontSize: 12 
                }}>
                  View Results
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={{
              fontSize: 14,
              color: weeklyData.winner === 'kingdom' ? colors.prussianBlue : colors.fireBrick,
              textAlign: 'center',
              fontStyle: 'italic',
            }}>
              {weeklyData.intro}
            </Text>
          </View>
        )}
        
        {/* Fullscreen modal for results */}
        <Modal visible={!!showWeeklyResults} animationType="fade" transparent>
          <View style={{ 
            flex: 1, 
            backgroundColor: 'rgba(0,0,0,0.8)', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: 16,
          }}>
            <View style={{ 
              backgroundColor: colors.cultured,
              borderRadius: 24, 
              padding: 20, 
              width: '100%', 
              maxWidth: 440,
              maxHeight: '90%',
              shadowColor: '#000',
              shadowOpacity: 0.3,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 10 },
              elevation: 15,
            }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.silver,
                }}>
                  {kingdom && kingdom.pfp && (
                    <View style={{
                      borderWidth: 3,
                      borderColor: weeklyData.winner === 'kingdom' ? colors.prussianBlue : colors.fireBrick,
                      borderRadius: 25,
                      padding: 2,
                      marginRight: 12,
                      shadowColor: weeklyData.winner === 'kingdom' ? colors.prussianBlue : colors.fireBrick,
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: 3,
                    }}>
                      <Image source={{ uri: kingdom.pfp }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ 
                      fontSize: 20, 
                      fontWeight: 'bold', 
                      color: colors.papayaWhip,
                      marginBottom: 4,
                    }}>
                      {weeklyData.title}
                    </Text>
                    <Text style={{ 
                      fontSize: 13, 
                      color: weeklyData.winner === 'kingdom' ? colors.prussianBlue : colors.fireBrick,
                      fontWeight: '500',
                    }}>
                      {weeklyData.intro}
                    </Text>
                  </View>
                </View>

                {/* Bento Grid Layout */}
                <View style={{ marginBottom: 20 }}>
                  {/* Battle Result - Large Card */}
                  <View style={{
                    backgroundColor: weeklyData.winner === 'kingdom' ? colors.airSuperiorityBlue : colors.barnRed,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 2,
                    borderColor: weeklyData.winner === 'kingdom' ? colors.prussianBlue : colors.fireBrick,
                  }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                    }}>
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                        <MaterialCommunityIcons 
                          name={weeklyData.winner === 'kingdom' ? "crown" : "skull"} 
                          size={24} 
                          color={weeklyData.winner === 'kingdom' ? colors.prussianBlue : colors.fireBrick}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={{
                          fontSize: 18,
                          fontWeight: 'bold',
                          color: weeklyData.winner === 'kingdom' ? colors.prussianBlue : colors.fireBrick,
                        }}>
                          {weeklyData.winner === 'kingdom' ? 'Kingdom Victory!' : 'Vampire Victory!'}
                        </Text>
                      </View>
                      <Text style={{
                        fontSize: 24,
                        fontWeight: '800',
                        color: weeklyData.winner === 'kingdom' ? colors.prussianBlue : colors.fireBrick,
                      }}>
                        {weeklyData.percent}%
                      </Text>
                    </View>
                    
                    {/* Progress Bar */}
                    <View style={{
                      height: 8,
                      backgroundColor: colors.silver,
                      borderRadius: 4,
                      overflow: 'hidden',
                      flexDirection: 'row',
                      borderWidth: 1,
                      borderColor: `${colors.gunmetal}30`,
                    }}>
                      <View style={{
                        width: `${weeklyData.percent}%`,
                        backgroundColor: colors.prussianBlue,
                        height: '100%',
                      }} />
                      <View style={{
                        width: `${100 - weeklyData.percent}%`,
                        backgroundColor: colors.fireBrick,
                        height: '100%',
                      }} />
                    </View>
                  </View>

                  {/* Personal Title Card */}
                  <View style={{
                    backgroundColor: colors.textDark,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: colors.prussianBlue,
                  }}>
                    <View style={{
                      backgroundColor: weeklyData.winner === 'kingdom' ? colors.prussianBlue : colors.fireBrick,
                      borderRadius: 12,
                      padding: 8,
                      marginRight: 12,
                      color: colors.textDark,
                    }}>
                      {getTitleIcon(weeklyData.myFunTitle, 20, colors.textDark)}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 12,
                        color: colors.textMuted,
                        fontWeight: '500',
                        marginBottom: 2,
                      }}>
                        Your Title
                      </Text>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: weeklyData.winner === 'kingdom' ? colors.prussianBlue : colors.fireBrick,
                      }}>
                        {weeklyData.myFunTitle}
                      </Text>
                    </View>
                  </View>

                  {/* Stats Grid - Two Rows */}
                  <View style={{
                    flexDirection: 'row',
                    marginBottom: 12,
                    gap: 8,
                  }}>
                    {/* Your Stats */}
                    <View style={{
                      flex: 1,
                      backgroundColor: weeklyData.winner === 'kingdom' ? colors.airSuperiorityBlue : colors.barnRed,
                      borderRadius: 16,
                      padding: 14,
                      borderWidth: 2,
                      borderColor: weeklyData.winner === 'kingdom' ? colors.prussianBlue : colors.fireBrick,
                    }}>
                      <Text style={{
                        fontSize: 12,
                        color: colors.papayaWhip,
                        fontWeight: '600',
                        marginBottom: 8,
                        textAlign: 'center',
                      }}>
                        YOUR STATS
                      </Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.prussianBlue }}>{weeklyData.myStats.pos || 0}</Text>
                          <Text style={{ fontSize: 10, color: colors.papayaWhip, fontWeight: '500' }}>GOOD</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.richBlack }}>{weeklyData.myStats.completed || 0}</Text>
                          <Text style={{ fontSize: 10, color: colors.papayaWhip, fontWeight: '500' }}>TOTAL</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.fireBrick }}>{weeklyData.myStats.neg || 0}</Text>
                          <Text style={{ fontSize: 10, color: colors.papayaWhip, fontWeight: '500' }}>BAD</Text>
                        </View>
                      </View>
                      <Text style={{
                        fontSize: 11,
                        color: colors.papayaWhip,
                        textAlign: 'center',
                        marginTop: 6,
                      }}>
                        {weeklyData.myPercent}% contribution
                      </Text>
                    </View>

                    {/* MVP Card */}
                    <View style={{
                      flex: 1,
                      backgroundColor: weeklyData.winner === 'kingdom' ? colors.airSuperiorityBlue : colors.barnRed,
                      borderRadius: 16,
                      padding: 14,
                      borderWidth: 2,
                      borderColor: weeklyData.winner === 'kingdom' ? colors.prussianBlue : colors.fireBrick,
                    }}>
                      <Text style={{
                        fontSize: 12,
                        color: colors.papayaWhip,
                        fontWeight: '600',
                        marginBottom: 8,
                        textAlign: 'center',
                      }}>
                        {weeklyData.mvpTitle.toUpperCase()}
                      </Text>
                      <View style={{ alignItems: 'center', marginBottom: 6 }}>
                        {weeklyData.mvp.avatarUrl ? (
                          <Image source={{ uri: weeklyData.mvp.avatarUrl }} style={{ 
                            width: 28, 
                            height: 28, 
                            borderRadius: 14, 
                            marginBottom: 4,
                            borderWidth: 1,
                            borderColor: colors.prussianBlue,
                          }} />
                        ) : (
                          <MaterialCommunityIcons name="account-circle" size={28} color={colors.prussianBlue} style={{ marginBottom: 4 }} />
                        )}
                        <Text style={{
                          fontSize: 13,
                          fontWeight: 'bold',
                          color: colors.papayaWhip,
                          textAlign: 'center',
                        }}>
                          {weeklyData.mvp.displayName}
                        </Text>
                      </View>
                      <Text style={{
                        fontSize: 11,
                        color: colors.papayaWhip,
                        textAlign: 'center',
                      }}>
                        {weeklyData.mvpPercent}% contribution
                      </Text>
                    </View>
                  </View>

                  {/* Personal Message Card */}
                  <View style={{
                    backgroundColor: colors.textDark,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: weeklyData.winner === 'kingdom' ? colors.prussianBlue : colors.fireBrick,
                  }}>
                    <Text style={{
                      fontSize: 14,
                      color: weeklyData.winner === 'kingdom' ? colors.prussianBlue : colors.fireBrick,
                      textAlign: 'center',
                      fontStyle: 'italic',
                      lineHeight: 20,
                    }}>
                      {weeklyData.personalMsg}
                    </Text>
                    {weeklyData.streak && (
                      <View style={{
                        backgroundColor: colors.airSuperiorityBlue,
                        borderRadius: 8,
                        padding: 8,
                        marginTop: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <MaterialCommunityIcons name="fire" size={16} color={colors.prussianBlue} style={{ marginRight: 6 }} />
                        <Text style={{
                          fontSize: 12,
                          fontWeight: 'bold',
                          color: colors.prussianBlue,
                        }}>
                          Perfect Week Streak!
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Close Button */}
                <TouchableOpacity
                  onPress={async () => {
                    setShowWeeklyCard(false); setShowWeeklyResults(false);
                    // Store the fun title, completions, and winner in user and kingdom profile for this week and last week
                    try {
                      const userRef = doc(db, "users", auth.currentUser.uid);
                      const now = new Date();
                      const y = now.getFullYear();
                      const w = (function getWeekNumber(d) {
                        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
                        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
                        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
                        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
                        return weekNo;
                      })(now);
                      const weekKey = `${y}-W${w}`;
                      // Store this week's title
                      await updateDoc(userRef, { [`weeklyTitles.${weekKey}`]: weeklyData.myFunTitle });
                      // Store completions for this week
                      await updateDoc(userRef, { [`weeklyCompletions.${weekKey}`]: weeklyData.myStats.completed || 0 });
                      // Store last week's title and completions for reference
                      const lastWeek = new Date(now);
                      lastWeek.setDate(now.getDate() - 7);
                      const lastY = lastWeek.getFullYear();
                      const lastW = (function getWeekNumber(d) {
                        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
                        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
                        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
                        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
                        return weekNo;
                      })(lastWeek);
                      const lastWeekKey = `${lastY}-W${lastW}`;
                      // Optionally, store last week's title as a separate field for easy access
                      await updateDoc(userRef, { lastWeekTitle: weeklyData.myFunTitle, lastWeekCompletions: weeklyData.myStats.completed || 0 });

                      // Store winner for this week in kingdom doc
                      if (kingdom && kingdom.code) {
                        const kingdomRef = doc(db, "kingdoms", kingdom.code);
                        
                        // Collect weekly grid data for all members (Sunday-Saturday of completed week)
                        const weeklyGridData = {};
                        const today = new Date();
                        const offsetToLastSunday = (today.getDay() + 7) % 7 + 7;
                        const lastSunday = new Date(today);
                        lastSunday.setDate(today.getDate() - offsetToLastSunday);
                        
                        for (const member of memberDocs) {
                          const memberWeekData = [];
                          for (let i = 0; i < 7; i++) {
                            const d = new Date(lastSunday);
                            d.setDate(lastSunday.getDate() + i);
                            const dateKey = d.toISOString().slice(0, 10);
                            let val = 0;
                            if (member.habitHistory && member.habitHistory[dateKey]) {
                              val = (member.habitHistory[dateKey].good || 0) - (member.habitHistory[dateKey].bad || 0);
                            }
                            memberWeekData.push(val);
                          }
                          weeklyGridData[member.uid] = memberWeekData;
                        }
                        
                        // Store weekly winner and stats
                        await updateDoc(kingdomRef, {
                          [`weeklyWinners.${weekKey}`]: weeklyData.winner,
                          [`weeklyStats.${weekKey}`]: {
                            percent: weeklyData.percent,
                            winner: weeklyData.winner,
                            mvpName: weeklyData.mvp.displayName,
                            mvpDesc: weeklyData.mvpTitle,
                            topHabits: habits.filter(h => h.completed === Math.max(...habits.map(hh => hh.completed))).map(h => h.name),
                            neglected: habits.filter(h => h.completed === Math.min(...habits.map(hh => hh.completed))).map(h => h.name),
                            gridData: weeklyGridData, // Store the 7-day grid data for each member
                          },
                          lastWeekWinner: weeklyData.winner,
                          lastWeekStats: {
                            percent: weeklyData.percent,
                            winner: weeklyData.winner,
                            mvpName: weeklyData.mvp.displayName,
                            mvpDesc: weeklyData.mvpTitle,
                            topHabits: habits.filter(h => h.completed === Math.max(...habits.map(hh => hh.completed))).map(h => h.name),
                            neglected: habits.filter(h => h.completed === Math.min(...habits.map(hh => hh.completed))).map(h => h.name),
                          }
                        });
                        // Update overall win counts and win streak
                        let medievalWins = kingdom.medievalWins || 0;
                        let vampireWins = kingdom.vampireWins || 0;
                        let winStreak = kingdom.winStreak || 0;
                        
                        if (weeklyData.winner === 'kingdom') {
                          medievalWins++;
                          winStreak++; // Increment streak for medieval victory
                        } else {
                          vampireWins++;
                          winStreak = 0; // Reset streak on vampire victory
                        }
                        
                        await updateDoc(kingdomRef, {
                          medievalWins,
                          vampireWins,
                          winStreak
                        });
                      }
                    } catch (e) { /* ignore */ }
                  }}
                  style={{
                    backgroundColor: weeklyData.winner === 'kingdom' ? colors.fireBrick : colors.prussianBlue,
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    shadowColor: colors.fireBrick,
                    shadowOpacity: 0.25,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 3,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialCommunityIcons 
                    name="check-circle" 
                    size={18} 
                    color={colors.cultured}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ 
                    color: colors.cultured, 
                    fontWeight: 'bold', 
                    fontSize: 16 
                  }}>
                    Got it!
                  </Text>
                </TouchableOpacity>

                {/* Footer Text */}
                <Text style={{
                  fontSize: 11,
                  color: colors.textMuted,
                  textAlign: 'center',
                  marginTop: 12,
                  fontStyle: 'italic',
                }}>
                  {weeklyData.hook}
                </Text>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </>
    );
  }
  const [motivation, setMotivation] = useState(null);
  const [showMotivation, setShowMotivation] = useState(false);
  const [habits, setHabits] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState("");
  const [frequency, setFrequency] = useState(1);
  const [difficulty, setDifficulty] = useState(1);
  const [type, setType] = useState('good');
  const [userData, setUserData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [kingdom, setKingdom] = useState(null);
  const [tab, setTab] = useState('today');
  const [weekData, setWeekData] = useState({});
  const [editHabit, setEditHabit] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editFreq, setEditFreq] = useState(1);
  const [editDiff, setEditDiff] = useState(1);
  const [editType, setEditType] = useState('good');
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Subscribe to the user's document so local UI stays in sync with updates (e.g., habit week toggles)
    let unsubKingdom = null;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsubUser = onSnapshot(userRef, (snap) => {
      const data = snap.data();
      setUserData(data);
      // Show motivation popup if present
      if (data && data.motivation && data.motivation.message) {
        setMotivation(data.motivation);
        setShowMotivation(true);
      } else {
        setMotivation(null);
        setShowMotivation(false);
      }
      // Manage kingdom subscription: cleanup previous and attach to new kingdom id
      if (unsubKingdom) {
        try { unsubKingdom(); } catch (e) { /* ignore */ }
        unsubKingdom = null;
      }
      if (data && data.kingdom) {
        const kingdomRef = doc(db, "kingdoms", data.kingdom);
        unsubKingdom = onSnapshot(kingdomRef, (kSnap) => {
          setKingdom(kSnap.data());
        });
      } else {
        setKingdom(null);
      }
    });

    return () => {
      try { unsubUser(); } catch (e) { /* ignore */ }
      if (unsubKingdom) {
        try { unsubKingdom(); } catch (e) { /* ignore */ }
      }
    };
  }, []);

  useEffect(() => {
    if (userData && userData.habits) {
      const habitMap = userData.habits;
      setHabits(prev => {
        // If we don't have a previous ordering, just use server order
        if (!prev || prev.length === 0) return Object.values(habitMap).map(h => ({ ...h }));
        const prevNames = prev.map(p => p.name).filter(Boolean);
        const ordered = [];
        // Keep previous order for habits that still exist
        prevNames.forEach(n => {
          if (habitMap[n]) ordered.push({ ...habitMap[n] });
        });
        // Append any new habits that weren't in prev
        Object.values(habitMap).forEach(h => {
          if (!prevNames.includes(h.name)) ordered.push({ ...h });
        });
        return ordered;
      });
    } else {
      setHabits([]);
    }
  }, [userData]);

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

  const addHabit = async () => {
    if (!newHabit) return;
    let habitObj;
    if (type === 'good') {
      habitObj = { name: newHabit, frequency, completed: 0, type, difficulty, week: Array(7).fill(false) };
    } else {
      habitObj = { name: newHabit, completed: 0, type, difficulty, week: Array(7).fill(false) };
    }
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, { [`habits.${newHabit}`]: habitObj });
    if (userData && userData.kingdom) {
      const kingdomRef = doc(db, "kingdoms", userData.kingdom);
      await updateDoc(kingdomRef, { [`habits.${auth.currentUser.uid}.${newHabit}`]: habitObj });
    }
    setHabits([...habits, habitObj]);
    setNewHabit("");
    setFrequency(1);
    setDifficulty(1);
    setType('good');
    setShowAdd(false);
  };

  const markHabit = async (habit, direction) => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    let updated;
    if (direction === 'right') {
      updated = { ...habit, completed: (habit.completed || 0) + 1 };
    } else {
      updated = { ...habit, completed: Math.max(0, (habit.completed || 0) - 1) };
    }
    await updateDoc(userRef, { [`habits.${habit.name}`]: updated });
    
    // Update user's daily habit history for grid visualization
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
    const userDayData = userData?.habitHistory?.[today] || { good: 0, bad: 0 };
    const progressField = habit.type === 'good' ? 'good' : 'bad';
    const newUserDayData = { ...userDayData };
    
    if (direction === 'right') {
      newUserDayData[progressField] = (newUserDayData[progressField] || 0) + 1;
    } else {
      newUserDayData[progressField] = Math.max(0, (newUserDayData[progressField] || 0) - 1);
    }
    
    await updateDoc(userRef, { 
      [`habitHistory.${today}`]: newUserDayData 
    });
    if (userData && userData.kingdom) {
      const kingdomRef = doc(db, "kingdoms", userData.kingdom);
      await updateDoc(kingdomRef, { [`habits.${auth.currentUser.uid}.${habit.name}`]: updated });
      
      // Update cumulative progress
      const progressField = habit.type === 'good' ? 'good' : 'bad';
      let newVal = (kingdom?.progress?.[auth.currentUser.uid]?.[progressField] || 0);
      newVal = direction === 'right' ? newVal + 1 : Math.max(0, newVal - 1);
      await updateDoc(kingdomRef, { [`progress.${auth.currentUser.uid}.${progressField}`]: newVal });
      
      // Update daily habit history for grid visualization
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
      const currentDayData = kingdom?.habitHistory?.[auth.currentUser.uid]?.[today] || { good: 0, bad: 0 };
      const newDayData = { ...currentDayData };
      
      if (direction === 'right') {
        newDayData[progressField] = (newDayData[progressField] || 0) + 1;
      } else {
        newDayData[progressField] = Math.max(0, (newDayData[progressField] || 0) - 1);
      }
      
      await updateDoc(kingdomRef, { 
        [`habitHistory.${auth.currentUser.uid}.${today}`]: newDayData 
      });
    }
    setHabits(habits.map(h => h.name === habit.name ? updated : h));
  };

  // Open edit modal
  const openEdit = (habit) => {
    setEditHabit(habit);
    setEditName(habit.name);
    setEditFreq(habit.frequency);
    setEditDiff(habit.difficulty);
    setEditType(habit.type);
    setEditModal(true);
  };

  // Save edits
  const saveEdit = async () => {
    if (!editHabit) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const updated = { ...editHabit, name: editName, frequency: editFreq, difficulty: editDiff, type: editType };
    await updateDoc(userRef, { [`habits.${editHabit.name}`]: updated });
    if (userData && userData.kingdom) {
      const kingdomRef = doc(db, "kingdoms", userData.kingdom);
      await updateDoc(kingdomRef, { [`habits.${auth.currentUser.uid}.${editHabit.name}`]: updated });
    }
    setHabits(habits.map(h => h.name === editHabit.name ? updated : h));
    setEditModal(false);
  };

  // Delete habit
  const deleteHabit = async () => {
    if (!editHabit) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const newHabits = { ...userData.habits };
    delete newHabits[editHabit.name];
    await updateDoc(userRef, { habits: newHabits });
    if (userData && userData.kingdom) {
      const kingdomRef = doc(db, "kingdoms", userData.kingdom);
      const kHabits = { ...(kingdom?.habits?.[auth.currentUser.uid] || {}) };
      delete kHabits[editHabit.name];
      await updateDoc(kingdomRef, { [`habits.${auth.currentUser.uid}`]: kHabits });
    }
    setHabits(habits.filter(h => h.name !== editHabit.name));
    setEditModal(false);
  };

  // Monthly grid data (simulate with random for now, or use habit.completions)
  function CompletionGrid({ habit }) {
    // For demo, use completions array: habit.completions = [dateString,...]
    // In real app, store completions in Firestore
    const days = getDaysInMonth(year, month);
    const completions = habit.completions || [];
    // Build a map of completed days for this month
    const completedDays = {};
    completions.forEach(date => {
      const d = new Date(date);
      if (d.getMonth() === month && d.getFullYear() === year) completedDays[d.getDate() - 1] = true;
    });
    return (
      <View style={{ alignItems: 'center', marginVertical: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <TouchableOpacity onPress={() => setMonth(m => m === 0 ? 11 : m - 1)}><Text style={{ fontSize: 18, color: colors.prussianBlue }}>{'<'}</Text></TouchableOpacity>
          <Text style={{ marginHorizontal: 12, fontWeight: 'bold', color: colors.textDark }}>{new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
          <TouchableOpacity onPress={() => setMonth(m => m === 11 ? 0 : m + 1)}><Text style={{ fontSize: 18, color: colors.prussianBlue }}>{'>'}</Text></TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 7 * 28 }}>
          {[...Array(days)].map((_, i) => {
            const filled = completedDays[i];
            let bgColor = colors.textMuted;
            if (filled) {
              bgColor = habit.type === 'good' ? colors.prussianBlue : colors.fireBrick;
            }
            return (
              <View key={i} style={{ width: 28, height: 28, borderRadius: 14, margin: 2, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: colors.buttonText, fontSize: 13 }}>{i+1}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  // Memoize header to prevent FlatList re-rendering on every keystroke (without add habit input)
  const renderHeader = React.useCallback(() => (
    <>
      {/* Tab Navigation */}
      <View style={{ 
        flexDirection: 'row', 
        marginBottom: 20,
        backgroundColor: colors.cultured,
        borderRadius: 16,
        padding: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}>
        <TouchableOpacity 
          onPress={() => setTab('today')} 
          style={{ 
            flex: 1,
            backgroundColor: tab === 'today' ? colors.fireBrick : 'transparent',
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginRight: 2,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: tab === 'today' ? colors.fireBrick : 'transparent',
            shadowOpacity: tab === 'today' ? 0.2 : 0,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: tab === 'today' ? 3 : 0,
          }}
        >
          <MaterialCommunityIcons 
            name="calendar-today" 
            size={16} 
            color={tab === 'today' ? colors.cultured : colors.textMuted}
            style={{ marginRight: 6 }}
          />
          <Text style={{ 
            color: tab === 'today' ? colors.cultured : colors.richBlack,
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: 14,
          }}>
            Today
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setTab('week')} 
          style={{ 
            flex: 1,
            backgroundColor: tab === 'week' ? colors.fireBrick : 'transparent',
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginLeft: 2,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: tab === 'week' ? colors.fireBrick : 'transparent',
            shadowOpacity: tab === 'week' ? 0.2 : 0,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: tab === 'week' ? 3 : 0,
          }}
        >
          <MaterialCommunityIcons 
            name="calendar-week" 
            size={16} 
            color={tab === 'week' ? colors.cultured : colors.textMuted}
            style={{ marginRight: 6 }}
          />
          <Text style={{ 
            color: tab === 'week' ? colors.cultured : colors.richBlack,
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: 14,
          }}>
            Week
          </Text>
        </TouchableOpacity>
      </View>
    </>
  ), [tab]);

  return (
    <View style={styles.safeArea}>
      {/* ProgressBar above habits/add UI */}
      <ProgressBar percent={progress} kingdom={kingdom} />
      
      {/* Weekly Results Card */}
      <WeeklyResultsCard />
      
      {/* Motivation Card */}
      {showMotivation && motivation && (
        <View style={{
          backgroundColor: colors.papayaWhip,
          borderColor: colors.fireBrick,
          borderWidth: 2,
          borderRadius: 18,
          padding: 22,
          marginHorizontal: 8,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 4,
          elevation: 3,
          minWidth: 260,
          maxWidth: 500,
          alignSelf: 'center',
        }}>
          <Text style={{ fontFamily: 'serif', fontSize: 17, color: colors.textDark, marginBottom: 10, textAlign: 'center', fontStyle: 'italic' }}>
            "{motivation.message}"
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
            {motivation.avatarUrl ? (
              <Image source={{ uri: motivation.avatarUrl }} style={{ width: 28, height: 28, borderRadius: 14, marginRight: 8 }} />
            ) : null}
            <Text style={{ color: colors.textDark, fontWeight: 'bold', fontSize: 15, fontFamily: 'serif' }}>— {motivation.from || 'Your Ally'}</Text>
          </View>
          <TouchableOpacity
            onPress={async () => {
              setShowMotivation(false);
              setMotivation(null);
              // Remove motivation from Firestore
              const userRef = doc(db, "users", auth.currentUser.uid);
              await updateDoc(userRef, { motivation: {} });
            }}
            style={{ alignSelf: 'center', marginTop: 10, backgroundColor: colors.prussianBlue, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 18 }}
          >
            <Text style={{ color: colors.buttonText, fontWeight: 'bold', fontSize: 15 }}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Add Habit Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 16,
        marginTop: 8,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: colors.fireBrick,
      }}>
        <View style={{
          width: 4,
          height: 24,
          backgroundColor: colors.fireBrick,
          borderRadius: 2,
          marginRight: 10,
        }} />
        <Text style={{ 
          fontSize: 22, 
          fontWeight: 'bold', 
          color: colors.textDark,
          flex: 1,
          letterSpacing: -0.3,
        }}>
          Your Habits
        </Text>
        <TouchableOpacity 
          onPress={() => setShowAdd(!showAdd)} 
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
          }}
        >
          <FontAwesome 
            name={showAdd ? "minus" : "plus"} 
            size={14} 
            color={colors.cultured}
            style={{ marginRight: 6 }}
          />
          <Text style={{
            color: colors.cultured,
            fontWeight: '600',
            fontSize: 13,
          }}>
            {showAdd ? "Cancel" : "Add Habit"}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Add Habit Form */}
      {showAdd && (
        <View style={{ 
          backgroundColor: colors.cultured,
          borderRadius: 16, 
          padding: 16, 
          marginBottom: 20,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 4,
          borderWidth: 2,
          borderColor: type === 'good' ? colors.prussianBlue : colors.fireBrick,
        }}>
          {/* Form Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.silver,
          }}>
            <View style={{
              backgroundColor: type === 'good' ? colors.prussianBlue : colors.fireBrick,
              borderRadius: 12,
              padding: 8,
              marginRight: 12,
            }}>
              <MaterialCommunityIcons 
                name={type === 'good' ? "shield-sword" : "bat"} 
                size={18} 
                color={colors.cultured}
              />
            </View>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: colors.richBlack,
            }}>
              Create New {type === 'good' ? 'Medieval' : 'Vampire'} Habit
            </Text>
          </View>

          {/* Habit Name Input */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.richBlack,
              marginBottom: 8,
            }}>
              Habit Name
            </Text>
            <TextInput
              placeholder="Enter habit name..."
              placeholderTextColor={type === 'good' ? colors.prussianBlue : colors.fireBrick}
              style={{
                backgroundColor: colors.white,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 16,
                color: colors.textDark,
                borderWidth: 1,
                borderColor: `${type === 'good' ? colors.prussianBlue : colors.fireBrick}40`,
              }}
              value={newHabit}
              onChangeText={setNewHabit}
            />
          </View>

          {/* Settings Row */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            {/* Difficulty Stars */}
            <View>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.richBlack,
                marginBottom: 8,
              }}>
                Difficulty
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {[1,2,3].map(star => (
                  <TouchableOpacity key={star} onPress={() => setDifficulty(star)}>
                    <FontAwesome 
                      name={difficulty >= star ? 'star' : 'star-o'} 
                      size={20} 
                      color={type === 'good' ? colors.prussianBlue : colors.fireBrick}
                      style={{ marginHorizontal: 2 }} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Type Toggle */}
            <View>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.richBlack,
                marginBottom: 8,
              }}>
                Type
              </Text>
              <TouchableOpacity 
                onPress={() => setType(type === 'good' ? 'bad' : 'good')} 
                style={{ 
                  backgroundColor: type === 'good' ? colors.airSuperiorityBlue : colors.barnRed,
                  borderRadius: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderColor: type === 'good' ? colors.prussianBlue : colors.fireBrick,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <MaterialCommunityIcons 
                  name={type === 'good' ? "shield-sword" : "bat"} 
                  size={16} 
                  color={type === 'good' ? colors.prussianBlue : colors.fireBrick}
                  style={{ marginRight: 6 }}
                />
                <Text style={{ 
                  color: type === 'good' ? colors.prussianBlue : colors.fireBrick,
                  fontSize: 13,
                  fontWeight: '600',
                }}>
                  {type === 'good' ? 'Positive' : 'Negative'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Frequency Selector for Good Habits */}
          {type === 'good' && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.richBlack,
                marginBottom: 8,
              }}>
                Weekly Frequency
              </Text>
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between',
                backgroundColor: colors.white,
                borderRadius: 12,
                padding: 8,
                borderWidth: 1,
                borderColor: `${colors.prussianBlue}40`,
              }}>
                {[...Array(7)].map((_, i) => (
                  <TouchableOpacity 
                    key={i} 
                    onPress={() => setFrequency(i+1)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: i < frequency ? colors.textMuted2 : colors.textMuted,
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: i < frequency ? colors.prussianBlue : 'transparent',
                      shadowOpacity: 0.2,
                      shadowRadius: 3,
                      shadowOffset: { width: 0, height: 1 },
                      elevation: i < frequency ? 2 : 0,
                    }}
                  >
                    <Text style={{ 
                      color: colors.cultured,
                      fontSize: 14,
                      fontWeight: 'bold',
                    }}>
                      {i+1}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Add Button */}
          <TouchableOpacity 
            onPress={addHabit} 
            style={{ 
              backgroundColor: type === 'good' ? colors.prussianBlue : colors.fireBrick,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 20,
              shadowColor: type === 'good' ? colors.prussianBlue : colors.fireBrick,
              shadowOpacity: 0.25,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons 
              name="plus-circle" 
              size={18} 
              color={colors.cultured}
              style={{ marginRight: 8 }}
            />
            <Text style={{ 
              color: colors.cultured,
              fontWeight: 'bold',
              fontSize: 16,
            }}>
              Create Habit
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {tab === 'today' ? (
        <FlatList
          data={habits}
          keyExtractor={item => item.name}
          renderItem={({ item }) => {
            // Only allow complete once per day
            const today = new Date();
            const dayIdx = today.getDay();
            const completedToday = item.week && item.week[dayIdx];
            return (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <SwipeableHabit
                    habit={item}
                    onSwipeLeft={async () => {
                      if (completedToday) return;
                      const newWeek = item.week ? [...item.week] : Array(7).fill(false);
                      newWeek[dayIdx] = true;
                      const updated = { ...item, completed: (item.completed || 0) + 1, week: newWeek };
                      const userRef = doc(db, "users", auth.currentUser.uid);
                      await updateDoc(userRef, { [`habits.${item.name}`]: updated });
                      
                      // Update user's daily habit history for grid visualization
                      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
                      const userDayData = userData?.habitHistory?.[today] || { good: 0, bad: 0 };
                      const progressField = item.type === 'good' ? 'good' : 'bad';
                      const newUserDayData = { ...userDayData };
                      newUserDayData[progressField] = (newUserDayData[progressField] || 0) + 1;
                      
                      await updateDoc(userRef, { 
                        [`habitHistory.${today}`]: newUserDayData 
                      });
                      
                      if (userData && userData.kingdom) {
                        const kingdomRef = doc(db, "kingdoms", userData.kingdom);
                        await updateDoc(kingdomRef, { [`habits.${auth.currentUser.uid}.${item.name}`]: updated });
                        
                        // Update kingdom daily habit history for grid visualization
                        const currentDayData = kingdom?.habitHistory?.[auth.currentUser.uid]?.[today] || { good: 0, bad: 0 };
                        const newDayData = { ...currentDayData };
                        newDayData[progressField] = (newDayData[progressField] || 0) + 1;
                        
                        await updateDoc(kingdomRef, { 
                          [`habitHistory.${auth.currentUser.uid}.${today}`]: newDayData 
                        });
                      }
                      setHabits(habits.map(h => h.name === item.name ? updated : h));
                    }}
                    onSwipeRight={async () => {
                      if (!completedToday) return;
                      const newWeek = item.week ? [...item.week] : Array(7).fill(false);
                      newWeek[dayIdx] = false;
                      const updated = { ...item, completed: Math.max(0, (item.completed || 0) - 1), week: newWeek };
                      const userRef = doc(db, "users", auth.currentUser.uid);
                      await updateDoc(userRef, { [`habits.${item.name}`]: updated });
                      
                      // Update user's daily habit history for grid visualization
                      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
                      const userDayData = userData?.habitHistory?.[today] || { good: 0, bad: 0 };
                      const progressField = item.type === 'good' ? 'good' : 'bad';
                      const newUserDayData = { ...userDayData };
                      newUserDayData[progressField] = Math.max(0, (newUserDayData[progressField] || 0) - 1);
                      
                      await updateDoc(userRef, { 
                        [`habitHistory.${today}`]: newUserDayData 
                      });
                      
                      if (userData && userData.kingdom) {
                        const kingdomRef = doc(db, "kingdoms", userData.kingdom);
                        await updateDoc(kingdomRef, { [`habits.${auth.currentUser.uid}.${item.name}`]: updated });
                        
                        // Update kingdom daily habit history for grid visualization
                        const currentDayData = kingdom?.habitHistory?.[auth.currentUser.uid]?.[today] || { good: 0, bad: 0 };
                        const newDayData = { ...currentDayData };
                        newDayData[progressField] = Math.max(0, (newDayData[progressField] || 0) - 1);
                        
                        await updateDoc(kingdomRef, { 
                          [`habitHistory.${auth.currentUser.uid}.${today}`]: newDayData 
                        });
                      }
                      setHabits(habits.map(h => h.name === item.name ? updated : h));
                    }}
                  />
                </View>
                <TouchableOpacity onPress={() => openEdit(item)} style={{ marginLeft: 8, padding: 6 }}>
                  <MaterialCommunityIcons name="pencil-circle" size={28} color={colors.textDark} />
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={{ color: colors.textMuted, textAlign: 'center' }}>No habits yet. Add one above!</Text>}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      ) : (
        <FlatList
          data={habits.map(h => ({
            ...h,
            kingdomId: userData && userData.kingdom ? userData.kingdom : undefined,
            kingdomUid: auth.currentUser.uid
          }))}
          keyExtractor={item => item.name}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => openEdit(item)} activeOpacity={0.8}>
              <HabitWeekCard habit={item} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ color: colors.textMuted, textAlign: 'center' }}>No habits yet. Add one above!</Text>}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}

      {/* Edit Habit Modal */}
      <Modal visible={editModal} animationType="slide" transparent>
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{ 
            backgroundColor: colors.cultured,
            borderRadius: 16, 
            padding: 16, 
            width: '100%',
            maxWidth: 400,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 8,
            borderWidth: 2,
            borderColor: editType === 'good' ? colors.prussianBlue : colors.fireBrick,
          }}>
            {/* Form Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.silver,
            }}>
              <View style={{
                backgroundColor: editType === 'good' ? colors.prussianBlue : colors.fireBrick,
                borderRadius: 12,
                padding: 8,
                marginRight: 12,
              }}>
                <MaterialCommunityIcons 
                  name={editType === 'good' ? "shield-sword" : "bat"} 
                  size={18} 
                  color={colors.cultured}
                />
              </View>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: colors.richBlack,
              }}>
                Edit Habit
              </Text>
            </View>

            {/* Habit Name Input */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.richBlack,
                marginBottom: 8,
              }}>
                Habit Name
              </Text>
              <TextInput
                placeholder="Enter habit name..."
                placeholderTextColor={editType === 'good' ? colors.prussianBlue : colors.fireBrick}
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.textDark,
                  borderWidth: 1,
                  borderColor: `${editType === 'good' ? colors.prussianBlue : colors.fireBrick}40`,
                }}
                value={editName}
                onChangeText={setEditName}
              />
            </View>

            {/* Settings Row */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}>
              {/* Difficulty Stars */}
              <View>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.richBlack,
                  marginBottom: 8,
                }}>
                  Difficulty
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {[1,2,3].map(star => (
                    <TouchableOpacity key={star} onPress={() => setEditDiff(star)}>
                      <FontAwesome 
                        name={editDiff >= star ? 'star' : 'star-o'} 
                        size={20} 
                        color={editType === 'good' ? colors.prussianBlue : colors.fireBrick}
                        style={{ marginHorizontal: 2 }} 
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Type Toggle */}
              <View>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.richBlack,
                  marginBottom: 8,
                }}>
                  Type
                </Text>
                <TouchableOpacity 
                  onPress={() => setEditType(editType === 'good' ? 'bad' : 'good')} 
                  style={{ 
                    backgroundColor: editType === 'good' ? colors.airSuperiorityBlue : colors.barnRed,
                    borderRadius: 12,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderColor: editType === 'good' ? colors.prussianBlue : colors.fireBrick,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <MaterialCommunityIcons 
                    name={editType === 'good' ? "shield-sword" : "bat"} 
                    size={16} 
                    color={editType === 'good' ? colors.prussianBlue : colors.fireBrick}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{ 
                    color: editType === 'good' ? colors.prussianBlue : colors.fireBrick,
                    fontSize: 13,
                    fontWeight: '600',
                  }}>
                    {editType === 'good' ? 'Medieval' : 'Vampire'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Frequency Selector for Good Habits */}
            {editType === 'good' && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.richBlack,
                  marginBottom: 8,
                }}>
                  Weekly Frequency
                </Text>
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between',
                  backgroundColor: colors.white,
                  borderRadius: 12,
                  padding: 8,
                  borderWidth: 1,
                  borderColor: `${colors.prussianBlue}40`,
                }}>
                  {[...Array(7)].map((_, i) => (
                    <TouchableOpacity 
                      key={i} 
                      onPress={() => setEditFreq(i+1)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: i < editFreq ? colors.textMuted2 : colors.textMuted,
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: i < editFreq ? colors.prussianBlue : 'transparent',
                        shadowOpacity: 0.2,
                        shadowRadius: 3,
                        shadowOffset: { width: 0, height: 1 },
                        elevation: i < editFreq ? 2 : 0,
                      }}
                    >
                      <Text style={{ 
                        color: colors.cultured,
                        fontSize: 14,
                        fontWeight: 'bold',
                      }}>
                        {i+1}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              marginBottom: 12,
            }}>
              {/* Save Button */}
              <TouchableOpacity 
                onPress={saveEdit} 
                style={{ 
                  backgroundColor: editType === 'good' ? colors.prussianBlue : colors.fireBrick,
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  flex: 1,
                  marginRight: 8,
                  shadowColor: editType === 'good' ? colors.prussianBlue : colors.fireBrick,
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 3,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons 
                  name="content-save" 
                  size={16} 
                  color={colors.cultured}
                  style={{ marginRight: 6 }}
                />
                <Text style={{ 
                  color: colors.cultured,
                  fontWeight: 'bold',
                  fontSize: 14,
                }}>
                  Save
                </Text>
              </TouchableOpacity>

              {/* Delete Button */}
              <TouchableOpacity 
                onPress={deleteHabit} 
                style={{ 
                  backgroundColor: editType === 'good' ? colors.prussianBlue : colors.fireBrick,
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  flex: 1,
                  marginLeft: 8,
                  shadowColor: editType === 'good' ? colors.prussianBlue : colors.fireBrick,
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 3,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons 
                  name="delete" 
                  size={16} 
                  color={colors.cultured}
                  style={{ marginRight: 6 }}
                />
                <Text style={{ 
                  color: colors.cultured,
                  fontWeight: 'bold',
                  fontSize: 14,
                }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>

            {/* Close Button */}
            <TouchableOpacity 
              onPress={() => setEditModal(false)} 
              style={{
                alignSelf: 'center',
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8,
              }}
            >
              <Text style={{ 
                color: colors.textMuted,
                fontWeight: '600',
                fontSize: 14,
              }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


function SwipeableHabit({ habit, onSwipeRight, onSwipeLeft }) {
  const [offset] = useState(new Animated.Value(0));
  let startX = 0;
  const today = new Date();
  const dayIdx = today.getDay();
  const completedToday = habit.week && habit.week[dayIdx];
  
  // Only allow swipe left to complete if not completed, right to undo if completed
  const canSwipeLeft = !completedToday;
  const canSwipeRight = completedToday;
  
  // Modern card styling with proper theming
  const isGoodHabit = habit.type === 'good';
  const primaryColor = isGoodHabit ? colors.prussianBlue : colors.fireBrick;
  const lightBgColor = isGoodHabit ? colors.airSuperiorityBlue : colors.barnRed;
  const swipeBgColor = isGoodHabit ? colors.fireBrick : colors.prussianBlue;
  
  const cardBg = completedToday ? lightBgColor : colors.cultured;
  const borderColor = completedToday ? primaryColor : `${primaryColor}40`;
  
  return (
    <View style={{ 
      marginBottom: 12, 
      position: 'relative',
      borderRadius: 16,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    }}>
      {/* Swipe Background Actions */}
      <View style={{
        position: 'absolute',
        left: 0, right: 0, top: 0, bottom: 0,
        backgroundColor: swipeBgColor,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
      }}>
        {/* Undo Action (Right Swipe) */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          opacity: canSwipeRight ? 1 : 0.3 
        }}>
          <MaterialCommunityIcons 
            name="undo-variant" 
            size={20} 
            color={colors.cultured}
            style={{ marginRight: 8 }}
          />
          <Text style={{ 
            color: colors.cultured, 
            fontWeight: '600', 
            fontSize: 14 
          }}>
            Undo
          </Text>
        </View>
        
        {/* Complete Action (Left Swipe) */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          opacity: canSwipeLeft ? 1 : 0.3 
        }}>
          <Text style={{ 
            color: colors.cultured, 
            fontWeight: '600', 
            fontSize: 14,
            marginRight: 8,
          }}>
            {isGoodHabit ? 'Complete' : 'Happen'}
          </Text>
          <MaterialCommunityIcons 
            name={isGoodHabit ? "check-circle" : "close-circle"} 
            size={20} 
            color={colors.cultured}
          />
        </View>
      </View>
      
      {/* Main Habit Card */}
      <Animated.View
        style={{
          transform: [{ translateX: offset }],
          backgroundColor: cardBg,
          borderRadius: 16,
          padding: 16,
          borderWidth: 2,
          borderColor: borderColor,
          minHeight: 70,
        }}
        onStartShouldSetResponder={() => canSwipeLeft || canSwipeRight}
        onResponderGrant={e => { startX = e.nativeEvent.pageX; }}
        onResponderMove={e => {
          const dx = e.nativeEvent.pageX - startX;
          if ((dx < 0 && !canSwipeLeft) || (dx > 0 && !canSwipeRight)) return;
          offset.setValue(dx);
        }}
        onResponderRelease={e => {
          const dx = e.nativeEvent.pageX - startX;
          if (dx < -80 && canSwipeLeft) { 
            onSwipeLeft(); 
            offset.setValue(0); 
          }
          else if (dx > 80 && canSwipeRight) { 
            onSwipeRight(); 
            offset.setValue(0); 
          }
          else { 
            Animated.spring(offset, { 
              toValue: 0, 
              useNativeDriver: true 
            }).start(); 
          }
        }}
      >
        {/* Card Header */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          marginBottom: 8,
        }}>
          {/* Habit Icon */}
          <View style={{
            backgroundColor: primaryColor,
            borderRadius: 12,
            padding: 8,
            marginRight: 12,
          }}>
            <MaterialCommunityIcons 
              name={isGoodHabit ? "shield-sword" : "bat"} 
              size={18} 
              color={colors.cultured}
            />
          </View>
          
          {/* Habit Name and Progress */}
          <View style={{ flex: 1 }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: 'bold',
              color: colors.richBlack,
              marginBottom: 2,
            }}>
              {habit.name}
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* Habit Type Badge */}
              <View style={{
                backgroundColor: `${primaryColor}15`,
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginRight: 8,
                borderWidth: 1,
                borderColor: primaryColor,
              }}>
                <Text style={{
                  color: primaryColor,
                  fontSize: 11,
                  fontWeight: '600',
                }}>
                  {isGoodHabit ? 'Medieval' : 'Vampire'}
                </Text>
              </View>
              
              {/* Progress Text */}
              <Text style={{ 
                color: colors.textMuted, 
                fontSize: 12,
                fontWeight: '500',
              }}>
                {isGoodHabit 
                  ? `${habit.completed || 0}/${habit.frequency}` 
                  : `Count: ${habit.completed || 0}`
                }
              </Text>
            </View>
          </View>
          
          {/* Status Indicator */}
          {completedToday && (
            <View style={{
              backgroundColor: primaryColor,
              borderRadius: 20,
              padding: 6,
              shadowColor: primaryColor,
              shadowOpacity: 0.2,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}>
              <MaterialCommunityIcons 
                name={isGoodHabit ? "check" : "close"} 
                size={16} 
                color={colors.cultured}
              />
            </View>
          )}
        </View>
        
        {/* Difficulty Stars */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ 
              color: colors.textMuted, 
              fontSize: 12, 
              marginRight: 6,
              fontWeight: '500',
            }}>
              Difficulty:
            </Text>
            {[1,2,3].map(star => (
              <FontAwesome 
                key={star} 
                name={habit.difficulty >= star ? 'star' : 'star-o'} 
                size={14} 
                color={habit.difficulty >= star ? primaryColor : colors.textMuted}
                style={{ marginHorizontal: 1 }} 
              />
            ))}
          </View>
          
          {/* Swipe Hint */}
          <Text style={{ 
            color: colors.textMuted, 
            fontSize: 11,
            fontStyle: 'italic',
          }}>
            {canSwipeLeft ? '← Swipe to complete' : canSwipeRight ? 'Swipe to undo →' : 'Completed today'}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

function HabitWeekCard({ habit }) {
  const [week, setWeek] = useState(habit.week || Array(7).fill(false));
  const days = ['S','M','T','W','T','F','S'];
  const userRef = doc(db, "users", auth.currentUser.uid);
  const updateDay = async (idx) => {
    const newWeek = week.slice();
    let newCompleted = habit.completed || 0;
    const wasCompleting = !newWeek[idx]; // true if we're completing, false if uncompleting
    
    if (!newWeek[idx]) {
      newWeek[idx] = true;
      newCompleted++;
    } else {
      newWeek[idx] = false;
      newCompleted = Math.max(0, newCompleted - 1);
    }
    setWeek(newWeek);
    await updateDoc(userRef, { [`habits.${habit.name}.week`]: newWeek, [`habits.${habit.name}.completed`]: newCompleted });
    
    // Update user's daily habit history for grid visualization
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
    const progressField = habit.type === 'good' ? 'good' : 'bad';
    
    // Get current user data to access habitHistory
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    const userDayData = userData?.habitHistory?.[today] || { good: 0, bad: 0 };
    const newUserDayData = { ...userDayData };
    
    if (wasCompleting) {
      newUserDayData[progressField] = (newUserDayData[progressField] || 0) + 1;
    } else {
      newUserDayData[progressField] = Math.max(0, (newUserDayData[progressField] || 0) - 1);
    }
    
    await updateDoc(userRef, { 
      [`habitHistory.${today}`]: newUserDayData 
    });
    
    if (habit.kingdomId && habit.kingdomUid) {
      const kingdomRef = doc(db, "kingdoms", habit.kingdomId);
      await updateDoc(kingdomRef, { [`habits.${habit.kingdomUid}.${habit.name}.week`]: newWeek, [`habits.${habit.kingdomUid}.${habit.name}.completed`]: newCompleted });
      
      // Update kingdom daily habit history for grid visualization
      const kingdomDoc = await getDoc(kingdomRef);
      const kingdomData = kingdomDoc.data();
      const currentDayData = kingdomData?.habitHistory?.[habit.kingdomUid]?.[today] || { good: 0, bad: 0 };
      const newDayData = { ...currentDayData };
      
      if (wasCompleting) {
        newDayData[progressField] = (newDayData[progressField] || 0) + 1;
      } else {
        newDayData[progressField] = Math.max(0, (newDayData[progressField] || 0) - 1);
      }
      
      await updateDoc(kingdomRef, { 
        [`habitHistory.${habit.kingdomUid}.${today}`]: newDayData 
      });
    }
  };
  return (
    <View style={{ backgroundColor: habit.type === 'good' ? colors.airSuperiorityBlue : colors.barnRed, borderRadius: 10, padding: 12, marginBottom: 12, borderColor: habit.type === 'good' ? colors.prussianBlue : colors.fireBrick, borderWidth: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ flex: 1, fontSize: 16, color: colors.papayaWhip, fontWeight: 'bold' }}>{habit.name}</Text>
        {[1,2,3].map(star => (
          <FontAwesome key={star} name={habit.difficulty >= star ? 'star' : 'star-o'} size={18} color={habit.type === 'good' ? colors.prussianBlue : colors.fireBrick} style={{ marginHorizontal: 1 }} />
        ))}
        {habit.type === 'good' ? (
          <MaterialCommunityIcons name="shield-sword" size={20} color={habit.type === 'good' ? colors.prussianBlue : colors.fireBrick} style={{ marginLeft: 8 }} />
        ) : (
          <MaterialCommunityIcons name="bat" size={20} color={habit.type === 'good' ? colors.prussianBlue : colors.fireBrick} style={{ marginLeft: 8 }} />
        )}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        {days.map((d, i) => (
          <TouchableOpacity key={i} onPress={() => updateDay(i)}>
            <View style={{ width: 28, height: 28, borderRadius: 14, marginHorizontal: 2, backgroundColor: week[i] ? (habit.type === 'good' ? colors.prussianBlue : colors.fireBrick) : colors.buttonText, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: habit.type === 'good' ? colors.prussianBlue : colors.fireBrick }}>
              <Text style={{ color: colors.papayaWhip, fontWeight: 'bold' }}>{d}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
