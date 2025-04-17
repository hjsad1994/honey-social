import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { Container, Box } from '@chakra-ui/react'
import UserPage from './pages/UserPage'
import PostPage from './pages/PostPage'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import UpdateProfilePage from './pages/UpdateProfilePage'
import LandingPage from './pages/LandingPage'
import Header from './components/Header'
import LoginCard from './components/LoginCard'
import LogoutButton from './components/LogoutButton'
import { useSelector } from 'react-redux'
import { RootState } from './store/store'


import AnimatedBackground from './components/AnimatedBackground';   // 👈 Thêm dòng này

// const App: React.FC = () => {
//   const user = useSelector((state: RootState) => state.user?.user);

//   // If user is not logged in and we're on the home route (landing page)
//   // we should render without container constraints
//   const isLandingPage = !user && window.location.pathname === '/';

//   return (
//     <>
//       {/* Only show header for authenticated users or non-landing pages */}
//       {!isLandingPage && <Header />}
      
//       {isLandingPage ? (
//         // Render landing page without container constraints
//         <LandingPage />
//       ) : (
//         // All other pages are wrapped with container
//         <Container maxW="680px" px={{ base: 2, md: 4 }}>
//           <Routes>
//             <Route path="/" element={user ? <HomePage /> : <Navigate to="/auth" />} />
//             <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
//             <Route path="/update" element={user ? <UpdateProfilePage /> : <Navigate to="/auth" />} />
//             <Route path="/login" element={<LoginCard />} />
//             <Route path="/:username" element={<UserPage />} />
//             <Route path="/:username/post/:pid" element={<PostPage />} />
//           </Routes>
//           {user && <LogoutButton />}
//         </Container>
//       )}
//     </>
//   );
// }

// export default App

const App: React.FC = () => {
  const user = useSelector((state: RootState) => state.user?.user);
  const isLandingPage = !user && window.location.pathname === '/';

  return (
    <>
      {/*  🔸 Background phủ toàn site, đặt thật sớm để nó nằm dưới mọi thứ  */}
      <AnimatedBackground />

      {/* Header chỉ hiển thị ngoài landing page  */}
      {!isLandingPage && <Header />}

      {isLandingPage ? (
        <LandingPage />  
      ) : (
        <Container
          maxW="680px"
          px={{ base: 2, md: 4 }}
          /* bảo đảm nội dung nổi lên trên background */
          as={Box}
          position="relative"
          zIndex={1}
        >
          <Routes>
            <Route path="/" element={user ? <HomePage /> : <Navigate to="/auth" />} />
            <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
            <Route path="/update" element={user ? <UpdateProfilePage /> : <Navigate to="/auth" />} />
            <Route path="/login" element={<LoginCard />} />
            <Route path="/:username" element={<UserPage />} />
            <Route path="/:username/post/:pid" element={<PostPage />} />
          </Routes>
          {user && <LogoutButton />}
        </Container>
      )}
    </>
  );
};

export default App;
