
// import { useState, useEffect } from "react";
// import auth from "../firebase.config";
// import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

// export default function App() {
//   const ADMIN_EMAIL = "admin@ice.com";
//   const [user, setUser] = useState(null);
//   const [teams, setTeams] = useState([]);
//   const [matches, setMatches] = useState([]);
//   const [upcoming, setUpcoming] = useState([]);
//   const [points, setPoints] = useState([]);
//   const [semifinals, setSemifinals] = useState([]);
//   const [finals, setFinals] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Admin stuff
  
//   const [newTeam, setNewTeam] = useState({ name: "", group: "A" });
//   const [newMatch, setNewMatch] = useState({ team1: "", team2: "", score: "", scorer: "", motm: "" });
//   const [newUpcoming, setNewUpcoming] = useState({ team1: "", team2: "", date: "", time: "" });
//   const [newPoint, setNewPoint] = useState({ team: "", played: 0, won: 0, lost: 0, draw: 0, points: 0, gd: 0, group: "A" });
//   const [newSemi, setNewSemi] = useState({ team1: "", team2: "", score: "" });
//   const [newFinal, setNewFinal] = useState({ team1: "", team2: "", score: "" });
//   const [email, setEmail] = useState("");
//   const [pass, setPass] = useState("");
//   const [showLogin, setShowLogin] = useState(false);

//   // 🔹 Load all data once
//   useEffect(() => {
//     onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
//     loadAllData();
//   }, []);

//   const loadAllData = async () => {
//     try {
//       setLoading(true);
//       await Promise.all([fetchTeams(), fetchMatches(), fetchUpcoming(), fetchPoints(), fetchSemifinals(), fetchFinals()]);
//     } catch (err) {
//       console.error("Error fetching data:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔹 Define missing fetch functions
//   const fetchTeams = async () => {
//     const res = await fetch("https://futsal-server.vercel.app/api/teams");
//     setTeams(await res.json());
//   };
//   const fetchMatches = async () => {
//     const res = await fetch("https://futsal-server.vercel.app/api/matches");
//     setMatches(await res.json());
//   };
//   const fetchUpcoming = async () => {
//     const res = await fetch("https://futsal-server.vercel.app/api/upcoming");
//     setUpcoming(await res.json());
//   };
//   const fetchPoints = async () => {
//     const res = await fetch("https://futsal-server.vercel.app/api/points");
//     setPoints(await res.json());
//   };
//   const fetchSemifinals = async () => {
//     const res = await fetch("https://futsal-server.vercel.app/api/semifinals");
//     setSemifinals(await res.json());
//   };
//   const fetchFinals = async () => {
//     const res = await fetch("https://futsal-server.vercel.app/api/finals");
//     setFinals(await res.json());
//   };






//   // 🔹 CRUD helpers (you already had these)
//   const addTeam = async () => {
//     await fetch("https://futsal-server.vercel.app/api/teams", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(newTeam),
//     });
//     setNewTeam({ name: "", group: "A" });
//     fetchTeams();
//   };

//   const deleteData = async (endpoint, id, callback) => {
//     await fetch(`https://futsal-server.vercel.app/api/${endpoint}/${id}`, { method: "DELETE" });
//     callback();
//   };

//   const deleteTeam = async (id) => {
//     await fetch(`https://futsal-server.vercel.app/api/teams/${id}`, { method: "DELETE" });
//     fetchTeams();
//   };

//   const addMatch = async () => {
//     await fetch("https://futsal-server.vercel.app/api/matches", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(newMatch),
//     });
//     setNewMatch({ team1: "", team2: "", score: "", scorer: "", motm: "" });
//     fetchMatches();
//   };

//   const deleteMatch = async (id) => {
//     await fetch(`https://futsal-server.vercel.app/api/matches/${id}`, { method: "DELETE" });
//     fetchMatches();
//   };

//   const addUpcoming = async () => {
//     await fetch("https://futsal-server.vercel.app/api/upcoming", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(newUpcoming),
//     });
//     setNewUpcoming({ team1: "", team2: "", date: "", time: "" });
//     fetchUpcoming();
//   };

//   const deleteUpcoming = async (id) => {
//     await fetch(`https://futsal-server.vercel.app/api/upcoming/${id}`, { method: "DELETE" });
//     fetchUpcoming();
//   };

//   const login = () => {
//     signInWithEmailAndPassword(auth, email, pass)
//       .then(() => setShowLogin(false))
//       .catch((e) => alert(e.message));
//   };

//   // 🔹 Loading spinner
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
//       </div>
//     );
//   }







//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       {/* Navbar */}
//       <nav className="mb-6 flex justify-between items-center">
//         <h1 className="text-3xl font-bold">ICE Futsal Fest</h1>
//         {user ? (
//           <div>
//             <span className="mr-4">{user.email}</span>
//             <button className="bg-red-500 text-white px-2 py-1" onClick={() => signOut(auth)}>Sign Out</button>
//           </div>
//         ) : null}
//       </nav>

//       {/* Teams Section */}
//       <section className="mb-6">
//         <h2 className="text-2xl font-bold mb-2">Teams</h2>
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <h3 className="font-semibold">Group A</h3>
//             {teams.filter(t => t.group === "A").map(t => (
//               <div key={t._id} className="flex justify-between bg-gray-100 p-2 my-1">
//                 {t.name}
//                 {user?.email === ADMIN_EMAIL && <button onClick={() => deleteTeam(t._id)}>❌</button>}
//               </div>
//             ))}
//           </div>
//           <div>
//             <h3 className="font-semibold">Group B</h3>
//             {teams.filter(t => t.group === "B").map(t => (
//               <div key={t._id} className="flex justify-between bg-gray-100 p-2 my-1">
//                 {t.name}
//                 {user?.email === ADMIN_EMAIL && <button onClick={() => deleteTeam(t._id)}>❌</button>}
//               </div>
//             ))}
//           </div>
//         </div>
//         {user?.email === ADMIN_EMAIL && (
//           <div className="mt-3">
//             <input className="border p-1 mr-2" placeholder="Team Name" value={newTeam.name} onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}/>
//             <select value={newTeam.group} onChange={(e) => setNewTeam({ ...newTeam, group: e.target.value })}>
//               <option value="A">Group A</option>
//               <option value="B">Group B</option>
//             </select>
//             <button className="bg-blue-500 text-white px-2 py-1 ml-2" onClick={addTeam}>Add</button>
//           </div>
//         )}
//       </section>

//       {/* Points Table */}
     

// {/* Update Points Table section */}
// <section className="mb-6">
//   <h2 className="text-2xl font-bold mb-2">Points Table</h2>
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//     {/* Group A Table */}
//     <div>
//       <h3 className="font-semibold text-lg mb-2">Group A</h3>
//       <table className="w-full border">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="border px-2">Team</th>
//             <th className="border px-2">P</th>
//             <th className="border px-2">W</th>
//             <th className="border px-2">L</th>
//             <th className="border px-2">D</th>
//             <th className="border px-2">GD</th>
//             <th className="border px-2">Pts</th>
//             {user?.email === ADMIN_EMAIL && <th>Action</th>}
//           </tr>
//         </thead>
//         <tbody>
//           {points
//             .filter(p => p.group === "A")
//             .sort((a, b) => b.points - a.points || b.gd - a.gd)
//             .map(p => (
//               <tr key={p._id}>
//                 <td className="border px-2">{p.team}</td>
//                 <td className="border px-2">{p.played}</td>
//                 <td className="border px-2">{p.won}</td>
//                 <td className="border px-2">{p.lost}</td>
//                 <td className="border px-2">{p.draw}</td>
//                 <td className="border px-2">{p.gd}</td>
//                 <td className="border px-2">{p.points}</td>
//                 {user?.email === ADMIN_EMAIL && (
//                   <td className="border px-2">
//                     <button 
//                       className="text-blue-500 mr-2"
//                       onClick={() => {
//                         setNewPoint({...p});
//                         document.getElementById('edit-point-form').scrollIntoView();
//                       }}
//                     >✏️</button>
//                     <button 
//                       className="text-red-500" 
//                       onClick={() => deleteData("points", p._id, fetchPoints)}
//                     >❌</button>
//                   </td>
//                 )}
//               </tr>
//             ))}
//         </tbody>
//       </table>
//     </div>

//     {/* Group B Table */}
//     <div>
//       <h3 className="font-semibold text-lg mb-2">Group B</h3>
//       <table className="w-full border">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="border px-2">Team</th>
//             <th className="border px-2">P</th>
//             <th className="border px-2">W</th>
//             <th className="border px-2">L</th>
//             <th className="border px-2">D</th>
//             <th className="border px-2">GD</th>
//             <th className="border px-2">Pts</th>
//             {user?.email === ADMIN_EMAIL && <th>Action</th>}
//           </tr>
//         </thead>
//         <tbody>
//           {points
//             .filter(p => p.group === "B")
//             .sort((a, b) => b.points - a.points || b.gd - a.gd)
//             .map(p => (
//               <tr key={p._id}>
//                 <td className="border px-2">{p.team}</td>
//                 <td className="border px-2">{p.played}</td>
//                 <td className="border px-2">{p.won}</td>
//                 <td className="border px-2">{p.lost}</td>
//                 <td className="border px-2">{p.draw}</td>
//                 <td className="border px-2">{p.gd}</td>
//                 <td className="border px-2">{p.points}</td>
//                 {user?.email === ADMIN_EMAIL && (
//                   <td className="border px-2">
//                     <button 
//                       className="text-blue-500 mr-2"
//                       onClick={() => {
//                         setNewPoint({...p});
//                         document.getElementById('edit-point-form').scrollIntoView();
//                       }}
//                     >✏️</button>
//                     <button 
//                       className="text-red-500" 
//                       onClick={() => deleteData("points", p._id, fetchPoints)}
//                     >❌</button>
//                   </td>
//                 )}
//               </tr>
//             ))}
//         </tbody>
//       </table>
//     </div>
//   </div>

//   {user?.email === ADMIN_EMAIL && (
//     <div id="edit-point-form" className="mt-6 p-4 border rounded-lg">
//       <h3 className="font-semibold mb-2">
//         {newPoint._id ? "Edit Team Points" : "Add New Team Points"}
//       </h3>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div>
//           <label className="block mb-1">Team Name</label>
//           <input 
//             placeholder="Team" 
//             value={newPoint.team} 
//             onChange={(e) => setNewPoint({ ...newPoint, team: e.target.value })} 
//             className="border p-1 w-full"
//           />
//         </div>
//         <div>
//           <label className="block mb-1">Group</label>
//           <select 
//             value={newPoint.group} 
//             onChange={(e) => setNewPoint({ ...newPoint, group: e.target.value })} 
//             className="border p-1 w-full"
//           >
//             <option value="A">Group A</option>
//             <option value="B">Group B</option>
//           </select>
//         </div>
//         <div>
//           <label className="block mb-1">Played</label>
//           <input 
//             type="number" 
//             placeholder="Played" 
//             value={newPoint.played} 
//             onChange={(e) => setNewPoint({ ...newPoint, played: +e.target.value })} 
//             className="border p-1 w-full"
//           />
//         </div>
//         <div>
//           <label className="block mb-1">Won</label>
//           <input 
//             type="number" 
//             placeholder="Won" 
//             value={newPoint.won} 
//             onChange={(e) => setNewPoint({ ...newPoint, won: +e.target.value })} 
//             className="border p-1 w-full"
//           />
//         </div>
//         <div>
//           <label className="block mb-1">Lost</label>
//           <input 
//             type="number" 
//             placeholder="Lost" 
//             value={newPoint.lost} 
//             onChange={(e) => setNewPoint({ ...newPoint, lost: +e.target.value })} 
//             className="border p-1 w-full"
//           />
//         </div>
//         <div>
//           <label className="block mb-1">Draw</label>
//           <input 
//             type="number" 
//             placeholder="Draw" 
//             value={newPoint.draw} 
//             onChange={(e) => setNewPoint({ ...newPoint, draw: +e.target.value })} 
//             className="border p-1 w-full"
//           />
//         </div>
//         <div>
//           <label className="block mb-1">Goal Difference</label>
//           <input 
//             type="number" 
//             placeholder="GD" 
//             value={newPoint.gd} 
//             onChange={(e) => setNewPoint({ ...newPoint, gd: +e.target.value })} 
//             className="border p-1 w-full"
//           />
//         </div>
//         <div>
//           <label className="block mb-1">Points</label>
//           <input 
//             type="number" 
//             placeholder="Points" 
//             value={newPoint.points} 
//             onChange={(e) => setNewPoint({ ...newPoint, points: +e.target.value })} 
//             className="border p-1 w-full"
//           />
//         </div>
//       </div>
//       <div className="mt-3">
//         <button 
//           className="bg-blue-500 text-white px-4 py-2 mr-2"
//           onClick={async () => {
//             if (newPoint._id) {
//               // Update existing point
//               await fetch(`https://futsal-server.vercel.app/api/points/${newPoint._id}`, { 
//                 method: "PATCH", 
//                 headers: { "Content-Type": "application/json" }, 
//                 body: JSON.stringify(newPoint) 
//               });
//             } else {
//               // Add new point
//               await fetch("https://futsal-server.vercel.app/api/points", { 
//                 method: "POST", 
//                 headers: { "Content-Type": "application/json" }, 
//                 body: JSON.stringify(newPoint) 
//               });
//             }
//             fetchPoints();
//             setNewPoint({ 
//               team: "", 
//               played: 0, 
//               won: 0, 
//               lost: 0, 
//               draw: 0, 
//               points: 0,
//               gd: 0,
//               group: "A" 
//             });
//           }}
//         >
//           {newPoint._id ? "Update" : "Add"}
//         </button>
//         {newPoint._id && (
//           <button 
//             className="bg-gray-500 text-white px-4 py-2"
//             onClick={() => setNewPoint({ 
//               team: "", 
//               played: 0, 
//               won: 0, 
//               lost: 0, 
//               draw: 0, 
//               points: 0,
//               gd: 0,
//               group: "A" 
//             })}
//           >
//             Cancel
//           </button>
//         )}
//       </div>
//     </div>
//   )}
// </section>


//       {/* Completed Matches */}
//       <section className="mb-6">
//         <h2 className="text-2xl font-bold mb-2">Completed Matches</h2>
//         {matches.map(m => (
//           <div key={m._id} className="bg-gray-100 p-3 my-2 rounded">
//             {m.team1} vs {m.team2} → {m.score} | Scorer: {m.scorer} | MOTM: {m.motm}
//             {user?.email === ADMIN_EMAIL && <button className="ml-2 text-red-500" onClick={() => deleteMatch(m._id)}>❌</button>}
//           </div>
//         ))}
//         {user?.email === ADMIN_EMAIL && (
//           <div className="mt-3 space-x-2">
//             <input placeholder="Team1" value={newMatch.team1} onChange={(e) => setNewMatch({ ...newMatch, team1: e.target.value })} className="border p-1"/>
//             <input placeholder="Team2" value={newMatch.team2} onChange={(e) => setNewMatch({ ...newMatch, team2: e.target.value })} className="border p-1"/>
//             <input placeholder="Score" value={newMatch.score} onChange={(e) => setNewMatch({ ...newMatch, score: e.target.value })} className="border p-1"/>
//             <input placeholder="Scorer" value={newMatch.scorer} onChange={(e) => setNewMatch({ ...newMatch, scorer: e.target.value })} className="border p-1"/>
//             <input placeholder="MOTM" value={newMatch.motm} onChange={(e) => setNewMatch({ ...newMatch, motm: e.target.value })} className="border p-1"/>
//             <button className="bg-blue-500 text-white px-2 py-1" onClick={addMatch}>Add</button>
//           </div>
//         )}
//       </section>



//       {/* Upcoming Matches */}
//       <section className="mb-6">
//         <h2 className="text-2xl font-bold mb-2">Upcoming Matches</h2>
//         {upcoming.map(u => (
//           <div key={u._id} className="bg-gray-100 p-3 my-2 rounded">
//             {u.team1} vs {u.team2} → {u.date} {u.time}
//             {user?.email === ADMIN_EMAIL && <button className="ml-2 text-red-500" onClick={() => deleteUpcoming(u._id)}>❌</button>}
//           </div>
//         ))}
//         {user?.email === ADMIN_EMAIL && (
//           <div className="mt-3 space-x-2">
//             <input placeholder="Team1" value={newUpcoming.team1} onChange={(e) => setNewUpcoming({ ...newUpcoming, team1: e.target.value })} className="border p-1"/>
//             <input placeholder="Team2" value={newUpcoming.team2} onChange={(e) => setNewUpcoming({ ...newUpcoming, team2: e.target.value })} className="border p-1"/>
//             <input placeholder="Date" type="date" value={newUpcoming.date} onChange={(e) => setNewUpcoming({ ...newUpcoming, date: e.target.value })} className="border p-1"/>
//             <input placeholder="Time" type="time" value={newUpcoming.time} onChange={(e) => setNewUpcoming({ ...newUpcoming, time: e.target.value })} className="border p-1"/>
//             <button className="bg-blue-500 text-white px-2 py-1" onClick={addUpcoming}>Add</button>
//           </div>
//         )}
//       </section>



//       {/* Semi Final */}
//       <section className="mb-6">
//   <h2 className="text-2xl font-bold mb-2">Semi Finals</h2>
//   {semifinals.map(s => (
//     <div key={s._id} className="bg-gray-100 p-3 my-2 rounded">
//       {s.team1} vs {s.team2} → {s.score}
//       {user?.email === ADMIN_EMAIL && <button className="ml-2 text-red-500" onClick={() => deleteData("semifinals", s._id, fetchSemifinals)}>❌</button>}
//     </div>
//   ))}
//   {user?.email === ADMIN_EMAIL && (
//     <div className="mt-3 space-x-2">
//       <input placeholder="Team1" value={newSemi.team1} onChange={(e) => setNewSemi({ ...newSemi, team1: e.target.value })} className="border p-1"/>
//       <input placeholder="Team2" value={newSemi.team2} onChange={(e) => setNewSemi({ ...newSemi, team2: e.target.value })} className="border p-1"/>
//       <input placeholder="Score" value={newSemi.score} onChange={(e) => setNewSemi({ ...newSemi, score: e.target.value })} className="border p-1"/>
//       <button className="bg-blue-500 text-white px-2 py-1" onClick={async () => {
//         await fetch("https://futsal-server.vercel.app/api/semifinals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newSemi) });
//         fetchSemifinals();
//       }}>Add</button>
//     </div>
//   )}
// </section>

// {/* Final */}
// <section className="mb-6">
//   <h2 className="text-2xl font-bold mb-2">Final</h2>
//   {finals.map(f => (
//     <div key={f._id} className="bg-gray-100 p-3 my-2 rounded">
//       {f.team1} vs {f.team2} → {f.score}
//       {user?.email === ADMIN_EMAIL && <button className="ml-2 text-red-500" onClick={() => deleteData("finals", f._id, fetchFinals)}>❌</button>}
//     </div>
//   ))}
//   {user?.email === ADMIN_EMAIL && (
//     <div className="mt-3 space-x-2">
//       <input placeholder="Team1" value={newFinal.team1} onChange={(e) => setNewFinal({ ...newFinal, team1: e.target.value })} className="border p-1"/>
//       <input placeholder="Team2" value={newFinal.team2} onChange={(e) => setNewFinal({ ...newFinal, team2: e.target.value })} className="border p-1"/>
//       <input placeholder="Score" value={newFinal.score} onChange={(e) => setNewFinal({ ...newFinal, score: e.target.value })} className="border p-1"/>
//       <button className="bg-blue-500 text-white px-2 py-1" onClick={async () => {
//         await fetch("https://futsal-server.vercel.app/api/finals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newFinal) });
//         fetchFinals();
//       }}>Add</button>
//     </div>
//   )}
// </section>


// {/*  */}


//       {/* Footer */}
//       <footer className="text-center text-gray-600 border-t pt-4 mt-6">
//         © {new Date().getFullYear()} ICE Futsal Fest. All rights reserved aalga-sabbir.
//       </footer>

//       {/* Login */}
//       {!user && !showLogin && (
//         <button className="bg-blue-500 text-white px-4 py-2 mt-4" onClick={() => setShowLogin(true)}>Admin Login</button>
//       )}
//       {showLogin && !user && (
//         <div className="mt-4 space-y-2">
//           <input className="border p-2 w-full" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
//           <input type="password" className="border p-2 w-full" placeholder="Password" onChange={(e) => setPass(e.target.value)} />
//           <button className="bg-blue-500 text-white px-4 py-2" onClick={login}>Login</button>
//           <button className="bg-gray-400 text-white px-4 py-2" onClick={() => setShowLogin(false)}>Cancel</button>
//         </div>
//       )}
//     </div>
//   );
// }
