import { useSelector } from "react-redux";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import LoginCard from "../components/LoginCard";
import SignupCard from "../components/SignupCard";
import { RootState } from "../store/store";

const AuthPage: React.FC = () => {
  const authScreen = useSelector((state: RootState) => state.auth.authScreen);
  
  // Support for dark mode with subtle background overlay
  const overlayColor = useColorModeValue(
    "rgba(255, 255, 255, 0.1)", 
    "rgba(0, 0, 0, 0.4)"
  );

  return (
    <Box
      as="main"
      height="100vh"
      width="100vw"
      position="fixed"
      top={0}
      left={0}
      overflow="auto"
      sx={{
        "&::-webkit-scrollbar": {
          width: "8px",
          borderRadius: "8px",
          backgroundColor: "rgba(0, 0, 0, 0.05)",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
        },
      }}
    >
      {/* Background container */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundImage="url('/bg-logout.png')"
        backgroundSize="1785px 510px"
        backgroundPosition="top center"
        backgroundRepeat="no-repeat"
        zIndex={-1}
        _after={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: overlayColor,
          zIndex: 0,
        }}
      />

      {/* Content container */}
      <Flex
        height="100%"
        width="100%"
        justifyContent="center"
        alignItems="center"
        padding={4}
      >
        <Box
          position="relative"
          zIndex={1}
          width="100%"
          maxWidth="480px"
          marginY="auto"
        >
          {authScreen === 'login' ? <LoginCard /> : <SignupCard />}
        </Box>
      </Flex>
    </Box>
  );
};

export default AuthPage;