import './App.css';
import React, { useState, useEffect } from 'react';
import './App.css';

const CountryDropdown = ({ onSelect }) => {
  const [countries, setCountries] = useState([]);
  useEffect(() => {
    fetch(`http://worldtimeapi.org/api/timezone`)
      .then(response => response.json())
      .then(data => setCountries(data));
  }, []);

  return (
    <select onChange={(e) => onSelect(e.target.value)}>
      <option value="" >Select a country</option>
      {countries.map((country, index) => (
        <option key={index} value={country}>
          {country}
        </option>
      ))}
    </select>
  );
};

const handleCountrySelect = (selectedCountry) => {
  console.log(`Selected country: ${selectedCountry}`);
};

const Timer = ({ handleCountrySelect }) => {
  const [time, setTime] = useState(new Date());
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
    let interval;
    const fetchTime = async () => {
      try {
        const response = await fetch(`http://worldtimeapi.org/api/timezone/America/Argentina/Salta`);
        const data = await response.json();
        setTime(new Date(data.utc_datetime));
      } catch (error) {
        console.error('Error fetching time:', error);
      }
    };
    const startClock = () => {
      interval = setInterval(fetchTime,1000)
    };
    startClock();
    return () => clearInterval(interval);
  }, [handleCountrySelect]);

  const togglePause = () => {
    setIsPaused(prevState => !prevState);
  };

  return (
    <div className="clock">
      <div className="time">
        {
         time.toLocaleTimeString()
        }
      </div>
      <button onClick={togglePause}>{isPaused ? 'Start' : 'Pause'}</button>
    </div>
  );
};

const UserCard = ({ user, onClick }) => (
  <div className="user-card" onClick={() => onClick(user.id)}>
    <div className="user-name">{user.name}</div>
    <div className="post-count">{user.posts.length} posts</div>
  </div>
);

const UserProfile = ({ user, onBack }) => (

  <div className="user-profile">
    <div className='btn-section'>
    <button onClick={onBack}>Back</button>
    <div className="dropdown-container">
    <CountryDropdown onSelect={handleCountrySelect} />
    </div>
    <div className="user-clock">
      <Timer onSelect={handleCountrySelect} />
    </div> 
   </div>

    <div className="user-address">
      <div>
        <h3>Name</h3>
        <p>{user.name}</p>
        <h3>Username</h3>
        <p>{user.username}</p>
        <h3>Catch Phrase</h3>
        <p>{user.company.catchPhrase}</p>
      </div>
      <div>
        <h3>Address</h3>
        <p>{user.address.city}, {user.address.street}</p>
        <h3>Email</h3>
        <p>{user.email}</p>
        <h3>Phone</h3>
        <p>{user.phone}</p>
      </div>
    </div>
    <div className="user-posts">
      {user.posts.map(post => (
        <div key={post.id} className="post">
          <h3>{post.title}</h3>
          <p>{post.body}</p>
        </div>
      ))}
    </div>
  </div>
);


const App = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(response => response.json())
      .then(users => {
        setUsers(users.map(user => ({
          ...user,
          posts: [],
        })));
        Promise.all(users.map(user => fetchUserPosts(user.id)));
      });
  }, []);

  const fetchUserPosts = userId => {
    fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`)
      .then(response => response.json())
      .then(posts => {
        setUsers(prevUsers => {
          const updatedUsers = [...prevUsers];
          const userIndex = updatedUsers.findIndex(user => user.id === userId);
          if (userIndex !== -1) {
            updatedUsers[userIndex].posts = posts.slice(0, 3);
          }
          return updatedUsers;
        });
      });
  };

  const selectUser = userId => {
    setSelectedUser(users.find(user => user.id === userId));
  };

  const goBack = () => {
    setSelectedUser(null);
  };
  
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
      <h1>Directory</h1>
      </div>

      <div className="app">
      {!selectedUser && users.map(user => (
        <UserCard key={user.id} user={user} onClick={selectUser} />
      ))}
      {selectedUser && <UserProfile user={selectedUser} onBack={goBack} />}
    </div>
  </>
  );
};
export default App;