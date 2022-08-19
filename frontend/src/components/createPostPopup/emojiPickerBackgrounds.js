import Picker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";

export default function EmojiPickerBackgrounds({
  text,
  setText,
  user,
  type2,
  background,
  setBackground,
}) {
  const [picker, setPicker] = useState(false);
  const [cursorPosition, setCursorPostion] = useState();
  const [showBackgrounds, setShowBackgrounds] = useState(false);
  const textRef = useRef(null);
  const bgRef = useRef(null);
  const postBackgrounds = [
    "../../../images/postBackgrounds/1.jpg",
    "../../../images/postBackgrounds/2.jpg",
    "../../../images/postBackgrounds/3.jpg",
    "../../../images/postBackgrounds/4.jpg",
    "../../../images/postBackgrounds/5.jpg",
    "../../../images/postBackgrounds/6.jpg",
    "../../../images/postBackgrounds/7.jpg",
    "../../../images/postBackgrounds/8.jpg",
    "../../../images/postBackgrounds/9.jpg",
  ];
  const backgroundHandler = (i) => {
    bgRef.current.style.backgroundImage = `url(${postBackgrounds[i]})`;
    setBackground(postBackgrounds[i]);
    bgRef.current.classList.add("bgHandler");
  };
  const removeBackground = () => {
    bgRef.current.style.backgroundImage = "";
    setBackground("");
    bgRef.current.classList.remove("bgHandler");
  };

  useEffect(() => {
    textRef.current.selectionEnd = cursorPosition;
  }, [cursorPosition]);
  // when the cursorPosition changes, the above function will executed and change the cursor position.
  const handleEmoji = (e, { emoji }) => {
    const ref = textRef.current;
    ref.focus();
    const start = text.substring(0, ref.selectionStart);
    const end = text.substring(ref.selectionStart);
    const newText = start + emoji + end;
    setText(newText);
    setCursorPostion(start.length + emoji.length);
  };
  const sm = useMediaQuery({
    query: "(max-width: 550px)",
  });
  return (
    <div className={type2 ? "img_input" : ""}>
      <div className={!type2 ? "flex_center" : ""} ref={bgRef}>
        <textarea
          maxLength="250"
          value={text}
          ref={textRef}
          placeholder={`What's on your mind, ${user.first_name}`}
          className={`post_input ${type2 ? "input2" : ""} ${
            sm && !background && "l0"
          }`}
          onChange={(e) => setText(e.target.value)}
          style={{
            paddingTop: `${
              background
                ? Math.abs(textRef.current.value.length * 0.1 - 30)
                : "0"
            }%`,
          }}
        ></textarea>
      </div>
      <div className={!type2 ? "post_emojis_wrap" : ""}>
        {picker && (
          <div
            className={`comment_emoji_picker ${
              type2 ? "movepicker2" : "rlmove"
            }`}
          >
            <Picker onEmojiClick={handleEmoji} />
          </div>
        )}
        {!type2 && (
          <img
            src="../../../icons/colorful.png"
            alt=""
            onClick={() => setShowBackgrounds((prev) => !prev)}
          />
        )}
        {!type2 && showBackgrounds && (
          <div className="post_backgrounds">
            <div className="no_bg" onClick={() => removeBackground()}></div>
            {postBackgrounds.map((bg, i) => (
              <img
                src={bg}
                alt=""
                key={i}
                onClick={() => backgroundHandler(i)}
              />
            ))}
          </div>
        )}

        <i
          className={`emoji_icon_large ${type2 ? "moveleft" : ""}`}
          onClick={() => setPicker((prev) => !prev)}
        ></i>
      </div>
    </div>
  );
}
