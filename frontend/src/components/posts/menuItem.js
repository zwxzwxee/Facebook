export default function MenuItem({ icon, title, subtitle, img }) {
  return (
    <li className="hover1">
      {img ? <img src={img} alt="" /> : <i className={icon}></i>}

      <div className="post_menu_text">
        <span>{title}</span>
        {subtitle && <span className="post_menu_col">{subtitle}</span>}
      </div>
    </li>
  );
}
