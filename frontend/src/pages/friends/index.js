import { useEffect, useReducer } from "react";
import { useSelector } from "react-redux";
import Header from "../../components/header";
import { getFriendsPageInfos } from "../../functions/user";
import "./style.css";
import { friendsPage } from "../../functions/reducers";
import Card from "./card";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Friends() {
  const { type } = useParams();
  const [{ loading, error, data }, dispatch] = useReducer(friendsPage, {
    loading: false,
    error: "",
    data: {},
  });
  const { user } = useSelector((state) => ({ ...state }));
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    dispatch({
      type: "FRIENDS_REQUEST",
    });
    const data = await getFriendsPageInfos(user.token);
    if (data.status === "ok") {
      dispatch({
        type: "FRIENDS_SUCCESS",
        payload: data.data,
      });
    } else {
      dispatch({
        type: "FRIENDS_ERROR",
        payload: data.data,
      });
    }
  };

  return (
    <>
      <Header page="friends" />
      <div className="friends">
        <div className="friends_left">
          <div className="friends_left_header">
            <h3>Friends</h3>
            <div className="small_circle">
              <i className="settings_filled_icon"></i>
            </div>
          </div>
          <div className="friends_left_wrap">
            <Link
              to="/friends"
              className={`mmenu_item hover3 ${
                type === undefined && "active_friends"
              }`}
            >
              <div className="small_circle">
                <i
                  className={`friends_home_icon ${
                    type === undefined && "invert"
                  }`}
                ></i>
              </div>
              <span>Home</span>
              <div className="rArrow">
                <i className="right_icon"></i>
              </div>
            </Link>
            <Link
              to="/friends/requests"
              className={`mmenu_item hover3 ${
                type === "requests" && "active_friends"
              }`}
            >
              <div className="small_circle">
                <i
                  className={`friends_requests_icon ${
                    type === "requests" && "invert"
                  }`}
                ></i>
              </div>
              <span>Friends Requests</span>
              <div className="rArrow">
                <i className="right_icon"></i>
              </div>
            </Link>
            <Link
              to="/friends/sent"
              className={`mmenu_item hover3 ${
                type === "sent" && "active_friends"
              }`}
            >
              <div className="small_circle">
                <i
                  className={`friends_requests_icon ${
                    type === "sent" && "invert"
                  }`}
                ></i>
              </div>
              <span>Sent Requests</span>
              <div className="rArrow">
                <i className="right_icon"></i>
              </div>
            </Link>
            <Link to="/friends/" className="mmenu_item hover3">
              <div className="small_circle">
                <i className="friends_suggestions_icon"></i>
              </div>
              <span>Suggestions</span>
              <div className="rArrow">
                <i className="right_icon"></i>
              </div>
            </Link>
            <Link
              to="/friends/all"
              className={`mmenu_item hover3 ${
                type === "all" && "active_friends"
              }`}
            >
              <div className="small_circle">
                <i
                  className={`all_friends_icon ${type === "all" && "invert"}`}
                ></i>
              </div>
              <span>All Friends</span>
              <div className="rArrow">
                <i className="right_icon"></i>
              </div>
            </Link>
            <Link to="/friends/" className="mmenu_item hover3">
              <div className="small_circle">
                <i className="birthdays_icon"></i>
              </div>
              <span>Birthdays</span>
              <div className="rArrow">
                <i className="right_icon"></i>
              </div>
            </Link>
            <Link to="/friends/" className="mmenu_item hover3">
              <div className="small_circle">
                <i className="all_friends_icon"></i>
              </div>
              <span>Custom Lists</span>
              <div className="rArrow">
                <i className="right_icon"></i>
              </div>
            </Link>
          </div>
        </div>
        <div className="friends_right">
          {(type === undefined || type === "requests") && (
            <div className="friends_right_wrap">
              <div className="friends_left_header">
                <h3>Friends Requests</h3>
                {type === undefined && (
                  <Link to="/friends/requests" className="see_link hover3">
                    See all
                  </Link>
                )}
              </div>
              <div className="flex_wrap">
                {data.requests &&
                  data.requests.map((user, i) => (
                    <Card
                      key={i}
                      userr={user}
                      type="request"
                      getData={getData}
                    />
                  ))}
              </div>
            </div>
          )}
          {(type === undefined || type === "sent") && (
            <div className="friends_right_wrap">
              <div className="friends_left_header">
                <h3>Sent Requests</h3>
                {type === undefined && (
                  <Link to="/friends/sent" className="see_link hover3">
                    See all
                  </Link>
                )}
              </div>
              <div className="flex_wrap">
                {data.sentRequests &&
                  data.sentRequests.map((user, i) => (
                    <Card
                      key={i}
                      userr={user}
                      type="sentRequest"
                      getData={getData}
                    />
                  ))}
              </div>
            </div>
          )}
          {(type === undefined || type === "all") && (
            <div className="friends_right_wrap">
              <div className="friends_left_header">
                <h3>Friends</h3>
                {type === undefined && (
                  <Link to="/friends/all" className="see_link hover3">
                    See all
                  </Link>
                )}
              </div>
              <div className="flex_wrap">
                {data.friends &&
                  data.friends.map((user, i) => (
                    <Card
                      key={i}
                      userr={user}
                      type="friends"
                      getData={getData}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
