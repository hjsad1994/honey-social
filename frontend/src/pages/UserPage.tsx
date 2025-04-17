import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import UserHeader from "../components/UserHeader";
import Post from "../components/Post";
import { useColorModeValue, Box, Spinner, Flex, Text, Button, Icon } from "@chakra-ui/react";
import { FiRefreshCw } from "react-icons/fi";
import useShowToast from "../hooks/useShowToast";
import { setUserPosts } from "../reducers/postReducer";
import { RootState } from "../store/store";
import { User, Post as IPost } from "../types/types";
import { AppDispatch } from "../store/store";

const UserPage: React.FC = () => {
  // State hooks
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchingPosts, setFetchingPosts] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Other hooks
  const { username } = useParams<{ username: string }>();
  const showToast = useShowToast();
  const dispatch = useDispatch<AppDispatch>();
  
  // Store all color mode values at the component top level
  const cardBg = useColorModeValue("white", "#161617");
  const shadowColor = useColorModeValue("lg", "dark-lg");
  const borderColor = useColorModeValue("blackAlpha.300", "whiteAlpha.200");
  const textColor = useColorModeValue("gray.500", "gray.400");
  const buttonBg = useColorModeValue("rgba(201, 201, 201, 0.3)", "rgba(180, 180, 180, 0.3)");
  const buttonHoverBg = useColorModeValue("rgba(80, 80, 80, 0.3)", "rgba(180, 180, 180, 0.3)");
  // bg: colorMode === "dark" ? "rgba(80, 80, 80, 0.3)" : "rgba(180, 180, 180, 0.3)",
  // Redux selectors
  const allPosts = useSelector((state: RootState) => state.posts.posts);
  const userPostsMap = useSelector((state: RootState) => state.posts.userPosts);
  const currentUser = useSelector((state: RootState) => state.user.user);
  
  const getUserPosts = useCallback((): IPost[] => {
    if (!user) return [];
    
    const cachedPosts = userPostsMap[user._id] || [];
    const recentUserPosts = allPosts.filter(
      (post) => {
        if (typeof post.postedBy === 'string') {
          return post.postedBy === user._id;
        } else {
          return post.postedBy?._id === user._id;
        }
      }
    );
    
    // Combine and deduplicate posts
    const combinedPosts = [...recentUserPosts];
    cachedPosts.forEach((cachedPost) => {
      if (!combinedPosts.some((post) => post._id === cachedPost._id)) {
        combinedPosts.push(cachedPost);
      }
    });
    
    // Sort by creation date (newest first)
    return combinedPosts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [user, allPosts, userPostsMap]);

  const posts = getUserPosts();

  const fetchUserData = useCallback(async (): Promise<void> => {
    if (!username) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/users/profile/${username}`);
      const data = await res.json();

      if (data.error) {
        showToast("Lỗi", data.error, "error");
        return;
      }

      setUser(data.user);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast("Lỗi", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [username, showToast]);

  const fetchUserPosts = useCallback(async (showLoadingIndicator: boolean = true): Promise<void> => {
    if (!user || !username) return;
    
    if (showLoadingIndicator) {
      setFetchingPosts(true);
    }
    
    try {
      const res = await fetch(`/api/posts/user/${username}`);
      const data = await res.json();
      
      if (data.error) {
        showToast("Lỗi", data.error, "error");
        return;
      }
      
      dispatch(setUserPosts({ 
        userId: user._id, 
        posts: data 
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast("Lỗi", errorMessage, "error");
      dispatch(setUserPosts({ userId: user._id, posts: [] }));
    } finally {
      setFetchingPosts(false);
      setRefreshing(false);
    }
  }, [user, username, showToast, dispatch]);

  // Initial data load
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Load posts when user data is available
  useEffect(() => {
    if (user) {
      if (!userPostsMap[user._id]) {
        fetchUserPosts();
      } else {
        setFetchingPosts(false);
      }
    }
  }, [user, userPostsMap, fetchUserPosts]);

  const handleFollowUpdate = useCallback(() => {
    // Refreshes user data when follow status changes
    fetchUserData();
  }, [fetchUserData]);

  const handleRefreshPosts = useCallback((): void => {
    if (!user) return;
    setRefreshing(true);
    fetchUserPosts(false);
  }, [user, fetchUserPosts]);

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  if (!user) {
    return (
      <Flex direction="column" justifyContent="center" alignItems="center" height="70vh">
        <Text fontSize="2xl" fontWeight="bold">Không tìm thấy người dùng</Text>
        <Text color={textColor} mt={2}>
          Người dùng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </Text>
      </Flex>
    );
  }

  const isOwnProfile = currentUser && user._id === currentUser._id;

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
      <UserHeader 
        user={user} 
        onFollowUpdate={handleFollowUpdate}
      />
       
      {!fetchingPosts && posts.length > 0 && (
        <Flex justifyContent="flex-end" mb={4} mt={2} >
          <Button
            size="sm"
            leftIcon={<Icon as={FiRefreshCw} />}
            onClick={handleRefreshPosts}
            isLoading={refreshing}
            loadingText="Đang làm mới"
            bg={buttonBg}
            _hover={{ bg: buttonHoverBg }}
          >
            Làm mới
          </Button>
        </Flex>
      )}
      
      {fetchingPosts ? (
        <Flex justifyContent="center" py={10}>
          <Spinner size="md" color="blue.500" thickness="3px" />
        </Flex>
      ) : posts.length > 0 ? (
        posts.map((post) => (
          <Post
            key={post._id}
            post={post}
          />
        ))
      ) : (
        <Flex direction="column" justifyContent="center" alignItems="center" py={10} gap={4}>
          <Text color={textColor}>
            {isOwnProfile 
              ? "Bạn chưa đăng bài viết nào" 
              : `${user.name} chưa đăng bài viết nào`
            }
          </Text>
          
          {isOwnProfile && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Tạo bài viết mới
            </Button>
          )}
        </Flex>
      )}
      
      {posts.length > 0 && (
        <Flex justifyContent="center" py={4}>
          <Text fontSize="sm" color={textColor}>
            Đã hiển thị tất cả bài viết
          </Text>
        </Flex>
      )}
    </Box>
  );
};

export default UserPage;