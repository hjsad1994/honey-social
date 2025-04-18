import React from 'react';
import { Link } from 'react-router-dom';
import { Flex, Avatar, Box, Text, Image, useColorModeValue } from '@chakra-ui/react';
import Actions from './Actions';
import { Post, User } from '../types/types';

interface UserPostProps {
  post: Post;
  user: User;
}

const UserPost: React.FC<UserPostProps> = ({ post, user }) => {
  // Pre-compute color mode values
  const borderColor = useColorModeValue("gray.light", "gray.dark");
  const textColor = useColorModeValue("black", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const bgHover = useColorModeValue("gray.50", "gray.800");

  // Format the time display
  const formatTimeCompact = (date: string) => {
    if (!date) return "";
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - new Date(date).getTime()) / 1000
    );   
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 5) return `${diffInWeeks}w`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo`;
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}y`;
  };

  return (
    <Link to={`/${user.username}/post/${post._id}`}>
      <Flex 
        gap={3} 
        mb={4} 
        py={5} 
        borderRadius="lg"
        transition="all 0.2s"
        _hover={{ bg: bgHover }}
      >
        <Flex flexDirection="column" alignItems="center">
          <Avatar 
            size="md" 
            name={user.name} 
            src={user.profilePic || "/tai.png"} 
          />
          <Box w="1px" h="full" bg={borderColor} my={2} />
        </Flex>
        
        <Flex flex={1} flexDirection="column" gap={2}>
          <Flex justifyContent="space-between" w="full">
            <Flex w="full" gap={2} alignItems="center">
              <Text fontSize="sm" fontWeight="bold" color={textColor}>
                {user.username}
              </Text>
              {user.isVerified && (
                <Image src="/verified.png" w={4} h={4} ml={-1} />
              )}
              <Text fontSize="xs" color={subTextColor}>
                {formatTimeCompact(post.createdAt)}
              </Text>
            </Flex>
          </Flex>

          <Text fontSize="sm" color={textColor}>{post.text}</Text>

          {post.img && (
            <Box
              borderRadius={6}
              overflow="hidden"
              border="1px solid"
              borderColor={borderColor}
            >
              <Image 
                src={post.img} 
                w="full" 
                alt={post.text || "Post image"}
                loading="lazy"
                transition="all 0.3s"
                _hover={{ transform: "scale(1.01)" }}
              />
            </Box>
          )}

          <Flex gap={3} my={1}>
            <Actions post={post} />
          </Flex>

          <Flex gap={2} alignItems="center">
            <Text color={subTextColor} fontSize="xs">
              {post.replies?.length || 0} bình luận
            </Text>
            <Box w={0.5} h={0.5} borderRadius="full" bg={subTextColor} />
            <Text color={subTextColor} fontSize="xs">
              {post.likes?.length || 0} lượt thích
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Link>
  );
};

export default UserPost;