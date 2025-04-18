import React from 'react';
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import ChatAI from '../components/ChatAI';
import { useColorModeValue } from '@chakra-ui/react';

const ChatAIPage: React.FC = () => {
  const textColor = useColorModeValue('gray.700', 'gray.200');
  
  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center" mb={4}>
          <Heading as="h1" size="xl" mb={2}>
            Chat AI
          </Heading>
          <Text color={textColor}>
            Trò chuyện với trợ lý AI của Honey. Hỏi bất kỳ điều gì bạn muốn!
          </Text>
        </Box>
        
        <ChatAI />
      </VStack>
    </Container>
  );
};

export default ChatAIPage;