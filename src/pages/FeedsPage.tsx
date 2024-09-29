import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

interface Post {
  id: string;
  username: string;
  imageUrl: string;
  likes: number;
  user: string;
  comments: {
    username: string;
    comment: string;
    replies?: { username: string; comment: string }[];
  }[];
  likedBy: string[];
  savedBy: string[];
  userId: string;
  orderBy: string;
}

const FeedsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Real-time fetching of posts
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "minisocial"),
      (snapshot) => {
        const postsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[];
        setPosts(postsData);
      },
      (error) => {
        console.error("Error loading posts:", error);
        setError("Failed to load posts");
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle liking a post
  const handleLike = async (postId: string) => {
    try {
      const postRef = doc(db, "minisocial", postId);
      const post = posts.find((p) => p.id === postId);

      if (!post) return;

      const isLiked = post.likedBy.includes(user?.uid ?? "");
      if (!isLiked) {
        await updateDoc(postRef, {
          likes: post.likes + 1,
          likedBy: arrayUnion(user?.uid),
        });
      } else {
        await updateDoc(postRef, {
          likes: post.likes - 1,
          likedBy: arrayRemove(user?.uid),
        });
      }
    } catch (error) {
      console.error("Error liking post:", error);
      setError("Failed to like post");
    }
  };

  // Handle saving a post
  const handleSavePost = async (postId: string) => {
    if (!user) {
      setError("You must be logged in to save a post.");
      return;
    }

    try {
      const postRef = doc(db, "minisocial", postId);
      console.log("Saving post with ID:", postId);
      const post = posts.find((p) => p.id === postId);
      if (!post) {
        console.log("Post not found in the posts array.");
        return;
      }
      const savedBy = post.savedBy || [];
      console.log("Current savedBy array:", savedBy);
      if (!savedBy.includes(user.uid)) {
        console.log("Saving post for user:", user.uid);
        await updateDoc(postRef, { savedBy: arrayUnion(user.uid) });
        const updatedPosts = posts.map((p) =>
          p.id === postId ? { ...p, savedBy: [...savedBy, user.uid] } : p
        );
        setPosts(updatedPosts);
      } else {
        console.log("User has already saved this post.");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      setError("Failed to save post");
    }
  };

  // Handle adding a comment to a post
  const handleComment = async (postId: string, comment: string) => {
    if (!user) {
      setError("You must be logged in to comment.");
      return;
    }

    try {
      const postRef = doc(db, "minisocial", postId);
      const post = posts.find((p) => p.id === postId);

      if (!post) return;

      const newComment = { username: user.displayName || "Anonymous", comment };
      await updateDoc(postRef, { comments: arrayUnion(newComment) });
    } catch (error) {
      console.error("Error commenting on post:", error);
      setError("Failed to comment on post");
    }
  };

  const handleReply = async (
    postId: string,
    commentIndex: number,
    reply: string
  ) => {
    const postRef = doc(db, "minisocial", postId);
    const post = posts.find((p) => p.id === postId);

    if (!post) return;

    const newReply = {
      username: user?.displayName || "Anonymous",
      comment: reply,
    };
    const updatedComments = [...post.comments];
    const currentReplies = updatedComments[commentIndex].replies ?? [];

    updatedComments[commentIndex].replies = [...currentReplies, newReply];

    await updateDoc(postRef, { comments: updatedComments });
  };

  const handleDelete = async (postId: string) => {
    try {
      const postRef = doc(db, "minisocial", postId);
      await deleteDoc(postRef);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const fetchMorePosts = async () => {
    if (loading) return; // Prevent multiple fetches
    setLoading(true);

    try {
      const response = await fetch(`/api/posts?page=${page}`);
      const newPosts = await response.json();
      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching more posts:", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };
  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 5 && !loading) {
      fetchMorePosts(); // Fetch more posts when the bottom is reached
    }
  };

  // Set up the scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener on component unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading]); // Re-run when loading state changes

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Feeds</h1>
      {error && <p className="text-red-500">{error}</p>}
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
                  user
                    ? post.likedBy.includes(user?.uid)
                      ? "text-red-500"
                      : "text-gray-500"
                    : "text-gray-500 cursor-not-allowed"
                } font-bold`}
                onClick={() => user && handleLike(post.id)}
                disabled={!user}
              >
                {post.likedBy.includes(user?.uid ?? "") ? "❤️" : "🤍"}{" "}
                {post.likes}
              </button>
              <button
                className={`${
                  user ? "text-blue-500" : "text-gray-500 cursor-not-allowed"
                } font-bold`}
                onClick={() => user && handleSavePost(post.id)}
                disabled={!user}
              >
                📥 Save
              </button>
              {user?.uid === post.userId && user && (
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-red-500"
                >
                  Delete Post
                </button>
              )}
            </div>
            <div className="mb-4">
              <p className="font-bold">Comments:</p>
              {post.comments.map((comment, commentIndex) => (
                <div key={commentIndex}>
                  <p>
                    <strong>{comment.username}</strong>: {comment.comment}
                  </p>
                  {comment.replies?.map((reply, replyIndex) => (
                    <p key={replyIndex} className="ml-4">
                      <strong>{reply.username}</strong>: {reply.comment}
                    </p>
                  ))}
                  {user && (
                    <button
                      onClick={() =>
                        handleReply(post.id, commentIndex, "Replying to...")
                      }
                    >
                      Reply
                    </button>
                  )}
                </div>
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
      {loading && <div>Loading more posts...</div>}
    </div>
  );
};

export default FeedsPage;
