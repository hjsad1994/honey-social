import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { RootState } from '../store/store';
import { Reply } from '../types/types';

interface CommentProps {
    reply: Reply;
    postId: string;
    onDeleteReply?: (replyId: string) => void;
}

interface UserProfile {
    _id: string;
    username: string;
    profilePic?: string;
    name: string;
    [key: string]: unknown;
}

const Comment: React.FC<CommentProps> = ({ reply, postId, onDeleteReply }) => {
    // Move all hooks to the top level - before any conditional returns
    const dispatch = useDispatch();
    const showToast = useShowToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const isMounted = useRef<boolean>(true);
    
    // Extract reply properties with defaults for type safety
    const text = reply?.text || "";
    const username = reply?.username || "";
    const userProfilePic = reply?.userProfilePic;
    const likes = useMemo(() => reply?.likes || [], [reply?.likes]);
    const userId = reply?.userId || "";
    const replyId = reply?._id || "";
    const commentTime = useState<Date | string>(reply?.createdAt || new Date());
    
    // State hooks
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [likesCount, setLikesCount] = useState<number>(likes.length);
    const [isLiking, setIsLiking] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isAvatarLoading, setIsAvatarLoading] = useState<boolean>(true);
    const [avatarError, setAvatarError] = useState<boolean>(false);
    
    // Get current user from Redux
    const currentUser = useSelector((state: RootState) => state.user.user);
    
    // Theme values - MUST be at component top level
    const menuListBg = useColorModeValue("white", "#1E1E1E");
    const menuListBorder = useColorModeValue("gray.200", "gray.700");
    const menuItemBg = useColorModeValue("white", "#1E1E1E");
    const deleteHoverBg = useColorModeValue("red.50", "whiteAlpha.200");
    
    // Add all modal color mode values here
    const modalContentBg = useColorModeValue("white", "black");
    const modalHeaderColor = useColorModeValue("black", "white");
    const modalBodyColor = useColorModeValue("gray.600", "gray.300");
    const cancelBtnBg = useColorModeValue("gray.100", "gray.700");
    const cancelBtnColor = useColorModeValue("black", "white");
    const cancelBtnHoverBg = useColorModeValue("gray.200", "gray.600");
    const deleteBtnBg = useColorModeValue("black", "white");
    const deleteBtnColor = useColorModeValue("white", "black");
    const deleteBtnHoverBg = useColorModeValue("gray.800", "gray.200");

    // Define avatar source calculation function
    const getAvatarSrc = (): string => {
        return userProfilePic || 
               (userProfile?.profilePic) || 
               (currentUser && userId === currentUser._id ? currentUser.profilePic : "") ||
               "/tai.png";
    };
    
    // Initialize avatarSrc before using it in any hooks
    const avatarSrc = getAvatarSrc();
    
    // Clean up effect to prevent state updates after unmount
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Check if current user has liked the reply
    useEffect(() => {
        if (currentUser && likes) {
            setIsLiked(likes.includes(currentUser._id));
            setLikesCount(likes.length);
        }
    }, [currentUser, likes]);

    // Fetch user profile for the comment author
    useEffect(() => {
        const fetchUserData = async (): Promise<void> => {
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
    
    // Reset avatar loading state when source changes
    useEffect(() => {
        setIsAvatarLoading(true);
        setAvatarError(false);
    }, [avatarSrc]);
    
    const isAuthor = currentUser && userId === currentUser._id;
    
    // Format time displays
    const formatTimeCompact = (date: Date | string): string => {
        try {
            if (!date) return "";
            const now = new Date();
            const postDate = new Date(date);
            if (isNaN(postDate.getTime())) return "";
            const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
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
    
    const handleAvatarLoad = (): void => {
        setIsAvatarLoading(false);
    };
    
    const handleAvatarError = (): void => {
        setIsAvatarLoading(false);
        setAvatarError(true);
    };

    const handleLike = async (): Promise<void> => {
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
            const res = await fetch(`/api/posts/reply/like/${replyId}`, {
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
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            setIsLiked(wasLiked);
            setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
            showToast("Error", errorMessage, "error");
        } finally {
            setIsLiking(false);
        }
    };

    const confirmDelete = (e: React.MouseEvent): void => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUser || !isAuthor) {
            showToast("Error", "Bạn chỉ có thể xoá bình luận của chính mình", "error");
            return;
        }
        if (isDeleting) return;
        onOpen();
    };

    const handleDeleteComment = async (): Promise<void> => {
        setIsDeleting(true);
        
        onClose();
        
        if (onDeleteReply && replyId) {
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
                showToast("Error", data.error, "error");
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            showToast("Error", errorMessage || "Lỗi khi xóa bình luận", "error");
        } finally {
            if (isMounted.current) {
                setIsDeleting(false);
            }
        }
    };

    // If no reply, render nothing
    if (!reply) return null;

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
                        src={avatarError ? "/tai.png" : avatarSrc} 
                        size="sm" 
                        name={username}
                        onLoad={handleAvatarLoad}
                        onError={handleAvatarError}
                        visibility={isAvatarLoading ? "hidden" : "visible"}
                        bg={avatarError ? "gray.400" : undefined}
                    />  
                </Box>
                <Flex gap={1} w="full" flexDirection="column">
                    <Flex w="full" justifyContent="space-between" alignItems="center">
                        <Flex alignItems="center" gap={2}>
                            <Text fontSize="sm" fontWeight="bold">{username}</Text>
                            <Text fontSize="sm" color="gray.light">{formatTimeCompact(commentTime[0])}</Text>
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
                                {likesCount} {likesCount === 1 ? "thích" : "thích"}
                            </Text>
                        )}
                    </Flex>
                </Flex>
            </Flex>

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
                        Xóa bình luận?
                    </ModalHeader>
                    <ModalBody
                        fontSize="sm"
                        color={modalBodyColor}
                        p={0}
                        mb={6}
                    >
                        Nếu xóa bình luận này, bạn sẽ không thể khôi phục được nữa.
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
                            _hover={{
                                bg: deleteBtnHoverBg,
                            }}
                            onClick={handleDeleteComment}
                            isLoading={isDeleting}
                            loadingText="Đang xóa..."
                            w="48%"
                            borderRadius="md"
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