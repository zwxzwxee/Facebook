import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "./styles/icons/icons.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { legacy_createStore as createStore } from "redux";
import { Provider } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./reducers/index";
import "./styles/dark.css";

const store = createStore(rootReducer, composeWithDevTools());

ReactDOM.render(
  <Provider store={store}>
    {/* <button className="blue_btn open_signup btn"> HI</button> */}
    <Router>
      <App />
    </Router>
  </Provider>,
  document.getElementById("root")
);
