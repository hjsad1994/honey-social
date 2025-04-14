import { useState, useEffect, } from "react";
import { useParams } from "react-router"

import UserHeader from "../components/UserHeader"
import UserPost from "../components/UserPost"
import { useColorModeValue, Box } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
const UserPage = () => {
  const [user, setUser] = useState(null)
  const { username } = useParams()
  const showToast = useShowToast()
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`)
        const data = await res.json();
        if (data.error) {
          showToast('Error', data.error, 'error')
          return
        }
        setUser(data.user)
      } catch (error) {
        showToast('Error', error, 'error')
      }
    }
    getUser();
  }, [username, showToast]);

  if (!user) return null;

  const cardBg = useColorModeValue("white", "#161617");
  const shadowColor = useColorModeValue("lg", "dark-lg");
  return (
    <Box
      p={6}
      borderRadius="xl"
      bg={cardBg}
      boxShadow={shadowColor}
      transition="all 0.3s ease"
    >
      <UserHeader user={user} />
      <UserPost likes={122} replies={2330} postImg="/post1.png" postTitle="Thiên nhiên thiệt là tuyệt đẹp" />
      <UserPost likes={122} replies={2330} postImg="/post3.png" postTitle="Khứa này giàu vãi" />
      <UserPost likes={122} replies={2330} postImg="/post3.png" postTitle="Xin chào" />


    </Box>


  )
}

export default UserPage
