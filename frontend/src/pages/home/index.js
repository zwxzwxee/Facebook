import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import CreatePost from "../../components/createPost";
import Header from "../../components/header";
import LeftHome from "../../components/home/left";
import RightHome from "../../components/home/right";
import SendVerification from "../../components/home/sendVerification";
import Stories from "../../components/home/stories";
import Post from "../../components/posts";
import { HashLoader } from "react-spinners";
import "./style.css";

export default function Home({ setVisible, posts, loading, getAllPosts }) {
  const { user } = useSelector((user) => ({ ...user }));
  const middle = useRef(null);
  const [height, setHeight] = useState();
  useEffect(() => {
    setHeight(middle.current.clientHeight);
  }, [loading, height]);
  return (
    <div className="home" style={{ height: `${height + 150}px` }}>
      <Header page="home" getAllPosts={getAllPosts} />
      <LeftHome user={user} />
      <div className="home_middle" ref={middle}>
        <Stories />
        {user.verified !== true && <SendVerification user={user} />}
        {/* if the user is not verified then show the resend part */}
        <CreatePost user={user} setVisible={setVisible} />

        {loading ? (
          <div className="skeleton_loader">
            <HashLoader color="#1876f2" />
          </div>
        ) : (
          <div className="posts">
            {posts.map((post) => (
              <Post key={post._id} post={post} user={user} />
            ))}
          </div>
        )}
      </div>
      <RightHome user={user} />
    </div>
  );
}
