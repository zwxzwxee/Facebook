import { Link } from "react-router-dom";
import "./style.css";
import Moment from "react-moment";
import { Dots, Public } from "../../svg";
import ReactsPopup from "./reactsPopup";
import { useEffect, useState, useRef } from "react";
import CreateComments from "./createComments";
import PostMenu from "./postMenu";
import { getReacts, reactPost } from "../../functions/post";
import Comment from "./comment";

export default function Post({ post, user, profile }) {
  const [visible, setVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [reacts, setReacts] = useState();
  const [check, setCheck] = useState("");
  const [total, setTotal] = useState(0);
  const [comments, setComments] = useState([]);
  const [checkSaved, setCheckSaved] = useState();
  const [count, setCount] = useState(1);
  const postRef = useRef(null);
  const showMore = () => {
    setCount((prev) => prev + 3);
  };

  const showLess = () => {
    setCount(1);
  };

  useEffect(() => {
    setComments(post?.comments);
  }, [post]);

  useEffect(() => {
    getPostReacts();
  }, [post]);

  const getPostReacts = async () => {
    const res = await getReacts(post._id, user.token);
    // return an object with attribute called reacts,
    // where stores the array of reacts of the post,
    // and the check stores the react of the user to the post
    setReacts(res.reacts);
    setCheck(res.check);
    setTotal(res.total);
    setCheckSaved(res.checkSaved);
  };

  const reactHandler = async (type) => {
    reactPost(post._id, type, user.token);
    if (check == type) {
      setCheck("");
      let index = reacts.findIndex((x) => x.react == type);
      if (index !== -1) {
        setReacts([...reacts, (reacts[index].count = --reacts[index].count)]);
        setTotal((prev) => prev - 1);
      }
    } else {
      let tmp = check;
      setCheck(type);
      let index1 = reacts.findIndex((x) => x.react == type);
      if (index1 !== -1) {
        setReacts([...reacts, (reacts[index1].count = ++reacts[index1].count)]);
        setTotal((prev) => prev + 1);
      }

      let index2 = reacts.findIndex((x) => x.react == tmp);
      if (index2 !== -1) {
        setReacts([...reacts, (reacts[index2].count = --reacts[index2].count)]);
        setTotal((prev) => prev - 1);
      }
    }
  };

  return (
    <div
      className="post"
      style={{ width: `${profile && "100%"}` }}
      ref={postRef}
    >
      <div className="post_header">
        <Link
          className="post_header_left"
          to={`/profile/${post.user.username}`}
        >
          <img src={post.user.picture} alt="" />
          <div className="header_col">
            <div className="post_profile_name">
              {post.user.first_name} {post.user.last_name}
              <div className="update_p">
                {post.type === "profilePicture" &&
                  `updated ${
                    post.user.gender === "male" ? "his" : "her"
                  } profile picture`}
                {post.type === "coverPicture" &&
                  `updated ${
                    post.user.gender === "male" ? "his" : "her"
                  } cover`}
              </div>
            </div>
            <div className="post_profile_privacy_date">
              {/* Moment will auto-show the how many days defore the post is posted and update the time every 30s */}
              <Moment fromNow interval={30}>
                {post.createdAt}
              </Moment>
              <div style={{ marginLeft: "5px", transform: "translateY(2px)" }}>
                <Public color="#828387" />
              </div>
            </div>
          </div>
        </Link>
        <div
          className="post_header_right hover1"
          onClick={() => setShowMenu((prev) => !prev)}
        >
          <Dots color="#828387" />
        </div>
      </div>
      {post.background ? (
        <div
          className="post_bg"
          style={{ backgroundImage: `url(${post.background})` }}
        >
          <div className="post_bg_text">{post.text}</div>
        </div>
      ) : post.type === null ? (
        <>
          <div className="post_text">{post.text}</div>
          {post.images && post.images.length && (
            <div
              className={
                post.images.length === 1
                  ? "grid_1"
                  : post.images.length === 2
                  ? "grid_2"
                  : post.images.length === 3
                  ? "grid_3"
                  : post.images.length === 4
                  ? "grid_4"
                  : post.images.length >= 5 && "grid_5"
              }
            >
              {post.images.slice(0, 5).map((img, i) => (
                <img src={img.url} key={i} alt="" className={`img-${i}`} />
              ))}
              {post.images.length > 5 && (
                <div className="more-pics-shadow">
                  +{post.images.length - 5}
                </div>
              )}
            </div>
          )}
        </>
      ) : post.type === "profilePicture" ? (
        <div className="post_profile_wrap">
          <div className="post_updated_bg">
            <img src={post.user.cover} alt="" />
          </div>
          <img
            className="post_updated_picture"
            src={post.images[0].url}
            alt=""
          />
        </div>
      ) : (
        <div className="post_cover_wrap">
          <img src={post.images[0].url} alt="" />
        </div>
      )}
      <div className="post_infos">
        <div className="reacts_count">
          <div className="reacts_count_imgs">
            {reacts &&
              reacts
                .sort((a, b) => {
                  return b.count - a.count;
                })
                .slice(0, 3)
                .map((react, i) =>
                  react.count > 0 ? (
                    <img
                      src={`../../../reacts/${react.react}.svg`}
                      alt=""
                      key={i}
                    />
                  ) : (
                    ""
                  )
                )}
          </div>
          <div className="reacts_count_num">{total > 0 ? total : ""}</div>
        </div>
        <div className="to_right">
          <div className="comments_count">
            {comments.length > 0 ? comments.length + " comments" : "No comment"}
          </div>
          <div className="share_count">1 share</div>
        </div>
      </div>
      <div className="post_actions">
        <ReactsPopup
          visible={visible}
          setVisible={setVisible}
          reactHandler={reactHandler}
        />
        <div
          className="post_action hover1"
          onMouseOver={() =>
            setTimeout(() => {
              setVisible(true);
            }, 500)
          }
          onMouseLeave={() =>
            setTimeout(() => {
              setVisible(false);
            }, 500)
          }
          onClick={() => {
            reactHandler(check ? check : "like");
          }}
        >
          {check ? (
            <img
              src={`../../../reacts/${check}.svg`}
              alt=""
              className="small_react"
              style={{ width: "20px" }}
            />
          ) : (
            <i className="like_icon"></i>
          )}
          <span
            style={{
              color: `${
                check === "like"
                  ? "#4267b2"
                  : check === "haha"
                  ? "#f7b125"
                  : check === "wow"
                  ? "#f7b125"
                  : check === "sad"
                  ? "#f7b125"
                  : check === "love"
                  ? "#f63459"
                  : check === "angry"
                  ? "#e4605a"
                  : ""
              }`,
            }}
          >
            {check ? check : "like"}
          </span>
        </div>
        <div className="post_action hover1">
          <i className="comment_icon"></i>
          <span>Comment</span>
        </div>
        <div className="post_action hover1">
          <i className="share_icon"></i>
          <span>Share</span>
        </div>
      </div>
      <div className="comments_wrap">
        <div className="comments_order"></div>
        <CreateComments
          user={user}
          postId={post._id}
          setCount={setCount}
          setComments={setComments}
        />
        {comments &&
          comments
            .sort((a, b) => {
              return new Date(b.commentAt) - new Date(a.commentAt);
            })
            .slice(0, count)
            .map((comment, i) => <Comment comment={comment} key={i} />)}
        {comments.length > 0 && count < comments.length ? (
          <div className="view_comments" onClick={() => showMore()}>
            View more comments
          </div>
        ) : comments.length > 0 &&
          count >= comments.length &&
          comments.length > 1 ? (
          <div className="view_comments" onClick={() => showLess()}>
            View less comments
          </div>
        ) : (
          ""
        )}
      </div>
      {showMenu && (
        <PostMenu
          userId={user.id}
          postUserId={post.user._id}
          imgLength={post?.images?.length}
          setShowMenu={setShowMenu}
          postId={post._id}
          token={user.token}
          checkSaved={checkSaved}
          setCheckSaved={setCheckSaved}
          imgs={post.images}
          postRef={postRef}
        />
      )}
    </div>
  );
}
