import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';
import { lookupBsb, formatBsb, isValidBsbFormat } from '@/utils/bsb-lookup';

const AVATAR_COLORS = ['#E91E63', '#9C27B0', '#2196F3', '#FF9800', '#4CAF50', '#F44336', '#607D8B', '#795548'];

function Field({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  keyboardType,
  maxLength,
  error,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  maxLength?: number;
  error?: string;
  autoCapitalize?: 'none' | 'words' | 'sentences';
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Text>
      <View style={{
        backgroundColor: Colors.white,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 13,
        borderCurve: 'continuous',
        borderWidth: 1.5,
        borderColor: error ? Colors.error : Colors.border,
      }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          style={{ fontSize: 15, fontFamily: Fonts.regular, color: Colors.textPrimary }}
        />
      </View>
      {error && <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.error }}>{error}</Text>}
    </View>
  );
}

export default function AddPayeeScreen() {
  const addPayee = useAppStore((s) => s.addPayee);

  const [name, setName] = useState('');
  const [bsb, setBsb] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const bsbDigits = bsb.replace(/\D/g, '');
  const bankInfo = bsbDigits.length >= 3 ? lookupBsb(bsb) : null;
  const bsbIsValid = isValidBsbFormat(bsb);

  const handleBSBChange = (val: string) => {
    setBsb(formatBsb(val));
    if (errors.bsb) setErrors((e) => ({ ...e, bsb: '' }));
  };

  const handleBSBBlur = () => {
    if (bsbDigits.length > 0 && !bsbIsValid) {
      setErrors((e) => ({ ...e, bsb: 'BSB must be exactly 6 digits (e.g. 641-800)' }));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Account name is required';
    if (!bsbIsValid) errs.bsb = 'Enter a valid 6-digit BSB (e.g. 641-800)';
    const acctDigits = accountNumber.replace(/\D/g, '');
    if (acctDigits.length < 6 || acctDigits.length > 10) {
      errs.accountNumber = 'Account number must be 6–10 digits';
    }
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    addPayee({
      name: name.trim(),
      bsb,
      accountNumber: accountNumber.trim(),
      nickname: nickname.trim() || undefined,
      avatarColour: selectedColor,
    });
    Alert.alert('Payee Added', `${name.trim()} has been added to your payees.`, [
      { text: 'Done', onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

        {/* Avatar preview */}
        <View style={{ alignItems: 'center', gap: 12 }}>
          <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: selectedColor, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 26, fontFamily: Fonts.bold, color: Colors.white }}>
              {name.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {AVATAR_COLORS.map((color) => (
              <Pressable
                key={color}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: color, borderWidth: selectedColor === color ? 3 : 0, borderColor: Colors.primary }}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>

        <Field
          label="Account Name *"
          value={name}
          onChangeText={(v) => { setName(v); if (errors.name) setErrors((e) => ({ ...e, name: '' })); }}
          placeholder="e.g. John Smith"
          autoCapitalize="words"
          error={errors.name}
        />

        {/* BSB with live bank lookup */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            BSB *
          </Text>
          <View style={{
            backgroundColor: Colors.white,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 13,
            borderCurve: 'continuous',
            borderWidth: 1.5,
            borderColor: errors.bsb ? Colors.error : bsbIsValid ? Colors.success : Colors.border,
          }}>
            <TextInput
              value={bsb}
              onChangeText={handleBSBChange}
              onBlur={handleBSBBlur}
              placeholder="XXX-XXX"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
              maxLength={7}
              style={{ fontSize: 15, fontFamily: Fonts.regular, color: Colors.textPrimary }}
            />
          </View>
          {/* Bank info row */}
          {bankInfo && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 2 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: bankInfo.color }} />
              <Text style={{ fontSize: 13, fontFamily: Fonts.medium, color: Colors.textPrimary, flex: 1 }}>{bankInfo.name}</Text>
              {bsbIsValid && <Ionicons name="checkmark-circle" size={15} color={Colors.success} />}
            </View>
          )}
          {!bankInfo && bsbDigits.length >= 3 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 2 }}>
              <Ionicons name="help-circle-outline" size={14} color={Colors.textSecondary} />
              <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>Unknown BSB prefix</Text>
            </View>
          )}
          {errors.bsb ? <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.error }}>{errors.bsb}</Text> : null}
        </View>

        <Field
          label="Account Number *"
          value={accountNumber}
          onChangeText={(v) => { setAccountNumber(v.replace(/\D/g, '')); if (errors.accountNumber) setErrors((e) => ({ ...e, accountNumber: '' })); }}
          placeholder="6–10 digits"
          keyboardType="numeric"
          maxLength={10}
          error={errors.accountNumber}
        />

        <Field
          label="Nickname (optional)"
          value={nickname}
          onChangeText={setNickname}
          placeholder="e.g. Mum, Rent, etc."
          autoCapitalize="words"
        />

        <View style={{ backgroundColor: Colors.infoBg, borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, borderCurve: 'continuous' }}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.info} />
          <Text style={{ flex: 1, fontSize: 13, fontFamily: Fonts.regular, color: Colors.textPrimary, lineHeight: 18 }}>
            Always verify the account name matches the recipient&apos;s name before sending money.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [{
            backgroundColor: Colors.accent,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            borderCurve: 'continuous',
            opacity: pressed ? 0.85 : 1,
          }]}
          onPress={handleSave}
        >
          <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
          <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.primary }}>Save Payee</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
