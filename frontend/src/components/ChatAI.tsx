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
  useColorModeValue,
  useColorMode,
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
  const { colorMode } = useColorMode();

  // Color mode values
  const cardBg = useColorModeValue("white", "#161617");
  const shadowColor = useColorModeValue("lg", "dark-lg");
  const borderColor = useColorModeValue("blackAlpha.300", "whiteAlpha.200");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const headingColor = useColorModeValue("gray.800", "white");
  
  const userMsgBg = useColorModeValue("blue.500", "blue.400");
  const aiMsgBg = useColorModeValue("gray.100", "gray.700");
  const aiMsgText = useColorModeValue("gray.800", "gray.100");
  
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const inputBorder = useColorModeValue("gray.300", "gray.600");
  const buttonBg = useColorModeValue("blue.500", "blue.400");
  const buttonHoverBg = useColorModeValue("blue.600", "blue.500");
  
  const timestampColor = useColorModeValue("gray.500", "gray.400");
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (): Promise<void> => {
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
      // Use a relative URL and include credentials
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // <-- This ensures cookies are sent
        body: JSON.stringify({
          message: inputMessage,
          userId: currentUser?._id,
          name: currentUser?.name || 'Anonymous',
          bio: currentUser?.bio || '',
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
      p={{ base: 4, md: 6 }}
      borderRadius="30px"
      borderWidth="0.5px"
      borderStyle="solid"
      borderColor={borderColor}
      bg={cardBg}
      boxShadow={shadowColor}
      transition="all 0.3s ease"
      height="600px"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <Text fontSize="xl" fontWeight="bold" mb={4} color={headingColor}>
        Chat với AI
      </Text>
      <Divider mb={4} borderColor={borderColor} />

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
              <Avatar size="xs" name="AI" src="/ai-avatar.png" bg={buttonBg} />
            )}

            <Box
              maxW="70%"
              p={3}
              borderRadius="lg"
              bg={msg.isUser ? userMsgBg : aiMsgBg}
              color={msg.isUser ? 'white' : aiMsgText}
              borderWidth={msg.isUser ? 0 : "1px"}
              borderColor={msg.isUser ? "" : borderColor}
              boxShadow="sm"
            >
              <Text>{msg.text}</Text>
              <Text fontSize="xs" opacity={0.8} textAlign="right" mt={1} color={msg.isUser ? "whiteAlpha.800" : timestampColor}>
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
            <Avatar size="xs" name="AI" src="/ai-avatar.png" bg={buttonBg} />
            <Box p={3} borderRadius="lg" bg={aiMsgBg} borderWidth="1px" borderColor={borderColor}>
              <Spinner size="sm" color={buttonBg} mr={2} />
              <Text fontSize="sm" color={aiMsgText}>Đang trả lời...</Text>
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
          bg={inputBg}
          borderColor={inputBorder}
          borderRadius="full"
          disabled={isLoading}
          _hover={{ borderColor: buttonBg }}
          _focus={{ borderColor: buttonBg, boxShadow: `0 0 0 1px ${colorMode === 'light' ? 'blue.500' : 'blue.400'}` }}
        />
        <IconButton
          aria-label="Send message"
          icon={<FiSend />}
          bg={buttonBg}
          color="white"
          _hover={{ bg: buttonHoverBg }}
          borderRadius="full"
          onClick={handleSendMessage}
          isLoading={isLoading}
          isDisabled={!inputMessage.trim() || isLoading}
          transition="all 0.2s"
          boxShadow="sm"
        />
      </Flex>
    </Box>
  );
};

export default ChatAI;