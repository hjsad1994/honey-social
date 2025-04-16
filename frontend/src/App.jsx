import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { Button, Container } from '@chakra-ui/react'
import UserPage from './pages/UserPage'
import PostPage from './pages/PostPage'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import CreatePosts from './components/CreatePosts'
import UpdateProfilePage from './pages/UpdateProfilePage'
import Header from './components/Header'
import LoginCard from './components/LoginCard'
import LogoutButton from './components/LogoutButton'
import { useSelector } from 'react-redux'

function App() {
  const user = useSelector((state) => state.user?.user);

  return (
    <>
      {/* Header nằm ngoài Container để có thể full width */}
      <Header />
      
      <Container maxW="680px" px={{ base: 2, md: 4 }} >
        <Routes>
          <Route path="/" element={user ? <HomePage /> : <Navigate to="/auth" />} />
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
          <Route path="/update" element={user ? <UpdateProfilePage /> : <Navigate to="/auth" />} />
          
          <Route path="/login" element={<LoginCard />} />
          <Route path="/:username" element={<UserPage />} />
          <Route path="/:username/post/:pid" element={<PostPage />} />
        </Routes>
        {user && <LogoutButton />}
        {user && <CreatePosts />}
      </Container>
    </>
  );
}

export default App
