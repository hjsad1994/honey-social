import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Input,
  Text,
  VStack,
  Spinner,
  IconButton,
  Avatar,
  Divider,
} from '@chakra-ui/react';
import { FiSend } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import useShowToast from '../hooks/useShowToast';
import { RootState } from '../store/store';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: 'Xin chào! Tôi là trợ lý AI của Honey. Bạn có thể hỏi tôi bất kỳ điều gì.',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const currentUser = useSelector((state: RootState) => state.user.user);
  const showToast = useShowToast();

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken'); // Retrieve token from localStorage

      const response = await fetch('http://localhost:5000/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify({
          message: inputMessage,
          userId: currentUser?._id,
        }),
      });

      if (response.status === 401) {
        throw new Error('Unauthorized: Please log in again.');
      }

      const data = await response.json();

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error: any) {
      showToast('Lỗi', error.message || 'Đã xảy ra lỗi khi gửi tin nhắn', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      p={4}
      borderRadius="lg"
      boxShadow="md"
      bg="white"
      borderWidth="1px"
      height="600px"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Chat với AI
      </Text>
      <Divider mb={4} />

      <VStack
        flex="1"
        overflowY="auto"
        spacing={4}
        alignItems="stretch"
        px={2}
        py={4}
      >
        {messages.map((msg) => (
          <Flex
            key={msg.id}
            justifyContent={msg.isUser ? 'flex-end' : 'flex-start'}
            alignItems="flex-start"
            gap={2}
          >
            {!msg.isUser && (
              <Avatar size="xs" name="AI" src="/ai-avatar.png" bg="blue.500" />
            )}

            <Box
              maxW="70%"
              p={3}
              borderRadius="lg"
              bg={msg.isUser ? 'blue.500' : 'gray.100'}
              color={msg.isUser ? 'white' : 'black'}
            >
              <Text>{msg.text}</Text>
              <Text fontSize="xs" opacity={0.8} textAlign="right" mt={1}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Text>
            </Box>

            {msg.isUser && (
              <Avatar
                size="xs"
                name={currentUser?.name || "User"}
                src={currentUser?.profilePic}
              />
            )}
          </Flex>
        ))}

        {isLoading && (
          <Flex alignItems="center" gap={2}>
            <Avatar size="xs" name="AI" src="/ai-avatar.png" bg="blue.500" />
            <Box p={3} borderRadius="lg" bg="gray.100">
              <Spinner size="sm" color="blue.500" mr={2} />
              <Text fontSize="sm">Đang trả lời...</Text>
            </Box>
          </Flex>
        )}

        <div ref={messageEndRef} />
      </VStack>

      <Flex mt={4} gap={2}>
        <Input
          placeholder="Nhập tin nhắn của bạn..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          bg="gray.100"
          borderRadius="full"
          disabled={isLoading}
        />
        <IconButton
          aria-label="Send message"
          icon={<FiSend />}
          colorScheme="blue"
          borderRadius="full"
          onClick={handleSendMessage}
          isLoading={isLoading}
          isDisabled={!inputMessage.trim() || isLoading}
        />
      </Flex>
    </Box>
  );
};

export default ChatAI;