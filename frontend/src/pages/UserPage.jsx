import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router"
import UserHeader from "../components/UserHeader"
import UserPost from "../components/UserPost"
import { useColorModeValue, Box, Spinner, Flex } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";

const UserPage = () => {
  const [user, setUser] = useState(null);
  const { username } = useParams();
  const showToast = useShowToast();
  
  const cardBg = useColorModeValue("white", "#161617");
  const shadowColor = useColorModeValue("lg", "dark-lg");

  const [loading, setLoading] = useState(true);
  // Tạo hàm refresh user data
  const refreshUserData = useCallback(async () => {
    setLoading(true); // Set loading to true before fetching
    try {
      const res = await fetch(`/api/users/profile/${username}`);
      const data = await res.json();

      if (data.error) {
        showToast('Error', data.error, 'error');
        return;
      }

      setUser(data.user);
    } catch (error) {
      showToast('Error', error.message, 'error');
    } finally {
      setLoading(false); // Set loading to false regardless of success or error
    }
  }, [username, showToast]);

  // Initial data loading
  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  // Xử lý cập nhật followers - Cải tiến để đảm bảo state cập nhật
  const handleFollowUpdate = useCallback((updatedUser) => {
    console.log("Updating user with new data:", updatedUser);
    // Sử dụng hàm cập nhật để đảm bảo state mới nhất
    setUser(updatedUser);
  }, []);

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }
  if (!user) return <h1>User not found</h1>

  return (
    <Box
      p={6}
      borderRadius="xl"
      bg={cardBg}
      boxShadow={shadowColor}
      transition="all 0.3s ease"
    >
      <UserHeader 
        user={user} 
        onFollowUpdate={handleFollowUpdate}
        refreshUserData={refreshUserData} 
      />
      <UserPost likes={122} replies={2330} postImg="/post1.png" postTitle="Thiên nhiên thiệt là tuyệt đẹp" />
      <UserPost likes={122} replies={2330} postImg="/post3.png" postTitle="Khứa này giàu vãi" />
      <UserPost likes={122} replies={2330} postImg="/post3.png" postTitle="Xin chào" />
    </Box>
  );
};

export default UserPage;
