import { useRef, useState } from "react";
import "./style.css";
import UpdateProfilePic from "./updateProfilePic";
import useClickOutside from "../../helpers/clickOutside";
import { useSelector } from "react-redux";

export default function ProfilePicture({ setShow, show, pRef, photos }) {
  const { user } = useSelector((state) => ({ ...state }));
  const refInput = useRef(null);
  const popup = useRef(null);
  useClickOutside(popup, () => {
    setShow(false);
  });
  const [error, setError] = useState("");
  const [img, setImg] = useState();
  const handleImg = (e) => {
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
      setImg(readerEvent.target.result);
    };
  };
  return (
    <div className="blur">
      <input
        type="file"
        hidden
        ref={refInput}
        onChange={handleImg}
        accept="image/jpeg, image/png, image/webp,image/gif"
      />
      <div className="postBox pictureBox" ref={popup}>
        <div className="box_header">
          <div className="small_circle" onClick={() => setShow(false)}>
            <i className="exit_icon"></i>
          </div>
          <span>Update profile picture</span>
        </div>
        <div className="update_picture_wrap">
          <div className="update_picture_buttons">
            <button
              className="light_blue_btn"
              onClick={() => refInput.current.click()}
            >
              <i className="plus_icon filter_blue"></i>
              upload photo
            </button>
            <button className="gray_btn">
              <i className="frame_icon"></i>
              Add frame
            </button>
          </div>
        </div>
        {error && (
          <div className="postError comment_error">
            <div className="postError_error">{error}</div>
            <button className="blue_btn" onClick={() => setError("")}>
              Try again
            </button>
          </div>
        )}
        <div className="old_pictures_wrap scrollbar">
          <h4>Your profile pictures</h4>
          <div className="old_pictures">
            {photos
              .filter(
                (img) => img.folder === `${user.username}/profile_pictures`
              )
              .map((photo) => (
                <img
                  src={photo.secure_url}
                  alt=""
                  key={photo.public_id}
                  style={{ width: "100px" }}
                  onClick={() => setImg(photo.secure_url)}
                />
              ))}
          </div>
          <h4>Your other pictures</h4>
          <div className="old_pictures">
            {photos
              .filter(
                (img) => img.folder !== `${user.username}/profile_pictures`
              )
              .map((photo) => (
                <img
                  src={photo.secure_url}
                  alt=""
                  key={photo.public_id}
                  style={{ width: "100px" }}
                  onClick={() => setImg(photo.secure_url)}
                />
              ))}
          </div>
        </div>
        {img && (
          <UpdateProfilePic
            setImg={setImg}
            img={img}
            error={error}
            setError={setError}
            setShow={setShow}
            pRef={pRef}
          />
        )}
      </div>
    </div>
  );
}
