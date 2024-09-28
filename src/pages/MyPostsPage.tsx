// src/pages/MyPostsPage.tsx
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const MyPostsPage = () => {
  const { user } = useAuth();
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyPosts = async () => {
    try {
      const q = query(
        collection(db, "posts"),
        where("userId", "==", user?.uid)
      );
      const postsSnapshot = await getDocs(q);
      const postsData = postsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMyPosts(postsData);
      setLoading(false);
    } catch (error) {
      setError("Failed to load posts");
    }
  };

  useEffect(() => {
    if (user) fetchMyPosts();
  }, [user]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">My Posts</h1>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myPosts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4 shadow-md">
              <img
                src={post.imageUrl}
                alt={post.username}
                className="w-full h-64 object-cover mb-4"
              />
              <p className="font-bold">{post.username}</p>
              <p>{post.likes} likes</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPostsPage;
