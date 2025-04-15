import { useState } from "react";
import {
  Box,
  Flex,
  Link,
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
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useColorModeValue
} from "@chakra-ui/react";
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import "../index.css";
import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import UpdateProfilePage from "../pages/UpdateProfilePage";

const UserHeader = ({ user }) => {
  const toast = useToast();
  const currentUser = useSelector((state) => state.user.user);
  const [activeTab, setActiveTab] = useState("honeys");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const copyURL = () => {
    const currentURL = window.location.href;
    navigator.clipboard
      .writeText(currentURL)
      .then(() => {
        toast({
          title: "Đã sao chép!",
          description: "URL đã được sao chép vào clipboard.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error) => {
        toast({
          title: "Sao chép thất bại",
          description: `Không thể sao chép URL: ${error}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
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
            {/* <Text
              fontSize={"xs"}
              bg={"gray.dark"}
              color={"gray.light"}
              p={1}
              borderRadius={"full"}
            >
            honeys.vn 
            </Text> */}
          </Flex>
        </Box>
        
        <Box>
          {user.profilePic && (
            <Avatar
              name={user.name}
              src={user.profilePic}
              size={{
                base: "md",
                md: "xl",
              }}
            />
          )}
          {!user.profilePic && (
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
        {/* Bio nằm bên trái */}
        <Text>{user.bio}</Text>

        {/* Icons nằm bên phải */}
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
      <Flex w={"full"} justifyContent={"space-between"} alignItems="center">
        <Flex gap={2} alignItems={"center"}>
          <Text color={"gray.light"}>{user.followers.length} followers</Text>
          {/* <Box w="1" h="1" bg={"gray.light"} borderRadius={"full"} /> */}
          {/* <Link color={"gray.light"} href="#">
            honeys.vn
          </Link> */}
        </Flex>
      </Flex>
      {/* {currentUser?._id === user._id && (
        <Link as={RouterLink} to='/update'>
          <Button size={"sm"}>Update Profile</Button>
        </Link>
      )} */}
      {currentUser && currentUser._id === user._id && (
        <Button
          w={"full"}
          size={"sm"}
          bg={useColorModeValue("white", "#161617")}
          color={useColorModeValue("black", "white")}
          borderRadius={"8px"}
          border="1px solid"
          borderColor={"whiteAlpha.300"}
          _hover={{
            bg: useColorModeValue("gray.100", "gray.700"),
          }}
          onClick={() => setIsModalOpen(true)}
        >
          Update Profile
        </Button>
      )}

      {/* Modal for Update Profile */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl" >
        <ModalOverlay
          bg="blackAlpha.600" // Background overlay
          backdropFilter="blur(10px)" // Blur effect
        />
        <ModalContent bg={useColorModeValue("white", "gray.dark")}>
          <ModalCloseButton />
          <ModalBody>
            <UpdateProfilePage 
              onUpdateSuccess={() => {
                setIsModalOpen(false); // Close the modal after successful update
              }} 
            />

          </ModalBody>
        </ModalContent>
      </Modal>



      <Flex w={"full"}>
        <Flex
          flex={1}
          borderBottom={`1.5px solid ${activeTab === "honeys" ? "white" : "gray"}`}
          justifyContent={"center"}
          pb={"3"}
          cursor={"pointer"}
          onClick={() => setActiveTab("honeys")}
        >
          <Text fontWeight={"bold"}>Honeys</Text>
        </Flex>
        <Flex
          flex={1}
          borderBottom={`1.5px solid ${activeTab === "reply" ? "white" : "gray"}`}
          justifyContent={"center"}
          pb={"3"}
          cursor={"pointer"}
          onClick={() => setActiveTab("reply")}
        >
          <Text fontWeight={"bold"}>Reply</Text>
        </Flex>
      </Flex>
    </VStack>
  );
};

export default UserHeader;