import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

function Field({
  label,
  value,
  onChangeText,
  editable = true,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText?: (t: string) => void;
  editable?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words';
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
        borderWidth: editable ? 1 : 0,
        borderColor: Colors.border,
      }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={{ fontSize: 15, fontFamily: Fonts.regular, color: editable ? Colors.textPrimary : Colors.textSecondary }}
        />
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);

  const hasChanges =
    firstName !== profile.firstName ||
    lastName !== profile.lastName ||
    email !== profile.email ||
    phone !== profile.phone ||
    address !== profile.address;

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'First and last name are required.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    updateProfile({ firstName, lastName, email, phone, address });
    Alert.alert('Saved', 'Your personal details have been updated.');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={{ alignItems: 'center', paddingVertical: 12 }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: Colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 28, fontFamily: Fonts.bold, color: Colors.accent }}>
              {firstName.charAt(0)}{lastName.charAt(0)}
            </Text>
          </View>
          <Text style={{ marginTop: 12, fontSize: 18, fontFamily: Fonts.bold, color: Colors.textPrimary }}>
            {profile.firstName} {profile.lastName}
          </Text>
          <Text style={{ fontSize: 13, fontFamily: Fonts.regular, color: Colors.textSecondary }}>
            {profile.memberNumber}
          </Text>
        </View>

        {/* Editable fields */}
        <Field label="First Name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
        <Field label="Last Name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
        <Field label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Field label="Mobile Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label="Address" value={address} onChangeText={setAddress} autoCapitalize="words" />

        {/* Read-only fields */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Date of Birth
          </Text>
          <View style={{ backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, borderCurve: 'continuous' }}>
            <Text style={{ fontSize: 15, fontFamily: Fonts.regular, color: Colors.textSecondary }}>
              {profile.dateOfBirth}
            </Text>
            <Text style={{ fontSize: 11, fontFamily: Fonts.regular, color: Colors.textSecondary, marginTop: 2 }}>
              Contact us to update your date of birth
            </Text>
          </View>
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Member Since
          </Text>
          <View style={{ backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, borderCurve: 'continuous' }}>
            <Text style={{ fontSize: 15, fontFamily: Fonts.regular, color: Colors.textSecondary }}>{profile.memberSince}</Text>
          </View>
        </View>

        {/* Save button */}
        <Pressable
          style={({ pressed }) => [{
            backgroundColor: hasChanges ? Colors.accent : Colors.border,
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
          disabled={!hasChanges}
        >
          <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
          <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.primary }}>Save Changes</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
