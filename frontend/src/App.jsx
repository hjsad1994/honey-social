import { Routes, Route } from 'react-router-dom'
import './App.css'
import { Button, Container } from '@chakra-ui/react'
import UserPage from './pages/UserPage'
import PostPage from './pages/PostPage'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import Header from './components/Header'
import LoginCard from './components/LoginCard'
function App() {
  return (
    <Container maxW='620px'>

    <Header/>
    
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<LoginCard />} />
        <Route path="/:username" element={<UserPage />} />
        <Route path="/:username/post/:pid" element={<PostPage />} />
      </Routes>
    </Container>
  );
}

export default App
