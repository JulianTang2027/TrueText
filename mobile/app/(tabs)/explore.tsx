"use client";

import { useState } from "react";
import { StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

interface TranslationHistory {
  id: string;
  original: string;
  translation: string;
  timestamp: Date;
  isReversed: boolean; // true if Danish→English, false if English→Danish
}

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const [history, setHistory] = useState<TranslationHistory[]>([
    {
      id: "1",
      original: "Hello, how are you?",
      translation: "Hej, hvordan har du det?",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isReversed: false, // English→Danish
    },
    {
      id: "2",
      original: "Mange tak",
      translation: "Thank you very much",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isReversed: true, // Danish→English
    },
    {
      id: "3",
      original: "Where is the train station?",
      translation: "Hvor er togstationen?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      isReversed: false, // English→Danish
    },
  ]);

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Text copied to clipboard");
  };

  const deleteHistoryItem = (id: string) => {
    Alert.alert(
      "Delete Translation",
      "Are you sure you want to delete this translation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setHistory(history.filter((item) => item.id !== id));
          },
        },
      ]
    );
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme ?? "light"];

  return (
    <ThemedView style={styles.container}>
      <ThemedView
        style={[
          styles.header,
          { backgroundColor: isDark ? "#1a1a2e" : "#667eea" },
        ]}
      >
        <ThemedText style={styles.headerTitle}>Translation History</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Your recent translations
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {history.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color={colors.icon} />
            <ThemedText style={styles.emptyTitle}>
              No translations yet
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Start translating to see your history here
            </ThemedText>
          </ThemedView>
        ) : (
          history.map((item) => (
            <ThemedView
              key={item.id}
              style={[
                styles.historyItem,
                { backgroundColor: colors.background },
              ]}
            >
              <ThemedView style={styles.historyHeader}>
                <ThemedText style={styles.timestamp}>
                  {formatTimestamp(item.timestamp)}
                </ThemedText>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteHistoryItem(item.id)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.icon}
                  />
                </TouchableOpacity>
              </ThemedView>

              <ThemedView style={styles.translationPair}>
                <ThemedView style={styles.originalText}>
                  <ThemedText style={styles.languageLabel}>
                    {item.isReversed ? "🇩🇰 Danish" : "🇬🇧 English"}
                  </ThemedText>
                  <ThemedText style={[styles.text, { color: colors.text }]}>
                    {item.original}
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => copyToClipboard(item.original)}
                  >
                    <Ionicons
                      name="copy-outline"
                      size={16}
                      color={colors.tint}
                    />
                  </TouchableOpacity>
                </ThemedView>

                <ThemedView style={styles.translatedText}>
                  <ThemedText style={styles.languageLabel}>
                    {item.isReversed ? "🇬🇧 English" : "🇩🇰 Danish"}
                  </ThemedText>
                  <ThemedText style={[styles.text, { color: colors.text }]}>
                    {item.translation}
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => copyToClipboard(item.translation)}
                  >
                    <Ionicons
                      name="copy-outline"
                      size={16}
                      color={colors.tint}
                    />
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f1419",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    fontWeight: "400",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#0f1419",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: -0.3,
    color: "rgba(255, 255, 255, 0.9)",
  },
  emptySubtitle: {
    fontSize: 15,
    opacity: 0.5,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 40,
    color: "rgba(255, 255, 255, 0.6)",
  },
  historyItem: {
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#1a1f29",
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.5,
    fontWeight: "500",
    letterSpacing: 0,
    color: "rgba(255, 255, 255, 0.6)",
  },
  deleteButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255, 59, 48, 0.15)",
  },
  translationPair: {
    gap: 14,
  },
  originalText: {
    position: "relative",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  translatedText: {
    position: "relative",
    paddingTop: 4,
  },
  languageLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.3,
    opacity: 0.6,
    color: "rgba(255, 255, 255, 0.6)",
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    paddingRight: 44,
    letterSpacing: 0,
    color: "rgba(255, 255, 255, 0.9)",
  },
  copyButton: {
    position: "absolute",
    top: 24,
    right: 0,
    padding: 8,
    borderRadius: 10,
    backgroundColor: "rgba(65, 105, 225, 0.15)",
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
});
