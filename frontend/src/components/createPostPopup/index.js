import { useEffect, useRef, useState } from "react";
import "./style.css";

import EmojiPickerBackgrounds from "./emojiPickerBackgrounds";
import AddToYourPost from "./addToYourPost";
import ImgPreview from "./imgPreview";
import useClickOutside from "../../helpers/clickOutside";
import { createPost } from "../../functions/post";
import PulseLoader from "react-spinners/PulseLoader";
import PostError from "./postError";
import dataURItoBlob from "../../helpers/dataURItoBlob";
import { uploadImages } from "../../functions/uploadImages";

export default function CreatePostPopup({
  user,
  setVisible,
  posts,
  dispatch,
  profile,
}) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [showPrev, setShowPrev] = useState(false);
  const [images, setImages] = useState([]);
  const [background, setBackground] = useState("");
  const [error, setError] = useState("");

  const popup = useRef(null);
  useClickOutside(popup, () => {
    setVisible(false);
  });
  const postSubmit = async () => {
    if (background) {
      setLoading(true);
      // the returned res from createPost() is either "ok" or the error message
      const res = await createPost(
        null,
        background,
        text,
        null,
        user.id,
        user.token
      );
      setLoading(false);
      if (res.status === "ok") {
        dispatch({
          type: profile ? "PROFILE_POSTS" : "POST_SUCCESS",
          payload: [res.data, ...posts],
        });
        setBackground("");
        setText("");
        setVisible(false);
      } else {
        setError(res);
      }
    } else if (images && images.length) {
      setLoading(true);
      // convert the original urlbased images into blobs
      const postImg = images.map((img) => {
        return dataURItoBlob(img);
      });
      const path = `${user.username}/postImages`;
      // the folder name the images gonna be stored inside of cloudinary
      let formData = new FormData();
      formData.append("path", path);
      postImg.forEach((img) => {
        formData.append("file", img);
      });
      const res = await uploadImages(formData, path, user.token);
      // first upload the images, and the function will return the url of the images if succeeds.
      // then use the returned url to make another post with text
      const response = await createPost(
        null,
        null,
        text,
        res,
        user.id,
        user.token
      );
      setLoading(false);
      if (response.status === "ok") {
        dispatch({
          type: profile ? "PROFILE_POSTS" : "POST_SUCCESS",
          payload: [res.data, ...posts],
        });
        setText("");
        setImages([]);
        setVisible(false);
      } else {
        setError(res);
      }
    } else if (text) {
      setLoading(true);
      // the returned res from createPost() is either "ok" or the error message
      const res = await createPost(null, null, text, null, user.id, user.token);
      setLoading(false);
      if (res.status === "ok") {
        dispatch({
          type: profile ? "PROFILE_POSTS" : "POST_SUCCESS",
          payload: [res.data, ...posts],
        });
        setBackground("");
        setText("");
        setVisible(false);
      } else {
        setError(res);
      }
    } else {
      console.log("nothing");
    }
  };

  return (
    <div className="blur">
      <div className="postBox" ref={popup}>
        {error && <PostError error={error} setError={setError} />}
        <div className="box_header">
          <div className="small_circle">
            <i className="exit_icon" onClick={() => setVisible(false)}></i>
          </div>
          <span>Create Post</span>
        </div>
        <div className="box_profile">
          <img src={user.picture} alt="" className="box_profile_img" />
          <div className="box_col">
            <div className="box_profile_name">
              {user.first_name} {user.last_name}
            </div>
            <div className="box_privacy">
              <img src="../../../icons/public.png" alt="" />
              <span>Public</span>
              <i className="arrowDown_icon"></i>
            </div>
          </div>
        </div>

        {!showPrev ? (
          <EmojiPickerBackgrounds
            text={text}
            setText={setText}
            user={user}
            background={background}
            setBackground={setBackground}
          />
        ) : (
          <ImgPreview
            text={text}
            setText={setText}
            user={user}
            setShowPrev={setShowPrev}
            images={images}
            setImages={setImages}
            setError={setError}
          />
        )}
        <AddToYourPost setShowPrev={setShowPrev} />
        <button
          className="post_submit"
          onClick={() => postSubmit()}
          disabled={loading}
        >
          {loading ? <PulseLoader color="#fff" size={5} /> : "Post"}
        </button>
      </div>
    </div>
  );
}
