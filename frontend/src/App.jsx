import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { Button, Container } from '@chakra-ui/react'
import UserPage from './pages/UserPage'
import PostPage from './pages/PostPage'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import Header from './components/Header'
import LoginCard from './components/LoginCard'
import LogoutButton from './components/LogoutButton'
import { useSelector } from 'react-redux'

function App() {
  const user = useSelector((state) => state.user?.user);

  console.log('User data:', user);

  return (
    <Container maxW='620px'>

      <Header />

      <Routes>
        <Route path="/" element={user ? <HomePage /> : <Navigate to="/auth" />} />
        <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
        <Route path="/login" element={<LoginCard />} />
        <Route path="/:username" element={<UserPage />} />
        <Route path="/:username/post/:pid" element={<PostPage />} />
      </Routes>
      {user && <LogoutButton />}
    </Container>
  );
}

export default App
