// src/App.tsx
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import FeedsPage from "./pages/FeedsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Navbar from "./components/Navbar";
import MyPostsPage from "./pages/MyPostsPage";
import SavedPostsPage from "./pages/SavedPostsPage";
import CreatePost from "./pages/CreatePost";
import { useAuth } from "./context/AuthContext";

const App = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<FeedsPage />} />
        <Route path="/login" element={!user ? <LoginPage /> : <FeedsPage />} />
        <Route
          path="/register"
          element={!user ? <RegisterPage /> : <FeedsPage />}
        />
        <Route path="/feeds" element={<FeedsPage />} />
        <Route path="/my-posts" element={<MyPostsPage />} />
        <Route path="/saved-posts" element={<SavedPostsPage />} />
        <Route path="/create-post" element={<CreatePost />} />
      </Routes>
    </Router>
  );
};

export default App;
