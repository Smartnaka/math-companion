import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  HelpCircle,
  Lightbulb,
  Send,
  Sparkles,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createRorkTool, useRorkAgent } from "@rork-ai/toolkit-sdk";
import { z } from "zod";
import * as Haptics from "expo-haptics";

type Message = {
  id: string;
  role: "user" | "assistant";
  parts: (
    | { type: "text"; text: string }
    | { type: "image"; image: string }
    | {
        type: "tool";
        toolName: string;
        state:
          | "input-streaming"
          | "input-available"
          | "output-available"
          | "output-error";
        input?: unknown;
        output?: unknown;
        errorText?: string;
      }
  )[];
};

export default function TutorScreen() {
  const { image } = useLocalSearchParams<{ image: string }>();
  const router = useRouter();
  const [input, setInput] = useState<string>("");
  const scrollViewRef = useRef<ScrollView>(null);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const { messages, sendMessage, error } = useRorkAgent({
    tools: {
      showConfidence: createRorkTool({
        description:
          "Show confidence boost message when student makes progress or understands a concept",
        zodSchema: z.object({
          message: z
            .string()
            .describe("Encouraging message for the student's progress"),
        }),
      }),
    },
    systemPrompt: `You are a patient, compassionate Socratic math tutor. Your goal is to guide students through understanding, not just give them answers.

CRITICAL RULES:
1. NEVER give the final answer directly. Always guide step-by-step.
2. Start by analyzing the problem and asking what the student notices or what they think the first step might be.
3. When they answer or ask "Why?", explain ONLY that specific concept before moving to the next step.
4. Use encouraging language. Celebrate small wins. Be patient with confusion.
5. If they're stuck, give a small hint or ask a leading question, but don't solve it for them.
6. Break complex problems into tiny, manageable steps.
7. Use the showConfidence tool when they make good progress or show understanding.

Your tone should be like sitting with a patient teacher who genuinely cares about understanding, not just getting the right answer.`,
  });

  useEffect(() => {
    if (!hasStarted && image && sendMessage) {
      setHasStarted(true);
      sendMessage({
        text: "I need help with this math problem. Can you guide me through it step by step?",
        files: [
          {
            type: "file",
            mimeType: "image/jpeg",
            uri: image,
          },
        ],
      });
    }
  }, [image, hasStarted]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    sendMessage(input.trim());
    setInput("");
  };

  const handleQuickQuestion = (question: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    sendMessage(question);
  };

  const renderMessage = (m: Message, index: number) => {
    if (m.role === "user") {
      return (
        <View key={m.id} style={styles.userMessageContainer}>
          {m.parts.map((part, i) => {
            if (part.type === "text") {
              return (
                <View key={`${m.id}-${i}`} style={styles.userBubble}>
                  <Text style={styles.userText}>{part.text}</Text>
                </View>
              );
            } else if (part.type === "image") {
              return (
                <View key={`${m.id}-${i}`} style={styles.imageContainer}>
                  <Image
                    source={{ uri: part.image }}
                    style={styles.image}
                    contentFit="contain"
                  />
                </View>
              );
            }
            return null;
          })}
        </View>
      );
    } else {
      return (
        <View key={m.id} style={styles.assistantMessageContainer}>
          <View style={styles.assistantIcon}>
            <Sparkles size={16} color="#0369a1" strokeWidth={2} />
          </View>
          <View style={styles.assistantContent}>
            {m.parts.map((part, i) => {
              if (part.type === "text") {
                return (
                  <View key={`${m.id}-${i}`} style={styles.assistantBubble}>
                    <Text style={styles.assistantText}>{part.text}</Text>
                  </View>
                );
              } else if (part.type === "tool") {
                if (
                  part.toolName === "showConfidence" &&
                  part.state === "output-available"
                ) {
                  const output = part.output as { message?: string };
                  return (
                    <View key={`${m.id}-${i}`} style={styles.confidenceBubble}>
                      <Lightbulb size={18} color="#f59e0b" strokeWidth={2} />
                      <Text style={styles.confidenceText}>
                        {output.message || "Great job!"}
                      </Text>
                    </View>
                  );
                }
              }
              return null;
            })}
          </View>
        </View>
      );
    }
  };

  const isLoading =
    messages.length > 0 &&
    messages[messages.length - 1]?.role === "user" &&
    !messages.some(
      (m, idx) => idx > messages.length - 1 && m.role === "assistant"
    );

  const showQuickActions = messages.length > 1;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#0c4a6e" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Sparkles size={20} color="#0369a1" strokeWidth={2} />
            <Text style={styles.headerText}>Your Math Companion</Text>
          </View>
          <View style={styles.backButton} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((m, i) => renderMessage(m, i))}

            {isLoading && (
              <View style={styles.assistantMessageContainer}>
                <View style={styles.assistantIcon}>
                  <Sparkles size={16} color="#0369a1" strokeWidth={2} />
                </View>
                <View style={styles.assistantContent}>
                  <View style={styles.loadingBubble}>
                    <ActivityIndicator size="small" color="#0369a1" />
                    <Text style={styles.loadingText}>Thinking...</Text>
                  </View>
                </View>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  Oops! Something went wrong. Please try again.
                </Text>
              </View>
            )}
          </ScrollView>

          {showQuickActions && (
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => handleQuickQuestion("Why did we do that?")}
                activeOpacity={0.7}
              >
                <HelpCircle size={16} color="#0369a1" strokeWidth={2} />
                <Text style={styles.quickButtonText}>Why did we do that?</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() =>
                  handleQuickQuestion("Can you explain that differently?")
                }
                activeOpacity={0.7}
              >
                <Lightbulb size={16} color="#0369a1" strokeWidth={2} />
                <Text style={styles.quickButtonText}>Explain differently</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Type your response..."
                placeholderTextColor="#94a3b8"
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !input.trim() && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!input.trim()}
                activeOpacity={0.7}
              >
                <Send
                  size={20}
                  color={input.trim() ? "#ffffff" : "#cbd5e1"}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#0c4a6e",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 16,
  },
  userMessageContainer: {
    alignItems: "flex-end",
    gap: 8,
  },
  userBubble: {
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    maxWidth: "80%",
    shadowColor: "#0369a1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userText: {
    fontSize: 16,
    color: "#ffffff",
    lineHeight: 22,
  },
  imageContainer: {
    width: "80%",
    aspectRatio: 4 / 3,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  assistantMessageContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  assistantIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  assistantContent: {
    flex: 1,
    gap: 8,
  },
  assistantBubble: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  assistantText: {
    fontSize: 16,
    color: "#1e293b",
    lineHeight: 24,
  },
  confidenceBubble: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  confidenceText: {
    fontSize: 15,
    color: "#92400e",
    fontWeight: "500" as const,
    lineHeight: 22,
    flex: 1,
  },
  loadingBubble: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: "#64748b",
    fontStyle: "italic" as const,
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  errorText: {
    fontSize: 15,
    color: "#991b1b",
    lineHeight: 22,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  quickButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0f2fe",
    shadowColor: "#0369a1",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#0369a1",
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#f1f5f9",
  },
});
  
