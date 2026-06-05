import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

const REFERRAL_CODE = 'IMB-ALEX-2026';

const REWARDS = [
  { id: 'r1', name: 'Sarah M.', date: '15 May 2026', reward: '$50', status: 'paid' },
  { id: 'r2', name: 'James T.', date: '3 Apr 2026', reward: '$50', status: 'paid' },
  { id: 'r3', name: 'Emma R.', date: '12 Mar 2026', reward: '$50', status: 'pending' },
];

export default function ReferralScreen() {
  const [copied, setCopied] = useState(false);
  const totalEarned = REWARDS.filter((r) => r.status === 'paid').length * 50;
  const pendingCount = REWARDS.filter((r) => r.status === 'pending').length;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join IMB Bank and get $50 cash when you open an account! Use my referral code: ${REFERRAL_CODE}\n\nSign up at imb.com.au/refer`,
        url: 'https://imb.com.au/refer',
        title: 'Refer a Friend to IMB Bank',
      });
    } catch {
      // Share dialog cancelled
    }
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert('Copied!', `Referral code ${REFERRAL_CODE} copied to clipboard.`);
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={{
        backgroundColor: Colors.primary,
        borderRadius: 20,
        padding: 24,
        gap: 12,
        overflow: 'hidden',
        borderCurve: 'continuous',
        boxShadow: '0 8px 24px rgba(0,75,90,0.25)',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="gift" size={22} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontFamily: Fonts.bold, color: Colors.white }}>Refer & Earn</Text>
            <Text style={{ fontSize: 13, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.7)' }}>Get $50 for every friend who joins</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 16 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 26, fontFamily: Fonts.bold, color: Colors.accent }}>${totalEarned}</Text>
            <Text style={{ fontSize: 11, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.65)' }}>Total Earned</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 26, fontFamily: Fonts.bold, color: Colors.accent }}>{REWARDS.length}</Text>
            <Text style={{ fontSize: 11, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.65)' }}>Referrals</Text>
          </View>
          {pendingCount > 0 && (
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 26, fontFamily: Fonts.bold, color: '#FFD54F' }}>{pendingCount}</Text>
              <Text style={{ fontSize: 11, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.65)' }}>Pending</Text>
            </View>
          )}
        </View>
        {/* Decorative circles */}
        <View style={{ position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.04)', right: -40, top: -40 }} />
      </View>

      {/* Your referral code */}
      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>
          Your Referral Code
        </Text>
        <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 20, borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, padding: 16, borderCurve: 'continuous' }}>
            <Text selectable style={{ flex: 1, fontSize: 22, fontFamily: Fonts.bold, color: Colors.primary, letterSpacing: 2 }}>
              {REFERRAL_CODE}
            </Text>
            <Pressable
              style={({ pressed }) => [{
                backgroundColor: copied ? '#E8F5E9' : Colors.primary,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                opacity: pressed ? 0.85 : 1,
              }]}
              onPress={handleCopy}
            >
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color={copied ? Colors.success : Colors.white} />
              <Text style={{ fontSize: 13, fontFamily: Fonts.semiBold, color: copied ? Colors.success : Colors.white }}>
                {copied ? 'Copied!' : 'Copy'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [{
              backgroundColor: Colors.accent,
              borderRadius: 12,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderCurve: 'continuous',
              opacity: pressed ? 0.85 : 1,
            }]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={18} color={Colors.primary} />
            <Text style={{ fontSize: 15, fontFamily: Fonts.bold, color: Colors.primary }}>Share with Friends</Text>
          </Pressable>
        </View>
      </View>

      {/* How it works */}
      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>
          How It Works
        </Text>
        <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
          {[
            { step: '1', icon: 'share-social-outline' as const, label: 'Share your code', desc: 'Send your unique referral code to friends and family' },
            { step: '2', icon: 'person-add-outline' as const, label: 'They open an account', desc: 'Friend opens an IMB account using your referral code' },
            { step: '3', icon: 'cash-outline' as const, label: 'Both earn $50', desc: 'You and your friend each receive $50 after 30 days' },
          ].map((item, idx, arr) => (
            <View
              key={item.step}
              style={{ flexDirection: 'row', alignItems: 'flex-start', padding: 16, gap: 14, borderBottomWidth: idx < arr.length - 1 ? 1 : 0, borderBottomColor: Colors.borderLight }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 15, fontFamily: Fonts.bold, color: Colors.white }}>{item.step}</Text>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ fontSize: 14, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>{item.label}</Text>
                <Text style={{ fontSize: 13, fontFamily: Fonts.regular, color: Colors.textSecondary, lineHeight: 18 }}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Referral history */}
      {REWARDS.length > 0 && (
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>
            Referral History
          </Text>
          <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
            {REWARDS.map((reward, idx) => (
              <View
                key={reward.id}
                style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: idx < REWARDS.length - 1 ? 1 : 0, borderBottomColor: Colors.borderLight, minHeight: 56 }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: reward.status === 'paid' ? '#E8F5E9' : '#FFF3E0', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={reward.status === 'paid' ? 'checkmark-circle' : 'time-outline'} size={20} color={reward.status === 'paid' ? Colors.success : Colors.warning} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: 14, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>{reward.name}</Text>
                  <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>{reward.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 3 }}>
                  <Text style={{ fontSize: 15, fontFamily: Fonts.bold, color: Colors.success }}>{reward.reward}</Text>
                  <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: reward.status === 'paid' ? '#E8F5E9' : '#FFF3E0' }}>
                    <Text style={{ fontSize: 10, fontFamily: Fonts.semiBold, color: reward.status === 'paid' ? Colors.success : Colors.warning, textTransform: 'capitalize' }}>
                      {reward.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ backgroundColor: Colors.infoBg, borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, borderCurve: 'continuous' }}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.info} />
        <Text style={{ flex: 1, fontSize: 12, fontFamily: Fonts.regular, color: Colors.textPrimary, lineHeight: 17 }}>
          Reward paid to your Everyday Account 30 days after friend opens and activates their account. Subject to IMB Referral Program T&Cs.
        </Text>
      </View>
    </ScrollView>
  );
}
