import React, { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Flex, Avatar, Box, Text, Image, Spinner, 
    Menu, MenuButton, MenuList, MenuItem, 
    Portal, useColorModeValue,
    Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalFooter, ModalBody, Button, useDisclosure,
    Tooltip,
    Radio,
    RadioGroup,
    Textarea,
    VStack
} from '@chakra-ui/react';
import { FiFlag } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { deletePost } from '../reducers/postReducer';
import Actions from './Actions';
import useShowToast from '../hooks/useShowToast';
import { Post as PostType, User } from '../types/types';
import { RootState } from '../store/store';

// Keep the time formatting function outside the component
const formatTimeCompact = (date: string | Date): string => {
  if (!date) return "";
  const now = new Date();
  const postDate = new Date(date);
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
};

// Get detailed date for tooltip
const getDetailedDate = (date: string | Date): string => {
  if (!date) return "";
  return new Date(date).toLocaleString('vi-VN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Modify the interface to remove separate postedBy prop
interface PostProps {
  post: PostType;
}

const Post = memo(({ post }: PostProps) => {
    // Extract postedBy from post at the beginning
    const postedByValue = typeof post.postedBy === 'string' ? post.postedBy : post.postedBy._id;
    
    // Rest of your component remains the same, just use postedByValue instead of postedBy prop
    const [loading, setLoading] = useState<boolean>(true);
    const [postUser, setPostUser] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isReportDialogOpen, setIsReportDialogOpen] = useState<boolean>(false);
    const [reportReason, setReportReason] = useState<string>("spam");
    const [customReason, setCustomReason] = useState<string>("");
    const [isReporting, setIsReporting] = useState<boolean>(false);
    
    const showToast = useShowToast();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentUser = useSelector((state: RootState) => state.user.user);

    // Pre-compute ALL color mode values at the top level
    // Remove unused bgColor variable
    const menuListBg = useColorModeValue("white", "gray.dark");
    const menuListBorder = useColorModeValue("gray.200", "gray.700");
    const menuItemBg = useColorModeValue("white", "gray.dark");
    const deleteHoverBg = useColorModeValue("red.50", "gray.600");
    const copyLinkText = useColorModeValue("black", "white");
    const copyLinkHoverBg = useColorModeValue("gray.100", "gray.600");
    const modalContentBg = useColorModeValue("white", "#101010");
    const modalHeaderColor = useColorModeValue("black", "white");
    const modalBodyColor = useColorModeValue("gray.600", "gray.300");
    const cancelBtnColor = useColorModeValue("black", "white");
    const deleteBtnBg = useColorModeValue("black", "white");
    const deleteBtnColor = useColorModeValue("white", "black");
    const deleteBtnHoverBg = useColorModeValue("gray.800", "gray.200");
    const inputBg = useColorModeValue("white", "gray.800");
    const postTextColor = useColorModeValue("gray.800", "gray.100");

    // Effects and callbacks
    useEffect(() => {
        const fetchUser = async () => {
            try {
                if (!postedByValue) return;
                
                const res = await fetch("/api/users/profile/" + postedByValue);
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                setPostUser(data.user);
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                showToast("Error", errorMessage, "error");
                setPostUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [postedByValue, showToast]);

    const confirmDelete = (e: React.MouseEvent): void => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUser || !postUser || currentUser._id !== postUser._id) {
            showToast("Error", "Bạn chỉ có thể xóa bài viết của chính mình", "error");
            return;
        }

        if (isDeleting) return;
        onOpen();
    };

    const handleDeletePost = async (): Promise<void> => {
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
            showToast("Success", "Xóa bài viết thành công", "success");
            onClose();
            
            if (window.location.pathname.includes(`/post/${post._id}`)) {
                navigate(`/${postUser?.username}`);
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            showToast("Error", errorMessage, "error");
            onClose();
        } finally {
            setIsDeleting(false);
        }
    };

    const copyPostLink = (e: React.MouseEvent): void => {
        e.preventDefault();
        if (!postUser) return;
        
        const postUrl = `${window.location.origin}/${postUser.username}/post/${post._id}`;
        navigator.clipboard.writeText(postUrl)
            .then(() => {
                showToast("Success", "Đã sao chép liên kết vào bộ nhớ tạm", "success");
            })
            .catch((error: unknown) => {
                showToast("Error", "Không thể sao chép liên kết", "error");
                console.error("Copy failed:", error);
            });
    };

    const openReportDialog = (e: React.MouseEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        setIsReportDialogOpen(true);
    };

    const handleReport = async (): Promise<void> => {
        if (reportReason === "other" && !customReason.trim()) {
            showToast("Lỗi", "Vui lòng nhập lý do báo cáo", "error");
            return;
        }

        setIsReporting(true);
        try {
            const res = await fetch('/api/moderation/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    credentials: 'include',
                },
                body: JSON.stringify({
                    postId: post._id,
                    reason: reportReason, // Luôn gửi lựa chọn gốc (kể cả "other")
                    customReason: reportReason === "other" ? customReason : undefined, // Chỉ gửi khi chọn "other"
                    content: post.text
                }),
            });

            const data = await res.json();

            if (data.error) {
                showToast("Lỗi", data.error, "error");
            } else {
                showToast("Thành công", "Cảm ơn bạn đã báo cáo bài viết này", "success");
                setIsReportDialogOpen(false);
                setReportReason("spam");
                setCustomReason("");
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
            showToast("Lỗi", errorMessage, "error");
        } finally {
            setIsReporting(false);
        }
    };

    // Determine if current user is the post author
    const isAuthor = currentUser && postUser && currentUser._id === postUser._id;

    if (loading) {
        return (
            <Flex justifyContent="center" py={4}>
                <Spinner size="md" color="blue.500" />
            </Flex>
        );
    }

    if (!postUser) return null;

    const detailedDate = getDetailedDate(post.createdAt);

    return (
        <>
            <Link to={`/${postUser.username}/post/${post._id}`}>
                <Flex 
                    gap={3} 
                    mb={4} 
                    py={5} 
                    borderRadius="lg"
                >
                    <Flex flexDirection="column" alignItems="center">
                        <Avatar
                            size="md"
                            name={postUser.name}
                            src={postUser.profilePic || "/tai.png"}
                            cursor="pointer"
                            onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                navigate(`/${postUser.username}`);
                            }}
                        />
                        <Box position="relative" w="full" />
                    </Flex>
                    <Flex flex={1} flexDirection="column" gap={2}>
                        <Flex justifyContent="space-between" w="full">
                            <Flex w="full" gap={2} alignItems="center">
                                <Text 
                                    fontSize="sm" 
                                    fontWeight="bold"
                                    onClick={(e: React.MouseEvent) => {
                                        e.preventDefault();
                                        navigate(`/${postUser.username}`);
                                    }}
                                    cursor="pointer"
                                    _hover={{ textDecoration: "underline" }}
                                >
                                    {postUser.username}
                                </Text>
                                {postUser.isVerified && (
                                    <Image src="/verified.png" w={4} h={4} ml={-1} />
                                )}
                                <Tooltip label={detailedDate} placement="top" hasArrow>
                                    <Text fontSize="sm" color="gray.light">
                                        {formatTimeCompact(post.createdAt)}
                                    </Text>
                                </Tooltip>
                            </Flex>

                            <Box onClick={(e) => e.preventDefault()} ml={2}>
                                <Menu>
                                    <MenuButton aria-label="More options">
                                        <svg
                                            aria-label="More options"
                                            role="img"
                                            viewBox="0 0 24 24"
                                            width="20"
                                            height="20"
                                            fill="currentColor"
                                            style={{ cursor: 'pointer' }}
                                        >
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
                                                    {isDeleting ? "Đang xóa..." : "Xóa bài viết"}
                                                </MenuItem>
                                            )}
                                            <MenuItem
                                                bg={menuItemBg}
                                                color={copyLinkText}
                                                _hover={{ bg: copyLinkHoverBg }}
                                                onClick={copyPostLink}
                                            >
                                                Sao chép liên kết
                                            </MenuItem>
                                            <MenuItem
                                                bg={menuItemBg}
                                                color={copyLinkText}
                                                _hover={{ bg: copyLinkHoverBg }}
                                                onClick={openReportDialog}
                                            >
                                                <FiFlag style={{ marginRight: '8px' }} />
                                                Báo cáo bài viết
                                            </MenuItem>
                                        </MenuList>
                                    </Portal>
                                </Menu>
                            </Box>
                        </Flex>

                        <Text fontSize="sm" color={postTextColor}>{post.text}</Text>

                        {post.img && (
                            <Box
                                borderRadius={15}
                                overflow="hidden"
                                // border="1px solid"
                                borderWidth={"0.5px"}
                                borderStyle="solid"

                                // borderColor={borderColor}
                            >
                                <Image 
                                  src={post.img} 
                                  w="full" 
                                  alt={post.text}
                                  loading="lazy"
                                  transition="all 0.3s"
                                  _hover={{ transform: "scale(1.005)" }}
                                />
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
                            colorScheme="gray"
                            variant="outline"
                            color={cancelBtnColor}
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
                            loadingText="Đang xóa..."
                            w="48%"
                            borderRadius="md"
                        >
                            Xoá
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isReportDialogOpen} onClose={() => setIsReportDialogOpen(false)} isCentered>
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
                <ModalContent
                    bg={modalContentBg}
                    borderRadius="15px"
                    mx={4}
                    py={6}
                    px={4}
                >
                    <ModalHeader
                        fontSize="lg"
                        fontWeight="bold"
                        p={0}
                        mb={4}
                        color={modalHeaderColor}
                        textAlign="center"
                    >
                        Báo cáo bài viết
                    </ModalHeader>
                    <ModalBody fontSize="sm" color={modalBodyColor} p={0} mb={4}>
                        <Text mb={4}>Vui lòng chọn lý do bạn báo cáo bài viết này:</Text>
                        
                        <RadioGroup value={reportReason} onChange={setReportReason} mb={5}>
                            <VStack align="flex-start" spacing={3}>
                                <Radio value="spam">Spam hoặc quảng cáo</Radio>
                                <Radio value="violence">Bạo lực hoặc nguy hiểm</Radio>
                                <Radio value="hate">Ngôn từ thù địch</Radio>
                                <Radio value="harassment">Quấy rối hoặc bắt nạt</Radio>
                                <Radio value="adult">Nội dung người lớn</Radio>
                                <Radio value="other">Khác</Radio>
                            </VStack>
                        </RadioGroup>
                        
                        {reportReason === "other" && (
                            <Textarea
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="Mô tả lý do báo cáo..."
                                size="md"
                                resize="vertical"
                                minHeight="100px"
                                focusBorderColor="blue.500"
                                bg={inputBg}
                                mt={2}
                            />
                        )}
                    </ModalBody>
                    <ModalFooter
                        display="flex"
                        justifyContent="space-between"
                        p={0}
                        w="100%"
                    >
                        <Button
                            onClick={() => setIsReportDialogOpen(false)}
                            variant="outline"
                            color={cancelBtnColor}
                            w="48%"
                            borderRadius="md"
                        >
                            Huỷ
                        </Button>
                        <Button
                            bg="red.500"
                            color="white"
                            _hover={{ bg: "red.600" }}
                            onClick={handleReport}
                            isLoading={isReporting}
                            loadingText="Đang gửi..."
                            w="48%"
                            borderRadius="md"
                        >
                            Báo cáo
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
});

export default Post;