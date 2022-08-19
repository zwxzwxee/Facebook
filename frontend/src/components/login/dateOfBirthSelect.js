import { useMediaQuery } from "react-responsive";
export default function DateOfBirthSelect({
  bDay,
  bMonth,
  bYear,
  dateError,
  years,
  months,
  days,
  handleRegisterChange,
}) {
  const view1 = useMediaQuery({
    query: "(min-width: 539px)",
  });
  const view2 = useMediaQuery({
    query: "(min-width: 850px)",
  });
  const view3 = useMediaQuery({
    query: "(min-width: 1170px)",
  });
  return (
    <div
      className="regi_grid"
      style={{
        marginBottom: `${dateError && !view3 ? "90px" : "0"}`,
      }}
    >
      <select name="bDay" value={bDay} onChange={handleRegisterChange}>
        {days.map((d, index) => (
          <option value={d} key={index}>
            {d}
          </option>
        ))}
      </select>
      <select name="bMonth" value={bMonth} onChange={handleRegisterChange}>
        {months.map((m, index) => (
          <option value={m} key={index}>
            {m}
          </option>
        ))}
      </select>
      <select name="bYear" value={bYear} onChange={handleRegisterChange}>
        {years.map((y, index) => (
          <option value={y} key={index}>
            {y}
          </option>
        ))}
      </select>
      {dateError && (
        <div
          className={
            !view3 ? "input_error" : "input_error input_error_select_large"
          }
        >
          <div
            className={!view3 ? "error_arrow_bottom" : "error_arrow_left"}
          ></div>
          {dateError}
        </div>
      )}
    </div>
  );
}
