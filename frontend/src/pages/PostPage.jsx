import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Flex, Avatar, Box, Text, Image, 
  Divider, Button, Spinner, useColorModeValue,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, useDisclosure,
  Menu, MenuButton, MenuList, MenuItem, Portal
} from '@chakra-ui/react';
import { useSelector, useDispatch } from 'react-redux';
import { deletePost } from '../reducers/postReducer';
import Actions from '../components/Actions';
import Comment from '../components/Comment';
import useShowToast from '../hooks/useShowToast';

const PostPage = () => {
  const { username, pid } = useParams();
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const showToast = useShowToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.user);

  // Pre-compute all color mode values
  const menuListBg = useColorModeValue("white", "gray.dark");
  const menuListBorder = useColorModeValue("gray.200", "gray.700");
  const menuItemBg = useColorModeValue("white", "gray.dark");
  const deleteHoverBg = useColorModeValue("red.50", "gray.600");
  const copyLinkText = useColorModeValue("black", "white");
  const copyLinkHoverBg = useColorModeValue("gray.100", "gray.600");
  const modalContentBg = useColorModeValue("white", "gray.800");
  const cancelBtnBg = useColorModeValue("gray.100", "gray.700");
  const cancelBtnHoverBg = useColorModeValue("gray.200", "gray.600");

  // Fetch post data when component mounts
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/posts/${pid}`);
        const data = await res.json();
        
        if (data.error) {
          showToast("Error", data.error, "error");
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
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [pid, showToast, navigate]);

  // Add confirmDelete handler
  const confirmDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser || !user || currentUser._id !== user._id) {
      showToast("Error", "You can only delete your own posts", "error");
      return;
    }

    if (isDeleting) return;
    onOpen();
  };

  // Delete post function
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
      navigate(`/${user.username}`);
    } catch (error) {
      showToast("Error", error.message, "error");
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  // Format time function
  const formatTimeCompact = (date) => {
    try {
      const now = new Date();
      const postDate = new Date(date);
      
      // Check if date is valid
      if (isNaN(postDate.getTime())) {
        return ""; // Return empty string for invalid dates
      }
      
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

  // Show loading state
  if (loading) {
    return (
      <Flex justifyContent="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  // Return empty if post not found
  if (!post) return null;
  
  // Determine if current user is the post author
  const isAuthor = currentUser && user && currentUser._id === user._id;

  return (
    <>
      <Flex>
        <Flex w="full" alignItems="center" gap={3}>
          <Avatar src={user?.profilePic} size="md" name={user?.name} />
          <Flex alignItems="center" gap={2}>
            <Text fontSize="sm" fontWeight="bold">
              {user?.username}
            </Text>
            <Image src="/verified.png" w="4" h="4" alt="Verified" />
          </Flex>
        </Flex>
        <Flex gap={4} alignItems="center">
          <Text fontSize="xs" width={20} mt={1} textAlign="right" color="gray.light">
            {formatTimeCompact(post.createdAt || new Date())}
          </Text>
          
          {/* Replace DeleteIcon with Menu */}
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
                      const postUrl = `${window.location.origin}/${user.username}/post/${post._id}`;
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

      <Text my={3}>{post.text}</Text>

      {post.img && (
        <Box
          borderRadius={6}
          overflow="hidden"
          border="1px solid"
          borderColor="gray.light"
        >
          <Image src={post.img} w="full" alt="Post image" />
        </Box>
      )}

      <Flex gap={3} my={3}>
        <Actions post={post} />
      </Flex>

      <Divider my={4} />

      <Flex justifyContent="space-between">
        <Flex gap={2} alignItems="center">
          <Text fontSize="2xl">👋</Text>
          <Text color="gray.light"> Get the app to like, reply and post</Text>
        </Flex>
        <Button>
          Get
        </Button>
      </Flex>

      <Divider my={4} />
      
      {post.replies && post.replies.length > 0 ? (
        post.replies.map((reply, index) => (
          <Comment
            key={reply._id || index}
            comment={reply.text}
            username={reply.username}
            userAvatar={reply.userProfilePic}
            createAt={formatTimeCompact(reply.createdAt)}
            likes={reply.likes?.length || 0}
          />
        ))
      ) : (
        <Text color="gray.light" textAlign="center" py={4}>No comments yet</Text>
      )}

      {/* Delete Post Modal */}
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

export default PostPage;