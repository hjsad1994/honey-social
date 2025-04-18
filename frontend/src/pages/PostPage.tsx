import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Flex, Avatar, Box, Text, Image,
  Divider, Button, Spinner, useColorModeValue,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, useDisclosure,
  Menu, MenuButton, MenuList, MenuItem, Portal,
  Icon, Tooltip
} from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { FiCopy, FiTrash2, FiMoreHorizontal } from 'react-icons/fi';
import { deletePost } from '../reducers/postReducer';
import Actions from '../components/Actions';
import Comment from '../components/Comment';
import useShowToast from '../hooks/useShowToast';
import { Post as IPost, Reply as IReply, User as IUser } from '../types/types';
import { RootState } from '../store/store';

// Date utility function
const formatTimeCompact = (date: Date | string): string => {
  if (!date) return "";
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  
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

const PostPage: React.FC = () => {
  const { pid } = useParams<{ username?: string; pid: string }>();
  const [post, setPost] = useState<IPost | null>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [localReplies, setLocalReplies] = useState<IReply[]>([]);

  const showToast = useShowToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user.user);

  // Pre-compute all color mode values
  const menuListBg = useColorModeValue("white", "gray.dark");
  const menuListBorder = useColorModeValue("gray.200", "gray.700");
  const menuItemBg = useColorModeValue("white", "gray.dark");
  const deleteHoverBg = useColorModeValue("red.50", "gray.600");
  const copyLinkText = useColorModeValue("black", "white");
  const copyLinkHoverBg = useColorModeValue("gray.100", "gray.600");
  const modalContentBg = useColorModeValue("white", "#161617");
  const modalHeaderColor = useColorModeValue("black", "white");
  const modalBodyColor = useColorModeValue("gray.600", "gray.300");
  const cancelBtnColor = useColorModeValue("black", "white");
  const deleteBtnBg = useColorModeValue("black", "white");
  const deleteBtnColor = useColorModeValue("white", "black");
  const deleteBtnHoverBg = useColorModeValue("gray.800", "gray.200");
  const cardBg = useColorModeValue("white", "#161617");
  const shadowColor = useColorModeValue("lg", "dark-lg");
  const borderColor = useColorModeValue("blackAlpha.300", "whiteAlpha.200");
  const textColor = useColorModeValue("gray.800", "white");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.400");
  const imageBorderColor = useColorModeValue("gray.200", "gray.700");

  // Fetch post data when component mounts
  useEffect(() => {
    const fetchPost = async (): Promise<void> => {
      if (!pid) return;
      
      setLoading(true);
      try {
        const res = await fetch(`/api/posts/${pid}`);
        const data = await res.json();

        if (data.error) {
          showToast("Lỗi", data.error, "error");
          navigate('/');
          return;
        }

        setPost(data);

        // Fetch post author data
        if (data.postedBy) {
          const userRes = await fetch(`/api/users/profile/${data.postedBy}`);
          const userData = await userRes.json();

          if (!userData.error) {
            setUser(userData.user);
          }
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        showToast("Lỗi", errorMessage, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [pid, showToast, navigate]);

  // Update localReplies when post changes
  useEffect(() => {
    if (post?.replies) {
      setLocalReplies(post.replies);
    }
  }, [post?._id, post?.replies]); // Added post.replies to dependency array

  // Callback to remove comment from UI
  const handleDeleteComment = useCallback((commentId: string): void => {
    setLocalReplies(prev => prev.filter(reply => reply._id !== commentId));
    
    // Also update the post object to ensure the reply count is correct
    setPost((prevPost: IPost | null) => {
      if (!prevPost || !prevPost.replies) return prevPost;
      
      return {
        ...prevPost,
        replies: prevPost.replies.filter((reply: IReply) => reply._id !== commentId)
      };
    });
  }, []);

  // Refresh post data after adding comments or other changes
  const refreshPostData = useCallback(async (): Promise<void> => {
    if (!pid) return;
    
    try {
      const res = await fetch(`/api/posts/${pid}`);
      const data = await res.json();

      if (data.error) {
        showToast("Lỗi", data.error, "error");
        return;
      }

      setPost(data);
      
      if (data.replies) {
        setLocalReplies(data.replies);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast("Lỗi", errorMessage, "error");
    }
  }, [pid, showToast]);

  // Handle post deletion confirmation
  const confirmDelete = useCallback((e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser || !user || currentUser._id !== user._id) {
      showToast("Lỗi", "Bạn chỉ có thể xóa bài viết của chính mình", "error");
      return;
    }

    if (isDeleting) return;
    onOpen();
  }, [currentUser, user, isDeleting, onOpen, showToast]);

  // Delete post function
  const handleDeletePost = useCallback(async (): Promise<void> => {
    if (!post?._id) return;
    
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
        showToast("Lỗi", data.error, "error");
        onClose();
        return;
      }

      dispatch(deletePost(post._id));
      showToast("Thành công", "Đã xóa bài viết", "success");
      onClose();
      navigate(`/${user?.username}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast("Lỗi", errorMessage, "error");
      onClose();
    } finally {
      setIsDeleting(false);
    }
  }, [post, user, dispatch, navigate, onClose, showToast]);

  // Copy post URL to clipboard
  const copyPostLink = useCallback((e: React.MouseEvent): void => {
    e.preventDefault();
    if (!user?.username || !post?._id) return;
    
    const postUrl = `${window.location.origin}/${user.username}/post/${post._id}`;
    navigator.clipboard.writeText(postUrl)
      .then(() => {
        showToast("Thành công", "Đã sao chép liên kết vào clipboard", "success");
      })
      .catch(() => {
        showToast("Lỗi", "Không thể sao chép liên kết", "error");
      });
  }, [post, user, showToast]);

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" my={10}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  if (!post || !user) return null;

  const isAuthor = currentUser && user && currentUser._id === user._id;

  return (
    <Box
      p={{ base: 4, md: 6 }}
      borderRadius="30px"
      borderWidth="0.5px" 
      borderStyle="solid"
      borderColor={borderColor}
      bg={cardBg}
      boxShadow={shadowColor}
      transition="all 0.3s ease"
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Flex alignItems="center" gap={3}>
          <Avatar 
            src={user.profilePic} 
            size="md" 
            name={user.name} 
            onClick={() => navigate(`/${user.username}`)}
            cursor="pointer"
          />
          <Box>
            <Flex alignItems="center" gap={2}>
              <Text 
                fontSize="sm" 
                fontWeight="bold"
                onClick={() => navigate(`/${user.username}`)}
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
              >
                {user.username}
              </Text>
              {user.isVerified && (
                <Image src="/verified.png" w="4" h="4" alt="Verified" />
              )}
            </Flex>
            <Text fontSize="xs" color={secondaryTextColor}>
              {formatTimeCompact(post.createdAt || new Date())}
            </Text>
          </Box>
        </Flex>

        <Box>
          <Menu placement="bottom-end">
            <Tooltip label="Tùy chọn" hasArrow placement="left">
              <MenuButton 
                as={Box} 
                p={2} 
                borderRadius="full" 
                _hover={{ bg: "blackAlpha.200" }}
                transition="all 0.2s"
              >
                <Icon as={FiMoreHorizontal} boxSize={5} />
              </MenuButton>
            </Tooltip>
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
                    icon={<FiTrash2 />}
                  >
                    {isDeleting ? "Đang xóa..." : "Xóa bài viết"}
                  </MenuItem>
                )}
                <MenuItem
                  bg={menuItemBg}
                  color={copyLinkText}
                  _hover={{ bg: copyLinkHoverBg }}
                  onClick={copyPostLink}
                  icon={<FiCopy />}
                >
                  Sao chép liên kết
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        </Box>
      </Flex>

      <Text my={4} color={textColor}>{post.text}</Text>

      {post.img && (
        <Box
          borderRadius={12}
          overflow="hidden"
          border="1px solid"
          borderColor={imageBorderColor}
          mb={4}
        >
          <Image 
            src={post.img} 
            w="full" 
            alt="Post image" 
            loading="lazy" 
          />
        </Box>
      )}

      <Flex gap={3} my={3}>
        <Actions post={post} onReplyAdded={refreshPostData} />
      </Flex>

      <Divider my={4} />

      {localReplies.length > 0 ? (
        <>
          <Text fontSize="sm" fontWeight="medium" mb={4} color={textColor}>
            Bình luận ({localReplies.length})
          </Text>
          {localReplies.map((reply) => (
            <Comment
              key={reply._id}
              reply={reply}
              postId={post._id}
              onDeleteReply={handleDeleteComment}
            />
          ))}
        </>
      ) : (
        <Text color={secondaryTextColor} textAlign="center" py={4}>
          Chưa có bình luận nào
        </Text>
      )}

      {/* Delete Post Modal */}
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
              _hover={{
                bg: deleteBtnHoverBg
              }}
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
    </Box>
  );
};

export default PostPage;