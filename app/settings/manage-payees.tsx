import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

export default function ManagePayeesScreen() {
  const { payees, deletePayee } = useAppStore();
  const [search, setSearch] = useState('');

  const filtered = payees.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Payee',
      `Delete ${name} from your saved payees?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deletePayee(id) },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, gap: 10, borderCurve: 'continuous', boxShadow: '0 2px 8px rgba(0,75,90,0.06)' }}>
          <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search payees..."
            placeholderTextColor={Colors.textSecondary}
            style={{ flex: 1, fontSize: 14, fontFamily: Fonts.regular, color: Colors.textPrimary }}
          />
        </View>

        {/* Payee list */}
        {filtered.length === 0 ? (
          <View style={{ backgroundColor: Colors.white, borderRadius: 16, padding: 32, alignItems: 'center', gap: 12, borderCurve: 'continuous' }}>
            <Ionicons name="people-outline" size={40} color={Colors.textSecondary} />
            <Text style={{ fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>No Payees</Text>
            <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center' }}>
              {search ? 'No payees match your search.' : 'Add payees to send money quickly.'}
            </Text>
          </View>
        ) : (
          <View style={{ backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderCurve: 'continuous', boxShadow: '0 2px 10px rgba(0,75,90,0.06)' }}>
            {filtered.map((payee, idx) => (
              <View key={payee.id} style={{ borderBottomWidth: idx < filtered.length - 1 ? 1 : 0, borderBottomColor: Colors.borderLight }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: payee.avatarColour, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.white }}>{payee.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontSize: 15, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>{payee.name}</Text>
                    {payee.nickname && <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.primary }}>&ldquo;{payee.nickname}&rdquo;</Text>}
                    <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>BSB {payee.bsb} · {payee.accountNumber}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <Pressable
                      style={({ pressed }) => [{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: Colors.background,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderCurve: 'continuous',
                        opacity: pressed ? 0.7 : 1,
                      }]}
                      onPress={() => router.push({ pathname: '/settings/edit-payee', params: { id: payee.id } })}
                    >
                      <Ionicons name="pencil-outline" size={16} color={Colors.primary} />
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: '#FFEBEE',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderCurve: 'continuous',
                        opacity: pressed ? 0.7 : 1,
                      }]}
                      onPress={() => handleDelete(payee.id, payee.name)}
                    >
                      <Ionicons name="trash-outline" size={16} color={Colors.error} />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add payee FAB */}
      <View style={{ position: 'absolute', bottom: 24, right: 20 }}>
        <Pressable
          style={({ pressed }) => [{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: Colors.accent,
            borderRadius: 28,
            paddingHorizontal: 20,
            paddingVertical: 14,
            boxShadow: '0 4px 16px rgba(0,75,90,0.2)',
            opacity: pressed ? 0.85 : 1,
          }]}
          onPress={() => router.push('/settings/add-payee')}
        >
          <Ionicons name="add" size={20} color={Colors.primary} />
          <Text style={{ fontSize: 15, fontFamily: Fonts.bold, color: Colors.primary }}>Add Payee</Text>
        </Pressable>
      </View>
    </View>
  );
}
