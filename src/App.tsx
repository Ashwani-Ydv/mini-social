// src/App.tsx
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FeedsPage from "./pages/FeedsPage";
import MyPostsPage from "./pages/MyPostsPage";
import SavedPostsPage from "./pages/SavedPostsPage";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";

const App = () => {
  const { user } = useAuth();

  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route
            path="/login"
            element={!user ? <LoginPage /> : <FeedsPage />}
          />
          <Route
            path="/register"
            element={!user ? <RegisterPage /> : <FeedsPage />}
          />
          <Route path="/feeds" element={<FeedsPage />} />
          <Route path="/my-posts" element={<MyPostsPage />} />
          <Route path="/saved-posts" element={<SavedPostsPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
