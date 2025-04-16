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

// Keep the time formatting function outside the component
const formatTimeCompact = (date) => {
  if (!date) return "";
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
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
    // All hooks at the top level of the component
    const [loading, setLoading] = useState(true);
    const [postUser, setPostUser] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    const showToast = useShowToast();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.user.user);

    // Pre-compute ALL color mode values at the top level
    const bgColor = useColorModeValue("white", "gray.dark");
    const menuListBg = useColorModeValue("white", "gray.dark");
    const menuListBorder = useColorModeValue("gray.200", "gray.700");
    const menuItemBg = useColorModeValue("white", "gray.dark");
    const deleteHoverBg = useColorModeValue("red.50", "gray.600");
    const copyLinkText = useColorModeValue("black", "white");
    const copyLinkHoverBg = useColorModeValue("gray.100", "gray.600");
    const modalContentBg = useColorModeValue("white", "black");
    const modalHeaderColor = useColorModeValue("black", "white");
    const modalBodyColor = useColorModeValue("gray.600", "gray.300");
    const cancelBtnBg = useColorModeValue("gray.100", "gray.700");
    const cancelBtnColor = useColorModeValue("black", "white");
    const cancelBtnHoverBg = useColorModeValue("gray.200", "gray.600");
    const deleteBtnBg = useColorModeValue("black", "white");
    const deleteBtnColor = useColorModeValue("white", "black");
    const deleteBtnHoverBg = useColorModeValue("gray.800", "gray.200");
    const borderColor = useColorModeValue("gray.light", "gray.dark");

    // Effects and callbacks
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

        if (!currentUser || !postUser || currentUser._id !== postUser._id) {
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

    // Determine if current user is the post author
    const isAuthor = currentUser && postUser && currentUser._id === postUser._id;

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
                            <Flex w="full" gap={2} alignItems="center">
                                <Text fontSize="sm" fontWeight="bold">
                                    {postUser.username}
                                </Text>
                                <Image src="/verified.png" w={4} h={4} ml={-1} />
                                <Text fontSize="sm" color="gray.light">
                                    {formatTimeCompact(post.createdAt)}
                                </Text>
                            </Flex>

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

                        <Text fontSize="sm">{post.text}</Text>

                        {post.img && (
                            <Box
                                borderRadius={6}
                                overflow="hidden"
                                border="1px solid"
                                borderColor={borderColor}
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
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
                <ModalContent
                    bg={modalContentBg}
                    borderRadius="15px"
                    mx={4}
                    py={6}
                    px={4}
                    textAlign="center"
                >
                    <ModalHeader
                        fontSize="lg"
                        fontWeight="bold"
                        p={0}
                        mb={4}
                        color={modalHeaderColor}
                        textAlign="center"
                    >
                        Xóa bài viết?
                    </ModalHeader>
                    <ModalBody
                        fontSize="sm"
                        color={modalBodyColor}
                        p={0}
                        mb={6}
                    >
                        Nếu xóa bài viết này, bạn sẽ không thể khôi phục được nữa.
                    </ModalBody>
                    <ModalFooter
                        display="flex"
                        justifyContent="space-between"
                        p={0}
                        w="100%"
                    >
                        <Button
                            onClick={onClose}
                            bg={cancelBtnBg}
                            color={cancelBtnColor}
                            _hover={{ bg: cancelBtnHoverBg }}
                            w="48%"
                            borderRadius="md"
                        >
                            Huỷ
                        </Button>
                        <Button
                            bg={deleteBtnBg}
                            color={deleteBtnColor}
                            _hover={{ bg: deleteBtnHoverBg }}
                            onClick={handleDeletePost}
                            isLoading={isDeleting}
                            loadingText="Deleting..."
                            w="48%"
                            borderRadius="md"
                        >
                            Xoá
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default Post;