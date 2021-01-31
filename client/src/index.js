import faker from "faker";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import "reset-css";
import Messenger from "./components/Messenger/Messenger";
import UsersList from "./components/UsersList/UsersList";
import { AppContext } from "./context/AppContext";
import "./index.scss";
import io from "socket.io-client";

let socket = null;

const App = () => {
  if (!socket) {
    socket = io(`http://localhost:4650/join`, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });
  }

  const [loggedInUser, setLoggedInUser] = useState();
  const [usersOnline, setUsersOnline] = useState([]);

  const handleUserCreation = () => {
    if (!localStorage.getItem("username")) {
      let tempName = faker.name.findName();
      let tempId = faker.random.uuid();
      localStorage.setItem("username", tempName);
      localStorage.setItem("id", tempId);
      setLoggedInUser({
        name: tempName,
        id: tempId,
      });
      socket.emit("userjoin", { name: tempName, id: tempId });
    } else {
      setLoggedInUser({
        name: localStorage.getItem("username"),
        id: localStorage.getItem("id"),
      });
      socket.emit("userjoin", {
        name: localStorage.getItem("username"),
        id: localStorage.getItem("id"),
      });
    }
  };

  const handleNewUsers = () => {
    if (socket) {
      socket.on("new-user-joined", (users) => {
        console.log(users);
        setUsersOnline((oldUsers) => users);
      });
    }
  };

  useEffect(() => {
    handleUserCreation();
    handleNewUsers();

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  return (
    <AppContext.Provider value={{ user: loggedInUser, users: usersOnline }}>
      {window.innerWidth < 769 && (
        <Router>
          <section className="app">
            <Switch>
              <Route path="/user/:userId">
                <Messenger />
              </Route>
              <Route path="/">
                <UsersList />
              </Route>
            </Switch>
          </section>
        </Router>
      )}
      {window.innerWidth > 768 && (
        <Router>
          <section className="app">
            <UsersList />
            <Switch>
              <Route path="/user/:userId">
                <Messenger />
              </Route>
              <Route path="/">
                <></>
              </Route>
            </Switch>
          </section>
        </Router>
      )}
    </AppContext.Provider>
  );
};

ReactDOM.render(<App />, document.getElementById("react-client"));
