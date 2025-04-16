import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import UserHeader from "../components/UserHeader";
import Post from "../components/Post";
import { useColorModeValue, Box, Spinner, Flex, Text } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import { setUserPosts } from "../reducers/postReducer";

const UserPage = () => {
  // State hooks
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingPosts, setFetchingPosts] = useState(true);
  
  // Other hooks
  const { username } = useParams();
  const showToast = useShowToast();
  const dispatch = useDispatch();
  
  // Store all color mode values at the component top level
  const cardBg = useColorModeValue("white", "#161617");
  const shadowColor = useColorModeValue("lg", "dark-lg");
  const borderColor = useColorModeValue("blackAlpha.300", "whiteAlpha.200");
  const textColor = useColorModeValue("gray.500", "gray.400");
  
  // Redux selectors
  const allPosts = useSelector((state) => state.posts.posts);
  const userPostsMap = useSelector((state) => state.posts.userPosts);
  const currentUser = useSelector((state) => state.user.user);
  
  const getUserPosts = () => {
    if (!user) return [];
    
    const cachedPosts = userPostsMap[user._id] || [];
    const recentUserPosts = allPosts.filter(
      (post) => post.postedBy === user._id || post.postedBy?._id === user._id
    );
    
    const combinedPosts = [...recentUserPosts];
    cachedPosts.forEach((cachedPost) => {
      if (!combinedPosts.some((post) => post._id === cachedPost._id)) {
        combinedPosts.push(cachedPost);
      }
    });
    
    return combinedPosts;
  };

  const posts = getUserPosts();

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/profile/${username}`);
      const data = await res.json();

      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      setUser(data.user);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [username, showToast]);

  const fetchUserPosts = useCallback(async () => {
    if (!user) return;
    
    setFetchingPosts(true);
    try {
      const res = await fetch(`/api/posts/user/${username}`);
      const data = await res.json();
      
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      
      dispatch(setUserPosts({ 
        userId: user._id, 
        posts: data 
      }));
    } catch (error) {
      showToast("Error", error.message, "error");
      dispatch(setUserPosts({ userId: user._id, posts: [] }));
    } finally {
      setFetchingPosts(false);
    }
  }, [user, username, showToast, dispatch]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (user) {
      if (!userPostsMap[user._id]) {
        fetchUserPosts();
      } else {
        setFetchingPosts(false);
      }
    }
  }, [user, userPostsMap, fetchUserPosts]);

  const handleFollowUpdate = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!user) {
    return (
      <Flex direction="column" justifyContent="center" alignItems="center" height="70vh">
        <Text fontSize="2xl" fontWeight="bold">User not found</Text>
        <Text color="gray.500" mt={2}>The user you're looking for doesn't exist or has been removed.</Text>
      </Flex>
    );
  }

  const isOwnProfile = currentUser && user._id === currentUser._id;

  return (
    <Box
      p={6}
      borderRadius="30px"
      borderWidth="0.5px" 
      borderStyle="solid"
      borderColor={borderColor} // Use the pre-computed value
      bg={cardBg}
      boxShadow={shadowColor}
      transition="all 0.3s ease"
    >
      <UserHeader 
        user={user} 
        onFollowUpdate={handleFollowUpdate}
      />
      
      {fetchingPosts ? (
        <Flex justifyContent="center" py={10}>
          <Spinner size="md" />
        </Flex>
      ) : posts.length > 0 ? (
        posts.map((post) => (
          <Post
            key={post._id}
            post={{
              _id: post._id,
              text: post.text,
              img: post.img,
              likes: post.likes || [],
              replies: post.replies || [],
              createdAt: post.createdAt,
            }}
            postedBy={post.postedBy}
          />
        ))
      ) : (
        <Flex justifyContent="center" py={10}>
          <Text color={textColor}> {/* Use the pre-computed value */}
            {isOwnProfile ? "You haven't posted anything yet" : `${user.name} hasn't posted anything yet`}
          </Text>
        </Flex>
      )}
    </Box>
  );
};

export default UserPage;
