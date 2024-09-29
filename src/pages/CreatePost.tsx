import { useState } from "react";
import { db, storage } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const CreatePost = () => {
  const { user } = useAuth();
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !image) {
      setError("Please provide all required fields");
      return;
    }

    setUploading(true);
    const storageRef = ref(storage, `posts/${image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      "state_changed",
      null,
      (error) => {
        console.error("Upload error:", error);
        setError("Failed to upload image");
        setUploading(false);
      },
      async () => {
        const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
        try {
          await addDoc(collection(db, "minisocial"), {
            username: user.displayName || "Anonymous",
            imageUrl,
            userId: user.uid,
            likes: 0,
            likedBy: [],
            comments: [],
            savedBy: [],
            createdAt: new Date(),
          });
          //   setCaption("");
          setImage(null);
          setError(null);
          setUploading(false);
        } catch (error) {
          console.error("Error creating post:", error);
          setError("Failed to create post");
          setUploading(false);
        }
      }
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Create Post</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleCreatePost} className="space-y-4">
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>
        {/* <div>
          <input
            type="text"
            placeholder="Enter caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div> */}
        <button
          type="submit"
          disabled={uploading}
          className={`w-full bg-blue-500 text-white rounded-lg px-4 py-2 ${
            uploading ? "opacity-50" : ""
          }`}
        >
          {uploading ? "Uploading..." : "Create Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
