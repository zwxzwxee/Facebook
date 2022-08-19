import { Link } from "react-router-dom";

export default function Friends({ friends }) {
  return (
    <div className="profile_card">
      <div className="profile_card_header">
        Friends
        <div className="profile_header_link">See All Friends</div>
      </div>
      <div className="profile_card_count">
        {!friends || !friends.length
          ? ""
          : friends.length === 1
          ? "1 friend"
          : `${friends.length} friends`}
      </div>
      <div className="profile_card_grid">
        {friends &&
          friends.slice(0, 9).map((item, i) => (
            <Link
              className="profile_photo_card"
              key={i}
              to={`/profile/${item.username}`}
            >
              <img src={item.picture} alt="" />
              <span>
                {item.first_name} {item.last_name}
              </span>
            </Link>
          ))}
      </div>
    </div>
  );
}
