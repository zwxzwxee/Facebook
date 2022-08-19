import { useRef, useState, useCallback, useEffect } from "react";
import useClickOutside from "../../helpers/clickOutside";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../helpers/getCroppedImg";
import { updateCover } from "../../functions/user";
import { uploadImages } from "../../functions/uploadImages";
import { useSelector } from "react-redux";
import { createPost } from "../../functions/post";
import PulseLoader from "react-spinners/PulseLoader";
import OldCovers from "./oldCovers";

export default function Cover({ profile, visitor, photos }) {
  const { user } = useSelector((state) => ({ ...state }));
  const [cover, setCover] = useState("");
  const [showCoverMenu, setShowCoverMenu] = useState(false);
  const [show, setShow] = useState(false); // the state for oldCovers popup
  const menuRef = useRef(null);
  const refInput = useRef(null);
  const coverRef = useRef(null);
  const pRef = useRef(null);
  const [width, setWidth] = useState();
  useEffect(() => {
    setWidth(coverRef.current.clientWidth);
  }, [window.innerWidth]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);
  //   return the cropped image in blob-url format, which can be used directly
  const getCroppedImage = useCallback(
    async (show) => {
      try {
        const image = await getCroppedImg(cover, croppedAreaPixels);
        //   after cropped set the zoom thumb to the origin
        if (show) {
          //  the cropped image will be shown
          setZoom(1);
          setCrop({ x: 0, y: 0 });
          setCover(image);
        } else {
          //  the cropped image will not be shown
          return image;
        }
      } catch (error) {
        console.log(error);
      }
    },
    [croppedAreaPixels]
  );

  useClickOutside(menuRef, () => {
    setShowCoverMenu(false);
  });

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
      setCover(readerEvent.target.result);
    };
  };

  const updateCoverPic = async () => {
    try {
      setLoading(true);
      let imgurl = await getCroppedImage();
      let blob = await fetch(imgurl).then((b) => b.blob());
      //   convert the url into blob
      const path = `${user.username}/cover_pictures`;
      const formData = new FormData();
      formData.append("path", path);
      formData.append("file", blob);
      //   first upload the images to the cloudinary
      const res = await uploadImages(formData, path, user.token);
      //   then using the returned url to update
      const response = await updateCover(res[0].url, user.token);
      if (response === "ok") {
        // after uploading all the imgs, we have to create a new post
        const new_post = await createPost(
          "coverPicture",
          null,
          null,
          res,
          user.id,
          user.token
        );
        setLoading(false);
        if (new_post === "ok") {
          console.log(pRef.current);
          setCover("");
          // the pRef must be after the setCover(""), to avoid pRef to be null
          pRef.current.src = res[0].url;
        } else {
          setError(new_post);
        }
      } else {
        setLoading(false);
        setError(response);
      }
    } catch (error) {
      setLoading(false);
      setError(error.response.data.message);
    }
  };

  return (
    <div className="profile_cover" ref={coverRef}>
      {cover && (
        <div className="save_changes_cover">
          <div className="save_changes_left">
            <img src="../../../icons/public.png" alt="" className="icon" />
            Your cover photo is public
          </div>
          <div className="save_changes_right">
            <button
              className="blue_btn opacity_btn"
              onClick={() => setCover("")}
            >
              Cancel
            </button>
            <button className="blue_btn" onClick={() => updateCoverPic()}>
              {loading ? <PulseLoader color="#fff" size={5} /> : "Save changes"}
            </button>
          </div>
        </div>
      )}
      <input
        type="file"
        hidden
        ref={refInput}
        accept="image/jpeg, image/png, image/webp,image/gif"
        onChange={handleImg}
      />
      {error && (
        <div className="postError comment_error">
          <div className="postError_error">{error}</div>
          <button className="blue_btn" onClick={() => setError("")}>
            Try again
          </button>
        </div>
      )}

      {cover && (
        <div className="cover_cropper">
          <Cropper
            image={cover}
            crop={crop}
            zoom={zoom}
            aspect={width / 350}
            // since the width of cover part of the page is flexible,
            // so we can use the reference to get the width of the part and set the
            // the crop size of the cover
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            showGrid={true}
            objectFit="horizontal-cover"
          />
        </div>
      )}

      {profile.cover && !cover && (
        <img src={profile.cover} alt="" className="cover" ref={pRef} />
      )}
      {!visitor && (
        <div className="update_cover_wrapper">
          <div
            className="open_cover_update"
            onClick={() => setShowCoverMenu((prev) => !prev)}
          >
            <i className="camera_filled_icon"></i>
            Add Cover Photo
          </div>
          {showCoverMenu && (
            <div className="open_cover_menu" ref={menuRef}>
              <div
                className="open_cover_menu_item hover1"
                onClick={() => setShow(true)}
              >
                <i className="photo_icon"></i>
                Select Photo
              </div>
              <div
                className="open_cover_menu_item hover1"
                onClick={() => refInput.current.click()}
              >
                <i className="upload_icon"></i>
                Upload Photo
              </div>
            </div>
          )}
        </div>
      )}
      {show && (
        <OldCovers
          photos={photos}
          user={user}
          setCover={setCover}
          setShow={setShow}
        />
      )}
    </div>
  );
}
