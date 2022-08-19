import axios from "axios";
import { useEffect, useReducer, useState } from "react";
import { useSelector } from "react-redux";
import { Routes, Route } from "react-router-dom";
import CreatePostPopup from "./components/createPostPopup";
import Home from "./pages/home";
import Activate from "./pages/home/activate";
import Login from "./pages/login";
import Profile from "./pages/profile";
import Reset from "./pages/reset";
import LoggedinRoutes from "./routes/loggedinRoutes";
import NotLoggedinRoutes from "./routes/notLoggedinRoutes";
import { reducer } from "./functions/reducers";
import Friends from "./pages/friends";

function App() {
  const [visible, setVisible] = useState(false);
  const { user, darkTheme } = useSelector((state) => ({ ...state }));
  // define a state and its reducer and its initial values
  const [{ loading, error, posts }, dispatch] = useReducer(reducer, {
    loading: false,
    posts: [],
    error: "",
  });
  const getAllPosts = async () => {
    try {
      dispatch({
        type: "POST_REQUEST",
      });
      const { data } = await axios.get(
        process.env.REACT_APP_BACKEND_URL + "/getAllPosts",
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      dispatch({
        type: "POST_SUCCESS",
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: "POST_ERROR",
        payload: error.response.data.message,
      });
    }
  };
  // after the page is loaded it will get executed
  useEffect(() => {
    getAllPosts();
  }, []);

  return (
    <div className={darkTheme ? "dark" : ""}>
      {visible && (
        <CreatePostPopup
          user={user}
          setVisible={setVisible}
          posts={posts}
          dispatch={dispatch}
        />
      )}
      <Routes>
        <Route element={<LoggedinRoutes />}>
          <Route
            path="/"
            element={
              <Home
                setVisible={setVisible}
                posts={posts}
                loading={loading}
                getAllPosts={getAllPosts}
              />
            }
            exact
          />
          <Route path="/activate/:token" element={<Activate />} exact />
          <Route
            path="/profile"
            element={
              <Profile setVisible={setVisible} getAllPosts={getAllPosts} />
            }
            exact
          />
          <Route
            path="/profile/:username"
            element={
              <Profile setVisible={setVisible} getAllPosts={getAllPosts} />
            }
            exact
          />
          <Route
            path="/friends"
            element={
              <Friends setVisible={setVisible} getAllPosts={getAllPosts} />
            }
            exact
          />
          <Route
            path="/friends/:type"
            element={
              <Friends setVisible={setVisible} getAllPosts={getAllPosts} />
            }
            exact
          />
        </Route>
        <Route element={<NotLoggedinRoutes />}>
          <Route path="/login" element={<Login />} exact />
        </Route>
        <Route path="/reset" element={<Reset />} exact />
      </Routes>
    </div>
  );
}

export default App;
