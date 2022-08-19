import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { profileReducer } from "../../functions/reducers";
import { useEffect, useReducer, useRef, useState } from "react";
import axios from "axios";
import Header from "../../components/header";
import "./style.css";
import Cover from "./cover";
import ProfilePicInfos from "./profilePicInfos";
import ProfileMenu from "./profileMenu";
import PeopleYouMayKnow from "./peopleYouMayKnow";
import CreatePost from "../../components/createPost";
import GridPosts from "./gridPosts";
import Post from "../../components/posts";
import Photos from "./photos";
import Friends from "./friends";
import { Link } from "react-router-dom";
import Intro from "../../components/intro";
import { useMediaQuery } from "react-responsive";
import CreatePostPopup from "../../components/createPostPopup";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { HashLoader } from "react-spinners";

export default function Profile({ getAllPosts }) {
  const [visible, setVisible] = useState(false);
  const [photos, setPhotos] = useState({});
  const navigate = useNavigate();
  const { username } = useParams();
  const { user } = useSelector((state) => ({ ...state }));
  const [otherName, setOtherName] = useState("");
  var userName = username === undefined ? user.username : username;
  // if the input username is undefined, then it will navigate to the login user's profile
  const [{ loading, error, profile }, dispatch] = useReducer(profileReducer, {
    loading: false,
    profile: {},
    error: "",
  });
  const path = `${userName}/*`;
  const max = 30;
  const sort = "desc";

  const getProfile = async () => {
    try {
      dispatch({
        type: "PROFILE_REQUEST",
      });
      const { data } = await axios.get(
        process.env.REACT_APP_BACKEND_URL + "/getProfile/" + userName,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (data.ok === false) {
        navigate("/profile");
      } else {
        dispatch({
          type: "PROFILE_SUCCESS",
          payload: data,
        });
        // after successfully get the profile of the user, we try to get photos
        try {
          const images = await axios.post(
            process.env.REACT_APP_BACKEND_URL + "/listImages",
            { path, sort, max },
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );
          setPhotos(images.data);
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      dispatch({
        type: "PROFILE_ERROR",
        payload: error.response.data.message,
      });
    }
  };

  useEffect(() => {
    getProfile();
  }, [userName]);

  useEffect(() => {
    setOtherName(profile?.details?.otherName);
  }, [profile]);

  var visitor = userName === user.username ? false : true; // check if the visitor is the owner of the profile

  const profileTop = useRef(null);
  const [height, setHeight] = useState();

  const leftSide = useRef(null);
  const [leftHeight, setLeftHeight] = useState();
  const [scrollHeight, setScrollHeight] = useState();

  useEffect(() => {
    setHeight(profileTop.current.clientHeight + 300);
    setLeftHeight(leftSide.current.clientHeight);
    window.addEventListener("scroll", getScrollHeight, { passive: true });
    return () => {
      window.addEventListener("scroll", getScrollHeight, { passive: true });
    };
  }, [loading, scrollHeight]);

  // when the profile page has two columns check is true
  const check = useMediaQuery({
    query: "(min-width: 901px)",
  });
  const getScrollHeight = () => {
    setScrollHeight(window.pageYOffset);
  };

  return (
    <div className="profile">
      {visible && (
        <CreatePostPopup
          user={user}
          setVisible={setVisible}
          posts={profile?.post}
          dispatch={dispatch}
          profile
        />
      )}
      <Header page="profile" getAllPosts={getAllPosts} />
      <div className="profile_top" ref={profileTop}>
        <div className="profile_container">
          {loading ? (
            <>
              <div className="profile_cover">
                <Skeleton
                  height="347px"
                  containerClassName="avatar-skeleton"
                  style={{ borderRadius: "8px" }}
                />
              </div>
              <div
                className="profile_img_wrap"
                style={{
                  marginBottom: "-3rem",
                  transform: "translateY(-8px)",
                }}
              >
                <div className="profile_w_left">
                  <Skeleton
                    height="180px"
                    width="180px"
                    circle
                    containerClassName="avatar-skeleton"
                    style={{ transform: "translateY(-3.3rem)" }}
                  />
                  <div className="profile_w_col">
                    <div className="profile_name">
                      <Skeleton
                        height="35px"
                        width="200px"
                        containerClassName="avatar-skeleton"
                      />
                      <Skeleton
                        height="30px"
                        width="100px"
                        containerClassName="avatar-skeleton"
                        style={{ transform: "translateY(2.5px)" }}
                      />
                    </div>
                    <div className="profile_friend_count">
                      <Skeleton
                        height="29px"
                        width="90px"
                        containerClassName="avatar-skeleton"
                        style={{ marginTop: "5px" }}
                      />
                    </div>
                    <div className="profile_friend_imgs">
                      {Array.from(new Array(6), (val, i) => i + 1).map(
                        (id, i) => (
                          <Skeleton
                            key={i}
                            height="32px"
                            width="32px"
                            circle
                            containerClassName="avatar-skeleton"
                            style={{ transform: `translateX(${-i * 7}px)` }}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div className={`friendship ${!visitor && "fix"}`}>
                  <Skeleton
                    height="36px"
                    width="120px"
                    containerClassName="avatar-skeleton"
                  />
                  <div className="flex">
                    <Skeleton
                      height="36px"
                      width="120px"
                      containerClassName="avatar-skeleton"
                    />
                    {visitor && (
                      <Skeleton
                        height="36px"
                        width="120px"
                        containerClassName="avatar-skeleton"
                      />
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Cover
                profile={profile}
                visitor={visitor}
                photos={photos.resources}
              />
              <ProfilePicInfos
                profile={profile}
                visitor={visitor}
                photos={photos.resources}
                otherName={otherName}
              />
            </>
          )}
          <ProfileMenu />
        </div>
      </div>
      <div className="profile_bottom">
        <div className="profile_container">
          <div className="bottom_container">
            <PeopleYouMayKnow />
            <div
              // if the left column is more info then stick on the bottom,
              // otherwise stick it on the top.
              className={`profile_grid ${
                check && scrollHeight >= height && leftHeight > 800
                  ? "scrollFixed showLess"
                  : check &&
                    scrollHeight >= height &&
                    leftHeight < 800 &&
                    "scrollFixed showMore"
              }`}
            >
              <div className="profile_left" ref={leftSide}>
                {loading ? (
                  <>
                    <div className="profile_card">
                      <div className="profile_card_header">Intro</div>
                      <div className="skeleton_loader">
                        <HashLoader color="#1876f2" />
                      </div>
                    </div>
                    <div className="profile_card">
                      <div className="profile_card_header">
                        Photos
                        <div className="profile_header_link">
                          See All Photos
                        </div>
                      </div>
                      <div className="skeleton_loader">
                        <HashLoader color="#1876f2" />
                      </div>
                    </div>
                    <div className="profile_card">
                      <div className="profile_card_header">
                        Friends
                        <div className="profile_header_link">
                          See All Friends
                        </div>
                      </div>
                      <div className="skeleton_loader">
                        <HashLoader color="#1876f2" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Intro
                      detailss={profile.details}
                      visitor={visitor}
                      user={user}
                      setOtherName={setOtherName}
                    />
                    <Photos
                      username={userName}
                      token={user.token}
                      photos={photos}
                      setPhotos={setPhotos}
                    />
                    <Friends friends={profile.friends} />
                  </>
                )}
                <div className="relative_fb_copyright">
                  <Link to="/">Privacy </Link>
                  <span>. </span>
                  <Link to="/">Terms </Link>
                  <span>. </span>
                  <Link to="/">Advertising </Link>
                  <span>. </span>
                  <Link to="/">
                    Ad Choices<i className="ad_choices_icon"></i>
                  </Link>
                  <span>. </span>
                  <Link to="/">Cookies </Link>
                  <span>. </span>
                  <Link to="/">More </Link>
                  <span>. </span>
                  <br />
                  Meta © 2022
                </div>
              </div>
              <div className="profile_right">
                {!visitor && (
                  <CreatePost user={user} setVisible={setVisible} profile />
                )}
                <GridPosts profile />
                {loading ? (
                  <div className="skeleton_loader">
                    <HashLoader color="#1876f2" />
                  </div>
                ) : (
                  <div className="posts">
                    {profile.post && profile.post.length ? (
                      profile.post.map((item) => (
                        <Post key={item._id} post={item} user={user} profile />
                      ))
                    ) : (
                      <div className="no_posts">No posts available</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
