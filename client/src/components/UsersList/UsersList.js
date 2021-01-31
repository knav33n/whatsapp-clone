import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import "./UsersList.scss";

const UsersList = () => {
  const { user, users } = useContext(AppContext);

  if (!user) return null;

  return (
    <aside className="user-list">
      <p>{`${user.name}'s Contacts`}</p>
      {users.length > 0 &&
        users
          .filter((u) => u.id !== user.id)
          .map((u) => (
            <Link to={`/user/${u.id}`} key={u.id}>
              <div className="user">
                <img src="https://picsum.photos/200" />
                <div className="user__conv">
                  <span>{u.name}</span>
                </div>
              </div>
            </Link>
          ))}
    </aside>
  );
};

export default UsersList;
