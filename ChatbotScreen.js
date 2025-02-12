import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ChatbotScreen = () => {
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([
    { text: "Merhaba! Size nasıl yardımcı olabilirim?", sender: "bot" },
  ]);

  const handleSendMessage = () => {
    if (userMessage.trim()) {
      const newMessage = { text: userMessage, sender: "user" };
      setMessages([...messages, newMessage]);

      // Simulating chatbot response after a delay
      setTimeout(() => {
        const botResponse = { text: "Chatbot cevap veriyor...", sender: "bot" };
        setMessages((prevMessages) => [...prevMessages, botResponse]);
      }, 1000);

      setUserMessage(""); // Clear input field
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.chatContainer}>
        <ScrollView 
          contentContainerStyle={styles.messagesContainer}
          ref={(ref) => { this.scrollView = ref }}
          onContentSizeChange={() => this.scrollView.scrollToEnd({ animated: true })}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                message.sender === "user" ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor="#ddd"
            value={userMessage}
            onChangeText={setUserMessage}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:60,
    backgroundColor: "#f0f0f0",
  },
  chatContainer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 10, // Adjust the bottom padding
  },
  messagesContainer: {
    padding: 15,
    paddingBottom: 80, // Increased padding at the bottom to prevent messages from hiding behind input field
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 20,
    marginVertical: 5,
    marginLeft: 10,
    marginRight: 10,
    alignSelf: "flex-start", // Default to bot's side
  },
  userBubble: {
    backgroundColor: "#007bff", // Blue for user
    alignSelf: "flex-end",
  },
  botBubble: {
    backgroundColor: "#28a745", // Green for bot
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    position: "absolute", // Fix input field at the bottom
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    fontSize: 16,
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 20,
  },
});

export default ChatbotScreen;
