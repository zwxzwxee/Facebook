import { useRef } from "react";
import Detail from "./detail";
import useClickOutside from "../../helpers/clickOutside";

export default function EditDetails({
  details,
  handleChange,
  updateDetails,
  info,
  setVisible,
}) {
  const detailRef = useRef(null);
  useClickOutside(detailRef, () => {
    setVisible(false);
  });
  return (
    <div className="blur">
      <div className="postBox infosBox" ref={detailRef}>
        <div className="box_header">
          <div className="small_circle" onClick={() => setVisible(false)}>
            <i className="exit_icon"></i>
          </div>
          <span>Edit Details</span>
        </div>
        <div className="details_wrapper scrollbar">
          <div className="details_col">
            <span>Customize Your Intro</span>
            <span>Details you select will be public</span>
          </div>
          <div className="details_header">Other Name</div>
          <Detail
            text="other name"
            value={details?.otherName}
            img="studies"
            placeholder="Add other name"
            name="otherName"
            handleChange={handleChange}
            updateDetails={updateDetails}
            info={info}
          />
          <div className="details_header">Work</div>
          <Detail
            text="a job"
            value={details?.job}
            img="job"
            placeholder="Add job title"
            name="job"
            handleChange={handleChange}
            updateDetails={updateDetails}
            info={info}
          />
          <Detail
            text="a workplace"
            value={details?.workplace}
            img="job"
            placeholder="Add a workplace"
            name="workplace"
            handleChange={handleChange}
            updateDetails={updateDetails}
            info={info}
          />
          <div className="details_header">Education</div>
          <Detail
            text="a high school"
            value={details?.highSchool}
            img="studies"
            placeholder="Add a high school"
            name="highSchool"
            handleChange={handleChange}
            updateDetails={updateDetails}
            info={info}
          />
          <Detail
            text="a college"
            value={details?.college}
            img="studies"
            placeholder="Add a college"
            name="college"
            handleChange={handleChange}
            updateDetails={updateDetails}
            info={info}
          />
          <div className="details_header">Current City</div>
          <Detail
            text="a current city"
            value={details?.currentCity}
            img="home"
            placeholder="Add a current city"
            name="currentCity"
            handleChange={handleChange}
            updateDetails={updateDetails}
            info={info}
          />
          <div className="details_header">Hometown</div>
          <Detail
            text="hometown"
            value={details?.hometown}
            img="home"
            placeholder="Add hometown"
            name="hometown"
            handleChange={handleChange}
            updateDetails={updateDetails}
            info={info}
          />
          <div className="details_header">Relationship</div>
          <Detail
            text="relationship"
            value={details?.relationship}
            img="relationship"
            placeholder="Add hometown"
            name="relationship"
            handleChange={handleChange}
            updateDetails={updateDetails}
            info={info}
            rel
          />
          <div className="details_header">Instagram</div>
          <Detail
            text="instagram"
            value={details?.instagram}
            img="instagram"
            placeholder="Add instagram"
            name="instagram"
            handleChange={handleChange}
            updateDetails={updateDetails}
            info={info}
          />
        </div>
      </div>
    </div>
  );
}
