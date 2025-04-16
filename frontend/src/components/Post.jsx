import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Flex, Avatar, Box, Text, Image, Spinner, 
    Menu, MenuButton, MenuList, MenuItem, 
    Portal, useColorModeValue,
    Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalFooter, ModalBody, Button, useDisclosure
} from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { deletePost } from '../reducers/postReducer';
import Actions from './Actions';
import useShowToast from '../hooks/useShowToast';

const formatTimeCompact = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
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

const Post = ({ post, postedBy }) => {
    const [loading, setLoading] = useState(true);
    const [postUser, setPostUser] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const showToast = useShowToast();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.user.user);
    
    // Determine if the current user is the post author
    const isAuthor = currentUser && postUser && currentUser._id === postUser._id;

    // Fetch user data when component mounts
    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (!postedBy) return;
                
                const res = await fetch("/api/users/profile/" + postedBy);
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                
                setPostUser(data.user);
            } catch (error) {
                showToast("Error", error.message, "error");
                setPostUser(null); 
            } finally {
                setLoading(false);
            }
        };
        
        fetchUser();
    }, [postedBy, showToast]);

    // Prepare for post deletion - opens confirmation modal
    const confirmDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isAuthor) {
            showToast("Error", "You can only delete your own posts", "error");
            return;
        }
        
        if (isDeleting) return;
        
        // Open confirmation modal instead of window.confirm()
        onOpen();
    };

    // Actually handle the post deletion after confirmation
    const handleDeletePost = async () => {
        setIsDeleting(true);
        
        try {
            // Include image URL in the request body if post has an image
            const requestBody = post.Image ? { imageUrl: post.Image } : {};
            
            const res = await fetch(`/api/posts/${post._id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody)
            });
            
            const data = await res.json();
            
            if (data.error && data.error !== "post deleted successfully") {
                showToast("Error", data.error, "error");
                onClose();
                return;
            }
            
            // Dispatch the delete action to update Redux state
            dispatch(deletePost(post._id));
            
            showToast("Success", "Post deleted successfully", "success");
            onClose();
            
            // Handle navigation after successful deletion
            if (window.location.pathname.includes(`/post/${post._id}`)) {
                navigate(`/${postUser.username}`);
            }
            
        } catch (error) {
            showToast("Error", error.message, "error");
            onClose();
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <Flex justifyContent="center" py={4}>
                <Spinner size="md" />
            </Flex>
        );
    }

    if (!postUser) return null;

    return (
        <>
            <Link to={`/${postUser.username}/post/${post._id}`}>
                <Flex gap={3} mb={4} py={5}>
                    <Flex flexDirection="column" alignItems="center">
                        <Avatar 
                            size="md" 
                            name={postUser.name} 
                            src={postUser.profilePic || "/tai.png"} 
                        />
                        <Box position="relative" w="full">
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
                                <Text fontSize="xs" width={20} mt={1} textAlign={'right'} color="gray.light">
                                    {formatTimeCompact(new Date(post.createdAt))}
                                </Text>
                                
                                {/* Three Dots Menu */}
                                <Box onClick={(e) => e.preventDefault()} ml={2}>
                                    <Menu>
                                        <MenuButton>
                                            <svg 
                                                aria-label="More options" 
                                                role="img" 
                                                viewBox="0 0 24 24" 
                                                width="20" 
                                                height="20"
                                                fill="currentColor"
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <title>More options</title>
                                                <circle cx="12" cy="12" r="1.5"></circle>
                                                <circle cx="6" cy="12" r="1.5"></circle>
                                                <circle cx="18" cy="12" r="1.5"></circle>
                                            </svg>
                                        </MenuButton>
                                        <Portal>
                                            <MenuList 
                                                bg={useColorModeValue("white", "gray.dark")} 
                                                borderColor={useColorModeValue("gray.200", "gray.700")}
                                                boxShadow="md"
                                            >
                                                {isAuthor && (
                                                    <MenuItem 
                                                        bg={useColorModeValue("white", "gray.dark")} 
                                                        color="red.500"
                                                        _hover={{ bg: useColorModeValue("red.50", "gray.600") }}
                                                        onClick={confirmDelete}
                                                        isDisabled={isDeleting}
                                                    >
                                                        {isDeleting ? "Deleting..." : "Delete Post"}
                                                    </MenuItem>
                                                )}
                                                <MenuItem 
                                                    bg={useColorModeValue("white", "gray.dark")} 
                                                    color={useColorModeValue("black", "white")}
                                                    _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        const postUrl = `${window.location.origin}/${postUser.username}/post/${post._id}`;
                                                        navigator.clipboard.writeText(postUrl);
                                                        showToast("Success", "Link copied to clipboard", "success");
                                                    }}
                                                >
                                                    Copy Link
                                                </MenuItem>
                                            </MenuList>
                                        </Portal>
                                    </Menu>
                                </Box>
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
                            <Actions post={post} />
                        </Flex>
                    </Flex>
                </Flex>
            </Link>

            {/* Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay 
                    bg="blackAlpha.300" 
                    backdropFilter="blur(5px)"
                />
                <ModalContent 
                    bg={useColorModeValue("white", "gray.800")}
                    borderRadius="lg"
                    mx={4}
                >
                    <ModalHeader>Delete Post</ModalHeader>
                    <ModalBody pb={6}>
                        <Text>Are you sure you want to delete this post? This action cannot be undone.</Text>
                    </ModalBody>

                    <ModalFooter gap={3}>
                        <Button 
                            onClick={onClose}
                            bg={useColorModeValue("gray.100", "gray.700")}
                            _hover={{ bg: useColorModeValue("gray.200", "gray.600") }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            colorScheme="red" 
                            onClick={handleDeletePost}
                            isLoading={isDeleting}
                            loadingText="Deleting..."
                        >
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default Post;