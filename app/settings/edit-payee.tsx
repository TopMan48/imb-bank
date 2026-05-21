import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

const AVATAR_COLORS = ['#E91E63', '#9C27B0', '#2196F3', '#FF9800', '#4CAF50', '#F44336', '#607D8B', '#795548'];

function formatBSB(bsb: string) {
  const digits = bsb.replace(/\D/g, '').slice(0, 6);
  if (digits.length > 3) return digits.slice(0, 3) + '-' + digits.slice(3);
  return digits;
}

function validateBSB(bsb: string) {
  return /^\d{3}-\d{3}$/.test(bsb) || /^\d{6}$/.test(bsb);
}

export default function EditPayeeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { payees, updatePayee, deletePayee } = useAppStore();
  const payee = payees.find((p) => p.id === id);

  const [name, setName] = useState(payee?.name ?? '');
  const [bsb, setBsb] = useState(payee?.bsb ?? '');
  const [accountNumber, setAccountNumber] = useState(payee?.accountNumber ?? '');
  const [nickname, setNickname] = useState(payee?.nickname ?? '');
  const [selectedColor, setSelectedColor] = useState(payee?.avatarColour ?? AVATAR_COLORS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!payee) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, fontFamily: Fonts.regular, color: Colors.textSecondary }}>Payee not found</Text>
      </View>
    );
  }

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Account name is required';
    if (!validateBSB(bsb)) errs.bsb = 'Enter a valid 6-digit BSB (e.g. 641-800)';
    if (!accountNumber.trim() || accountNumber.replace(/\D/g, '').length < 6) {
      errs.accountNumber = 'Enter a valid account number';
    }
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    updatePayee(id!, { name: name.trim(), bsb, accountNumber: accountNumber.trim(), nickname: nickname.trim() || undefined, avatarColour: selectedColor });
    Alert.alert('Saved', `${name} has been updated.`, [{ text: 'Done', onPress: () => router.back() }]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Payee', `Delete ${name} from your payees?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deletePayee(id!); router.back(); } },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

        <View style={{ alignItems: 'center', gap: 12 }}>
          <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: selectedColor, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 26, fontFamily: Fonts.bold, color: Colors.white }}>{name.charAt(0).toUpperCase() || '?'}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {AVATAR_COLORS.map((color) => (
              <Pressable key={color} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: color, borderWidth: selectedColor === color ? 3 : 0, borderColor: Colors.primary }} onPress={() => setSelectedColor(color)} />
            ))}
          </View>
        </View>

        {[
          { label: 'Account Name *', value: name, onChange: setName, placeholder: 'e.g. John Smith', autoCapitalize: 'words' as const, error: errors.name },
          { label: 'BSB *', value: bsb, onChange: (v: string) => setBsb(formatBSB(v)), placeholder: '641-800', keyboardType: 'numeric' as const, maxLength: 7, error: errors.bsb },
          { label: 'Account Number *', value: accountNumber, onChange: setAccountNumber, placeholder: '1234 5678', keyboardType: 'numeric' as const, error: errors.accountNumber },
          { label: 'Nickname (optional)', value: nickname, onChange: setNickname, placeholder: 'e.g. Mum' },
        ].map((field) => (
          <View key={field.label} style={{ gap: 6 }}>
            <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{field.label}</Text>
            <View style={{ backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, borderCurve: 'continuous', borderWidth: 1.5, borderColor: field.error ? Colors.error : Colors.border }}>
              <TextInput value={field.value} onChangeText={field.onChange} placeholder={field.placeholder} placeholderTextColor={Colors.textSecondary} keyboardType={field.keyboardType} maxLength={field.maxLength} autoCapitalize={field.autoCapitalize} style={{ fontSize: 15, fontFamily: Fonts.regular, color: Colors.textPrimary }} />
            </View>
            {field.error && <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.error }}>{field.error}</Text>}
          </View>
        ))}

        <Pressable style={({ pressed }) => [{ backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, borderCurve: 'continuous', opacity: pressed ? 0.85 : 1 }]} onPress={handleSave}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
          <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.primary }}>Save Changes</Text>
        </Pressable>

        <Pressable style={({ pressed }) => [{ backgroundColor: Colors.white, borderRadius: 14, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, borderCurve: 'continuous', borderWidth: 1.5, borderColor: '#FFCDD2', opacity: pressed ? 0.85 : 1 }]} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={18} color={Colors.error} />
          <Text style={{ fontSize: 15, fontFamily: Fonts.semiBold, color: Colors.error }}>Delete Payee</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
