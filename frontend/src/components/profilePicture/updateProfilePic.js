import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../helpers/getCroppedImg";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { uploadImages } from "../../functions/uploadImages";
import { updateUserPic } from "../../functions/user";
import { createPost } from "../../functions/post";
import PulseLoader from "react-spinners/PulseLoader";
import Cookies from "js-cookie";

export default function UpdateProfilePic({
  setImg,
  img,
  setError,
  error,
  setShow,
  pRef,
}) {
  const dispatch = useDispatch();
  const [description, setDescription] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const slider = useRef(null);
  const { user } = useSelector((state) => ({ ...state }));

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);
  const zoomIn = () => {
    slider.current.stepUp();
    setZoom(slider.current.value);
  };
  const zoomOut = () => {
    slider.current.stepDown();
    setZoom(slider.current.value);
  };
  //   return the cropped image in blob-url format, which can be used directly
  const getCroppedImage = useCallback(
    async (show) => {
      try {
        const image = await getCroppedImg(img, croppedAreaPixels);
        //   after cropped set the zoom thumb to the origin
        if (show) {
          //  the cropped image will be shown
          setZoom(1);
          setCrop({ x: 0, y: 0 });
          setImg(image);
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

  const updateProfilePicture = async () => {
    try {
      setLoading(true);
      let imgurl = await getCroppedImage();
      let blob = await fetch(imgurl).then((b) => b.blob());
      //   convert the url into blob
      const path = `${user.username}/profile_pictures`;
      const formData = new FormData();
      formData.append("path", path);
      formData.append("file", blob);
      //   first upload the images to the cloudinary
      const res = await uploadImages(formData, path, user.token);
      //   then using the returned url to update
      const response = await updateUserPic(res[0].url, user.token);
      if (response === "ok") {
        // after uploading all the imgs, we have to create a new post
        const new_post = await createPost(
          "profilePicture",
          null,
          description,
          res,
          user.id,
          user.token
        );
        setLoading(false);
        if (new_post === "ok") {
          pRef.current.style.backgroundImage = `url(${res[0].url})`;
          setImg();
          setShow(false);
          Cookies.set(
            "user",
            JSON.stringify({
              ...user,
              picture: res[0].url,
            })
          );
          dispatch({
            type: "UPDATEPIC",
            payload: res[0].url,
          });
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
    <div className="postBox update_img">
      <div className="box_header">
        <div className="small_circle" onClick={() => setImg()}>
          <i className="exit_icon"></i>
        </div>
        <span>Update profile picture</span>
      </div>
      <div className="update_img_desc">
        <textarea
          placeholder="Description"
          className="textarea_blue details_input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
      </div>
      <div className="update_center">
        <div className="crooper">
          <Cropper
            image={img}
            crop={crop}
            zoom={zoom}
            aspect={1 / 1}
            cropShape="round"
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            showGrid={false}
          />
        </div>
        <div className="slider">
          <div className="slider_circle hover1" onClick={() => zoomOut()}>
            <i className="minus_icon"></i>
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.2}
            // step means one move can change how much on the slider
            value={zoom}
            onChange={(e) => setZoom(e.target.value)}
            ref={slider}
          />
          <div className="slider_circle hover1" onClick={() => zoomIn()}>
            <i className="plus_icon"></i>
          </div>
        </div>
      </div>
      <div className="flex_up">
        {/* click crop photo will showed the cropped image while save btn will not*/}
        <div className="gray_btn" onClick={() => getCroppedImage("show")}>
          <i className="crop_icon"></i>Crop photo
        </div>
        <div className="gray_btn">
          <i className="temp_icon"></i>Make temporary
        </div>
      </div>
      <div className="flex_p_t">
        <img
          src="../../../icons/public.png"
          alt=""
          style={{ transform: "scale(1.6)" }}
        />
        Your profile picture is public
      </div>
      <div className="update_submit_wrap">
        <div className="blue_link" onClick={() => setImg()}>
          Cancel
        </div>
        <button
          className="blue_btn"
          disabled={loading}
          onClick={() => updateProfilePicture()}
        >
          {loading ? <PulseLoader color="#fff" size={5} /> : "Save"}
        </button>
      </div>
    </div>
  );
}
