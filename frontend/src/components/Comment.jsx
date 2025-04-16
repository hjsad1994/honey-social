import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Flex,
    Avatar,
    Text,
    Divider,
    Box,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Portal,
    useDisclosure,
    useColorModeValue,
    Spinner,
    Center
} from '@chakra-ui/react';
import { BsThreeDots } from 'react-icons/bs';
import { useSelector, useDispatch } from 'react-redux';
import useShowToast from '../hooks/useShowToast';
import { updatePost, removeReply } from '../reducers/postReducer';

const Comment = ({ reply, postId, onDeleteReply }) => {
    if (!reply) return null;

    const dispatch = useDispatch();
    const { text, username, userProfilePic, likes = [], userId = "", _id: replyId } = reply;
    const [commentTime] = useState(reply.createdAt || new Date());

    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(likes.length);
    const [isLiking, setIsLiking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const currentUser = useSelector(state => state.user.user);
    const showToast = useShowToast();
    
    const isMounted = useRef(true);
    
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const { isOpen, onOpen, onClose } = useDisclosure();

    const menuListBg = useColorModeValue("white", "#1E1E1E");
    const menuListBorder = useColorModeValue("gray.200", "gray.700");
    const menuItemBg = useColorModeValue("white", "#1E1E1E");
    const deleteHoverBg = useColorModeValue("red.50", "whiteAlpha.200");
    const modalContentBg = useColorModeValue("white", "#1E1E1E");
    const cancelBtnBg = useColorModeValue("gray.200", "whiteAlpha.200");
    const cancelBtnHoverBg = useColorModeValue("gray.300", "whiteAlpha.300");

    const isAuthor = currentUser && userId === currentUser._id;

    const formatTimeCompact = (date) => {
        try {
            if (!date) return "";
            const now = new Date();
            const postDate = new Date(date);
            if (isNaN(postDate.getTime())) return "";
            const diffInSeconds = Math.floor((now - postDate) / 1000);
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
        } catch (error) {
            console.error("Date formatting error:", error);
            return "";
        }
    };

    useEffect(() => {
        if (currentUser && likes) {
            setIsLiked(likes.includes(currentUser._id));
            setLikesCount(likes.length);
        }
    }, [currentUser, likes]);

    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (userId) {
                try {
                    const res = await fetch(`/api/users/profile/${userId}`);
                    const data = await res.json();
                    if (!data.error) {
                        setUserProfile(data.user);
                    }
                } catch (error) {
                    console.error("Không thể lấy thông tin người dùng:", error);
                }
            }
        };
        
        fetchUserData();
    }, [userId]);

    const [isAvatarLoading, setIsAvatarLoading] = useState(true);
    const [avatarError, setAvatarError] = useState(false);

    const getAvatarSrc = () => {
        return userProfilePic || 
               (userProfile?.profilePic) || 
               (currentUser && userId === currentUser._id ? currentUser.profilePic : null) ||
               "/tai.png";
    };
    
    const avatarSrc = getAvatarSrc();
    
    const handleAvatarLoad = () => {
        setIsAvatarLoading(false);
    };
    
    const handleAvatarError = () => {
        setIsAvatarLoading(false);
        setAvatarError(true);
    };
    
    useEffect(() => {
        setIsAvatarLoading(true);
        setAvatarError(false);
    }, [avatarSrc]);

    const handleLike = async () => {
        if (!currentUser) {
            showToast("Error", "Bạn phải đăng nhập để thích bình luận", "error");
            return;
        }
        if (isLiking) return;

        setIsLiking(true);
        const wasLiked = isLiked;
        setIsLiked(!wasLiked);
        setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);

        try {
            const res = await fetch(`/api/posts/reply/like/${reply._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();
            if (data.error && data.error !== "reply liked successfully" && data.error !== "reply unliked successfully") {
                setIsLiked(wasLiked);
                setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
                showToast("Error", data.error, "error");
            } else {
                setTimeout(() => {
                    fetch(`/api/posts/${postId}`)
                        .then(res => res.json())
                        .then(updatedPostData => {
                            if (!updatedPostData.error) {
                                dispatch(updatePost(updatedPostData));
                            }
                        })
                        .catch(err => console.error("Failed to fetch updated post data:", err));
                }, 300);
            }
        } catch (error) {
            setIsLiked(wasLiked);
            setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
            showToast("Error", error.message, "error");
        } finally {
            setIsLiking(false);
        }
    };

    const confirmDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUser || !isAuthor) {
            showToast("Error", "Bạn chỉ có thể xoá bình luận của chính mình", "error");
            return;
        }
        if (isDeleting) return;
        onOpen();
    };

    const handleDeleteComment = async () => {
        setIsDeleting(true);
        
        onClose();
        
        if (onDeleteReply) {
            console.log(`Component Comment gọi callback onDeleteReply với ID: ${replyId}`);
            onDeleteReply(replyId);
        }
        
        try {
            const res = await fetch(`/api/posts/${postId}/replies/${replyId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();
            
            if (!data.error || data.error === "reply deleted successfully") {
                dispatch(removeReply({ postId, replyId }));
                showToast("Success", "Bình luận đã được xóa", "success");
            } else {
                console.error("API error:", data.error);
                showToast("Error", data.error, "error");
            }
        } catch (error) {
            console.error("Lỗi khi xóa bình luận:", error);
            showToast("Error", error.message || "Lỗi khi xóa bình luận", "error");
        } finally {
            if (isMounted.current) {
                setIsDeleting(false);
            }
        }
    };

    return (
        <>
            <Flex gap={4} my={2} w="full">
                <Box position="relative" width="32px" height="32px">
                    {isAvatarLoading && (
                        <Center position="absolute" top="0" left="0" width="100%" height="100%">
                            <Spinner size="xs" color="gray.400" thickness="2px" />
                        </Center>
                        
                    )}
                    <Avatar 
                        src={avatarSrc} 
                        size="sm" 
                        name={username}

                        onLoad={handleAvatarLoad}
                        onError={handleAvatarError}
                        visibility={isAvatarLoading ? "hidden" : "visible"}
                    />  

                    
                </Box>
                <Flex gap={1} w="full" flexDirection="column">
                    <Flex w="full" justifyContent="space-between" alignItems="center">
                        <Flex alignItems="center" gap={2}>
                            <Text fontSize="sm" fontWeight="bold">{username}</Text>
                            <Text fontSize="sm" color="gray.light">{formatTimeCompact(commentTime)}</Text>
                        </Flex>
                        <Flex gap={2} alignItems="center">
                            {isAuthor && (
                                <Box>
                                    <Menu>
                                        <MenuButton>
                                            <BsThreeDots />
                                        </MenuButton>
                                        <Portal>
                                            <MenuList
                                                bg={menuListBg}
                                                borderColor={menuListBorder}
                                                boxShadow="md"
                                            >
                                                <MenuItem
                                                    bg={menuItemBg}
                                                    color="red.500"
                                                    _hover={{ bg: deleteHoverBg }}
                                                    onClick={confirmDelete}
                                                    isDisabled={isDeleting}
                                                >
                                                    {isDeleting ? "Đang xoá..." : "Xoá bình luận"}
                                                </MenuItem>
                                            </MenuList>
                                        </Portal>
                                    </Menu>
                                </Box>
                            )}
                        </Flex>
                    </Flex>
                    <Text>{text}</Text>
                    <Flex gap={2} alignItems="center" mt={1}>
                        <Box>
                            <svg
                                aria-label="Like"
                                color={isLiked ? "rgb(237, 73, 86)" : ""}
                                fill={isLiked ? "rgb(237, 73, 86)" : "transparent"}
                                height="19"
                                role="img"
                                viewBox="0 0 24 22"
                                width="20"
                                onClick={handleLike}
                                style={{
                                    cursor: isLiking ? "wait" : "pointer",
                                    opacity: isLiking ? 0.7 : 1,
                                }}
                            >
                                <path
                                    d="M1 7.66c0 4.575 3.899 9.086 9.987 12.934.338.203.74.406 1.013.406.283 0 .686-.203 1.013-.406C19.1 16.746 23 12.234 23 7.66 23 3.736 20.245 1 16.672 1 14.603 1 12.98 1.94 12 3.352 11.042 1.952 9.408 1 7.328 1 3.766 1 1 3.736 1 7.66Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                ></path>
                            </svg>
                        </Box>
                        {likesCount > 0 && (
                            <Text fontSize="sm" color="gray.light">
                                {likesCount} {likesCount === 1 ? "like" : "likes"}
                            </Text>
                        )}
                    </Flex>
                </Flex>
            </Flex>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
                <ModalContent bg={modalContentBg} borderRadius="lg" mx={4}>
                    <ModalHeader>Xoá bình luận</ModalHeader>
                    <ModalBody pb={6}>
                        <Text>
                            Bạn có chắc chắn muốn xoá bình luận này? Hành động này không thể hoàn tác.
                        </Text>
                    </ModalBody>
                    <ModalFooter gap={3}>
                        <Button
                            onClick={onClose}
                            bg={cancelBtnBg}
                            _hover={{ bg: cancelBtnHoverBg }}
                        >
                            Huỷ
                        </Button>
                        <Button
                            colorScheme="red"
                            onClick={handleDeleteComment}
                            isLoading={isDeleting}
                        >
                            Xoá
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Divider my={4} />
        </>
    );
};

export default Comment;
