import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { IMBHeader } from '@/components/imb-header';
import { ServiceBanner } from '@/components/service-banner';
import { HeroSection } from '@/components/hero-section';
import { PromoCard } from '@/components/promo-card';
import { AboutSection } from '@/components/about-section';
import { ContactSection } from '@/components/contact-section';
import { FooterNav } from '@/components/footer-nav';
import { useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/Colors';

export default function HomeScreen() {
  const dismissBanner = useAppStore((s) => s.dismissBanner);
  const dismissedBanners = useAppStore((s) => s.preferences.dismissedBanners) || [];
  const [showBanner, setShowBanner] = useState(!dismissedBanners.includes('easter-2026'));

  const handleDismissBanner = () => {
    setShowBanner(false);
    dismissBanner('easter-2026');
  };

  return (
    <View style={styles.container}>
      <IMBHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {showBanner && (
          <ServiceBanner
            message="Easter public holidays may impact Pay Anyone payment processing. Osko® payments remain real time. Find out more on our"
            linkText="Service Updates page."
            onDismiss={handleDismissBanner}
          />
        )}

        <HeroSection />

        <View style={styles.promoSection}>
          <PromoCard
            title="Get up to"
            highlight="$3,000 cashback"
            description="for new purchase or refinance home loans with IMB."
            footnote="Min lending applies. LVR up to 80%."
          />
        </View>

        <AboutSection />

        <ContactSection />

        <FooterNav />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  promoSection: {
    paddingVertical: 24,
  },
});
