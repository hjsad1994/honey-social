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
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useColorModeValue
} from "@chakra-ui/react";
import { CgMoreO } from "react-icons/cg";
import { FiLink, FiUser } from "react-icons/fi";
import "../index.css";
import { useSelector } from "react-redux";
import UpdateProfilePage from "../pages/UpdateProfilePage";
import useShowToast from '../hooks/useShowToast';
import useFollowUnfollow from '../hooks/useFollowUnfollow';
import { RootState } from "../store/store";
import { User as IUser } from "../types/types";

interface UserHeaderProps {
  user: IUser;
  onFollowUpdate?: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ user, onFollowUpdate }) => {
  const currentUser = useSelector((state: RootState) => state.user.user);
  const [activeTab, setActiveTab] = useState<"honeys" | "reply">("honeys");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const showToast = useShowToast();
  
  // Use custom hook for follow/unfollow functionality
  const { 
    handleFollowToggle, 
    isFollowing, 
    followers, 
    isLoading 
  } = useFollowUnfollow(user, onFollowUpdate);

  const copyURL = (): void => {
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL)
      .then(() => {
        showToast("Thành công", "Đã sao chép liên kết vào clipboard", "success");
      })
      .catch((error: unknown) => {
        showToast("Lỗi", "Không thể sao chép liên kết", "error");
        console.error("Copy failed: ", error);
      });
  };

  // Pre-compute all color mode values
  const menuBg = useColorModeValue("white", "gray.dark");
  const menuBorderColor = useColorModeValue("gray.200", "gray.700");
  const menuHoverBg = useColorModeValue("gray.100", "gray.600");
  const menuItemColor = useColorModeValue("black", "white");
  const buttonBg = useColorModeValue("white", "#161617");
  const buttonColor = useColorModeValue("black", "white");
  const buttonBorder = useColorModeValue("black", "whiteAlpha.300");
  const buttonHoverBg = useColorModeValue("rgba(190, 190, 190, 0.3)", "rgba(170, 170, 170, 0.3)");
//  bg: colorMode === "dark" ? "rgba(80, 80, 80, 0.3)" : "rgba(180, 180, 180, 0.3)",

  
  const activeTabColor = useColorModeValue("black", "white");
  const inactiveTabColor = "gray";
  const activeTabBorder = useColorModeValue("black", "white");
  const iconHoverBg = useColorModeValue("rgba(180, 180, 180, 0.3)", "rgba(80, 80, 80, 0.3)");
  const modalBg = useColorModeValue("white", "gray.dark");

  const isOwnProfile = currentUser && currentUser._id === user._id;
  
  return (
    <VStack gap={4} alignItems={"start"} w="full">
      <Flex justifyContent={"space-between"} w={"full"}>
        <Box>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {user.name}
          </Text>
          <Flex gap={2} alignItems={"center"}>
            <Text fontSize={"sm"}>{user.username}</Text>
            {user.isVerified && (
              <Box boxSize="14px">
                <img src="/verified.png" alt="Verified" width="100%" />
              </Box>
            )}
          </Flex>
        </Box>

        <Box>
          <Avatar
            name={user.name}
            src={user.profilePic || undefined}
            size={{
              base: "md",
              md: "xl",
            }}
            border="2px solid"
            borderColor={buttonBorder}
          />
        </Box>
      </Flex>

      <Flex justifyContent="space-between" alignItems="center" w="full">
        <Text>{user.bio}</Text>

        <Flex gap={2}>
          <Menu placement="bottom-end">
            {/* <Tooltip label="Xem thêm"> */}
              <MenuButton 
                className="icon-container"
                p={2}
                borderRadius="full"
                transition="all 0.3s"
                _hover={{
                  bg: iconHoverBg
                }}
              >
                <CgMoreO size={24} cursor="pointer" />
              </MenuButton>
            {/* </Tooltip> */}
            <Portal>
              <MenuList 
                bg={menuBg} 
                borderColor={menuBorderColor}
                boxShadow="md"
              >
                <MenuItem 
                  bg={menuBg} 
                  color={menuItemColor}
                  _hover={{ bg: menuHoverBg }}
                  onClick={copyURL}
                  icon={<FiLink size={14} />}
                >
                  Sao chép liên kết
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        </Flex>
      </Flex>

      {currentUser && !isOwnProfile && (
        <Button
          size="sm"
          onClick={handleFollowToggle}
          isLoading={isLoading}
          loadingText={isFollowing ? "Đang bỏ theo dõi" : "Đang theo dõi"}
          colorScheme={isFollowing ? "gray" : "blackAlpha"}
          variant={isFollowing ? "outline" : "solid"}
          _hover={{
            bg: isFollowing ? buttonHoverBg : undefined,
            transform: "translateY(-2px)",
            boxShadow: "sm"
          }}
          transition="all 0.3s ease"
        >
          {isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
        </Button>
      )}

      <Flex w="full" justifyContent="space-between" alignItems="center">
        <Flex gap={4} alignItems="center">
          <Text color="gray.light">
            {followers.length} người theo dõi
          </Text>
        </Flex>
      </Flex>

      {isOwnProfile && (
        <Button
          w="full"
          size="sm"
          bg={buttonBg}
          color={buttonColor}
          borderRadius="8px"
          border="1px solid"
          borderColor={buttonBorder}
          leftIcon={<FiUser />}
          _hover={{
            bg: buttonHoverBg,
            transform: "translateY(-2px)",
            boxShadow: "sm"
          }}
          onClick={() => setIsModalOpen(true)}
          transition="all 0.3s ease"
        >
          Cập nhật thông tin cá nhân
        </Button>
      )}

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
          bg={modalBg}
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

      <Flex w="full" mt={2}>
        <Flex
          flex={1}
          borderBottom={`2px solid ${activeTab === "honeys" ? activeTabBorder : "transparent"}`}
          justifyContent="center"
          pb={3}
          cursor="pointer"
          onClick={() => setActiveTab("honeys")}
          transition="all 0.3s ease"
        >
          <Text 
            fontWeight="bold" 
            color={activeTab === "honeys" ? activeTabColor : inactiveTabColor}
          >
            Bài viết
          </Text>
        </Flex>
        <Flex
          flex={1}
          borderBottom={`2px solid ${activeTab === "reply" ? activeTabBorder : "transparent"}`}
          justifyContent="center"
          pb={3}
          cursor="pointer"
          onClick={() => setActiveTab("reply")}
          transition="all 0.3s ease"
        >
          <Text 
            fontWeight="bold" 
            color={activeTab === "reply" ? activeTabColor : inactiveTabColor}
          >
            Bình luận
          </Text>
        </Flex>
      </Flex>
    </VStack>
  );
};

export default UserHeader;