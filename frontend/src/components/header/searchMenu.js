import { useEffect, useRef, useState } from "react";
import { Return, Search } from "../../svg";
import useClickOutside from "../../helpers/clickOutside";
import {
  search,
  addToSearchHistory,
  getSearchHistory,
  removeFromSearch,
} from "../../functions/user";
import { Link } from "react-router-dom";

export default function SearchMenu({ color, setShowSearchMenu, token }) {
  const [iconVisible, setIconVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [result, setResult] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const menu = useRef(null);
  const input = useRef(null);
  useClickOutside(menu, () => {
    setShowSearchMenu(false);
  });
  useEffect(() => {
    input.current.focus();
  }, []);
  //   after loading the searchMenu, the input will get auto-focused.

  const getHistory = async () => {
    const res = await getSearchHistory(token);
    setSearchHistory(res);
  };

  //   after loading the searchMenu, the searchHistory will get loaded.
  useEffect(() => {
    getHistory();
  }, []);

  const searchHandler = async () => {
    if (searchTerm === "") {
      setResult("");
    } else {
      const res = await search(searchTerm, token);
      setResult(res);
    }
  };

  const addToSearchHistoryHandler = async (id) => {
    addToSearchHistory(id, token);
    getHistory();
  };

  const removeHistoryHandler = async (searchUser) => {
    removeFromSearch(searchUser, token);
    getHistory();
  };
  console.log(searchHistory);

  return (
    <div className="header_left search_area scrollbar" ref={menu}>
      <div className="search_wrap">
        <div className="header_logo">
          <div
            className="circle hover1"
            onClick={() => setShowSearchMenu(false)}
          >
            <Return color={color} />
          </div>
        </div>
        <div className="search" onClick={() => input.current.focus()}>
          {/* when click the search bar will invoke the focus function and change the corresponding styles */}
          {iconVisible && (
            <div>
              <Search color={color} />
            </div>
          )}
          <input
            placeholder="Search Facebook"
            type="text"
            ref={input}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyUp={() => searchHandler()}
            onFocus={() => setIconVisible(false)}
            onBlur={() => setIconVisible(true)}
          ></input>
        </div>
      </div>
      {result == "" && (
        <div className="search_history_header">
          <span>Recent searches</span>
          <a>Edit</a>
        </div>
      )}
      <div className="search_history scrollbar">
        {searchHistory &&
          result == "" &&
          searchHistory
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((res, i) => (
              <div className="search_user_item hover1" key={i}>
                <Link
                  className="flex"
                  to={`/profile/${res.user.username}`}
                  onClick={() => addToSearchHistoryHandler(res.user._id)}
                >
                  <img src={res.user.picture} alt="" />
                  <span>
                    {res.user.first_name} {res.user.last_name}
                  </span>
                </Link>
                <i
                  className="exit_icon"
                  onClick={() => removeHistoryHandler(res.user._id)}
                ></i>
              </div>
            ))}
      </div>
      <div className="search_results scrollbar">
        {result &&
          result.map((res, i) => (
            <Link
              to={`/profile/${res.username}`}
              key={i}
              className="search_user_item hover1"
              onClick={() => addToSearchHistoryHandler(res._id)}
            >
              <img src={res.picture} alt="" />
              <span>
                {res.first_name} {res.last_name}
              </span>
            </Link>
          ))}
      </div>
    </div>
  );
}
