import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

const SCAM_TYPES = [
  'Impersonation (bank/government)',
  'Investment scam',
  'Romance scam',
  'Remote access scam',
  'Phishing email/SMS',
  'Fake product/service',
  'Other',
];

export default function ReportScamScreen() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selectedType) {
      Alert.alert('Required', 'Please select the type of scam.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required', 'Please describe what happened.');
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
        </View>
        <Text style={{ fontSize: 22, fontFamily: Fonts.bold, color: Colors.textPrimary, textAlign: 'center' }}>Report Submitted</Text>
        <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 }}>
          Your scam report has been lodged. Reference: SCM-{Date.now().toString().slice(-6)}.{'\n\n'}
          Our fraud team will review within 2 business days. If you believe money has been lost, please also call 133 462 immediately.
        </Text>
        <View style={{ backgroundColor: Colors.infoBg, borderRadius: 12, padding: 14, width: '100%' }}>
          <Text style={{ fontSize: 13, fontFamily: Fonts.medium, color: Colors.info, textAlign: 'center' }}>
            Also report to: Scamwatch.gov.au · 1300 292 371
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

        <View style={{ backgroundColor: '#FFF3E0', borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, borderCurve: 'continuous' }}>
          <Ionicons name="warning" size={20} color={Colors.warning} />
          <Text style={{ flex: 1, fontSize: 13, fontFamily: Fonts.regular, color: Colors.textPrimary, lineHeight: 18 }}>
            If you believe you have been scammed and money has been transferred, call us immediately on 133 462. Time is critical.
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Type of Scam</Text>
          {SCAM_TYPES.map((type) => (
            <Pressable
              key={type}
              style={({ pressed }) => [{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.white,
                borderRadius: 12,
                padding: 14,
                gap: 12,
                borderWidth: 2,
                borderColor: selectedType === type ? Colors.primary : 'transparent',
                borderCurve: 'continuous',
                opacity: pressed ? 0.8 : 1,
              }]}
              onPress={() => setSelectedType(type)}
            >
              <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: selectedType === type ? Colors.primary : Colors.border, alignItems: 'center', justifyContent: 'center' }}>
                {selectedType === type && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary }} />}
              </View>
              <Text style={{ fontSize: 14, fontFamily: Fonts.medium, color: Colors.textPrimary }}>{type}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Amount Lost (if any)</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, gap: 8, borderCurve: 'continuous' }}>
            <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.textSecondary }}>$</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="decimal-pad"
              style={{ flex: 1, fontSize: 16, fontFamily: Fonts.regular, color: Colors.textPrimary }}
            />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>What Happened?</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the scam in as much detail as possible..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={{ backgroundColor: Colors.white, borderRadius: 12, padding: 14, fontSize: 14, fontFamily: Fonts.regular, color: Colors.textPrimary, minHeight: 120, borderCurve: 'continuous' }}
          />
        </View>

        <Pressable
          style={({ pressed }) => [{
            backgroundColor: Colors.primary,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            borderCurve: 'continuous',
            opacity: pressed ? 0.85 : 1,
          }]}
          onPress={handleSubmit}
        >
          <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.white }}>Submit Report</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
