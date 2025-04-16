import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
import Comment from './Comment';

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

const Post = ({ post: initialPost, postedBy }) => {
    // Tạo state local để quản lý comments
    const [comments, setComments] = useState([]);
    const [commentsVersion, setCommentsVersion] = useState(0); // Thêm state version để buộc re-render
    
    // Khởi tạo comments từ prop khi component mount hoặc post thay đổi
    useEffect(() => {
        if (initialPost?.replies) {
            console.log(`Post ${initialPost._id} có ${initialPost.replies.length} bình luận`);
            setComments(initialPost.replies);
        }
    }, [initialPost._id]); // Chỉ cập nhật khi post ID thay đổi

    // Callback để xóa comment khỏi UI
    const handleDeleteComment = (commentId) => {
        console.log(`Xóa comment có ID ${commentId} khỏi UI`);
        
        // Cập nhật state bằng cách lọc bỏ comment vừa xóa
        setComments(prevComments => 
            prevComments.filter(comment => comment._id !== commentId)
        );
        
        // Tăng version để buộc re-render
        setCommentsVersion(prev => prev + 1);
    };

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
    useEffect(() => {
        console.log("Bài viết/bình luận thay đổi, cập nhật UI");
        // Nếu bạn có thêm logic để cập nhật UI ở đây
    }, [initialPost.replies?.length]); // Phản ứng khi số lượng bình luận thay đổi

    // Console.log để debug
    useEffect(() => {
        console.log("Post updated:", {
            id: initialPost._id,
            replyCount: initialPost.replies?.length || 0,
            replies: initialPost.replies?.map(r => r._id)
        });
    }, [initialPost.replies]);

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
            const requestBody = initialPost.img ? { imageUrl: initialPost.img } : {};
            const res = await fetch(`/api/posts/${initialPost._id}`, {
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
            dispatch(deletePost(initialPost._id));
            showToast("Success", "Post deleted successfully", "success");
            onClose();
            if (window.location.pathname.includes(`/post/${initialPost._id}`)) {
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
            <Link to={`/${postUser.username}/post/${initialPost._id}`}>
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
                                    {formatTimeCompact(new Date(initialPost.createdAt))}
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
                                                        const postUrl = `${window.location.origin}/${postUser.username}/post/${initialPost._id}`;
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

                        <Text fontSize="sm">{initialPost.text}</Text>

                        {initialPost.img && (
                            <Box
                                borderRadius={6}
                                overflow="hidden"
                                border="1px solid"
                                borderColor="gray.light"
                            >
                                <Image src={initialPost.img} w="full" alt={initialPost.text} />
                            </Box>
                        )}

                        <Flex gap={3} my={1}>
                            <Actions post={initialPost} />
                        </Flex>
                    </Flex>
                </Flex>
            </Link>

            {/* QUAN TRỌNG: Sử dụng comments từ state local, không dùng initialPost.replies */}
            <Box>
                {comments.map(reply => (
                    <Comment 
                        key={`${reply._id}-v${commentsVersion}`} 
                        reply={reply} 
                        postId={initialPost._id} 
                        onDeleteReply={handleDeleteComment}
                    />
                ))}
            </Box>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
            <ModalContent
                bg={useColorModeValue("white", "black")} // White in light mode, black in dark mode
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
                    color={useColorModeValue("black", "white")} // Black in light mode, white in dark mode
                    textAlign="center"
                >
                    Xóa bài viết?
                </ModalHeader>
                <ModalBody
                    fontSize="sm"
                    color={useColorModeValue("gray.600", "gray.300")} // Gray in light mode, lighter gray in dark mode
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
                        bg={useColorModeValue("gray.100", "gray.700")} // Light gray in light mode, dark gray in dark mode
                        color={useColorModeValue("black", "white")} // Black in light mode, white in dark mode
                        _hover={{ bg: useColorModeValue("gray.200", "gray.600") }}
                        w="48%"
                        borderRadius="md"
                    >
                        Huỷ
                    </Button>
                    <Button
                        bg={useColorModeValue("black", "white")} // Sáng: nền đen, Tối: nền trắng
                        color={useColorModeValue("white", "black")} // Sáng: chữ trắng, Tối: chữ đen
                        _hover={{
                            bg: useColorModeValue("gray.800", "gray.200"), // Sáng: xám đậm, Tối: xám nhạt
                        }}
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

export default React.memo(Post);