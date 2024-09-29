import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Social Media App</h1>
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <Link to="/feeds" className="hover:underline">
                Feeds
              </Link>
              <Link to="/my-posts" className="hover:underline">
                My Posts
              </Link>
              <Link to="/saved-posts" className="hover:underline">
                Saved Posts
              </Link>
              <Link to="/create-post" className="hover:underline">
                Create Post
              </Link>
              <button
                onClick={signOut}
                className="bg-red-500 px-4 py-2 rounded-lg"
              >
                Logout
              </button>
            </>
          )}
          {!user && (
            <Link to="/login" className="bg-blue-500 px-4 py-2 rounded-lg">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
