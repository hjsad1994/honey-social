import UserHeader from "../components/UserHeader"
import UserPost from "../components/UserPost"
import { useColorModeValue, Box } from "@chakra-ui/react";
const UserPage = () => {
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
      <UserHeader />
      <UserPost likes={122} replies={2330} postImg="/post1.png" postTitle="Thiên nhiên thiệt là tuyệt đẹp" />
      <UserPost likes={122} replies={2330} postImg="/post3.png" postTitle="Khứa này giàu vãi" />
      <UserPost likes={122} replies={2330} postImg="/post3.png" postTitle="Xin chào" />


    </Box>


  )
}

export default UserPage
