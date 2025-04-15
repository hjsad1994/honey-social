import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  useToast,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useColorModeValue
} from "@chakra-ui/react";
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import "../index.css";
import { useSelector } from "react-redux";
import UpdateProfilePage from "../pages/UpdateProfilePage";
import useShowToast from './../hooks/useShowToast';
import useFollowUnfollow from '../hooks/useFollowUnfollow'; // Import hook

const UserHeader = ({ user, onFollowUpdate, refreshUserData }) => {
  const toast = useToast();
  const currentUser = useSelector((state) => state.user.user);
  const [activeTab, setActiveTab] = useState("honeys");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showToast = useShowToast();
  
  // Sử dụng hook useFollowUnfollow thay vì quản lý state trong component
  const { handleFollowToggle, isFollowing, followers, isLoading } = useFollowUnfollow(user, onFollowUpdate);

  const copyURL = () => {
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL)
      .then(() => {
        showToast("Thành công", "Đã sao chép liên kết vào clipboard", "success");
      })
      .catch((error) => {
        showToast("Lỗi", "Không thể sao chép liên kết", "error");
        console.error("Copy failed: ", error);
      });
  };

  return (
    <VStack gap={4} alignItems={"start"}>
      <Flex justifyContent={"space-between"} w={"full"}>
        <Box>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {user.name}
          </Text>
          <Flex gap={2} alignItems={"center"}>
            <Text fontSize={"sm"}>{user.username}</Text>
          </Flex>
        </Box>

        <Box>
          {user.profilePic ? (
            <Avatar
              name={user.name}
              src={user.profilePic}
              size={{
                base: "md",
                md: "xl",
              }}
            />
          ) : (
            <Avatar
              name={user.name}
              src="https://bit.ly/broken-link"
              size={{
                base: "md",
                md: "xl",
              }}
            />
          )}
        </Box>
      </Flex>

      <Flex justifyContent="space-between" alignItems="center" w="full">
        <Text>{user.bio}</Text>

        <Flex gap={2}>
          <Box className="icon-container">
            <BsInstagram size={24} cursor="pointer" />
          </Box>

          <Menu>
            <MenuButton className="icon-container">
              <CgMoreO size={24} cursor="pointer" />
            </MenuButton>
            <Portal>
              <MenuList bg={"gray.dark"}>
                <MenuItem bg={"gray.dark"} onClick={copyURL}>
                  Copy Link
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        </Flex>
      </Flex>

      {currentUser && currentUser._id !== user._id && (
        <Button
          size={"sm"}
          onClick={handleFollowToggle}
          isLoading={isLoading}
          loadingText={isFollowing ? "Unfollowing" : "Following"}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>
      )}

      <Flex w={"full"} justifyContent={"space-between"} alignItems="center">
        <Flex gap={2} alignItems={"center"}>
          <Text color={"gray.light"}>{followers.length} followers</Text>
        </Flex>
      </Flex>

      {currentUser && currentUser._id === user._id && (
        <Button
          w={"full"}
          size={"sm"}
          bg={useColorModeValue("white", "#161617")}
          color={useColorModeValue("black", "white")}
          borderRadius={"8px"}
          border="1px solid"
          borderColor={useColorModeValue("black", "whiteAlpha.300")} // Cambiar el color del borde a negro en modo claro
          _hover={{
            bg: useColorModeValue("gray.100", "gray.700"),
          }}
          onClick={() => setIsModalOpen(true)}
        >
          Update Profile
        </Button>
      )}

      {/* Modal for Update Profile - Keep only this one */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        size="xl"
        closeOnOverlayClick={true}
      >
        <ModalOverlay
          bg="blackAlpha.600"
          backdropFilter="blur(10px)"
        />
        <ModalContent 
          bg={useColorModeValue("white", "gray.dark")}
          borderRadius="3xl" 
          p={0}
          overflow="hidden"
        >
          <ModalBody p={0}>
            <UpdateProfilePage 
              onUpdateSuccess={() => {
                setIsModalOpen(false);
              }} 
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Flex w={"full"}>
        <Flex
          flex={1}
          borderBottom={`1px solid ${activeTab === "honeys" ? 
            useColorModeValue("black", "white") : "transparent"}`} // Subrayado negro en modo claro, blanco en modo oscuro
          justifyContent={"center"}
          pb={"3"}
          cursor={"pointer"}
          onClick={() => setActiveTab("honeys")}
        >
          <Text 
            fontWeight={"bold"} 
            color={activeTab === "honeys" ? useColorModeValue("black", "white") : "gray"}
          >
            Honeys
          </Text>
        </Flex>
        <Flex
          flex={1}
          borderBottom={`1px solid ${activeTab === "reply" ? 
            useColorModeValue("black", "white") : "transparent"}`} // Subrayado negro en modo claro, blanco en modo oscuro
          justifyContent={"center"}
          pb={"3"}
          cursor={"pointer"}
          onClick={() => setActiveTab("reply")}
        >
          <Text 
            fontWeight={"bold"} 
            color={activeTab === "reply" ? useColorModeValue("black", "white") : "gray"}
          >
            Reply
          </Text>
        </Flex>
      </Flex>
    </VStack>
  );
};

export default UserHeader;
