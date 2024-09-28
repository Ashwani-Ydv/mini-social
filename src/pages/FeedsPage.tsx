// src/pages/FeedsPage.tsx
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

interface Post {
  id: string;
  username: string;
  imageUrl: string;
  likes: number;
  comments: { username: string; comment: string }[];
}

const FeedsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const postsCollection = collection(db, "minisocial", "posts");
      console.log("postsCollection", postsCollection);
      const postsSnapshot = await getDocs(postsCollection);
      console.log("postsSnapshot", postsSnapshot);
      const postsData = postsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    } catch (err) {
      setError("Failed to load posts");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId: string) => {
    // Handle likes functionality (already implemented previously)
  };

  const handleComment = async (postId: string, comment: string) => {
    // Handle comment functionality (already implemented previously)
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Feeds</h1>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4 shadow-md">
              <img
                src={post.imageUrl}
                alt={post.username}
                className="w-full h-64 object-cover mb-4"
              />
              <div className="flex justify-between items-center mb-4">
                <p className="font-bold">{post.username}</p>
                <button
                  className={`${
                    user ? "text-red-500" : "text-gray-500"
                  } font-bold`}
                  disabled={!user}
                  onClick={() => handleLike(post.id)}
                >
                  ❤️ {post.likes}
                </button>
              </div>
              <div className="mb-4">
                <p className="font-bold">Comments:</p>
                {post.comments.map((comment, index) => (
                  <p key={index}>
                    <strong>{comment.username}</strong>: {comment.comment}
                  </p>
                ))}
              </div>
              {user && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const comment = (e.target as any).comment.value;
                    if (comment) {
                      handleComment(post.id, comment);
                      (e.target as any).reset();
                    }
                  }}
                >
                  <input
                    type="text"
                    name="comment"
                    placeholder="Add a comment..."
                    className="w-full border rounded-lg px-4 py-2 mb-2"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white rounded-lg px-4 py-2"
                  >
                    Submit
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedsPage;
