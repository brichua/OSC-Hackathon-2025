import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, Alert, Clipboard, FlatList, Modal, ScrollView } from "react-native";
import { db, auth } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles, { colors } from "./style";
import { getTitleIcon } from "./titleIcon";

// Helper to get user's fun title for the week (from Firestore or fallback)
function getFunTitle(user, weekKey) {
  if (user.weeklyTitles && user.weeklyTitles[weekKey]) return user.weeklyTitles[weekKey];
  // fallback: use displayName or default
  return "Kingdom Member";
}

function TabButton({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: active ? colors.prussianBlue : 'transparent',
        borderRadius: 10,
        margin: 4,
        borderWidth: active ? 0 : 1.5,
        borderColor: colors.silver,
      }}
    >
      <Text style={{ color: active ? colors.buttonText : colors.textMuted, textAlign: 'center', fontWeight: 'bold' }}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function Stats() {
  const [tab, setTab] = useState(0);
  const [members, setMembers] = useState([]);
  const [userData, setUserData] = useState(null);
  const [kingdom, setKingdom] = useState(null);
  const [showBattleReport, setShowBattleReport] = useState(false);
  const [expanded, setExpanded] = useState({}); // uid: bool
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [selectedWeekKey, setSelectedWeekKey] = useState(null);
  const [overallGridPage, setOverallGridPage] = useState(0); // 0 = most recent 5 weeks
  const [showWeekPicker, setShowWeekPicker] = useState(false);
  

  // Helper: get current week string
  function getCurrentWeekString() {
    const now = new Date();
    const y = now.getFullYear();
    const w = getWeekNumber(now);
    return `${y}-W${w}`;
  }
  function getLastWeekString() {
    const now = new Date();
    now.setDate(now.getDate() - 7);
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

  useEffect(() => {
    const fetchData = async () => {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      const user = userSnap.data();
      setUserData(user);
      if (user.kingdom) {
        const kingdomRef = doc(db, "kingdoms", user.kingdom);
        const kingdomSnap = await getDoc(kingdomRef);
        const k = kingdomSnap.data();
        setKingdom(k);
        if (k && k.members) {
          const memberData = await Promise.all(k.members.map(async (uid) => {
            const mSnap = await getDoc(doc(db, "users", uid));
            return { ...mSnap.data(), uid };
          }));
          setMembers(memberData);
        }
      }
    };
    fetchData();
  }, [tab]);

  // Build list of available weeks from kingdom's weeklyStats or weeklyWinners
  useEffect(() => {
    if (!kingdom) return;
    const weeks = new Set();
    if (kingdom.weeklyStats) Object.keys(kingdom.weeklyStats).forEach(k => weeks.add(k));
    if (kingdom.weeklyWinners) Object.keys(kingdom.weeklyWinners).forEach(k => weeks.add(k));
    const sorted = Array.from(weeks).sort().reverse(); // newest first
    setAvailableWeeks(sorted);
    if (!selectedWeekKey && sorted.length > 0) setSelectedWeekKey(sorted[0]);
  }, [kingdom]);

  // General stats (example: win streak, total wins, etc.)
  // For now, just show number of members and sample win streak
  const generalStats = [
    { label: 'Members', value: members.length },
    { label: 'Win Streak', value: kingdom && kingdom.winStreak ? kingdom.winStreak : 0 },
    { label: 'Total Wins', value: kingdom && kingdom.medievalWins ? kingdom.medievalWins : 0 },
  ];

  

  // Week keys used by titles and last-week calculations
  let weekKey = getCurrentWeekString();
  let lastWeekKey = getLastWeekString();

  // Compute a fun kingdom title candidate and persist per-week so it stays the same until next week
  function computeTitleCandidate() {
    if (!kingdom) return '';
    const membersCount = members.length || 0;
    const avgCompletions = membersCount > 0 ? members.reduce((s, m) => s + (m.weeklyCompletions?.[weekKey] || 0), 0) / membersCount : 0;
    const winStreak = kingdom.winStreak || 0;
    const medievalWins = kingdom.medievalWins || 0;
    const vampireWins = kingdom.vampireWins || 0;

    if (winStreak >= 5) return 'The Unbroken Vanguard';
    if (winStreak >= 3) return 'The Streakbound';
    if (avgCompletions >= 5 && membersCount >= 3) return 'Steadfast Order';
    if (membersCount >= 8) return 'Rising Legion';
    if (medievalWins > vampireWins + 2) return 'Proud Defenders';
    if (vampireWins > medievalWins + 2) return 'Nightborn Coven';
    if (avgCompletions >= 3) return 'Consistent Keep';
    // fallback playful picks
    const picks = ['Aspirant Collective', 'Hearthbound Band', 'Vigorous Keep', 'Emberwatch'];
    return picks[Math.floor(Math.random() * picks.length)];
  }

  const computedCandidate = React.useMemo(() => computeTitleCandidate(), [kingdom, members, weekKey]);

  // Prefer stored weekly computed title; if missing, use candidate and persist it so it remains stable for the week
  const kingdomTitle = kingdom?.weeklyComputedTitles?.[weekKey] || computedCandidate;

  // Persist once per week when not present on the server yet
  useEffect(() => {
    if (!kingdom || !userData?.kingdom) return;
    const stored = kingdom.weeklyComputedTitles && kingdom.weeklyComputedTitles[weekKey];
    if (!stored && computedCandidate) {
      const ref = doc(db, 'kingdoms', userData.kingdom);
      updateDoc(ref, { [`weeklyComputedTitles.${weekKey}`]: computedCandidate }).catch(e => console.log('persist title failed', e));
    }
  }, [kingdom, userData, weekKey, computedCandidate]);

  // Helper to get last week's title for a user
  function getLastWeekTitle(user) {
    if (user.lastWeekTitle) return user.lastWeekTitle;
    if (user.weeklyTitles && user.weeklyTitles[lastWeekKey]) return user.weeklyTitles[lastWeekKey];
    return "Kingdom Member";
  }

  // Helper to get most frequent title for a user (overall)
  function getMostFrequentTitle(user) {
    if (!user.weeklyTitles) return "Kingdom Member";
    const counts = {};
    Object.values(user.weeklyTitles).forEach(title => {
      if (!title) return;
      counts[title] = (counts[title] || 0) + 1;
    });
    let max = 0, maxTitle = "Kingdom Member";
    Object.entries(counts).forEach(([title, count]) => {
      if (count > max) { max = count; maxTitle = title; }
    });
    return maxTitle;
  }

  // Personal stats component for the current user
  function PersonalStats({ user }) {
    // Most recent title (prefer lastWeekTitle, then this week's if present)
    const recentTitle = user.lastWeekTitle || (user.weeklyTitles && user.weeklyTitles[lastWeekKey]) || 'Kingdom Member';
    const frequentTitle = getMostFrequentTitle(user);
    let bestHabit = null, worstHabit = null, totalGood = 0, totalBad = 0;
    if (user.habits) {
      Object.values(user.habits).forEach(h => {
        const completed = h.completed || 0;
        if (h.type === 'good') totalGood += completed;
        else totalBad += completed;
        if (!bestHabit || completed > (bestHabit.completed || 0)) bestHabit = h;
        if (!worstHabit || completed < (worstHabit.completed || 0)) worstHabit = h;
      });
    }

    // Generate encouraging message based on stats
    function getEncouragingMessage() {
      const userName = user.displayName || 'Warrior';
      const netScore = totalGood - totalBad;
      const hasGoodProgress = totalGood > totalBad;
      const isStruggling = totalBad > totalGood;
      const isBalanced = Math.abs(totalGood - totalBad) <= 1;
      
      // Encouraging messages categorized by performance
      const excellentMessages = [
        `${userName}, you're absolutely crushing it! Your dedication is inspiring the entire kingdom!`,
        `Magnificent work, ${userName}! You're a true champion of positive habits!`,
        `${userName}, your consistency is legendary! The realm celebrates your victories!`,
        `Outstanding performance, ${userName}! You're setting the gold standard for everyone!`,
        `${userName}, you're on fire! Your positive momentum is unstoppable!`
      ];

      const goodMessages = [
        `Great job, ${userName}! You're making solid progress on your journey!`,
        `Well done, ${userName}! Your efforts are paying off beautifully!`,
        `Keep it up, ${userName}! You're building amazing habits day by day!`,
        `Nice work, ${userName}! Your positive choices are making a real difference!`,
        `${userName}, you're moving in the right direction! Stay the course!`
      ];

      const encouragingMessages = [
        `${userName}, every small step counts! You're stronger than you realize!`,
        `Remember, ${userName}, growth happens one day at a time. You've got this!`,
        `${userName}, progress isn't always perfect, and that's perfectly okay!`,
        `Tomorrow is a fresh start, ${userName}! Your potential is unlimited!`,
        `${userName}, diamonds are formed under pressure. You're becoming brilliant!`
      ];

      const balancedMessages = [
        `${userName}, you're finding your rhythm! Balance is the key to lasting change!`,
        `${userName}, steady progress is still progress! You're doing great!`,
        `${userName}, life is about harmony, and you're learning the perfect tune!`,
        `${userName}, like the ocean tides, your journey has natural ebbs and flows!`,
        `${userName}, you're painting a beautiful picture of growth and self-discovery!`
      ];

      let messageArray;
      if (netScore >= 5) messageArray = excellentMessages;
      else if (netScore >= 2) messageArray = goodMessages;
      else if (isBalanced) messageArray = balancedMessages;
      else messageArray = encouragingMessages;

      // Add specific habit mentions for extra personalization
      const randomIndex = Math.floor(Math.random() * messageArray.length);
      let message = messageArray[randomIndex];
      
      if (bestHabit && bestHabit.completed > 0) {
        const habitBoosts = [
          ` Your excellence in "${bestHabit.name}" shows your true potential!`,
          ` Keep shining with "${bestHabit.name}" - you're a natural!`,
          ` "${bestHabit.name}" is clearly your superpower!`,
          ` Your mastery of "${bestHabit.name}" inspires others!`
        ];
        message += habitBoosts[Math.floor(Math.random() * habitBoosts.length)];
      }

      return message;
    }

    const encouragingMessage = getEncouragingMessage();

    return (
      <View>
        {/* Title Badges Row */}
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <View style={{ 
            flex: 1, 
            marginRight: 6,
            backgroundColor: colors.airSuperiorityBlue,
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: colors.prussianBlue,
          }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 6, fontWeight: '600' }}>Recent Title</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {getTitleIcon(recentTitle, 16)}
              <Text style={{ marginLeft: 6, color: colors.cultured, fontWeight: 'bold', fontSize: 12 }}>{recentTitle}</Text>
            </View>
          </View>
          <View style={{ 
            flex: 1,
            marginLeft: 6,
            backgroundColor: colors.airSuperiorityBlue,
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: colors.prussianBlue,
          }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 6, fontWeight: '600' }}>Most Renowned</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {getTitleIcon(frequentTitle, 16)}
              <Text style={{ marginLeft: 6, color: colors.cultured, fontWeight: 'bold', fontSize: 12 }}>{frequentTitle}</Text>
            </View>
          </View>
        </View>

        {/* Habit Performance Row */}
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <View style={{ 
            flex: 1, 
            marginRight: 6,
            backgroundColor: `${colors.prussianBlue}10`,
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: colors.prussianBlue,
          }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 6, fontWeight: '600' }}>Best Habit</Text>
            <Text style={{ color: colors.prussianBlue, fontWeight: 'bold', fontSize: 13 }}>{bestHabit ? bestHabit.name : '—'}</Text>
          </View>
          <View style={{ 
            flex: 1,
            marginLeft: 6,
            backgroundColor: `${colors.fireBrick}10`,
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: colors.fireBrick,
          }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 6, fontWeight: '600' }}>Needs Focus</Text>
            <Text style={{ color: colors.fireBrick, fontWeight: 'bold', fontSize: 13 }}>{worstHabit ? worstHabit.name : '—'}</Text>
          </View>
        </View>

        {/* Chronicle Message */}
        <View style={{ 
          backgroundColor: `${colors.prussianBlue}08`,
          borderRadius: 12,
          padding: 14,
          borderWidth: 1,
          borderColor: colors.prussianBlue,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MaterialCommunityIcons name="heart" size={16} color={colors.prussianBlue} style={{ marginRight: 6 }} />
            <Text style={{ color: colors.prussianBlue, fontSize: 11, fontWeight: '600' }}>A Word For You</Text>
          </View>
          <Text style={{ color: colors.gunmetal, fontSize: 13, lineHeight: 19 }}>{encouragingMessage}</Text>
        </View>
      </View>
    );
  }

  // Winner for last week (demo: use kingdom.lastWeekWinner or calculate)
  let lastWeekWinner = kingdom && kingdom.lastWeekWinner;
  // For demo, calculate based on stored stats if not present
  if (!lastWeekWinner && kingdom && kingdom.lastWeekStats) {
    lastWeekWinner = kingdom.lastWeekStats.percent >= 50 ? 'Medieval' : 'Vampires';
  }

  // Overall: count wins for each side (demo: use stored or calculate)
  let medievalWins = kingdom && kingdom.medievalWins ? kingdom.medievalWins : 0;
  let vampireWins = kingdom && kingdom.vampireWins ? kingdom.vampireWins : 0;
  // If not present, try to count from weeklyWinners object
  if ((!medievalWins && !vampireWins) && kingdom && kingdom.weeklyWinners) {
    Object.values(kingdom.weeklyWinners).forEach(w => {
      if (w === 'kingdom' || w === 'Medieval') medievalWins++;
      if (w === 'vampires' || w === 'Vampires') vampireWins++;
    });
  }

  // Helper to get battle log for a week
  function getWeekBattleLog(weekKey) {
    if (!kingdom || !kingdom.weeklyStats || !kingdom.weeklyStats[weekKey]) return 'No data for this week.';
    const stats = kingdom.weeklyStats[weekKey];
    
    // Calculate total positive and negative habits completed from habit history
    let totalPositive = 0, totalNegative = 0;
    if (kingdom.habitHistory) {
      // Get the date range for the week
      const [year, weekNum] = weekKey.split('-W');
      
      // Calculate the Sunday of the given week
      const jan1 = new Date(Number(year), 0, 1);
      const jan1Day = jan1.getDay();
      
      // Find first Sunday of the year
      const firstSunday = new Date(jan1);
      firstSunday.setDate(jan1.getDate() + (7 - jan1Day) % 7);
      
      // Calculate the Sunday of the target week
      const sunday = new Date(firstSunday);
      sunday.setDate(firstSunday.getDate() + (Number(weekNum) - 1) * 7);
      
      // Sum up good and bad habits for all members for all 7 days of the week
      Object.keys(kingdom.habitHistory).forEach(memberUid => {
        const memberHistory = kingdom.habitHistory[memberUid];
        for (let i = 0; i < 7; i++) {
          const d = new Date(sunday);
          d.setDate(sunday.getDate() + i);
          const dateKey = d.toISOString().slice(0, 10);
          if (memberHistory && memberHistory[dateKey]) {
            totalPositive += memberHistory[dateKey].good || 0;
            totalNegative += memberHistory[dateKey].bad || 0;
          }
        }
      });
    }
    
    const winner = stats.winner === 'kingdom' ? 'Medieval' : 'Vampire';
    const winnerDesc = stats.winner === 'kingdom' ? 'triumphed over the darkness' : 'seized control of the night';
    
    return `The chronicles tell of ${weekKey} when ${kingdom?.name || 'the Kingdom'} faced the eternal struggle. ${members.length} valiant souls answered the call to battle.

The Keep scored ${stats.percent ?? '—'}% against the forces of darkness. In this week's campaign, warriors completed ${totalPositive} positive habits while succumbing to ${totalNegative} negative temptations.

Our brightest champion was ${stats.mvpName || 'a steadfast warrior'} — honored as ${stats.mvpDesc || 'defender of the realm'} for their unwavering dedication.

The realm's most tended virtues: ${(stats.topHabits || []).join(', ') || 'none recorded'}. The shadows most neglected: ${(stats.neglected || []).join(', ') || 'none recorded'}.

Thus ${winner} forces ${winnerDesc}, and the week passed into legend.`;
  }
  
  // Helper to get overall battle log
  function getOverallBattleLog() {
    if (!kingdom || !kingdom.weeklyStats) return 'No data.';
    
    let totalPercent = 0, count = 0, medievalWins = 0, vampireWins = 0;
    let mvpCounts = {}, topHabits = {}, neglected = {};
    let totalPositive = 0, totalNegative = 0;
    
    Object.entries(kingdom.weeklyStats).forEach(([week, stats]) => {
      if (stats.percent != null) { totalPercent += stats.percent; count++; }
      if (stats.winner === 'kingdom' || stats.winner === 'Medieval') medievalWins++;
      if (stats.winner === 'vampires' || stats.winner === 'Vampires') vampireWins++;
      if (stats.mvpName) mvpCounts[stats.mvpName] = (mvpCounts[stats.mvpName] || 0) + 1;
      (stats.topHabits || []).forEach(h => { topHabits[h] = (topHabits[h] || 0) + 1; });
      (stats.neglected || []).forEach(h => { neglected[h] = (neglected[h] || 0) + 1; });
      
      // Calculate total positive and negative habits from habit history for this week
      if (kingdom.habitHistory) {
        // Get the date range for the week
        const [year, weekNum] = week.split('-W');
        
        // Calculate the Sunday of the given week
        const jan1 = new Date(Number(year), 0, 1);
        const jan1Day = jan1.getDay();
        
        // Find first Sunday of the year
        const firstSunday = new Date(jan1);
        firstSunday.setDate(jan1.getDate() + (7 - jan1Day) % 7);
        
        // Calculate the Sunday of the target week
        const sunday = new Date(firstSunday);
        sunday.setDate(firstSunday.getDate() + (Number(weekNum)) * 7);
        
        // Sum up good and bad habits for all members for all 7 days of the week
        Object.keys(kingdom.habitHistory).forEach(memberUid => {
          const memberHistory = kingdom.habitHistory[memberUid];
          for (let i = 0; i < 7; i++) {
            const d = new Date(sunday);
            d.setDate(sunday.getDate() + i);
            const dateKey = d.toISOString().slice(0, 10);
            if (memberHistory && memberHistory[dateKey]) {
              totalPositive += memberHistory[dateKey].good || 0;
              totalNegative += memberHistory[dateKey].bad || 0;
            }
          }
        });
      }
    });
    
    const avgPercent = count ? Math.round(totalPercent / count) : 0;
    const topMVP = Object.entries(mvpCounts).sort((a,b) => b[1]-a[1])[0]?.[0] || 'unknown champion';
    const topHabit = Object.entries(topHabits).sort((a,b) => b[1]-a[1])[0]?.[0] || 'various virtues';
    const mostNeglected = Object.entries(neglected).sort((a,b) => b[1]-a[1])[0]?.[0] || 'various shadows';
    
    const totalWeeks = count;
    const dominantForce = medievalWins > vampireWins ? 'Medieval' : 'Vampire';
    const dominantDesc = medievalWins > vampireWins ? 'light has prevailed over darkness' : 'shadows have grown stronger';
    
    return `The grand chronicle of ${kingdom?.name || 'the Kingdom'} spans ${totalWeeks} weeks of eternal struggle between light and shadow.

Across all battles, the realm achieved an average score of ${avgPercent}% against the forces of darkness. In total, ${totalPositive} positive habits were forged while ${totalNegative} negative temptations claimed victory.

The eternal conflict stands: ${medievalWins} Medieval victories against ${vampireWins} Vampire conquests. Thus far, ${dominantDesc} in this age-long war.

Our most celebrated champion: ${topMVP}, who has risen to glory most frequently. The realm's most practiced virtue: ${topHabit}. The most persistent shadow: ${mostNeglected}.

So the chronicle continues, each week adding to the legend of ${kingdom?.name || 'the Kingdom'}...`;
  }

  // Function to calculate points for a user
  function calculateUserPoints(user) {
    let goodPts = 0, badPts = 0;
    if (user.habits) {
      Object.values(user.habits).forEach(h => {
        const comp = h.completed || 0;
        const diff = h.difficulty || 1;
        if (h.type === 'good') goodPts += comp * diff;
        else badPts += comp * diff;
      });
    }
    return goodPts - badPts;
  }

  // Sort members by points (highest first)
  const sortedMembers = React.useMemo(() => {
    if (!members || members.length === 0) return [];
    return [...members].sort((a, b) => calculateUserPoints(b) - calculateUserPoints(a));
  }, [members]);

  return (
    <View style={styles.safeArea}>
      <FlatList
        data={(tab === 1 || tab === 2) ? sortedMembers : []}
        keyExtractor={item => item.uid}
        ListHeaderComponent={(
          <View>
            {/* Screen header */}
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
                  Kingdom Stats
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '600' }}>Chronicles, winners, and weekly deeds</Text>
              </View>
            </View>
            {/* Kingdom image and name */}
            {kingdom && (
              <View style={{ alignItems: 'center', marginBottom: 18 }}>
                {kingdom.pfp && (
                  <Image source={{ uri: kingdom.pfp }} style={{ width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: colors.prussianBlue, marginBottom: 10 }} />
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textDark }}>{kingdom.name || 'Your Kingdom'}</Text>
                  {kingdom && kingdom.code && (
                    <TouchableOpacity
                      onPress={() => {
                        Clipboard.setString(kingdom.code);
                        Alert.alert('Copied!', 'Kingdom code copied to clipboard.');
                      }}
                      style={{ 
                        marginLeft: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.prussianBlue,
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        shadowColor: colors.prussianBlue,
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        shadowOffset: { width: 0, height: 2 },
                        elevation: 2,
                      }}
                    >
                      <MaterialCommunityIcons name="key-variant" size={16} color={colors.cultured} />
                      <Text style={{ color: colors.cultured, marginLeft: 6, fontWeight: '700', fontSize: 12 }}>Code</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {/* computed kingdom title under the name */}
                <Text style={{ color: colors.textMuted, fontSize: 13, fontStyle: 'italic' }}>{kingdomTitle}</Text>
              </View>
            )}
            {/* General stats (clean, no boxes) */}
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}>
              {generalStats.map((stat, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <Text style={{ color: colors.textMuted, marginHorizontal: 10, fontSize: 12 }}>•</Text>
                  )}
                  <Text style={{ color: colors.prussianBlue, fontWeight: '800', fontSize: 12 }}>{stat.value}</Text>
                  <Text style={{ color: colors.textMuted, marginLeft: 4, fontSize: 12 }}>{stat.label}</Text>
                </React.Fragment>
              ))}
            </View>
            <View style={{ height: 2, backgroundColor: colors.textMuted, marginVertical: 10, width: '90%', alignSelf: 'center', borderRadius: 2 }} />
            {/* Tabs */}
            <View style={{ 
              flexDirection: 'row', 
              marginBottom: 16,
            }}>
              <TabButton label="Chronicle" active={tab === 0} onPress={() => setTab(0)} />
              <TabButton label="Last Week" active={tab === 1} onPress={() => setTab(1)} />
              <TabButton label="Overall" active={tab === 2} onPress={() => setTab(2)} />
            </View>

            {/* Winner/summary for last week and overall */}
            {tab === 1 && (
              <View style={{ marginBottom: 16 }}>
                {/* Winner Icon Display */}
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ 
                    backgroundColor: lastWeekWinner === 'kingdom' || lastWeekWinner === 'Medieval' ? `${colors.prussianBlue}15` : `${colors.fireBrick}15`,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 2,
                    borderColor: lastWeekWinner === 'kingdom' || lastWeekWinner === 'Medieval' ? colors.prussianBlue : colors.fireBrick,
                    shadowColor: lastWeekWinner === 'kingdom' || lastWeekWinner === 'Medieval' ? colors.prussianBlue : colors.fireBrick,
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 3,
                  }}>
                    <MaterialCommunityIcons 
                      name={lastWeekWinner === 'kingdom' || lastWeekWinner === 'Medieval' ? "shield-crown" : "bat"} 
                      size={32} 
                      color={lastWeekWinner === 'kingdom' || lastWeekWinner === 'Medieval' ? colors.prussianBlue : colors.fireBrick}
                    />
                  </View>
                  <Text style={{ 
                    color: lastWeekWinner === 'kingdom' || lastWeekWinner === 'Medieval' ? colors.prussianBlue : colors.fireBrick, 
                    fontSize: 14, 
                    fontWeight: 'bold',
                    marginTop: 8,
                  }}>
                    Winner
                  </Text>
                </View>

                {/* Battle Log Button */}
                <View style={{ alignItems: 'center' }}>
                  <TouchableOpacity
                    onPress={() => setShowBattleReport(s => !s)}
                    style={{ 
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.cultured, 
                      paddingVertical: 12, 
                      paddingHorizontal: 20, 
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: colors.prussianBlue,
                      shadowColor: '#000',
                      shadowOpacity: 0.1,
                      shadowRadius: 6,
                      shadowOffset: { width: 0, height: 3 },
                      elevation: 3,
                    }}
                  >
                    <Text style={{ color: colors.prussianBlue, fontWeight: 'bold', fontSize: 14 }}>
                      {showBattleReport ? 'Hide Battle Chronicle' : 'View Battle Chronicle'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Battle Report Card */}
                {showBattleReport && (
                  <View style={{ 
                    marginTop: 16, 
                    backgroundColor: colors.cultured, 
                    borderRadius: 16, 
                    padding: 18, 
                    borderWidth: 2, 
                    borderColor: colors.silver, 
                    shadowColor: '#000', 
                    shadowOpacity: 0.08, 
                    shadowRadius: 12, 
                    shadowOffset: { width: 0, height: 6 }, 
                    elevation: 4,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <MaterialCommunityIcons name="sword-cross" size={20} color={colors.prussianBlue} style={{ marginRight: 8 }} />
                      <Text style={{ fontSize: 16, color: colors.richBlack, fontWeight: 'bold' }}>Battle Chronicle — Last Week</Text>
                    </View>
                    <View style={{
                      backgroundColor: `${colors.prussianBlue}05`,
                      borderRadius: 12,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: colors.silver,
                    }}>
                      {/* Calculate positive and negative habits from last week grid data */}
                      {(() => {
                        let totalPositive = 0, totalNegative = 0;
                        if (kingdom?.habitHistory) {
                          // Calculate for last week (Sunday to Saturday)
                          const today = new Date();
                          const offsetToLastSunday = (today.getDay()) % 7;
                          const lastSunday = new Date(today);
                          lastSunday.setDate(today.getDate() - offsetToLastSunday);
                          
                          // Sum up good and bad habits for all members for all 7 days of last week
                          Object.keys(kingdom.habitHistory).forEach(memberUid => {
                            const memberHistory = kingdom.habitHistory[memberUid];
                            for (let i = 0; i < 7; i++) {
                              const d = new Date(lastSunday);
                              d.setDate(lastSunday.getDate() + i);
                              const dateKey = d.toISOString().slice(0, 10);
                              if (memberHistory[dateKey]) {
                                totalPositive += memberHistory[dateKey].good || 0;
                                totalNegative += memberHistory[dateKey].bad || 0;
                              }
                            }
                          });
                        }
                        
                        const winner = kingdom?.lastWeekStats?.winner === 'kingdom' ? 'Medieval' : 'Vampire';
                        const winnerDesc = kingdom?.lastWeekStats?.winner === 'kingdom' ? 'triumphed over the darkness' : 'seized control of the night';
                        
                        return (
                          <Text style={{ color: colors.gunmetal, fontSize: 14, lineHeight: 22 }}>
                            The chronicles tell of last week when {kingdom?.name || 'the Kingdom'} faced the eternal struggle. {members.length} valiant souls answered the call to battle.{'\n\n'}
                            The Keep scored {kingdom?.lastWeekStats?.percent ?? '—'}% against the forces of darkness. In this week's campaign, warriors completed {totalPositive} positive habits while succumbing to {totalNegative} negative temptations.{'\n\n'}
                            Our brightest champion was {kingdom?.lastWeekStats?.mvpName || 'a steadfast warrior'} — honored as {kingdom?.lastWeekStats?.mvpDesc || 'defender of the realm'} for their unwavering dedication.{'\n\n'}
                            The realm's most tended virtues: {kingdom?.lastWeekStats?.topHabits ? kingdom.lastWeekStats.topHabits.join(', ') : 'none recorded'}. The shadows most neglected: {kingdom?.lastWeekStats?.neglected ? kingdom.lastWeekStats.neglected.join(', ') : 'none recorded'}.{'\n\n'}
                            Thus {winner} forces {winnerDesc}, and the week passed into legend.
                          </Text>
                        );
                      })()}
                    </View>
                    <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 12, textAlign: 'center', fontStyle: 'italic' }}>
                      A narrative forged from the kingdom's deeds — preserved in the royal archives
                    </Text>
                  </View>
                )}
              </View>
            )}
            {tab === 2 && (
              <View>
                {/* Win Count Icons */}
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Medieval Wins */}
                    <View style={{ 
                      alignItems: 'center', 
                      backgroundColor: `${colors.prussianBlue}15`,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 2,
                      borderColor: colors.prussianBlue,
                      marginRight: 20,
                      shadowColor: colors.prussianBlue,
                      shadowOpacity: 0.15,
                      shadowRadius: 6,
                      shadowOffset: { width: 0, height: 3 },
                      elevation: 2,
                    }}>
                      <MaterialCommunityIcons name="shield-crown" size={28} color={colors.prussianBlue} />
                      <Text style={{ color: colors.prussianBlue, fontWeight: 'bold', fontSize: 16, marginTop: 6 }}>
                        {medievalWins}
                      </Text>
                      <Text style={{ color: colors.prussianBlue, fontSize: 11, fontWeight: '600' }}>Medieval</Text>
                    </View>
                    
                    {/* VS Indicator */}
                    <View style={{
                      backgroundColor: colors.gunmetal,
                      borderRadius: 12,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      marginHorizontal: 8,
                    }}>
                      <Text style={{ color: colors.cultured, fontSize: 12, fontWeight: 'bold' }}>VS</Text>
                    </View>
                    
                    {/* Vampire Wins */}
                    <View style={{ 
                      alignItems: 'center', 
                      backgroundColor: `${colors.fireBrick}15`,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 2,
                      borderColor: colors.fireBrick,
                      marginLeft: 20,
                      shadowColor: colors.fireBrick,
                      shadowOpacity: 0.15,
                      shadowRadius: 6,
                      shadowOffset: { width: 0, height: 3 },
                      elevation: 2,
                    }}>
                      <MaterialCommunityIcons name="bat" size={28} color={colors.fireBrick} />
                      <Text style={{ color: colors.fireBrick, fontWeight: 'bold', fontSize: 16, marginTop: 6 }}>
                        {vampireWins}
                      </Text>
                      <Text style={{ color: colors.fireBrick, fontSize: 11, fontWeight: '600' }}>Vampire</Text>
                    </View>
                  </View>
                </View>
                
                {/* Battle Log Button - Always Overall */}
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <TouchableOpacity
                    onPress={() => setShowBattleReport(v => !v)}
                    style={{ 
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: colors.cultured, 
                      paddingVertical: 12, 
                      paddingHorizontal: 20, 
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: colors.prussianBlue,
                      shadowColor: '#000',
                      shadowOpacity: 0.1,
                      shadowRadius: 6,
                      shadowOffset: { width: 0, height: 3 },
                      elevation: 3,
                    }}
                  >
                    <MaterialCommunityIcons 
                      name={showBattleReport ? "chevron-up" : "book-open-page-variant"} 
                      size={18} 
                      color={colors.prussianBlue}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{ color: colors.prussianBlue, fontWeight: 'bold', fontSize: 14 }}>
                      {showBattleReport ? 'Hide Overall Chronicle' : 'View Overall Chronicle'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {/* Battle Report Card - Always Overall */}
                {showBattleReport && (
                  <View style={{ 
                    marginBottom: 16, 
                    backgroundColor: colors.cultured, 
                    borderRadius: 16, 
                    padding: 18, 
                    borderWidth: 2, 
                    borderColor: colors.silver, 
                    shadowColor: '#000', 
                    shadowOpacity: 0.08, 
                    shadowRadius: 12, 
                    shadowOffset: { width: 0, height: 6 }, 
                    elevation: 4,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <MaterialCommunityIcons name="book-open-page-variant" size={20} color={colors.prussianBlue} style={{ marginRight: 8 }} />
                      <Text style={{ fontSize: 16, color: colors.richBlack, fontWeight: 'bold' }}>
                        Overall Battle Chronicle
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: `${colors.prussianBlue}05`,
                      borderRadius: 12,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: colors.silver,
                    }}>
                      <Text style={{ color: colors.gunmetal, fontSize: 14, lineHeight: 22 }}>
                        {getOverallBattleLog()}
                      </Text>
                    </View>
                    <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 12, textAlign: 'center', fontStyle: 'italic' }}>
                      A narrative forged from the kingdom's deeds — preserved in the royal archives
                    </Text>
                  </View>
                )}
              </View>
            )}
            {/* Personal stats panel */}
            {tab === 0 && userData && (
              <View style={{ backgroundColor: colors.cultured, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 2, borderColor: colors.silver, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <MaterialCommunityIcons name="account-star" size={20} color={colors.prussianBlue} style={{ marginRight: 8 }} />
                  <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.richBlack }}>Your Chronicle</Text>
                </View>
                <PersonalStats user={userData} />
              </View>
            )}
          </View>
        )}
        renderItem={({ item, index }) => {
            // Determine which week key to use - Overall tab always uses overall stats
            let funTitle;
            if (tab === 1) {
              funTitle = getLastWeekTitle(item);
            } else if (tab === 2) {
              funTitle = getMostFrequentTitle(item);
            } else {
              funTitle = getFunTitle(item, weekKey);
            }

            // Completions - Overall tab always shows total completions
            let completions = 0;
            if (tab === 1) {
              completions = item.lastWeekCompletions || (item.weeklyCompletions && item.weeklyCompletions[lastWeekKey]) || 0;
            } else if (tab === 2 && item.weeklyCompletions) {
              completions = Object.values(item.weeklyCompletions).reduce((a, b) => a + (b || 0), 0);
            }

            // --- Grid logic ---
            let days = [];
            if (tab === 1) {
              // Last Week: 7 days, previous Sunday-Saturday
              const today = new Date();
              const offsetToLastSunday = (today.getDay() + 7) % 7 + 7;
              const start = new Date(today);
              start.setDate(start.getDate() - offsetToLastSunday);
              for (let i = 0; i < 7; i++) {
                const d = new Date(start);
                d.setDate(start.getDate() + i);
                const key = d.toISOString().slice(0, 10);
                let val = 0;
                if (item.habitHistory && item.habitHistory[key]) {
                  val = (item.habitHistory[key].good || 0) - (item.habitHistory[key].bad || 0);
                }
                days.push(val);
              }
            } else if (tab === 2) {
              // Overall: 10 weeks (70 days), paged, always show 70 days (pad with blanks if needed)
              let weeks = availableWeeks.slice(overallGridPage * 10, overallGridPage * 10 + 10);
              if (weeks.length < 10) {
                weeks = weeks.concat(Array(10 - weeks.length).fill(null));
              }
              days = [];
              for (let w = 0; w < 10; w++) {
                if (!weeks[w]) {
                  // Pad 7 days of blanks
                  for (let i = 0; i < 7; i++) days.push(null);
                  continue;
                }
                // For each week, get Sunday-Saturday
                const weekStr = weeks[w];
                const [year, weekNum] = weekStr.split('-W');
                // Find the Sunday of this week
                const firstDayOfYear = new Date(Number(year), 0, 1);
                const daysOffset = (Number(weekNum) - 1) * 7;
                let sunday = new Date(firstDayOfYear);
                sunday.setDate(firstDayOfYear.getDate() + daysOffset);
                // Adjust to Sunday
                while (sunday.getDay() !== 0) sunday.setDate(sunday.getDate() - 1);
                for (let i = 0; i < 7; i++) {
                  const d = new Date(sunday);
                  d.setDate(sunday.getDate() + i);
                  const key = d.toISOString().slice(0, 10);
                  let val = null;
                  if (item.habitHistory && item.habitHistory[key]) {
                    val = (item.habitHistory[key].good || 0) - (item.habitHistory[key].bad || 0);
                  }
                  days.push(val);
                }
              }
            }

            function getDayColor(val) {
              if (val > 0) {
                const intensity = Math.min(1, val / 3);
                // prussian-blue #003049 -> rgb(0,48,73)
                return `rgba(0,48,73,${0.18 + 0.62 * intensity})`;
              } else if (val < 0) {
                const intensity = Math.min(1, Math.abs(val) / 3);
                // fire-brick #c1121f -> rgb(193,18,31)
                return `rgba(193,18,31,${0.18 + 0.62 * intensity})`;
              } else {
                return colors.cultured;
              }
            }

            return (
              <View style={{ 
                backgroundColor: colors.cultured, 
                borderRadius: 16, 
                padding: 16, 
                marginBottom: 12, 
                borderWidth: 2, 
                borderColor: index === 0 ? colors.prussianBlue : colors.silver,
                shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3,
              }}>
                {/* Header Row with Avatar, Name, and Points - Clickable */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setExpanded(e => ({ ...e, [item.uid]: !e[item.uid] }))}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                >
                  {item.avatarUrl ? (
                    <Image source={{ uri: item.avatarUrl }} style={[styles.avatar, { borderColor: index === 0 ? colors.prussianBlue : colors.silver, width: 48, height: 48 }]} />
                  ) : (
                    <View style={[styles.avatar, { backgroundColor: colors.gunmetal, borderColor: index === 0 ? colors.prussianBlue : colors.silver, alignItems: 'center', justifyContent: 'center', width: 48, height: 48 }]}>
                      <MaterialCommunityIcons name="account" size={28} color={colors.prussianBlue} />
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ fontSize: 18, color: colors.richBlack, fontWeight: 'bold', marginRight: 8 }}>
                        {index + 1}. {item.displayName || 'User'}
                      </Text>
                      {/* Show (positive/negative habits) next to name */}
                      {item.habits && (
                        <View style={{ 
                          backgroundColor: colors.airSuperiorityBlue,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: colors.prussianBlue,
                        }}>
                          <Text style={{ fontSize: 11, color: colors.cultured, fontWeight: '600' }}>
                            <Text style={{ color: colors.cultured }}>
                              {Object.values(item.habits).filter(h => h.type === 'good').length}
                            </Text>
                            {' - '}
                            <Text style={{ color: colors.cultured }}>
                              {Object.values(item.habits).filter(h => h.type === 'bad').length}
                            </Text>
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {getTitleIcon(funTitle, 14)}
                      <Text style={{ 
                        color: colors.gunmetal, 
                        fontSize: 13, 
                        fontWeight: '600',
                        marginLeft: 6,
                        fontStyle: 'italic',
                      }}>{funTitle}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: colors.prussianBlue, fontWeight: 'bold', fontSize: 18 }}>
                      {/* Points: (good*diff) - (bad*diff) */}
                      {(() => {
                        let goodPts = 0, badPts = 0;
                        if (item.habits) {
                          Object.values(item.habits).forEach(h => {
                            const comp = h.completed || 0;
                            const diff = h.difficulty || 1;
                            if (h.type === 'good') goodPts += comp * diff;
                            else badPts += comp * diff;
                          });
                        }
                        return (goodPts - badPts) + ' pts';
                      })()}
                    </Text>
                    <Text style={{ color: colors.gunmetal, fontSize: 12 }}>
                      {/* +#/-# = total positive/negative completions */}
                      {(() => {
                        let good = 0, bad = 0;
                        if (item.habits) {
                          Object.values(item.habits).forEach(h => {
                            const comp = h.completed || 0;
                            if (h.type === 'good') good += comp;
                            else bad += comp;
                          });
                        }
                        return `+${good} / -${bad}`;
                      })()}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Contribution Grid Section - Only show when expanded */}
                {expanded[item.uid] && (
                  <View style={{ 
                    backgroundColor: `${colors.prussianBlue}05`,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.silver,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ color: colors.gunmetal, fontWeight: '600', fontSize: 13 }}>
                        {tab === 1 ? 'Last Week Activity' : 'Recent Activity'}
                      </Text>
                      {/* Paging arrows for overall grid if more than 10 weeks */}
                      {tab === 2 && availableWeeks.length > 10 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <TouchableOpacity
                            onPress={() => setOverallGridPage(p => Math.max(0, p - 1))}
                            disabled={overallGridPage === 0}
                            style={{ opacity: overallGridPage === 0 ? 0.3 : 1, padding: 2, marginRight: 4 }}
                          >
                            <MaterialCommunityIcons name="chevron-left" size={16} color={colors.prussianBlue} />
                          </TouchableOpacity>
                          <Text style={{ color: colors.gunmetal, fontSize: 10 }}>
                            {overallGridPage * 10 + 1}-{Math.min(availableWeeks.length, (overallGridPage + 1) * 10)}
                          </Text>
                          <TouchableOpacity
                            onPress={() => setOverallGridPage(p => p + 1)}
                            disabled={(overallGridPage + 1) * 10 >= availableWeeks.length}
                            style={{ opacity: (overallGridPage + 1) * 10 >= availableWeeks.length ? 0.3 : 1, padding: 2, marginLeft: 4 }}
                          >
                            <MaterialCommunityIcons name="chevron-right" size={16} color={colors.prussianBlue} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    
                    {tab === 1 ? (
                      <View style={{ alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 7 * 16, marginBottom: 4 }}>
                          {days.map((val, i) => (
                            <View key={i} style={{ 
                              width: 14, 
                              height: 14, 
                              borderRadius: 2, 
                              margin: 1, 
                              backgroundColor: val === null ? colors.cultured : getDayColor(val), 
                              borderWidth: 1, 
                              borderColor: colors.silver, 
                            }} />
                          ))}
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 7 * 16 }}>
                          {[...Array(7)].map((_, i) => (
                            <Text key={i} style={{ fontSize: 9, color: colors.gunmetal, textAlign: 'center' }}>{['S','M','T','W','T','F','S'][i]}</Text>
                          ))}
                        </View>
                      </View>
                    ) : (
                      <View style={{ alignItems: 'center' }}>
                        {/* Compact grid for overall view */}
                        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                          {/* Left stack (weeks 5-9, rendered from bottom to top) */}
                          <View style={{ flexDirection: 'column', marginRight: 8 }}>
                            {[9,8,7,6,5].map(weekIdx => (
                              <View key={weekIdx} style={{ flexDirection: 'row', marginBottom: 1 }}>
                                {days.slice(weekIdx*7, weekIdx*7+7).map((val, i) => (
                                  <View key={i} style={{ 
                                    width: 12, 
                                    height: 12, 
                                    borderRadius: 2, 
                                    margin: 0.5, 
                                    backgroundColor: val === null ? colors.cultured : getDayColor(val), 
                                    borderWidth: 1, 
                                    borderColor: colors.silver, 
                                  }} />
                                ))}
                              </View>
                            ))}
                          </View>
                          {/* Right stack (weeks 0-4, rendered from bottom to top) */}
                          <View style={{ flexDirection: 'column' }}>
                            {[4,3,2,1,0].map(weekIdx => (
                              <View key={weekIdx} style={{ flexDirection: 'row', marginBottom: 1 }}>
                                {days.slice(weekIdx*7, weekIdx*7+7).map((val, i) => (
                                  <View key={i} style={{ 
                                    width: 12, 
                                    height: 12, 
                                    borderRadius: 2, 
                                    margin: 0.5, 
                                    backgroundColor: val === null ? colors.cultured : getDayColor(val), 
                                    borderWidth: 1, 
                                    borderColor: colors.silver, 
                                  }} />
                                ))}
                              </View>
                            ))}
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 4 }}>
                          <Text style={{ fontSize: 9, color: colors.gunmetal, textAlign: 'center' }}>S M T W T F S</Text>
                          <View style={{ width: 16 }} />
                          <Text style={{ fontSize: 9, color: colors.gunmetal, textAlign: 'center' }}>S M T W T F S</Text>
                        </View>
                      </View>
                    )}
                    
                    <Text style={{ 
                      color: colors.textMuted, 
                      fontSize: 9, 
                      marginTop: 8, 
                      textAlign: 'center',
                      fontStyle: 'italic',
                    }}>
                      Blue = positive • Red = negative • Grey = neutral
                    </Text>
                  </View>
                )}
              </View>
            );
          }}
        ListEmptyComponent={(
          (tab === 1 || tab === 2)
            ? <View style={{
                backgroundColor: colors.cultured,
                borderRadius: 16,
                padding: 24,
                alignItems: 'center',
                marginTop: 12,
                shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2,
                borderWidth: 2,
                borderColor: colors.silver,
              }}>
                <MaterialCommunityIcons name="calendar-blank" size={36} color={colors.textMuted} style={{ marginBottom: 8 }} />
                <Text style={{ color: colors.gunmetal, textAlign: 'center' }}>No stats yet.</Text>
              </View>
            : null
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />

      {/* Week Picker Modal */}
      <Modal visible={showWeekPicker} animationType="fade" transparent>
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.7)', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{ 
            backgroundColor: colors.cultured,
            borderRadius: 20, 
            padding: 24, 
            width: '100%', 
            maxWidth: 350,
            maxHeight: '80%',
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 10 },
            elevation: 15,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
              paddingBottom: 16,
              borderBottomWidth: 2,
              borderBottomColor: colors.prussianBlue,
            }}>
              <MaterialCommunityIcons 
                name="calendar-week" 
                size={24} 
                color={colors.prussianBlue}
                style={{ marginRight: 10 }}
              />
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.richBlack,
                flex: 1,
              }}>
                Select Week
              </Text>
              <TouchableOpacity 
                onPress={() => setShowWeekPicker(false)}
                style={{
                  backgroundColor: colors.silver,
                  borderRadius: 20,
                  padding: 8,
                }}
              >
                <MaterialCommunityIcons name="close" size={20} color={colors.gunmetal} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={{ maxHeight: 300 }}
              showsVerticalScrollIndicator={false}
            >
              {availableWeeks.map((week, index) => (
                <TouchableOpacity
                  key={week}
                  onPress={() => {
                    setSelectedWeekKey(week);
                    setShowWeekPicker(false);
                  }}
                  style={{
                    backgroundColor: selectedWeekKey === week ? colors.airSuperiorityBlue : colors.white,
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 8,
                    borderWidth: 2,
                    borderColor: selectedWeekKey === week ? colors.prussianBlue : colors.silver,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: selectedWeekKey === week ? colors.prussianBlue : colors.richBlack,
                    }}>
                      {week}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: colors.textMuted,
                      marginTop: 2,
                    }}>
                      {index === 0 ? 'Most recent' : `${index + 1} weeks ago`}
                    </Text>
                  </View>
                  
                  {selectedWeekKey === week && (
                    <MaterialCommunityIcons 
                      name="check-circle" 
                      size={20} 
                      color={colors.prussianBlue}
                    />
                  )}
                </TouchableOpacity>
              ))}
              
              {availableWeeks.length === 0 && (
                <View style={{
                  alignItems: 'center',
                  padding: 20,
                }}>
                  <MaterialCommunityIcons 
                    name="calendar-blank" 
                    size={48} 
                    color={colors.textMuted}
                    style={{ marginBottom: 12 }}
                  />
                  <Text style={{
                    color: colors.textMuted,
                    fontSize: 16,
                    textAlign: 'center',
                  }}>
                    No weeks available yet
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
  }
