import { useState, useEffect, useRef } from "react";
import Picker from "emoji-picker-react";
import { comment } from "../../functions/post";
import { uploadImages } from "../../functions/uploadImages";
import dataURItoBlob from "../../helpers/dataURItoBlob";
import { ClipLoader } from "react-spinners";

export default function CreateComments({
  user,
  postId,
  setComments,
  setCount,
}) {
  const [cursorPosition, setCursorPostion] = useState();
  const [text, setText] = useState("");
  const [commentImg, setCommentImg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const textRef = useRef(null);
  const imgInput = useRef(null);
  const [picker, setPicker] = useState(false);
  useEffect(() => {
    textRef.current.selectionEnd = cursorPosition;
  }, [cursorPosition]);
  // when the cursorPosition changes, the above function will executed and change the cursor position.
  const handleEmoji = (e, { emoji }) => {
    const ref = textRef.current;
    ref.focus();
    const start = text.substring(0, ref.selectionStart);
    const end = text.substring(ref.selectionStart);
    const newText = start + emoji + end;
    setText(newText);
    setCursorPostion(start.length + emoji.length);
  };
  const handleImgs = (e) => {
    let file = e.target.files[0]; // only allow send one file to comment
    if (
      file.type !== "image/jpeg" &&
      file.type !== "image/png" &&
      file.type !== "image/webp" &&
      file.type !== "image/gif"
    ) {
      setError(`${file.name} format is not supported.`);
      return;
    } else if (file.size > 1024 * 1024 * 5) {
      setError(`${file.name} is too large.`);
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (readerEvent) => {
      setCommentImg(readerEvent.target.result);
    };
  };

  const handleComment = async (e) => {
    if (e.key == "Enter") {
      if (commentImg != "") {
        setLoading(true);
        // convert the original urlbased images into blobs
        const img = dataURItoBlob(commentImg);
        const path = `${user.username}/postImages/${postId}`;
        // the folder name the images gonna be stored inside of cloudinary
        let formData = new FormData();
        formData.append("path", path);
        formData.append("file", img);
        const commentImgUrl = await uploadImages(formData, path, user.token);
        const comments = await comment(
          postId,
          user.token,
          text,
          commentImgUrl[0].url
        );
        setComments(comments);
        setCount((prev) => ++prev);
        setLoading(false);
        setText("");
        setCommentImg("");
      } else {
        setLoading(true);
        const comments = await comment(postId, user.token, text, "");
        setComments(comments);
        setCount((prev) => ++prev);
        setLoading(false);
        setText("");
        setCommentImg("");
      }
    }
  };

  return (
    <div className="create_comment_wrap">
      <div className="create_comment">
        <img src={user?.picture} alt="" />
        <div className="comment_input_wrap">
          {picker && (
            <div className="comment_emoji_picker">
              <Picker onEmojiClick={handleEmoji} />{" "}
            </div>
          )}
          <input
            type="file"
            hidden
            ref={imgInput}
            accept="image/jpeg, image/png, image/webp,image/gif"
            onChange={handleImgs}
          />
          {error && (
            <div className="postError comment_error">
              <div className="postError_error">{error}</div>
              <button className="blue_btn" onClick={() => setError("")}>
                Try again
              </button>
            </div>
          )}
          <input
            className=""
            type="text"
            ref={textRef}
            value={text}
            placeholder="Write a comment..."
            onChange={(e) => setText(e.target.value)}
            onKeyUp={handleComment}
          />
          <div className="comment_circle" style={{ marginTop: "5px" }}>
            <ClipLoader size={20} color="#1876f2" loading={loading} />
          </div>
          <div
            className="comment_circle_icon hover2"
            onClick={() => setPicker((prev) => !prev)}
          >
            <i className="emoji_icon"></i>
          </div>
          <div
            className="comment_circle_icon hover2"
            onClick={() => imgInput.current.click()}
          >
            <i className="camera_icon"></i>
          </div>
          <div className="comment_circle_icon hover2">
            <i className="gif_icon"></i>
          </div>
          <div className="comment_circle_icon hover2">
            <i className="sticker_icon"></i>
          </div>
        </div>
      </div>
      {commentImg && (
        <div className="comment_img_preview">
          <img src={commentImg} alt="" />
          <div className="small_white_circle" onClick={() => setCommentImg("")}>
            <i className="exit_icon"></i>
          </div>
        </div>
      )}
    </div>
  );
}
