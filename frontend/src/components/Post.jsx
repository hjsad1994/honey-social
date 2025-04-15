import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flex, Avatar, Box, Text, Image, Spinner } from '@chakra-ui/react';
import { BsThreeDots } from 'react-icons/bs';
import Actions from './Actions';
import useShowToast from '../hooks/useShowToast';
import {formatDistanceToNow} from 'date-fns'
const Post = ({ post, postedBy }) => {
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [postUser, setPostUser] = useState(null); // Renamed from 'user' to 'postUser'
    const showToast = useShowToast();

    // Fetch user data when component mounts
    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (!postedBy) return;
                
                const res = await fetch("/api/users/profile/" + postedBy);
                const data = await res.json();
                console.log(data)
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                
                setPostUser(data.user); // Changed to store data.user instead of data
            } catch (error) {
                showToast("Error", error.message, "error");
                setPostUser(null); 
            } finally {
                setLoading(false);
            }
        };
        
        fetchUser();
    }, [postedBy, showToast]);

    // Check if user has liked the post
    useEffect(() => {
        if (post?.likes?.includes(postedBy)) {
            setLiked(true);
        }
    }, [post, postedBy]);

    if (loading) {
        return (
            <Flex justifyContent="center" py={4}>
                <Spinner size="md" />
            </Flex>
        );
    }

    if (!postUser) return null;

    return (
        <Link to={`/${postUser.username}/post/${post._id}`}>
            <Flex gap={3} mb={4} py={5}>
                <Flex flexDirection="column" alignItems="center">
                    <Avatar 
                        size="md" 
                        name={postUser.name} 
                        src={postUser.profilePic || "/tai.png"} 
                    />
                    {/* <Box w="1px" h="full" bg="gray.light" my={2} /> */}
                    <Box position="relative" w="full">
                        {/* You can remove these or customize them as needed */}
                        {/* <Avatar
                            size="xs"
                            name="like1"
                            src="https://bit.ly/dan-abramov"
                            position="absolute"
                            top="0px"
                            left="15px"
                            padding="2px"
                        /> */}
                        {/* <Avatar
                            size="xs"
                            name="like2"
                            src="https://bit.ly/tioluwani-kolawole"
                            position="absolute"
                            bottom="0px"
                            right="-5px"
                            padding="2px"
                        /> */}
                        {/* <Avatar
                            size="xs"
                            name="like3"
                            src="https://bit.ly/ryan-florence"
                            position="absolute"
                            bottom="0px"
                            left="4px"
                            padding="2px"
                        /> */}
                    </Box>
                </Flex>
                <Flex flex={1} flexDirection="column" gap={2}>
                    <Flex justifyContent="space-between" w="full">
                        <Flex w="full" alignItems="center">
                            <Text fontSize="sm" fontWeight="bold">
                                {postUser.username}
                            </Text>
                            <Image src="/verified.png" w={4} h={4} ml={1} />
                        </Flex>
                        <Flex gap={4} alignContent="center">
                            <Text fontSize="xs" width={20} textAlign={'right'} color="gray.light">
                                {formatDistanceToNow(new Date(post.createdAt))}
                            </Text>
                            {/* <BsThreeDots /> */}
                        </Flex>
                    </Flex>

                    <Text fontSize="sm">{post.Text}</Text>

                    {post.Image && (
                        <Box
                            borderRadius={6}
                            overflow="hidden"
                            border="1px solid"
                            borderColor="gray.light"
                        >
                            <Image src={post.Image} w="full" alt={post.Text} />
                        </Box>
                    )}

                    <Flex gap={3} my={1}>
                        <Actions liked={liked} setLiked={setLiked} />
                    </Flex>

                    <Flex gap={2} alignItems="center">
                        <Text color="gray.light" fontSize="sm">
                            {post.replies?.length || 0} replies
                        </Text>
                        <Box w={0.5} h={0.5} borderRadius="full" bg="gray.light" />
                        <Text color="gray.light" fontSize="sm">
                            {post.likes?.length || 0} likes
                        </Text>
                    </Flex>
                </Flex>
            </Flex>
        </Link>
    );
};

export default Post;