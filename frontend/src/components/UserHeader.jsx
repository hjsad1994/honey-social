import {
  Box,
  Flex,
  Link,
  Text,
  VStack,
  Avatar,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal
} from "@chakra-ui/react";
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import "../index.css";

const UserHeader = () => {
  const cardBg = useColorModeValue("white", "#161617");
  const shadowColor = useColorModeValue("lg", "dark-lg");
  const iconColor = useColorModeValue("gray.700", "gray.300");
  const iconHoverBg = useColorModeValue("gray.100", "#2e2e2e");

  const copyURL = () => {
    // const currentURL = window.location.href;
    // navigator.clipboard.writeText(currentURL).then(() => {

    // })
  }
  return (
    <Box
      p={6}
      borderRadius="xl"
      bg={cardBg}
      boxShadow={shadowColor}
      transition="all 0.3s ease"
    >
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
                bg={"#1e1e1e"}
                color={"white"}
                p={1}
                borderRadius={"full"}
              >
                threads.net
              </Text>
            </Flex>
          </Box>
          <Box>
            <Avatar name='Tran Tan Tai' src='/zuck-avatar.png' size={"xl"} />
          </Box>
        </Flex>

        <Text>Vip pro maxxxssssdsadasds.</Text>

        <Flex w={"full"} justifyContent={"space-between"} alignItems="center">
          <Flex gap={2} alignItems={"center"}>
            <Text color={"gray.light"}>99.9K followers</Text>
            <Box w="1" h="1" bg={"gray.light"} borderRadius={"full"} />
            <Link color={"gray.light"} href="#">meta.com</Link>
          </Flex>
          <Flex gap={2}>
            <Box
              className="icon-container"
              _hover={{
                bg: iconHoverBg,
                "& > svg": {
                  color: "#E1306C"
                }
              }}
            >
              <BsInstagram size={24} cursor="pointer" color={iconColor} />
            </Box>

            <Menu>
              <MenuButton
                as={Box}
                className="icon-container"
                _hover={{
                  bg: iconHoverBg,
                  "& > svg": {
                    color: "blue.500"
                  }
                }}
              >
                <CgMoreO size={24} cursor="pointer" />
              </MenuButton>
              <Portal>
                <MenuList bg={"gray.dark"}>
                  <MenuItem bg={"gray.dark"} onClick={copyURL}>Copy Link</MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </Flex>
        </Flex>
      </VStack>
    </Box>
  );
};

export default UserHeader;