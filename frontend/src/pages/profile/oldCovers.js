import { useRef } from "react";
import useClickOutside from "../../helpers/clickOutside";

export default function OldCovers({ photos, user, setCover, setShow }) {
  const oldCoverRef = useRef(null);
  useClickOutside(oldCoverRef, () => {
    setShow(false);
  });
  return (
    <div className="blur">
      <div className="postBox selectCoverBox" ref={oldCoverRef}>
        <div className="box_header">
          <div className="small_circle" onClick={() => setShow(false)}>
            <i className="exit_icon"></i>
          </div>
          <span>Select Photo</span>
        </div>
        <div className="selectCoverBox_links">
          <div className="selectCoverBox_link">Recent Photos</div>
          <div className="selectCoverBox_link">Photo Albums</div>
        </div>
        <div className="old_pictures_wrap scrollbar">
          <div className="old_pictures">
            {photos &&
              photos
                .filter(
                  (img) => img.folder === `${user.username}/cover_pictures`
                )
                .map((photo) => (
                  <img
                    src={photo.secure_url}
                    alt=""
                    key={photo.public_id}
                    style={{ width: "100px" }}
                    onClick={() => {
                      setCover(photo.secure_url);
                      setShow(false);
                    }}
                  />
                ))}
          </div>
          <div className="old_pictures">
            {photos &&
              photos
                .filter((img) => img.folder !== `${user.username}/postImages`)
                .map((photo) => (
                  <img
                    src={photo.secure_url}
                    alt=""
                    key={photo.public_id}
                    style={{ width: "100px" }}
                    onClick={() => {
                      setCover(photo.secure_url);
                      setShow(false);
                    }}
                  />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
