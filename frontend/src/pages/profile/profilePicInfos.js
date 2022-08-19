import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import ProfilePicture from "../../components/profilePicture";
import Friendship from "./friendship";

export default function ProfilePicInfos({
  profile,
  visitor,
  photos,
  otherName,
}) {
  const [show, setShow] = useState(false);
  const pRef = useRef(null);
  return (
    <div className="profile_img_wrap">
      {show && (
        <ProfilePicture
          show={show}
          setShow={setShow}
          pRef={pRef}
          photos={photos}
        />
      )}
      <div className="profile_w_left">
        <div className="profile_w_img">
          <div
            className="profile_w_bg"
            ref={pRef}
            style={{
              backgroundSize: "cover",
              backgroundImage: `url(${profile.picture})`,
            }}
          ></div>
          {!visitor && (
            <div
              className="profile_circle hover1"
              onClick={() => setShow(true)}
            >
              <i className="camera_filled_icon"></i>
            </div>
          )}
        </div>
        <div className="profile_w_col">
          <div className="profile_name">
            {profile.first_name} {profile.last_name}
            <div className="othername">{otherName && `(${otherName})`}</div>
          </div>
          <div className="profile_friend_count">
            <div className="profile_card_count">
              {!profile.friends || !profile.friends.length
                ? ""
                : profile.friends.length === 1
                ? "1 friend"
                : `${profile.friends.length} friends`}
            </div>
          </div>
          <div className="profile_friend_imgs">
            {profile?.friends &&
              profile.friends.slice(0, 6).map((friend, i) => (
                <Link to={`/profile/${friend.username}`} key={i}>
                  <img
                    src={friend.picture}
                    alt=""
                    style={{
                      transform: `translateX(${-i * 7}px)`,
                      zIndex: `${i}`,
                    }} // to let all the images get stack on the former one
                  />
                </Link>
              ))}
          </div>
        </div>
      </div>

      {visitor ? (
        <Friendship friendshipp={profile?.friendship} profileId={profile._id} />
      ) : (
        <div className="profile_w_right">
          <button className="blue_btn">
            <img src="../../../icons/plus.png" alt="" className="invert" />
            <span> Add to story</span>
          </button>
          <button className="gray_btn">
            <i className="edit_icon"></i>
            <span> Edit profile</span>
          </button>
        </div>
      )}
    </div>
  );
}
