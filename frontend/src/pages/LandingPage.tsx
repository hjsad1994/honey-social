import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Image,
  Stack,
  Icon,
  useColorModeValue,
  VStack,
  HStack,
  SimpleGrid,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMessageCircle, FiImage, FiHeart } from 'react-icons/fi';
// css
// import { keyframes } from '@emotion/react';

// Define animations for the background
// const float1 = keyframes`
//   0% { transform: translate(0, 0) rotate(0deg); }
//   50% { transform: translate(30px, -40px) rotate(15deg); }
//   100% { transform: translate(0, 0) rotate(0deg); }
// `;

// const float2 = keyframes`
//   0% { transform: translate(0, 0) rotate(0deg); }
//   50% { transform: translate(-40px, 30px) rotate(-15deg); }
//   100% { transform: translate(0, 0) rotate(0deg); }
// `;

// const float3 = keyframes`
//   0% { transform: translate(0, 0) rotate(0deg); }
//   50% { transform: translate(35px, 25px) rotate(10deg); }
//   100% { transform: translate(0, 0) rotate(0deg); }
// `;

// Update the AnimatedBackground component with much faster animations
// const AnimatedBackground = () => {
//   // Keep the vivid colors
//   const shape1Color = useColorModeValue('blue.400', 'blue.600');
//   const shape2Color = useColorModeValue('pink.400', 'pink.600');
//   const shape3Color = useColorModeValue('purple.400', 'purple.600');
  
//   return (
//     <Box
//       position="fixed"
//       top={0}
//       left={0}
//       right={0}
//       bottom={0}
//       zIndex={0}
//       overflow="hidden"
//       pointerEvents="none"
//       width="100%"
//       height="100vh"
//     >
//       <Box
//         position="absolute"
//         top="5%"
//         left="5%"
//         width="30vw"
//         height="30vw"
//         maxW="600px"
//         maxH="600px"
//         borderRadius="50%"
//         bg={shape1Color}
//         filter="blur(13vw)"
//         opacity={0.7}
//         css={css`
//           animation: ${float1} 5s ease-in-out infinite; // Reduced from 10s
//         `}
//       />
      
//       <Box
//         position="absolute"
//         top="60%"
//         left="60%"
//         width="40vw"
//         height="40vw"
//         maxW="800px"
//         maxH="800px"
//         borderRadius="50%"
//         bg={shape2Color}
//         filter="blur(16vw)"
//         opacity={0.5}
//         css={css`
//           animation: ${float1} 7s ease-in-out infinite; // Reduced from 12s
//         `}
//       />
      
//       <Box
//         position="absolute"
//         top="75%"
//         left="10%"
//         width="30vw"
//         height="30vw"
//         maxW="600px"
//         maxH="600px"
//         borderRadius="50%"
//         bg={shape3Color}
//         filter="blur(10vw)"
//         opacity={0.5}
//         css={css`
//           animation: ${float1} 7s ease-in-out infinite; // Reduced from 16s
//         `}
//       />

//       <Box
//         position="absolute"
//         top="15%"
//         left="75%"
//         width="20vw"
//         height="20vw"
//         maxW="500px"
//         maxH="500px"
//         borderRadius="50%"
//         bg={shape1Color}
//         filter="blur(8vw)"
//         opacity={0.6}
//         css={css`
//           animation: ${float1} 4s ease-in-out infinite; // Reduced from 14s
//         `}
//       />

//       <Box
//         position="absolute"
//         top="40%"
//         left="30%"
//         width="15vw"
//         height="15vw"
//         maxW="400px"
//         maxH="400px"
//         borderRadius="50%"
//         bg={shape3Color}
//         filter="blur(6vw)"
//         opacity={0.6}
//         css={css`
//           animation: ${float1} 9s ease-in-out infinite; // Reduced from 18s
//         `}
//       />
//     </Box>
//   );
// };

// Also update FeaturesSectionBackground with faster animations
// const FeaturesSectionBackground = () => {
//   const shape1Color = useColorModeValue('blue.200', 'blue.700');
//   const shape2Color = useColorModeValue('purple.200', 'purple.700');
//   const shape3Color = useColorModeValue('teal.200', 'teal.700');
  
//   return (
//     <Box
//       position="absolute"
//       top={0}
//       left={0}
//       right={0}
//       bottom={0}
//       zIndex={0}
//       overflow="hidden"
//       pointerEvents="none"
//     >
//       {/* Shape 1 */}
//       <Box
//         position="absolute"
//         top="10%"
//         right="5%"
//         width="25vw"
//         height="25vw"
//         maxW="500px"
//         maxH="500px"
//         borderRadius="50%"
//         bg={shape1Color}
//         filter="blur(8vw)"
//         opacity={0.7}
//         css={css`
//           animation: ${float1} 7.5s ease-in-out infinite; // Reduced from 13s
//         `}
//       />
      
//       {/* Shape 2 */}
//       <Box
//         position="absolute"
//         bottom="10%"
//         left="5%"
//         width="20vw"
//         height="20vw"
//         maxW="400px"
//         maxH="400px"
//         borderRadius="50%"
//         bg={shape2Color}
//         filter="blur(7vw)"
//         opacity={0.5}
//         css={css`
//           animation: ${float1} 6s ease-in-out infinite; // Reduced from 12s
//         `}
//       />

//       {/* Shape 3 */}
//       <Box
//         position="absolute"
//         top="60%"
//         left="50%"
//         width="15vw"
//         height="15vw"
//         maxW="300px"
//         maxH="300px"
//         borderRadius="50%"
//         bg={shape3Color}
//         filter="blur(6vw)"
//         opacity={0.6}
//         css={css`
//           animation: ${float1} 8s ease-in-out infinite; // Reduced from 12s
//         `}
//       />
//     </Box>
//   );
// };

// Create MotionBox component to easily use framer-motion with Chakra UI
const MotionBox = motion(Box);

// Update Feature component to include mouse-following animation
const Feature = ({ icon, title, text, index }: { icon: React.ElementType; title: string; text: string; index: number }) => {
  const textColor = useColorModeValue("gray.600", "gray.300");
  const bgBox = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const iconColor = useColorModeValue("blue.500", "blue.400");
  
  // Create states for tracking mouse position
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  
  // Define brighter gradient colors for more vivid effect
  const gradientStart = useColorModeValue("rgba(255, 255, 255, 0.3)", "rgba(50, 100, 207, 0.4)");
//   const gradientEnd = useColorModeValue("rgba(186, 130, 238, 0.3)", "rgba(255, 255, 255, 0.15)");
  
  // Handle mouse move to update position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!boxRef.current) return;
    
    const rect = boxRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
  };

  return (
    
    <MotionBox
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 * index }}
      viewport={{ once: true }}
    >
      {/* <AnimatedBackground /> */}

      <Box
        ref={boxRef}
        position="relative"
        overflow="hidden"
        borderRadius="xl"
        transition="all 0.3s ease"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        _hover={{ 
          transform: 'translateY(-5px)', 
          boxShadow: 'xl',
        }}
      >
        {/* Mouse-following background effect */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={0}
          borderRadius="xl"
          style={{
            background: isHovered 
              ? `radial-gradient(circle 150px at ${mousePosition.x}px ${mousePosition.y}px, ${gradientStart}, transparent)`
              : 'transparent',
            transition: 'opacity 0.3s ease',
            opacity: isHovered ? 1 : 0,
          }}
        />
        
        {/* Content */}
        <VStack
          role="group"
          align="start"
          p={{ base: 5, md: 6 }}
          bg={bgBox}
          boxShadow="md"
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          height="100%"
          position="relative"
          zIndex={1}
          transition="all 0.3s ease"
          _hover={{
            bg: "transparent",
            backdropFilter: "blur(5px)",
          }}
        >
          <Icon 
            as={icon} 
            boxSize={{ base: 8, md: 10 }} 
            color={iconColor} 
            mb={4}
            transition="transform 0.3s ease, color 0.3s ease"
            _groupHover={{
              transform: "scale(1.2)",
              color: "blue.500",
            }}
          />
          <Heading 
            size="md" 
            mb={3}
            transition="color 0.3s ease"
          >
            {title}
          </Heading>
          <Text color={textColor}>{text}</Text>
        </VStack>
      </Box>
    </MotionBox>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  
  // Scroll detection to trigger animations
  useEffect(() => {
    const handleScroll = () => {
      if (featuresRef.current) {
        const rect = featuresRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        
        // If top of the features section is in view
        if (rect.top <= windowHeight * 0.75) {
          setFeaturesVisible(true);
        }
      }
    };

    // Initial check
    handleScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Clean up
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Define color values
//   const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const primaryBtnBg = useColorModeValue('black', 'white');
  const primaryBtnColor = useColorModeValue('white', 'black');
  const secondaryBtnBg = useColorModeValue('white', 'transparent');
  const secondaryBtnColor = useColorModeValue('black', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const sectionBg = useColorModeValue('white', 'gray.800');

  return (
    <Box 
      width="100%" // Changed from 100vw
      minHeight="100vh" 
      overflowX="hidden"
      m={0}
      p={0}
      
    >
      {/* Add the animated background component */}
      {/* <AnimatedBackground /> */}
      
      {/* Content */}
      <Box position="relative" zIndex={1} width="100%">
        {/* Hero Section - Full Screen */}
        <Flex 
          width="100%" // Changed from 100vw
          height="100vh"
          direction="column"
          justify="center"
          align="center"
          px={0}
          py={0}
          overflow="hidden"
        >
          <Flex 
            width="100%"
            height="100%"
            maxW="100vw"
            direction={{ base: 'column', lg: 'row' }} 
            align="center" 
            justify="center"
            gap={{ base: 8, lg: 0 }}
            px={{ base: 4, md: 8, lg: 16 }}
          >
            <VStack 
              align={{ base: "center", lg: "flex-start" }} 
              spacing={8} 
              width={{ base: "100%", lg: "50%" }}
              pr={{ base: 0, lg: 8 }}
            >
              <Heading 
                as="h1" 
                size={{ base: "xl", md: "2xl", lg: "3xl" }}
                color={headingColor}
                lineHeight="1.2"
                fontWeight="bold"
                textAlign={{ base: "center", lg: "left" }}
              >
                Chia sẻ ý tưởng và kết nối với những người khác
              </Heading>
              
              <Text 
                fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                color={textColor}
                textAlign={{ base: "center", lg: "left" }}
              >
                Honey là nơi bạn có thể chia sẻ suy nghĩ, đăng tải hình ảnh và kết nối với bạn bè một cách đơn giản và trực quan.
              </Text>
              
              <Stack 
                direction={{ base: 'column', sm: 'row' }} 
                spacing={4} 
                w={{ base: "100%", sm: "auto" }}
                justify={{ base: "center", lg: "flex-start" }}
              >
                <Button 
                  size={{ base: "md", md: "lg" }}
                  height={{ base: "50px", md: "60px" }}
                  fontSize={{ base: "md", md: "lg" }}
                  bg={primaryBtnBg} 
                  color={primaryBtnColor} 
                  rounded="full" 
                  px={10}
                  py={7}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                  onClick={(e) => {
                    e.preventDefault(); // Prevent any default behavior
                    e.stopPropagation(); // Stop event propagation
                    window.location.href = '/auth'; // Direct browser navigation
                  }}
                >
                  Đăng nhập
                </Button>
                <Button 
                  size={{ base: "md", md: "lg" }}
                  height={{ base: "50px", md: "60px" }}
                  fontSize={{ base: "md", md: "lg" }}
                  bg={secondaryBtnBg}
                  color={secondaryBtnColor}
                  rounded="full"
                  px={10}
                  py={7}
                  borderWidth="1px"
                  borderColor={borderColor}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'md',
                  }}
                  onClick={(e) => {
                    e.preventDefault(); // Prevent any default behavior
                    e.stopPropagation(); // Stop event propagation
                    window.location.href = '/auth?register=true'; // Direct browser navigation
                  }}
                >
                  Đăng ký
                </Button>
              </Stack>
            </VStack>
            
            <Box 
              width={{ base: "90%", md: "80%", lg: "45%" }}
              height={{ base: "auto", lg: "70%" }}
              boxShadow="2xl"
              borderRadius={{ base: "2xl", md: "3xl" }}
              overflow="hidden"
            >
              <Image 
                src="/honey-logo.png" 
                alt="Honey Social Platform" 
                fallbackSrc="https://via.placeholder.com/800x600?text=Honey+Social"
                objectFit="cover"
                width="100%"
                height="100%"
              />
            </Box>
          </Flex>
        </Flex>

        {/* Features Section - Full Width */}
        <Box 
          ref={featuresRef}
          py={{ base: 16, md: 20 }}
          px={{ base: 4, md: 8, lg: 16 }}
        //   bg={useColorModeValue('gray.50', 'gray.900')} // Lighter background
          width="100%"
          position="relative"
        >
          {/* <FeaturesSectionBackground /> */}
          
          <VStack spacing={{ base: 12, md: 20 }} width="100%" position="relative" zIndex={1}>
            <VStack spacing={6} textAlign="center" width="100%">
              <Heading 
                as={motion.h2}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                size={{ base: "xl", md: "2xl" }} 
                color={useColorModeValue('gray.800', 'white')}
              >
                Tính năng nổi bật
              </Heading>
              <Text 
                as={motion.p}
                initial={{ opacity: 0 }}
                animate={featuresVisible ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                color={useColorModeValue('gray.600', 'gray.300')} 
                fontSize={{ base: "md", md: "lg" }} 
                maxWidth="800px"
              >
                Khám phá những gì bạn có thể làm trên nền tảng của chúng tôi
              </Text>
            </VStack>
            
            {featuresVisible && (
              <SimpleGrid 
                columns={{ base: 1, md: 2, lg: 4 }} 
                spacing={{ base: 8, md: 10 }} 
                width="100%"
                maxW="1800px"
                mx="auto"
              >
                <Feature 
                  icon={FiUser}
                  title="Hồ sơ cá nhân"
                  text="Tạo và tùy chỉnh hồ sơ của bạn để thể hiện con người thật của bạn"
                  index={0}
                />
                <Feature 
                  icon={FiMessageCircle}
                  title="Bình luận"
                  text="Tương tác với người khác thông qua các bình luận và trả lời"
                  index={1}
                />
                <Feature 
                  icon={FiImage}
                  title="Chia sẻ ảnh"
                  text="Đăng tải những khoảnh khắc đáng nhớ của bạn với bạn bè"
                  index={2}
                />
                <Feature 
                  icon={FiHeart}
                  title="Theo dõi & Thích"
                  text="Theo dõi những người dùng yêu thích và thể hiện sự đánh giá cao với nội dung hay"
                  index={3}
                />
              </SimpleGrid>
            )}
          </VStack>
        </Box>

            
        {/* Call to Action - Full Width */}
        <Flex 
          py={{ base: 16, md: 24 }}
          px={{ base: 4, md: 8, lg: 16 }}
          justifyContent="center"
          alignItems="center"
          width="100%" // Changed from 100vw
        //   bg={bgColor}

        >
          <VStack spacing={8} maxW="900px" textAlign="center" width="100%">
            <Heading 
              color={headingColor} 
              size={{ base: "xl", md: "2xl" }}
            >
              Sẵn sàng bắt đầu?
            </Heading>
            <Text 
              color={textColor} 
              fontSize={{ base: "lg", md: "xl" }}
              maxWidth="700px"
              px={4}
            >
              Tham gia với chúng tôi ngay hôm nay và bắt đầu chia sẻ những câu chuyện của bạn.
            </Text>
            <Button
              size={{ base: "md", md: "lg" }}
              height={{ base: "55px", md: "65px" }}
              fontSize={{ base: "md", md: "lg" }}
              bg={primaryBtnBg}
              color={primaryBtnColor}
              rounded="full"
              px={{ base: 10, md: 14 }}
              py={7}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              onClick={() => navigate('/auth')}
            >
              Tạo tài khoản miễn phí
            </Button>
          </VStack>
        </Flex>

        {/* Footer - Full Width */}
        <Box 
          py={{ base: 4, md: 4 }} 
          px={{ base: 4, md: 4, lg: 4 }} 
          borderTopWidth="1px" 
          borderColor={borderColor}
          width="100%" // Changed from 100vw
          bg={sectionBg}
        >
          <Flex 
            maxW="1800px" 
            mx="auto" 
            justify="space-between" 
            flexWrap="wrap"
            gap={{ base: 4, md: 0 }}
            width="100%"
          >
            <Text color={textColor} fontSize="sm">
              © {new Date().getFullYear()} Honey. Tất cả quyền được bảo lưu.
            </Text>
            <HStack spacing={6} flexWrap="wrap">
              <Text as="a" href="#" color={textColor} fontSize="sm">Về chúng tôi</Text>
              <Text as="a" href="#" color={textColor} fontSize="sm">Điều khoản</Text>
              <Text as="a" href="#" color={textColor} fontSize="sm">Quyền riêng tư</Text>
            </HStack>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default LandingPage;