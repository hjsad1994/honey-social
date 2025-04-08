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
  useToast
} from "@chakra-ui/react";
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import "../index.css";

const UserHeader = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("threads");

  const copyURL = () => {
    const currentURL = window.location.href; // Lấy URL hiện tại
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
              Tran Tan Tai
            </Text>
            <Flex gap={2} alignItems={"center"}>
              <Text fontSize={"sm"}>Tran tai</Text>
              <Text
                fontSize={"xs"}
                bg={"gray.dark"} 
                color={"gray.light"}
                p={1}
                borderRadius={"full"}
              >
                threads.net
              </Text>
            </Flex>
          </Box>
          <Box>
            <Avatar name="Tran Tan Tai" src="/zuck-avatar.png" size={
              {
                base: "md",
                md: "xl",
              }
            } />
          </Box>
        </Flex>

        <Text>Vip pro maxxxssssdsadasds.</Text>

        <Flex w={"full"} justifyContent={"space-between"} alignItems="center">
          <Flex gap={2} alignItems={"center"}>
            <Text color={"gray.light"}>99.9K followers</Text>
            <Box w="1" h="1" bg={"gray.light"} borderRadius={"full"} />
            <Link color={"gray.light"} href="#">
              meta.com
            </Link>
          </Flex>
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

        <Flex w={"full"}>
          <Flex
            flex={1}
            borderBottom={`1.5px solid ${activeTab === "threads" ? "white" : "gray"}`}
            justifyContent={"center"}
            pb={"3"}
            cursor={"pointer"}
            onClick={() => setActiveTab("threads")}
          >
            <Text fontWeight={"bold"}>Threads</Text>
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