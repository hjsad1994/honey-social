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
    // Hooks at the top-level
    const [loading, setLoading] = useState(true);
    const [postUser, setPostUser] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const showToast = useShowToast();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.user.user);
    const bgColor = useColorModeValue("white", "gray.dark");

    // Pre-compute all color mode values to avoid inline hook calls
    const menuListBg = useColorModeValue("white", "gray.dark");
    const menuListBorder = useColorModeValue("gray.200", "gray.700");
    const menuItemBg = useColorModeValue("white", "gray.dark");
    const deleteHoverBg = useColorModeValue("red.50", "gray.600");
    const copyLinkText = useColorModeValue("black", "white");
    const copyLinkHoverBg = useColorModeValue("gray.100", "gray.600");
    const modalContentBg = useColorModeValue("white", "gray.800");
    const cancelBtnBg = useColorModeValue("gray.100", "gray.700");
    const cancelBtnHoverBg = useColorModeValue("gray.200", "gray.600");

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

    const confirmDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthor) {
            showToast("Error", "You can only delete your own posts", "error");
            return;
        }

        if (isDeleting) return;
        onOpen();
    };

    const handleDeletePost = async () => {
        setIsDeleting(true);
        try {
            const requestBody = post.img ? { imageUrl: post.img } : {};
            const res = await fetch(`/api/posts/${post._id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });
            const data = await res.json();
            if (data.error && data.error !== "post deleted successfully") {
                showToast("Error", data.error, "error");
                onClose();
                return;
            }
            dispatch(deletePost(post._id));
            showToast("Success", "Post deleted successfully", "success");
            onClose();
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
                        <Box position="relative" w="full" />
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
                                                <circle cx="12" cy="12" r="1.5" />
                                                <circle cx="6" cy="12" r="1.5" />
                                                <circle cx="18" cy="12" r="1.5" />
                                            </svg>
                                        </MenuButton>
                                        <Portal>
                                            <MenuList
                                                bg={menuListBg}
                                                borderColor={menuListBorder}
                                                boxShadow="md"
                                            >
                                                {isAuthor && (
                                                    <MenuItem
                                                        bg={menuItemBg}
                                                        color="red.500"
                                                        _hover={{ bg: deleteHoverBg }}
                                                        onClick={confirmDelete}
                                                        isDisabled={isDeleting}
                                                    >
                                                        {isDeleting ? "Deleting..." : "Delete Post"}
                                                    </MenuItem>
                                                )}
                                                <MenuItem
                                                    bg={menuItemBg}
                                                    color={copyLinkText}
                                                    _hover={{ bg: copyLinkHoverBg }}
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

                        <Text fontSize="sm">{post.text}</Text>

                        {post.img && (
                            <Box
                                borderRadius={6}
                                overflow="hidden"
                                border="1px solid"
                                borderColor="gray.light"
                            >
                                <Image src={post.img} w="full" alt={post.text} />
                            </Box>
                        )}

                        <Flex gap={3} my={1}>
                            <Actions post={post} />
                        </Flex>
                    </Flex>
                </Flex>
            </Link>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
                <ModalContent bg={modalContentBg} borderRadius="lg" mx={4}>
                    <ModalHeader>Delete Post</ModalHeader>
                    <ModalBody pb={6}>
                        <Text>
                            Are you sure you want to delete this post? This action cannot be undone.
                        </Text>
                    </ModalBody>
                    <ModalFooter gap={3}>
                        <Button
                            onClick={onClose}
                            bg={cancelBtnBg}
                            _hover={{ bg: cancelBtnHoverBg }}
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