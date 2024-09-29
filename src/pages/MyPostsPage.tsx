import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

interface Post {
  id: string;
  username: string;
  imageUrl: string;
  likes: number;
  comments: { username: string; comment: string }[];
  userId: string;
}

const MyPostsPage = () => {
  const { user } = useAuth();
  const [myPosts, setMyPosts] = useState<Post[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "minisocial"),
      where("userId", "==", user?.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMyPosts(
        snapshot.docs.map((doc) => {
          const postData = doc.data() as Post; // Cast the data to Post type
          return {
            ...postData, // Spread the document data without the id
            id: doc.id, // Add the id manually
          };
        })
      );
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">My Posts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myPosts.length > 0 ? (
          myPosts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4 shadow-md">
              <img
                src={post.imageUrl}
                alt={post.username}
                className="w-full h-64 object-cover mb-4"
              />
              <p className="font-bold">{post.username}</p>
              <p>❤️ {post.likes}</p>
              <div className="mb-4">
                <p className="font-bold">Comments:</p>
                {post.comments.map((comment, index) => (
                  <p key={index}>
                    <strong>{comment.username}</strong>: {comment.comment}
                  </p>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-red-500">No posts found</p>
        )}
      </div>
    </div>
  );
};

export default MyPostsPage;
