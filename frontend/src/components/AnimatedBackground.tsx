import { Box, useColorModeValue } from '@chakra-ui/react';
import { css, keyframes } from '@emotion/react';


const float1 = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(30px, -40px) rotate(15deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
`;

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

const AnimatedBackground = () => {
  // Keep the vivid colors
  const shape1Color = useColorModeValue('blue.400', 'blue.600');
  const shape2Color = useColorModeValue('pink.400', 'pink.600');
  const shape3Color = useColorModeValue('purple.400', 'purple.600');
  
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={0}
      overflow="hidden"
      pointerEvents="none"
      width="100%"
      height="100vh"
    >
      <Box
        position="absolute"
        top="5%"
        left="5%"
        width="30vw"
        height="30vw"
        maxW="600px"
        maxH="600px"
        borderRadius="50%"
        bg={shape1Color}
        filter="blur(13vw)"
        opacity={0.7}
        css={css`
          animation: ${float1} 5s ease-in-out infinite; // Reduced from 10s
        `}
      />
      
      <Box
        position="absolute"
        top="60%"
        left="60%"
        width="40vw"
        height="40vw"
        maxW="800px"
        maxH="800px"
        borderRadius="50%"
        bg={shape2Color}
        filter="blur(16vw)"
        opacity={0.5}
        css={css`
          animation: ${float1} 7s ease-in-out infinite; // Reduced from 12s
        `}
      />
      
      <Box
        position="absolute"
        top="75%"
        left="10%"
        width="30vw"
        height="30vw"
        maxW="600px"
        maxH="600px"
        borderRadius="50%"
        bg={shape3Color}
        filter="blur(10vw)"
        opacity={0.5}
        css={css`
          animation: ${float1} 7s ease-in-out infinite; // Reduced from 16s
        `}
      />

      <Box
        position="absolute"
        top="15%"
        left="75%"
        width="20vw"
        height="20vw"
        maxW="500px"
        maxH="500px"
        borderRadius="50%"
        bg={shape1Color}
        filter="blur(8vw)"
        opacity={0.6}
        css={css`
          animation: ${float1} 4s ease-in-out infinite; // Reduced from 14s
        `}
      />

      <Box
        position="absolute"
        top="40%"
        left="30%"
        width="15vw"
        height="15vw"
        maxW="400px"
        maxH="400px"
        borderRadius="50%"
        bg={shape3Color}
        filter="blur(6vw)"
        opacity={0.6}
        css={css`
          animation: ${float1} 9s ease-in-out infinite; // Reduced from 18s
        `}
      />
    </Box>
  );
};
export default AnimatedBackground;
