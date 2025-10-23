"use client";

import { useState } from "react";
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import CameraModal from "@/components/camera-modal";

interface TranslationRequest {
  text: string;
  target_lang: string;
  context: string;
}

interface TranslationResponse {
  translation: string;
}

export default function TranslationScreen() {
  const colorScheme = useColorScheme();
  const [inputText, setInputText] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReversed, setIsReversed] = useState(false); // false = English→Danish, true = Danish→English
  const [showCamera, setShowCamera] = useState(false);

  const translateText = async () => {
    if (!inputText.trim()) {
      Alert.alert("Error", "Please enter text to translate");
      return;
    }

    setIsLoading(true);
    try {
      const request: TranslationRequest = {
        text: inputText,
        target_lang: isReversed ? "English" : "Danish",
        context: "neutral",
      };

      const endpoints = [
        "http://192.168.242.195:8000/translate", // Expo Go
        "http://localhost:8000/translate",
        "http://127.0.0.1:8000/translate",
      ];

      let response;
      let lastError;

      for (const endpoint of endpoints) {
        try {
          response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
          });

          if (!response.ok) {
            throw new Error("Translation failed");
          }

          const data: TranslationResponse = await response.json();
          setTranslation(data.translation);
          return;
        } catch (error) {
          lastError = error;
          console.log(`Failed to connect to ${endpoint}:`, error);
          continue;
        }
      }

      throw lastError || new Error("All endpoints failed");
    } catch (error) {
      Alert.alert("Error", "Failed to translate text. Please try again.");
      console.error("Translation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Text copied to clipboard");
  };

  const shareTranslation = async () => {
    if (!translation) return;

    try {
      await Share.share({
        message: `Original: ${inputText}\n\nTranslation: ${translation}`,
        title: "TrueText Translation",
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const swapLanguages = () => {
    if (translation) {
      setInputText(translation);
      setTranslation("");
    }
  };

  const toggleLanguageDirection = () => {
    setIsReversed(!isReversed);
    setTranslation("");
  };

  const handleImageCaptured = (imageUri: string) => {
    // TODO: Implement OCR (AR vision -> We can use google vision)
    Alert.alert(
      "Image Captured",
      "OCR functionality will be implemented to extract text from the image. For now, you can manually type the text you see in the image.",
      [{ text: "OK", style: "default" }]
    );
    setShowCamera(false);
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
        <ThemedText style={styles.headerTitle}>TrueText</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          {isReversed
            ? "Danish to English Translation"
            : "English to Danish Translation"}
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.section}>
          <ThemedView
            style={[
              styles.languageDisplay,
              { backgroundColor: colors.background },
            ]}
          >
            <ThemedText style={styles.languageFlag}>
              {isReversed ? "🇩🇰" : "🇬🇧"}
            </ThemedText>
            <ThemedText style={styles.languageName}>
              {isReversed ? "Danish" : "English"}
            </ThemedText>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={toggleLanguageDirection}
            >
              <Ionicons name="swap-horizontal" size={24} color={colors.tint} />
            </TouchableOpacity>
            <ThemedText style={styles.languageFlag}>
              {isReversed ? "🇬🇧" : "🇩🇰"}
            </ThemedText>
            <ThemedText style={styles.languageName}>
              {isReversed ? "English" : "Danish"}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedView style={styles.inputHeader}>
            <ThemedText style={styles.sectionTitle}>
              Enter text to translate
            </ThemedText>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setShowCamera(true)}
            >
              <Ionicons name="camera" size={20} color={colors.tint} />
              <ThemedText style={styles.cameraButtonText}>Camera</ThemedText>
            </TouchableOpacity>
          </ThemedView>
          <ThemedView
            style={[
              styles.textInputContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder={
                isReversed
                  ? "Type Danish text here..."
                  : "Type English text here..."
              }
              placeholderTextColor={colors.icon}
              value={inputText}
              onChangeText={setInputText}
              multiline
              textAlignVertical="top"
            />
            {inputText.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setInputText("")}
              >
                <Ionicons name="close-circle" size={20} color={colors.icon} />
              </TouchableOpacity>
            )}
          </ThemedView>
        </ThemedView>

        <TouchableOpacity
          style={[styles.translateButton, { opacity: isLoading ? 0.7 : 1 }]}
          onPress={translateText}
          disabled={isLoading || !inputText.trim()}
        >
          <ThemedView
            style={[
              styles.translateButtonGradient,
              { backgroundColor: "#667eea" },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="language" size={20} color="white" />
                <ThemedText style={styles.translateButtonText}>
                  Translate
                </ThemedText>
              </>
            )}
          </ThemedView>
        </TouchableOpacity>

        {translation && (
          <ThemedView style={styles.section}>
            <ThemedView style={styles.translationHeader}>
              <ThemedText style={styles.sectionTitle}>Translation</ThemedText>
              <ThemedView style={styles.translationActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => copyToClipboard(translation)}
                >
                  <Ionicons name="copy" size={18} color={colors.tint} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={shareTranslation}
                >
                  <Ionicons name="share" size={18} color={colors.tint} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={swapLanguages}
                >
                  <Ionicons
                    name="swap-horizontal"
                    size={18}
                    color={colors.tint}
                  />
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
            <ThemedView
              style={[
                styles.translationContainer,
                { backgroundColor: colors.background },
              ]}
            >
              <ThemedText
                style={[styles.translationText, { color: colors.text }]}
              >
                {translation}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        )}
      </ScrollView>

      <CameraModal
        visible={showCamera}
        onClose={() => setShowCamera(false)}
        onImageCaptured={handleImageCaptured}
      />
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
  section: {
    marginTop: 24,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(65, 105, 225, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(65, 105, 225, 0.3)",
  },
  cameraButtonText: {
    color: "#4169E1",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
    letterSpacing: 0,
    color: "rgba(255, 255, 255, 0.9)",
  },
  languageDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
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
  languageFlag: {
    fontSize: 24,
    marginHorizontal: 8,
  },
  languageName: {
    fontSize: 15,
    fontWeight: "600",
    marginHorizontal: 8,
    letterSpacing: 0,
    color: "rgba(255, 255, 255, 0.9)",
  },
  toggleButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: "#4169E1",
    marginHorizontal: 12,
    shadowColor: "#4169E1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  textInputContainer: {
    borderRadius: 16,
    backgroundColor: "#1a1f29",
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  textInput: {
    padding: 18,
    fontSize: 15,
    minHeight: 160,
    maxHeight: 220,
    lineHeight: 22,
    color: "rgba(255, 255, 255, 0.9)",
  },
  clearButton: {
    position: "absolute",
    top: 14,
    right: 14,
    padding: 6,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  translateButton: {
    marginTop: 24,
    borderRadius: 16,
    shadowColor: "#4169E1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  translateButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#4169E1",
  },
  translateButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 8,
    letterSpacing: 0,
  },
  translationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  translationActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(65, 105, 225, 0.15)",
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  translationContainer: {
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
  translationText: {
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0,
    color: "rgba(255, 255, 255, 0.9)",
  },
});
