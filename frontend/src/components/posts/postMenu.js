import { useRef, useState } from "react";
import MenuItem from "./menuItem";
import useClickOutside from "../../helpers/clickOutside";
import { deletePost, savePost } from "../../functions/post";
import { saveAs } from "file-saver";

export default function PostMenu({
  userId,
  postUserId,
  imgLength,
  setShowMenu,
  postId,
  token,
  checkSaved,
  setCheckSaved,
  imgs,
  postRef,
}) {
  // when the user is the owner of the post the test will be true
  const [test, setTest] = useState(userId === postUserId ? true : false);
  const menu = useRef(null);
  useClickOutside(menu, () => {
    setShowMenu(false);
  });

  const saveHandler = async () => {
    savePost(postId, token);
    setCheckSaved((prev) => !prev);
  };

  const downloadImgs = async () => {
    imgs.map((img) => {
      saveAs(img.url, "image.jpg");
    });
  };

  const deleteHandler = async () => {
    const res = await deletePost(postId, token);
    if (res.status === "ok") {
      postRef.current.style.display = "none";
    }
  };

  return (
    <ul className="post_menu" ref={menu}>
      {test && <MenuItem icon="pin_icon" title="Pin Post" />}
      <div onClick={() => saveHandler()}>
        {checkSaved ? (
          <MenuItem
            icon="save_icon"
            title="Unsave Post"
            subtitle="Remove this from your saved items."
          />
        ) : (
          <MenuItem
            icon="save_icon"
            title="Save Post"
            subtitle="Add this to your saved items."
          />
        )}
      </div>

      <div className="line"></div>
      {test && <MenuItem icon="edit_icon" title="Edit Post" />}
      {!test && (
        <MenuItem
          icon="turnOnNotification_icon"
          title="Turn on notifications for this post"
        />
      )}
      {/* only when the post has images we can show the download and full screen operations */}
      {imgLength && (
        <div onClick={() => downloadImgs()}>
          <MenuItem icon="download_icon" title="Download" />
        </div>
      )}
      {imgLength && (
        <MenuItem icon="fullscreen_icon" title="Enter Fullscreen" />
      )}
      {test && <MenuItem title="Edit Audience" img="../../../icons/lock.png" />}
      {test && (
        <MenuItem
          icon="turnOffNotifications_icon"
          title="Turn off notifications for this post"
        />
      )}
      {test && <MenuItem icon="delete_icon" title="Turn off translations" />}
      {test && <MenuItem icon="date_icon" title="Edit Date" />}
      {test && (
        <MenuItem icon="refresh_icon" title="Refresh share attachment" />
      )}
      {test && <MenuItem icon="archive_icon" title="Move to archive" />}
      {test && (
        <div onClick={() => deleteHandler()}>
          <MenuItem
            icon="trash_icon"
            title="Move to trash"
            subtitle="Items in trash are deleted after 30 days"
          />
        </div>
      )}
      {!test && <div className="line"></div>}
      {!test && (
        <MenuItem
          img="../../../icons/report.png"
          title="Report Post"
          subtitle="I'm concerned about this post"
        />
      )}
    </ul>
  );
}
