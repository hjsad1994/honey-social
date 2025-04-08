import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flex, Avatar, Box, Text, Image, Divider, Button } from '@chakra-ui/react';
import { BsThreeDots } from 'react-icons/bs';
import Actions from '../components/Actions';
import Comment from '../components/Comment';

const PostPage = () => {
  const [liked, setLiked] = useState(false);

  return (
    <>
      {/* Phần Header và Nội dung bài post bọc bởi Link để điều hướng khi click vào nội dung */}
      <Link to="/trantantai/post/1">
        <Flex justifyContent="space-between" alignItems="center">
          <Flex w="full" alignItems="center" gap={3}>
            <Avatar src="/tai.png" size="md" name="Tấn Tài" />
            <Flex alignItems="center" gap={2}>
              <Text fontSize="sm" fontWeight="bold">Tấn Tài</Text>
              <Image src="/verified.png" w="4" h="4" alt="Verified" />
            </Flex>
          </Flex>
          <Flex gap={4} alignItems="center">
            <Text fontSize="sm" color="gray.light">1d</Text>
            <BsThreeDots />
          </Flex>
        </Flex>
        <Text my={3}>Xin chào mọi người.</Text>
        <Box
          borderRadius={6}
          overflow="hidden"
          border="1px solid"
          borderColor="gray.light"
        >
          <Image src="/post2.png" w="full" alt="Post image" />
        </Box>
      </Link>

      {/* Phần Actions được tách riêng ra ngoài Link - không kích hoạt điều hướng */}
      <Flex gap={3} my={3}>
        <Actions liked={liked} setLiked={setLiked} />
      </Flex>

      {/* Hiển thị số likes cập nhật */}
      <Flex gap={2} alignItems="center">
        <Text color="gray.light" fontSize="sm">123 replies</Text>
        <Box w={0.5} h={0.5} borderRadius="full" bg="gray.light" />
        <Text color="gray.light" fontSize="sm">
          {200 + (liked ? 1 : 0)} likes
        </Text>
      </Flex>
      <Divider my={4}/>
      <Flex justifyContent={"space-between"}>
        <Flex gap={2} alignItems={"center"}>
          <Text fontSize={"2xl"}>
              👋
          </Text>
          <Text color={"gray.light"}> Get the app to like, reply and post</Text>
        </Flex>
        <Button>
          Get
        </Button>
      </Flex>
      <Divider my={4}/>
      <Comment comment="đỉnh vãi" createAt="2d" likes={210} username="Thien" userAvatar="https://bit.ly/kent-c-dodds"/>
      <Comment comment="mãi đỉnh" createAt="2d" likes={24} username="Toai" userAvatar="https://bit.ly/ryan-florence" />
      <Comment comment="8386" createAt="2d" likes={588} username="Ty" userAvatar="https://bit.ly/code-beast" />

    </>
  );
};

export default PostPage;