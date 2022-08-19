export default function Bio({
  info,
  handleChange,
  max,
  setShowBio,
  updateDetails,
  placeholder,
  name,
  detail,
  setShow,
  rel,
}) {
  return (
    <div className="add_bio_wrap">
      {rel ? (
        <select
          className="select_rel"
          name={name}
          value={info.relationship}
          onChange={handleChange}
        >
          <option value="Single">Single</option>
          <option value="In a relationship">In a relationship</option>
          <option value="Married">Married</option>
          <option value="Divorced">Divorced</option>
        </select>
      ) : (
        <textarea
          placeholder={placeholder}
          name={name}
          value={info?.[name]}
          maxLength={detail ? "25" : "100"}
          className="textarea_blue details_input"
          onChange={handleChange}
        ></textarea>
      )}
      {!detail && <div className="remaining">{max} characters remaining</div>}
      <div className="flex">
        <div className="flex flex_left">
          <img src="../../../icons/public.png" />
          Public
        </div>
        <div className="flex flex_right">
          <button
            className="gray_btn"
            onClick={() => {
              !detail ? setShowBio(false) : setShow(false);
            }}
          >
            Cancel
          </button>
          <button
            className="blue_btn"
            onClick={() => {
              updateDetails();
              if (detail) setShow(false);
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
