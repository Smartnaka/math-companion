import { useRouter } from "expo-router";
import { Camera, Sparkles } from "lucide-react-native";
import React from "react";
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#f0f9ff", "#e0f2fe", "#fef3c7"]}
        style={styles.gradient}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Sparkles size={48} color="#0369a1" strokeWidth={2} />
            </View>
            <Text style={styles.title}>Math Companion</Text>
            <Text style={styles.subtitle}>
              Your patient guide to understanding math, step by step
            </Text>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Camera size={24} color="#0369a1" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Snap a Problem</Text>
                <Text style={styles.featureDescription}>
                  Take a photo of any calculus or algebra problem
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>💭</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Learn by Thinking</Text>
                <Text style={styles.featureDescription}>
                  We guide you through each step, never just give answers
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>🤔</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Ask Why?</Text>
                <Text style={styles.featureDescription}>
                  Stuck? Ask why we did something and we&apos;ll explain
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push("/camera")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#0ea5e9", "#0369a1"]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Camera size={24} color="#ffffff" strokeWidth={2} />
              <Text style={styles.startButtonText}>Start Learning</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f9ff",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingBottom: Platform.OS === "web" ? 48 : 40,
  },
  header: {
    alignItems: "center",
    marginTop: 60,
    gap: 16,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0369a1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: "#0c4a6e",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#075985",
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 16,
  },
  features: {
    gap: 24,
    marginTop: 20,
  },
  feature: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    gap: 16,
    shadowColor: "#0369a1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
  },
  featureIconText: {
    fontSize: 24,
  },
  featureText: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#0c4a6e",
  },
  featureDescription: {
    fontSize: 15,
    color: "#64748b",
    lineHeight: 22,
  },
  startButton: {
    marginTop: 32,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#0369a1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#ffffff",
  },
});
