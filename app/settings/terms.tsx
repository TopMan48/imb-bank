import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Typography';

export default function TermsScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary }}>Last updated: 1 January 2026</Text>

      {[
        { title: '1. Acceptance of Terms', body: 'By accessing or using the IMB Bank mobile application, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the application.' },
        { title: '2. Account Access', body: 'You are responsible for maintaining the confidentiality of your passcode and login credentials. IMB Bank will never ask for your full passcode via phone, email or SMS. Report any suspected unauthorised access immediately to 133 462.' },
        { title: '3. Electronic Transactions', body: 'Payments made through this application are subject to IMB Bank\'s Electronic Transactions Terms. Payments via Osko/PayID are subject to the New Payments Platform Australia (NPPA) terms and conditions.' },
        { title: '4. PayTo Services', body: 'PayTo agreements are established on the NPP network. You can manage, pause or cancel PayTo agreements at any time. IMB Bank will notify you of any new PayTo agreements before funds are drawn.' },
        { title: '5. Liability', body: 'IMB Bank\'s liability is limited as set out in the ePayments Code and our Product Terms. In general, if you have not contributed to a loss, you will not be held liable for unauthorised transactions.' },
        { title: '6. Privacy', body: 'IMB Bank collects and uses your personal information in accordance with our Privacy Policy and the Australian Privacy Act 1988. Your data is used to provide and improve banking services.' },
        { title: '7. Changes to Terms', body: 'IMB Bank may update these Terms from time to time. We will notify you of material changes via the app or email. Continued use after notification constitutes acceptance.' },
        { title: '8. Governing Law', body: 'These Terms are governed by the laws of New South Wales, Australia. Any disputes are subject to the exclusive jurisdiction of the courts of NSW.' },
      ].map((section) => (
        <View key={section.title} style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.textPrimary }}>{section.title}</Text>
          <Text style={{ fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, lineHeight: 22 }}>{section.body}</Text>
        </View>
      ))}

      <View style={{ height: 1, backgroundColor: Colors.borderLight }} />
      <Text style={{ fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary, lineHeight: 18, textAlign: 'center' }}>
        IMB Ltd ABN 92 087 651 974 AFSL/Australian Credit Licence 237 391{'\n'}
        Authorised Deposit-taking Institution (ADI) regulated by APRA
      </Text>
    </ScrollView>
  );
}
