import { useState, useEffect, useCallback } from "react";
import auth from "../firebase.config";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

// Constants
const API_BASE_URL = "https://futsal-server.vercel.app/api";
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second initial delay
const ADMIN_EMAIL = "admin@ice.com";

// Data cache
const dataCache = {
  teams: null,
  matches: null,
  upcoming: null,
  points: null,
  semifinals: null,
  finals: null,
  lastUpdated: null
};

export default function App() {
  // Data states
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [points, setPoints] = useState([]);
  const [semifinals, setSemifinals] = useState([]);
  const [finals, setFinals] = useState([]);
  
  // UI states
  const [loadingStates, setLoadingStates] = useState({
    teams: true,
    matches: true,
    upcoming: true,
    points: true,
    semifinals: true,
    finals: true,
    auth: true
  });
  const [errors, setErrors] = useState({});
  const [forceRefresh, setForceRefresh] = useState(false);

  // Form states
  const [newTeam, setNewTeam] = useState({ name: "", group: "A" });
  const [newMatch, setNewMatch] = useState({ team1: "", team2: "", score: "", scorer: "", motm: "" });
  const [newUpcoming, setNewUpcoming] = useState({ team1: "", team2: "", date: "", time: "" });
  const [newPoint, setNewPoint] = useState({ team: "", played: 0, won: 0, lost: 0, draw: 0, points: 0, gd: 0, group: "A" });
  const [newSemi, setNewSemi] = useState({ team1: "", team2: "", score: "" });
  const [newFinal, setNewFinal] = useState({ team1: "", team2: "", score: "" });
  const [email, setEmail] = useState("admin@ice.com"); // Pre-filled for testing
  const [pass, setPass] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Check if all data is loaded
  const allDataLoaded = !Object.values(loadingStates).some(state => state);

  // Enhanced fetch function with retry logic and caching
  const fetchData = useCallback(async (endpoint, dataKey) => {
    let attempts = 0;
    let lastError = null;

    // Clear previous error
    setErrors(prev => ({ ...prev, [dataKey]: null }));

    // Check cache if not forcing refresh
    if (!forceRefresh && dataCache[dataKey] && dataCache.lastUpdated && 
        Date.now() - dataCache.lastUpdated < 300000) { // 5 minute cache
      return dataCache[dataKey];
    }

    while (attempts <= MAX_RETRIES) {
      try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Update cache
        dataCache[dataKey] = data;
        dataCache.lastUpdated = Date.now();
        
        return data;
      } catch (error) {
        lastError = error;
        attempts++;
        
        if (attempts <= MAX_RETRIES) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempts - 1)));
        }
      }
    }

    throw lastError || new Error(`Failed to fetch ${dataKey} after ${MAX_RETRIES} attempts`);
  }, [forceRefresh]);

  // Data fetching functions
  const fetchTeams = useCallback(async () => {
    try {
      const data = await fetchData('teams', 'teams');
      setTeams(data);
    } catch (error) {
      console.error("Teams fetch error:", error);
      setErrors(prev => ({ ...prev, teams: "Failed to load teams" }));
      setTeams([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, teams: false }));
    }
  }, [fetchData]);

  const fetchMatches = useCallback(async () => {
    try {
      const data = await fetchData('matches', 'matches');
      setMatches(data);
    } catch (error) {
      console.error("Matches fetch error:", error);
      setErrors(prev => ({ ...prev, matches: "Failed to load matches" }));
      setMatches([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, matches: false }));
    }
  }, [fetchData]);

  const fetchUpcoming = useCallback(async () => {
    try {
      const data = await fetchData('upcoming', 'upcoming');
      setUpcoming(data);
    } catch (error) {
      console.error("Upcoming fetch error:", error);
      setErrors(prev => ({ ...prev, upcoming: "Failed to load upcoming matches" }));
      setUpcoming([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, upcoming: false }));
    }
  }, [fetchData]);

  const fetchPoints = useCallback(async () => {
    try {
      const data = await fetchData('points', 'points');
      setPoints(data);
    } catch (error) {
      console.error("Points fetch error:", error);
      setErrors(prev => ({ ...prev, points: "Failed to load points table" }));
      setPoints([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, points: false }));
    }
  }, [fetchData]);

  const fetchSemifinals = useCallback(async () => {
    try {
      const data = await fetchData('semifinals', 'semifinals');
      setSemifinals(data);
    } catch (error) {
      console.error("Semifinals fetch error:", error);
      setErrors(prev => ({ ...prev, semifinals: "Failed to load semifinals" }));
      setSemifinals([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, semifinals: false }));
    }
  }, [fetchData]);

  const fetchFinals = useCallback(async () => {
    try {
      const data = await fetchData('finals', 'finals');
      setFinals(data);
    } catch (error) {
      console.error("Finals fetch error:", error);
      setErrors(prev => ({ ...prev, finals: "Failed to load finals" }));
      setFinals([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, finals: false }));
    }
  }, [fetchData]);

  // Load all data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingStates(prev => ({ ...prev, auth: false }));
    });

    const loadAllData = async () => {
      try {
        setLoadingStates({
          teams: true,
          matches: true,
          upcoming: true,
          points: true,
          semifinals: true,
          finals: true,
          auth: loadingStates.auth
        });

        await Promise.all([
          fetchTeams(),
          fetchMatches(),
          fetchUpcoming(),
          fetchPoints(),
          fetchSemifinals(),
          fetchFinals()
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setForceRefresh(false);
      }
    };

    loadAllData();

    return () => unsubscribe();
  }, [fetchTeams, fetchMatches, fetchUpcoming, fetchPoints, fetchSemifinals, fetchFinals, forceRefresh]);

  // CRUD Operations
  const addTeam = async () => {
    try {
      await fetch(`${API_BASE_URL}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTeam),
      });
      setNewTeam({ name: "", group: "A" });
      // Invalidate cache and refresh
      dataCache.teams = null;
      fetchTeams();
    } catch (error) {
      console.error("Error adding team:", error);
      alert("Failed to add team");
    }
  };

  const deleteData = async (endpoint, id) => {
    try {
      await fetch(`${API_BASE_URL}/${endpoint}/${id}`, { method: "DELETE" });
      // Invalidate cache and refresh the specific data
      dataCache[endpoint] = null;
      switch(endpoint) {
        case 'teams': fetchTeams(); break;
        case 'matches': fetchMatches(); break;
        case 'upcoming': fetchUpcoming(); break;
        case 'points': fetchPoints(); break;
        case 'semifinals': fetchSemifinals(); break;
        case 'finals': fetchFinals(); break;
      }
    } catch (error) {
      console.error(`Error deleting ${endpoint}:`, error);
      alert(`Failed to delete ${endpoint}`);
    }
  };

  const addMatch = async () => {
    try {
      await fetch(`${API_BASE_URL}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMatch),
      });
      setNewMatch({ team1: "", team2: "", score: "", scorer: "", motm: "" });
      // Invalidate cache and refresh
      dataCache.matches = null;
      fetchMatches();
    } catch (error) {
      console.error("Error adding match:", error);
      alert("Failed to add match");
    }
  };

  const addUpcoming = async () => {
    try {
      await fetch(`${API_BASE_URL}/upcoming`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUpcoming),
      });
      setNewUpcoming({ team1: "", team2: "", date: "", time: "" });
      // Invalidate cache and refresh
      dataCache.upcoming = null;
      fetchUpcoming();
    } catch (error) {
      console.error("Error adding upcoming match:", error);
      alert("Failed to add upcoming match");
    }
  };

  const addPoint = async () => {
    try {
      const url = newPoint._id 
        ? `${API_BASE_URL}/points/${newPoint._id}`
        : `${API_BASE_URL}/points`;
      
      const method = newPoint._id ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPoint),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save points');
      }

      setNewPoint({ team: "", played: 0, won: 0, lost: 0, draw: 0, points: 0, gd: 0, group: "A" });
      // Invalidate cache and refresh
      dataCache.points = null;
      fetchPoints();
    } catch (error) {
      console.error("Error adding/updating points:", error);
      alert("Failed to update points");
    }
  };

  const addSemifinal = async () => {
    try {
      await fetch(`${API_BASE_URL}/semifinals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSemi),
      });
      setNewSemi({ team1: "", team2: "", score: "" });
      // Invalidate cache and refresh
      dataCache.semifinals = null;
      fetchSemifinals();
    } catch (error) {
      console.error("Error adding semifinal:", error);
      alert("Failed to add semifinal");
    }
  };

  const addFinal = async () => {
    try {
      await fetch(`${API_BASE_URL}/finals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFinal),
      });
      setNewFinal({ team1: "", team2: "", score: "" });
      // Invalidate cache and refresh
      dataCache.finals = null;
      fetchFinals();
    } catch (error) {
      console.error("Error adding final:", error);
      alert("Failed to add final");
    }
  };

  const login = async () => {
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setShowLogin(false);
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Invalid email or password");
    }
  };

  // Loading Screen Component
  const LoadingScreen = () => {
    const loadedCount = Object.values(loadingStates).filter(state => !state).length;
    const totalCount = Object.keys(loadingStates).length;
    const progress = Math.round((loadedCount / totalCount) * 100);

    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50 p-4">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Loading Futsal Data</h1>
          
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-blue-700">Progress</span>
              <span className="text-sm font-medium text-blue-700">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {Object.entries(loadingStates).map(([key, loading]) => (
              <div key={key} className="flex items-center p-2 bg-gray-50 rounded">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  loading ? 'bg-yellow-400' : errors[key] ? 'bg-red-500' : 'bg-green-500'
                }`}></div>
                <span className="capitalize">{key}: </span>
                <span className="ml-1 text-sm">
                  {loading ? 'Loading...' : errors[key] ? 'Error' : 'Ready'}
                </span>
              </div>
            ))}
          </div>

          {Object.values(errors).filter(e => e).length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-center">
              <p className="text-red-600 mb-2">Some data failed to load</p>
              <button
                className="bg-blue-500 text-white px-4 py-1 rounded text-sm"
                onClick={() => {
                  setErrors({});
                  setForceRefresh(true);
                }}
              >
                Retry Failed Loads
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render loading screen if data isn't ready
  if (!allDataLoaded) {
    return <LoadingScreen />;
  }

  // Main App Render
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Error Notifications */}
      {Object.entries(errors).map(([key, error]) => error && (
        <div key={key} className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4">
          <p>{error}</p>
        </div>
      ))}

      {/* Navbar */}
      <nav className="mb-6 flex justify-between  items-center">
        <h1 className="text-3xl font-bold ">ICE Futsal Fest</h1>
        {user ? (
          <div className="flex items-center">
            <span className="mr-4">{user.email}</span>
            <button 
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              onClick={() => signOut(auth)}
            >
              Sign Out
            </button>
          </div>
        ) : (
          !showLogin && (
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
              onClick={() => setShowLogin(true)}
            >
              Admin
            </button>
          )
        )}
      </nav>

      {/* Login Form */}
      {showLogin && !user && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">Admin Login</h2>
          {loginError && <p className="text-red-500 mb-3">{loginError}</p>}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full border p-2 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                className="w-full border p-2 rounded"
                placeholder="Enter password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex-1"
                onClick={login}
              >
                Login
              </button>
              <button
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded flex-1"
                onClick={() => setShowLogin(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teams Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-bold">Teams</h2>
          <button 
            className="text-sm text-blue-500 hover:text-blue-700"
            onClick={() => {
              dataCache.teams = null;
              setLoadingStates(prev => ({ ...prev, teams: true }));
              fetchTeams();
            }}
          >
            Refresh
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['A', 'B'].map(group => (
            <div key={group} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-lg mb-3 border-b pb-2">Group {group}</h3>
              <div className="space-y-2">
                {teams.filter(t => t.group === group).map(t => (
                  <div key={t._id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <span className="font-medium">{t.name}</span>
                    {user?.email === ADMIN_EMAIL && (
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (window.confirm(`Delete team ${t.name}?`)) {
                            deleteData('teams', t._id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {user?.email === ADMIN_EMAIL && (
          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Add New Team</h3>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                className="flex-1 border p-2 rounded"
                placeholder="Team Name"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              />
              <select
                className="border p-2 rounded"
                value={newTeam.group}
                onChange={(e) => setNewTeam({ ...newTeam, group: e.target.value })}
              >
                <option value="A">Group A</option>
                <option value="B">Group B</option>
              </select>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                onClick={addTeam}
                disabled={!newTeam.name.trim()}
              >
                Add Team
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Points Table Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-bold">Points Table</h2>
          <button 
            className="text-sm text-blue-500 hover:text-blue-700"
            onClick={() => {
              dataCache.points = null;
              setLoadingStates(prev => ({ ...prev, points: true }));
              fetchPoints();
            }}
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['A', 'B'].map(group => (
            <div key={group} className="bg-white rounded-lg shadow overflow-hidden">
              <h3 className="font-semibold text-lg p-3 bg-gray-100">Group {group}</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Team</th>
                      <th className="p-2 text-center">P</th>
                      <th className="p-2 text-center">W</th>
                      <th className="p-2 text-center">L</th>
                      <th className="p-2 text-center">D</th>
                      <th className="p-2 text-center">GD</th>
                      <th className="p-2 text-center">Pts</th>
                      {user?.email === ADMIN_EMAIL && <th className="p-2 text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {points
                      .filter(p => p.group === group)
                      .sort((a, b) => b.points - a.points || b.gd - a.gd)
                      .map(p => (
                        <tr key={p._id}>
                          <td className="p-2">{p.team}</td>
                          <td className="p-2 text-center">{p.played}</td>
                          <td className="p-2 text-center">{p.won}</td>
                          <td className="p-2 text-center">{p.lost}</td>
                          <td className="p-2 text-center">{p.draw}</td>
                          <td className="p-2 text-center">{p.gd}</td>
                          <td className="p-2 text-center font-medium">{p.points}</td>
                          {user?.email === ADMIN_EMAIL && (
                            <td className="p-2 text-center">
                              <button
                                className="text-blue-500 hover:text-blue-700 mr-2"
                                onClick={() => {
                                  setNewPoint({...p});
                                  document.getElementById('edit-point-form').scrollIntoView({
                                    behavior: 'smooth'
                                  });
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="text-red-500 hover:text-red-700"
                                onClick={() => {
                                  if (window.confirm(`Delete points record for ${p.team}?`)) {
                                    deleteData('points', p._id);
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {user?.email === ADMIN_EMAIL && (
          <div id="edit-point-form" className="mt-6 bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-lg mb-3">
              {newPoint._id ? "Edit Team Points" : "Add New Team Points"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Team Name</label>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Team Name"
                  value={newPoint.team}
                  onChange={(e) => setNewPoint({ ...newPoint, team: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Group</label>
                <select
                  className="w-full border p-2 rounded"
                  value={newPoint.group}
                  onChange={(e) => setNewPoint({ ...newPoint, group: e.target.value })}
                >
                  <option value="A">Group A</option>
                  <option value="B">Group B</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Played</label>
                <input
                  type="number"
                  min="0"
                  className="w-full border p-2 rounded"
                  value={newPoint.played}
                  onChange={(e) => setNewPoint({ ...newPoint, played: +e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Won</label>
                <input
                  type="number"
                  min="0"
                  className="w-full border p-2 rounded"
                  value={newPoint.won}
                  onChange={(e) => setNewPoint({ ...newPoint, won: +e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lost</label>
                <input
                  type="number"
                  min="0"
                  className="w-full border p-2 rounded"
                  value={newPoint.lost}
                  onChange={(e) => setNewPoint({ ...newPoint, lost: +e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Draw</label>
                <input
                  type="number"
                  min="0"
                  className="w-full border p-2 rounded"
                  value={newPoint.draw}
                  onChange={(e) => setNewPoint({ ...newPoint, draw: +e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Goal Difference</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  value={newPoint.gd}
                  onChange={(e) => setNewPoint({ ...newPoint, gd: +e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Points</label>
                <input
                  type="number"
                  min="0"
                  className="w-full border p-2 rounded"
                  value={newPoint.points}
                  onChange={(e) => setNewPoint({ ...newPoint, points: +e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                onClick={addPoint}
                disabled={!newPoint.team.trim()}
              >
                {newPoint._id ? "Update" : "Add"}
              </button>
              {newPoint._id && (
                <button
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={() => setNewPoint({ team: "", played: 0, won: 0, lost: 0, draw: 0, points: 0, gd: 0, group: "A" })}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Completed Matches Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-bold">Completed Matches</h2>
          <button 
            className="text-sm text-blue-500 hover:text-blue-700"
            onClick={() => {
              dataCache.matches = null;
              setLoadingStates(prev => ({ ...prev, matches: true }));
              fetchMatches();
            }}
          >
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {matches.map(m => (
              <div key={m._id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{m.team1}</span> vs <span className="font-medium">{m.team2}</span>
                    <span className="mx-2 font-bold">→</span>
                    <span className="font-medium">{m.score}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {m.scorer && <span>Scorer: {m.scorer}</span>}
                    {m.motm && <span className="ml-2">MOTM: {m.motm}</span>}
                  </div>
                </div>
                {user?.email === ADMIN_EMAIL && (
                  <div className="mt-2 flex justify-end">
                    <button
                      className="text-red-500 hover:text-red-700 text-sm"
                      onClick={() => {
                        if (window.confirm("Delete this match record?")) {
                          deleteData('matches', m._id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {user?.email === ADMIN_EMAIL && (
          <div className="mt-4 bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-3">Add New Match</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Team 1</label>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Team 1"
                  value={newMatch.team1}
                  onChange={(e) => setNewMatch({ ...newMatch, team1: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Team 2</label>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Team 2"
                  value={newMatch.team2}
                  onChange={(e) => setNewMatch({ ...newMatch, team2: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Score</label>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="e.g. 3-2"
                  value={newMatch.score}
                  onChange={(e) => setNewMatch({ ...newMatch, score: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Scorer</label>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Scorer name"
                  value={newMatch.scorer}
                  onChange={(e) => setNewMatch({ ...newMatch, scorer: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Man of the Match</label>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="MOTM name"
                  value={newMatch.motm}
                  onChange={(e) => setNewMatch({ ...newMatch, motm: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
                  onClick={addMatch}
                  disabled={!newMatch.team1.trim() || !newMatch.team2.trim()}
                >
                  Add Match
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Upcoming Matches Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-bold">Upcoming Matches</h2>
          <button 
            className="text-sm text-blue-500 hover:text-blue-700"
            onClick={() => {
              dataCache.upcoming = null;
              setLoadingStates(prev => ({ ...prev, upcoming: true }));
              fetchUpcoming();
            }}
          >
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {upcoming.map(u => (
              <div key={u._id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{u.team1}</span> vs <span className="font-medium">{u.team2}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {u.date && <span>{new Date(u.date).toLocaleDateString()}</span>}
                    {u.time && <span className="ml-2">{u.time}</span>}
                  </div>
                </div>
                {user?.email === ADMIN_EMAIL && (
                  <div className="mt-2 flex justify-end">
                    <button
                      className="text-red-500 hover:text-red-700 text-sm"
                      onClick={() => {
                        if (window.confirm("Delete this upcoming match?")) {
                          deleteData('upcoming', u._id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {user?.email === ADMIN_EMAIL && (
          <div className="mt-4 bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-3">Add New Upcoming Match</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Team 1</label>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Team 1"
                  value={newUpcoming.team1}
                  onChange={(e) => setNewUpcoming({ ...newUpcoming, team1: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Team 2</label>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Team 2"
                  value={newUpcoming.team2}
                  onChange={(e) => setNewUpcoming({ ...newUpcoming, team2: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded"
                  value={newUpcoming.date}
                  onChange={(e) => setNewUpcoming({ ...newUpcoming, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="time"
                  className="w-full border p-2 rounded"
                  value={newUpcoming.time}
                  onChange={(e) => setNewUpcoming({ ...newUpcoming, time: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
                  onClick={addUpcoming}
                  disabled={!newUpcoming.team1.trim() || !newUpcoming.team2.trim()}
                >
                  Add Upcoming Match
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Semifinals Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-bold">Semifinals</h2>
          <button 
            className="text-sm text-blue-500 hover:text-blue-700"
            onClick={() => {
              dataCache.semifinals = null;
              setLoadingStates(prev => ({ ...prev, semifinals: true }));
              fetchSemifinals();
            }}
          >
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {semifinals.map(s => (
              <div key={s._id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{s.team1}</span> vs <span className="font-medium">{s.team2}</span>
                    {s.score && (
                      <>
                        <span className="mx-2 font-bold">→</span>
                        <span className="font-medium">{s.score}</span>
                      </>
                    )}
                  </div>
                  {user?.email === ADMIN_EMAIL && (
                    <button
                      className="text-red-500 hover:text-red-700 text-sm"
                      onClick={() => {
                        if (window.confirm("Delete this semifinal record?")) {
                          deleteData('semifinals', s._id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {user?.email === ADMIN_EMAIL && (
          <div className="mt-4 bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-3">Add New Semifinal</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Team 1</label>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Team 1"
                  value={newSemi.team1}
                  onChange={(e) => setNewSemi({ ...newSemi, team1: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Team 2</label>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Team 2"
                  value={newSemi.team2}
                  onChange={(e) => setNewSemi({ ...newSemi, team2: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Score</label>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Score"
                  value={newSemi.score}
                  onChange={(e) => setNewSemi({ ...newSemi, score: e.target.value })}
                />
              </div>
              <div className="md:col-span-3">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
                  onClick={addSemifinal}
                  disabled={!newSemi.team1.trim() || !newSemi.team2.trim()}
                >
                  Add Semifinal
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Finals Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-bold">Final</h2>
          <button 
            className="text-sm text-blue-500 hover:text-blue-700"
            onClick={() => {
              dataCache.finals = null;
              setLoadingStates(prev => ({ ...prev, finals: true }));
              fetchFinals();
            }}
          >
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {finals.map(f => (
              <div key={f._id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{f.team1}</span> vs <span className="font-medium">{f.team2}</span>
                    {f.score && (
                      <>
                        <span className="mx-2 font-bold">→</span>
                        <span className="font-medium">{f.score}</span>
                      </>
                    )}
                  </div>
                  {user?.email === ADMIN_EMAIL && (
                    <button
                      className="text-red-500 hover:text-red-700 text-sm"
                      onClick={() => {
                        if (window.confirm("Delete this final record?")) {
                          deleteData('finals', f._id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {user?.email === ADMIN_EMAIL && (
          <div className="mt-4 bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-3">Add New Final</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Team 1</label>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Team 1"
                  value={newFinal.team1}
                  onChange={(e) => setNewFinal({ ...newFinal, team1: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Team 2</label>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Team 2"
                  value={newFinal.team2}
                  onChange={(e) => setNewFinal({ ...newFinal, team2: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Score</label>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Score"
                  value={newFinal.score}
                  onChange={(e) => setNewFinal({ ...newFinal, score: e.target.value })}
                />
              </div>
              <div className="md:col-span-3">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
                  onClick={addFinal}
                  disabled={!newFinal.team1.trim() || !newFinal.team2.trim()}
                >
                  Add Final
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-600 border-t pt-4 mt-6">
        © {new Date().getFullYear()} ICE Futsal Fest. All rights reserved to <span className="font-bold text-red-600">aalga-sabbir</span>.
      </footer>
    </div>
  );
}
