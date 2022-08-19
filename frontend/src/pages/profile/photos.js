import { photosReducer } from "../../functions/reducers";
import { useReducer, useEffect } from "react";
import axios from "axios";

export default function Photos({ username, token, photos, setPhotos }) {
  return (
    <div className="profile_card">
      <div className="profile_card_header">
        Photos
        <div className="profile_header_link">See All Photos</div>
      </div>
      <div className="profile_card_count">
        {photos.total_count === 0
          ? ""
          : photos.total_count === 1
          ? "1 photo"
          : `${photos.total_count} photos`}
      </div>
      <div className="profile_card_grid">
        {photos.resources &&
          photos.resources.slice(0, 9).map((photo) => (
            <div className="profile_photo_card" key={photo.public_id}>
              <img src={photo.secure_url} alt="" />
            </div>
          ))}
      </div>
    </div>
  );
}
