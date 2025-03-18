import {
  Box,
  VStack,
  Text,
  Button,
  Divider,
  Tabs,
  TabList,
  Tab,
  Card,
  CardBody,
  Stack,
  Heading,
  Flex,
  Image
} from "@chakra-ui/react";

const UserHeader = () => {
  return (
    <VStack align="stretch" spacing={4}>
      {/* Profile Header with Avatar */}
      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center" pb={4}>
        {/* Avatar */}
        <Image
          src="/zuck-avatar.png"
          boxSize="120px"
          borderRadius="full"
          objectFit="cover"
          mb={{ base: 4, md: 0 }}
        />

        {/* Profile Info */}
        <VStack align={{ base: "center", md: "start" }} spacing={1} flex={1} mx={{ md: 4 }}>
          <Heading as="h1" size="lg">Tài Trần</Heading>
          <Text fontSize="sm" color="gray.500">Ltai2612</Text>
          <Text fontSize="sm" color="gray.500">4 người theo dõi</Text>
        </VStack>

        {/* Edit Profile Button - Centered between tabs */}
        <Box w={{ md: "200px" }} textAlign="center">
          <Button
            variant="outline"
            size="sm"
            _hover={{ bg: 'gray.100' }}
          >
            Chỉnh sửa trang cá nhân
          </Button>
        </Box>
      </Flex>

      <Divider />

      {/* Centered Tabs */}
      <Tabs variant="enclosed" align="center">
        <TabList>
          <Tab _selected={{ color: 'white', bg: 'blue.900' }}>Thread</Tab>
          <Tab _selected={{ color: 'white', bg: 'blue.900' }}>Thread trả lời</Tab>
          <Tab _selected={{ color: 'white', bg: 'blue.900' }}>Bài đăng lại</Tab>
        </TabList>
      </Tabs>

      {/* Content Sections */}
      <VStack spacing={6} align="stretch">
        {/* First Card */}
        <Card variant="outline">
          <CardBody>
            <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align="center">
              <Box flex={1}>
                <Heading size="sm" mb={2}>Có gì mới?</Heading>
                <Text fontSize="sm" color="gray.500">
                  Cho mọi người biết bạn đang nghĩ gì hoặc chia sẻ về một hoạt động nổi bật mới đây.
                </Text>
              </Box>
              <Button colorScheme="blue" size="sm">Đăng</Button>
            </Stack>
          </CardBody>
        </Card>

        {/* Second Card */}
        <Card variant="outline">
          <CardBody>
            <Flex justify="space-between" align="center" direction={{ base: "column", md: "row" }}>
              <Box mb={{ base: 2, md: 0 }}>
                <Heading size="sm" mb={2}>Hoàn tất trang cá nhân</Heading>
                <Text fontSize="sm" color="gray.500">Còn 3</Text>
              </Box>
              <Stack direction={{ base: "column", md: "row" }} spacing={2}>
                <Button variant="outline" size="sm">Tạo thread</Button>
                <Button colorScheme="blue" size="sm">Thêm ảnh đại diện</Button>
                <Button colorScheme="blue" size="sm">Thêm tiểu sử</Button>
              </Stack>
            </Flex>
          </CardBody>
        </Card>
      </VStack>
    </VStack>
  );
};

export default UserHeader;