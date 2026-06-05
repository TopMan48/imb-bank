import React from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

const FONT_SIZES = [
  { value: 'small' as const, label: 'Small', scale: 0.85 },
  { value: 'medium' as const, label: 'Medium', scale: 1.0 },
  { value: 'large' as const, label: 'Large', scale: 1.15 },
  { value: 'xlarge' as const, label: 'Extra Large', scale: 1.3 },
];

export default function AccessibilityScreen() {
  const { accessibility, updateAccessibility } = useAppStore();

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Font Size */}
      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>
          Text Size
        </Text>
        <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
          {FONT_SIZES.map((size, idx) => (
            <Pressable
              key={size.value}
              style={({ pressed }) => [{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
                gap: 14,
                borderBottomWidth: idx < FONT_SIZES.length - 1 ? 1 : 0,
                borderBottomColor: Colors.borderLight,
                backgroundColor: pressed ? Colors.background : accessibility.fontSize === size.value ? '#F0F8FA' : 'transparent',
                minHeight: 56,
              }]}
              onPress={() => updateAccessibility({ fontSize: size.value })}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 14 * size.scale, fontFamily: Fonts.bold, color: Colors.primary, lineHeight: 20 }}>
                  A
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontFamily: Fonts.medium, color: Colors.textPrimary }}>
                  {size.label}
                </Text>
                <Text style={{ fontSize: 12 * size.scale, fontFamily: Fonts.regular, color: Colors.textSecondary, marginTop: 2 }}>
                  Sample text at this size
                </Text>
              </View>
              {accessibility.fontSize === size.value && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {/* Display Options */}
      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>
          Display
        </Text>
        <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, minHeight: 56 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="contrast-outline" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 15, fontFamily: Fonts.medium, color: Colors.textPrimary }}>High Contrast</Text>
              <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>Increases contrast for better readability</Text>
            </View>
            <Switch
              value={accessibility.highContrast}
              onValueChange={(v) => updateAccessibility({ highContrast: v })}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, minHeight: 56 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="flash-outline" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 15, fontFamily: Fonts.medium, color: Colors.textPrimary }}>Reduce Motion</Text>
              <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>Minimise animations and transitions</Text>
            </View>
            <Switch
              value={accessibility.reduceMotion}
              onValueChange={(v) => updateAccessibility({ reduceMotion: v })}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, minHeight: 56 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="expand-outline" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 15, fontFamily: Fonts.medium, color: Colors.textPrimary }}>Larger Touch Targets</Text>
              <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>Makes buttons and links easier to tap</Text>
            </View>
            <Switch
              value={accessibility.largerTouchTargets}
              onValueChange={(v) => updateAccessibility({ largerTouchTargets: v })}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>
      </View>

      {/* Preview */}
      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4 }}>
          Preview
        </Text>
        <View style={{
          backgroundColor: accessibility.highContrast ? '#000000' : Colors.white,
          borderRadius: 16,
          padding: 20,
          gap: 12,
          borderCurve: 'continuous',
          boxShadow: '0 2px 10px rgba(0,75,90,0.06)',
          borderWidth: accessibility.highContrast ? 2 : 0,
          borderColor: Colors.primary,
        }}>
          <Text style={{
            fontSize: (accessibility.fontSize === 'small' ? 11 : accessibility.fontSize === 'medium' ? 13 : accessibility.fontSize === 'large' ? 15 : 17),
            fontFamily: Fonts.semiBold,
            color: accessibility.highContrast ? '#FFFFFF' : Colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            Account Balance
          </Text>
          <Text style={{
            fontSize: (accessibility.fontSize === 'small' ? 28 : accessibility.fontSize === 'medium' ? 32 : accessibility.fontSize === 'large' ? 36 : 42),
            fontFamily: Fonts.bold,
            color: accessibility.highContrast ? Colors.accent : Colors.textPrimary,
          }}>
            $4,256.78
          </Text>
          <Text style={{
            fontSize: (accessibility.fontSize === 'small' ? 11 : accessibility.fontSize === 'medium' ? 12 : accessibility.fontSize === 'large' ? 14 : 16),
            fontFamily: Fonts.regular,
            color: accessibility.highContrast ? 'rgba(255,255,255,0.7)' : Colors.textSecondary,
          }}>
            Everyday Account · BSB 641-800
          </Text>
        </View>
      </View>

      <View style={{ backgroundColor: Colors.infoBg, borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, borderCurve: 'continuous' }}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.info} />
        <Text style={{ flex: 1, fontSize: 13, fontFamily: Fonts.regular, color: Colors.textPrimary, lineHeight: 18 }}>
          Changes apply immediately throughout the app. For additional accessibility options, check your device Settings → Accessibility.
        </Text>
      </View>
    </ScrollView>
  );
}
