import React, { Fragment, useState, useEffect } from 'react';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost/api'
    : '/api';

function App() {
    const [pointsSlips, setPointsSlips] = useState([]);
    const [screen, setScreen] = useState('home');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [staffList, setStaffList] = useState([]);

    const theme = {
        primary: '#016c4a',
        background: '#121212',
        surface: '#1e1e1e',
        surfaceLight: '#2a2a2a',
        text: '#e0e0e0',
        textDim: '#a0a0a0',
        border: '#333333',
        accent: '#028a5e'
    };

    const fetchSlips = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const response = await fetch(`${API_URL}/slips`);
            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();
            const formattedData = data.map(slip => {
                const [year, month, day] = slip.date.split('-').map(Number);
                return {
                    ...slip,
                    date: new Date(year, month - 1, day)
                };
            });
            setPointsSlips(formattedData);
            setError(null);
        } catch (err) {
            console.error('Fetch error:', err);
            if (!isSilent) setError('Could not connect to the server.');
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const response = await fetch(`${API_URL}/staff`);
            if (response.ok) {
                const data = await response.json();
                setStaffList(data);
            }
        } catch (err) {
            console.error('Fetch staff error:', err);
        }
    };

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
        }

        document.body.style.backgroundColor = theme.background;
        document.body.style.color = theme.text;
        document.body.style.margin = '0';
        document.body.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';

        fetchSlips();
        fetchStaff();

        const interval = setInterval(() => {
            fetchSlips(true);
            fetchStaff();
        }, 20000);

        return () => clearInterval(interval);
    }, [theme.background, theme.text]);

    const addSlip = async (newSlip) => {
        try {
            const response = await fetch(`${API_URL}/slips`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSlip),
            });
            if (!response.ok) throw new Error('Failed to save data');
            await fetchSlips(true);
        } catch (err) {
            console.error('Add slip error:', err);
            alert('Error saving points to the server.');
        }
    };

    const handleLogin = async (username, password) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            if (response.ok) {
                const user = await response.json();
                setCurrentUser(user);
                localStorage.setItem('user', JSON.stringify(user));
                setScreen('home');
            } else {
                alert('Invalid credentials');
            }
        } catch (err) {
            alert('Login failed. Server might be down.');
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('user');
        setScreen('home');
    };

    if (!currentUser) {
        return <LoginScreen onLogin={handleLogin} theme={theme} />;
    }

    if (loading && pointsSlips.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', backgroundColor: theme.background, minHeight: '100vh', color: theme.text }}>
                <h1>Loading...</h1>
            </div>
        );
    }

    if (screen === 'enter') {
        return <EnterPointsScreen setScreen={setScreen} addSlip={addSlip} theme={theme} staffList={staffList} onLogout={handleLogout} currentUser={currentUser} />;
    }

    if (screen === 'view') {
        return <ViewPointsScreen setScreen={setScreen} pointsSlips={pointsSlips} theme={theme} onLogout={handleLogout} currentUser={currentUser} />;
    }

    if (screen === 'admin' && currentUser.role === 'admin') {
        return <AdminScreen setScreen={setScreen} theme={theme} API_URL={API_URL} onLogout={handleLogout} currentUser={currentUser} />;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'start', padding: '20px', minHeight: '100vh', backgroundColor: theme.background, color: theme.text }}>
            <Navigation setScreen={setScreen} screen={screen} theme={theme} currentUser={currentUser} onLogout={handleLogout} />

            <hr style={{ border: `1px solid ${theme.border}`, width: '100%', margin: '0' }} />

            <div style={{ alignSelf: 'center', marginTop: '40px', textAlign: 'center' }}>
                <h1 style={{ margin: '0 0 10px 0', color: theme.primary }}>Welcome, {currentUser.username}!</h1>
                <p style={{ color: theme.textDim }}>Use this console to enter and view staff points.</p>
            </div>
        </div>
    );
}

function Navigation({ setScreen, screen, theme, currentUser, onLogout }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                <p style={{ fontWeight: 'bold', color: theme.primary, fontSize: '1.2em', margin: 0, marginRight: '10px' }}>Staff Points</p>
                <button style={navButtonStyle(screen === 'home', theme)} onClick={() => setScreen('home')}>Home</button>
                <button style={navButtonStyle(screen === 'view', theme)} onClick={() => setScreen('view')}>View Points</button>
                <button style={navButtonStyle(screen === 'enter', theme)} onClick={() => setScreen('enter')}>Enter Points</button>
                {currentUser.role === 'admin' && (
                    <button style={navButtonStyle(screen === 'admin', theme)} onClick={() => setScreen('admin')}>Admin</button>
                )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ color: theme.textDim, fontSize: '0.9em' }}>{currentUser.username} ({currentUser.role})</span>
                <button 
                    onClick={onLogout}
                    style={{ 
                        padding: '5px 10px', 
                        backgroundColor: 'transparent', 
                        color: '#ff5252', 
                        border: '1px solid #ff5252', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontSize: '0.8em'
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

function LoginScreen({ onLogin, theme }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(username, password);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: theme.background }}>
            <form onSubmit={handleSubmit} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '15px', 
                width: '100%', 
                maxWidth: '350px',
                padding: '40px',
                backgroundColor: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
            }}>
                <h1 style={{ color: theme.primary, textAlign: 'center', margin: '0 0 10px 0' }}>Staff Login</h1>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ color: theme.textDim, fontSize: '0.9em' }}>Username:</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        style={{ padding: '12px', borderRadius: '4px', border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceLight, color: theme.text }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ color: theme.textDim, fontSize: '0.9em' }}>Password:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        style={{ padding: '12px', borderRadius: '4px', border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceLight, color: theme.text }}
                    />
                </div>
                <button type="submit" style={{ 
                    padding: '12px', 
                    backgroundColor: theme.primary, 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginTop: '10px'
                }}>
                    Login
                </button>
            </form>
        </div>
    );
}

function AdminScreen({ setScreen, theme, API_URL, onLogout, currentUser }) {
    const [users, setUsers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('user');
    const [newStaffName, setNewStaffName] = useState('');

    const fetchData = React.useCallback(async () => {
        try {
            const uRes = await fetch(`${API_URL}/users`);
            const sRes = await fetch(`${API_URL}/staff`);
            if (uRes.ok) setUsers(await uRes.json());
            if (sRes.ok) setStaff(await sRes.json());
        } catch (e) { console.error(e); }
    }, [API_URL]);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            if (isMounted) await fetchData();
        };
        load();
        return () => { isMounted = false; };
    }, [fetchData]);

    const addUser = async (e) => {
        e.preventDefault();
        if (!newUsername || !newPassword) return;
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole })
        });
        if (res.ok) {
            setNewUsername(''); setNewPassword(''); fetchData();
        } else {
            alert('Failed to add user');
        }
    };

    const deleteUser = async (uname) => {
        if (uname === 'admin') return;
        const res = await fetch(`${API_URL}/users/${uname}`, { method: 'DELETE' });
        if (res.ok) fetchData();
    };

    const addStaff = async (e) => {
        e.preventDefault();
        if (!newStaffName) return;
        const res = await fetch(`${API_URL}/staff`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newStaffName })
        });
        if (res.ok) {
            setNewStaffName(''); fetchData();
        } else {
            alert('Failed to add staff');
        }
    };

    const deleteStaff = async (name) => {
        const res = await fetch(`${API_URL}/staff/${name}`, { method: 'DELETE' });
        if (res.ok) fetchData();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'start', padding: '20px', minHeight: '100vh', backgroundColor: theme.background, color: theme.text, width: '100%', boxSizing: 'border-box' }}>
            <Navigation setScreen={setScreen} screen="admin" theme={theme} currentUser={currentUser} onLogout={onLogout} />
            <hr style={{ border: `1px solid ${theme.border}`, width: '100%', margin: '0' }} />
            <h1 style={{ color: theme.primary }}>Admin Management</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', width: '100%' }}>
                <div style={{ backgroundColor: theme.surface, padding: '20px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                    <h2 style={{ color: theme.primary, marginTop: 0 }}>Manage Users</h2>
                    <form onSubmit={addUser} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                        <input placeholder="Username" value={newUsername} onChange={e => setNewUsername(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceLight, color: theme.text }} />
                        <input placeholder="Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceLight, color: theme.text }} />
                        <select value={newRole} onChange={e => setNewRole(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceLight, color: theme.text }}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button type="submit" style={{ padding: '10px', backgroundColor: theme.primary, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add User</button>
                    </form>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {users.map(u => (
                            <li key={u.username} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: `1px solid ${theme.border}` }}>
                                <span>{u.username} ({u.role})</span>
                                {u.username !== 'admin' && <button onClick={() => deleteUser(u.username)} style={{ color: '#ff5252', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>}
                            </li>
                        ))}
                    </ul>
                </div>

                <div style={{ backgroundColor: theme.surface, padding: '20px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                    <h2 style={{ color: theme.primary, marginTop: 0 }}>Manage Staff</h2>
                    <form onSubmit={addStaff} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input placeholder="Staff Name" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceLight, color: theme.text }} />
                        <button type="submit" style={{ padding: '10px', backgroundColor: theme.primary, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add Staff</button>
                    </form>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {staff.map(s => (
                            <li key={s.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: `1px solid ${theme.border}` }}>
                                <span>{s.name}</span>
                                <button onClick={() => deleteStaff(s.name)} style={{ color: '#ff5252', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function EnterPointsScreen({ setScreen, addSlip, theme, staffList, onLogout, currentUser }) {
    const getLocalDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [name, setName] = useState('');
    const [date, setDate] = useState(getLocalDateString(new Date()));
    const [points, setPoints] = useState('');
    const [hours, setHours] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const suggestions = name ? staffList.filter(s => s.name.toLowerCase().includes(name.toLowerCase())) : [];

    const handleSubmit = (e) => {
        e.preventDefault();
        const matchedStaff = staffList.find(s => s.name.toLowerCase() === name.toLowerCase());
        if (!matchedStaff) {
            alert('Please select a valid staff member from the list');
            return;
        }
        if (!date || !points || !hours) {
            alert('Please fill in all fields');
            return;
        }

        const newSlip = {
            name: matchedStaff.name, // Use the correct casing from the list
            date,
            points: parseFloat(points),
            hours: parseFloat(hours)
        };

        addSlip(newSlip);
        setName('');
        setPoints('');
        setHours('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'start', padding: '20px', minHeight: '100vh', backgroundColor: theme.background, color: theme.text }}>
            <Navigation setScreen={setScreen} screen="enter" theme={theme} currentUser={currentUser} onLogout={onLogout} />

            <hr style={{ border: `1px solid ${theme.border}`, width: '100%', margin: '0' }} />

            <h1 style={{ margin: '0', alignSelf: 'center', color: theme.primary }}>Enter Points</h1>

            <form onSubmit={handleSubmit} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '15px', 
                width: '100%', 
                maxWidth: '400px',
                alignSelf: 'center',
                padding: '30px',
                backgroundColor: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', position: 'relative' }}>
                    <label htmlFor="name" style={{ color: theme.textDim, fontSize: '0.9em' }}>Staff Name:</label>
                    <input 
                        id="name"
                        type="text" 
                        value={name} 
                        autoComplete="off"
                        onChange={(e) => { setName(e.target.value); setShowSuggestions(true); }} 
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="Type staff name..."
                        style={{ padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceLight, color: theme.text }}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <div style={{ 
                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, 
                            backgroundColor: theme.surfaceLight, border: `1px solid ${theme.border}`, 
                            borderRadius: '4px', maxHeight: '150px', overflowY: 'auto' 
                        }}>
                            {suggestions.map(s => (
                                <div key={s.name} onClick={() => { setName(s.name); setShowSuggestions(false); }} style={{ padding: '10px', cursor: 'pointer', borderBottom: `1px solid ${theme.border}` }}>
                                    {s.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label htmlFor="date" style={{ color: theme.textDim, fontSize: '0.9em' }}>Date:</label>
                    <input 
                        id="date"
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                        style={{ padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceLight, color: theme.text }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label htmlFor="points" style={{ color: theme.textDim, fontSize: '0.9em' }}>Points:</label>
                    <input 
                        id="points"
                        type="number" 
                        value={points} 
                        onChange={(e) => setPoints(e.target.value)} 
                        placeholder="Enter points"
                        style={{ padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceLight, color: theme.text }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label htmlFor="hours" style={{ color: theme.textDim, fontSize: '0.9em' }}>Hours:</label>
                    <input 
                        id="hours"
                        type="number" 
                        step="0.1"
                        value={hours} 
                        onChange={(e) => setHours(e.target.value)} 
                        placeholder="Enter hours"
                        style={{ padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceLight, color: theme.text }}
                    />
                </div>

                <button type="submit" style={{ 
                    padding: '12px', 
                    backgroundColor: theme.primary, 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginTop: '10px',
                    fontSize: '1em'
                }}>
                    Submit Slip
                </button>
            </form>
        </div>
    )
}

function ViewPointsScreen({ setScreen, pointsSlips, theme, onLogout, currentUser }) {
    const [selectedStaff, setSelectedStaff] = useState('');
    const [activeTab, setActiveTab] = useState('table');
    const tableContainerRef = React.useRef(null);

    const todayLocal = new Date();
    todayLocal.setHours(0, 0, 0, 0);
    const oneWeekAgo = new Date(todayLocal.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklySlips = pointsSlips.filter(p => p.date >= oneWeekAgo);
    
    const totalPointsWeek = weeklySlips.reduce((sum, p) => sum + p.points, 0);
    const totalHoursWeek = weeklySlips.reduce((sum, p) => sum + p.hours, 0);
    const avgPointsWeek = weeklySlips.length > 0 ? (totalPointsWeek / weeklySlips.length).toFixed(2) : 0;
    const avgHoursWeek = weeklySlips.length > 0 ? (totalHoursWeek / weeklySlips.length).toFixed(2) : 0;

    const staffNames = [...new Set(pointsSlips.map(p => p.name))].sort();
    
    const dates = [];
    for (let i = -14; i <= 14; i++) {
        const d = new Date(todayLocal);
        d.setDate(d.getDate() + i);
        dates.push(d);
    }

    useEffect(() => {
        if (activeTab === 'table' && tableContainerRef.current) {
            const todayIndex = 14; 
            const container = tableContainerRef.current;
            const scrollAmount = (todayIndex * 160); 
            container.scrollLeft = scrollAmount - (container.clientWidth / 2) + 80;
        }
    }, [activeTab]);

    const filteredSlips = pointsSlips
        .filter(p => p.name === selectedStaff)
        .sort((a, b) => a.date - b.date);

    const maxPoints = Math.max(...filteredSlips.map(p => p.points), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'stretch', width: '100%', padding: '20px', boxSizing: 'border-box', minHeight: '100vh', backgroundColor: theme.background, color: theme.text }}>
            <Navigation setScreen={setScreen} screen="view" theme={theme} currentUser={currentUser} onLogout={onLogout} />

            <hr style={{ border: `1px solid ${theme.border}`, width: '100%', margin: '0' }} />

            <div style={{ alignSelf: 'center', textAlign: 'center', backgroundColor: theme.surface, padding: '20px', borderRadius: '8px', border: `1px solid ${theme.primary}`, width: '100%', maxWidth: '600px', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
                <h3 style={{ margin: '0 0 15px 0', color: theme.primary }}>Weekly Stats (Last 7 Days)</h3>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <div>
                        <span style={{ color: theme.textDim }}>Total Points:</span> <strong style={{ color: theme.text }}>{totalPointsWeek.toFixed(1)}</strong><br/>
                        <span style={{ color: theme.textDim }}>Total Hours:</span> <strong style={{ color: theme.text }}>{totalHoursWeek.toFixed(1)}</strong>
                    </div>
                    <div>
                        <span style={{ color: theme.textDim }}>Avg Points/Slip:</span> <strong style={{ color: theme.text }}>{avgPointsWeek}</strong><br/>
                        <span style={{ color: theme.textDim }}>Avg Hours/Slip:</span> <strong style={{ color: theme.text }}>{avgHoursWeek}</strong>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}` }}>
                <button 
                    onClick={() => setActiveTab('table')}
                    style={{ 
                        padding: '12px 24px', 
                        cursor: 'pointer', 
                        border: 'none', 
                        backgroundColor: activeTab === 'table' ? theme.primary : 'transparent',
                        color: activeTab === 'table' ? 'white' : theme.textDim,
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                    }}
                >
                    Table View
                </button>
                <button 
                    onClick={() => setActiveTab('graph')}
                    style={{ 
                        padding: '12px 24px', 
                        cursor: 'pointer', 
                        border: 'none', 
                        backgroundColor: activeTab === 'graph' ? theme.primary : 'transparent',
                        color: activeTab === 'graph' ? 'white' : theme.textDim,
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                    }}
                >
                    Graph View
                </button>
            </div>

            {activeTab === 'table' ? (
                <div ref={tableContainerRef} style={{ overflowX: 'auto', width: '100%', border: `1px solid ${theme.border}`, borderRadius: '8px', backgroundColor: theme.surface }}>
                    <table style={{ borderCollapse: 'collapse', width: 'max-content' }}>
                        <thead>
                            <tr>
                                <th style={{ border: `1px solid ${theme.border}`, padding: '12px', backgroundColor: theme.surfaceLight, color: theme.primary, position: 'sticky', left: 0, zIndex: 1 }}>Staff Member</th>
                                {dates.map(date => (
                                    <th key={date.toISOString()} colSpan="2" style={{ 
                                        border: `1px solid ${theme.border}`, 
                                        padding: '12px', 
                                        backgroundColor: date.toDateString() === todayLocal.toDateString() ? 'rgba(1, 108, 74, 0.2)' : theme.surfaceLight,
                                        color: date.toDateString() === todayLocal.toDateString() ? theme.primary : theme.text,
                                        minWidth: '150px'
                                    }}>
                                        {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                <th style={{ border: `1px solid ${theme.border}`, padding: '5px', backgroundColor: theme.surfaceLight, position: 'sticky', left: 0, zIndex: 1 }}></th>
                                {dates.map(date => (
                                    <Fragment key={date.toISOString()}>
                                        <th style={{ border: `1px solid ${theme.border}`, padding: '8px', fontSize: '12px', backgroundColor: theme.surface, color: theme.textDim }}>1a (Pts)</th>
                                        <th style={{ border: `1px solid ${theme.border}`, padding: '8px', fontSize: '12px', backgroundColor: theme.surface, color: theme.textDim }}>1b (Hrs)</th>
                                    </Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {staffNames.map(name => (
                                <tr key={name}>
                                    <td style={{ border: `1px solid ${theme.border}`, padding: '12px', fontWeight: 'bold', backgroundColor: theme.surfaceLight, color: theme.text, position: 'sticky', left: 0, zIndex: 1 }}>{name}</td>
                                    {dates.map(date => {
                                        const slip = pointsSlips.find(p => p.name === name && p.date.toDateString() === date.toDateString());
                                        return (
                                            <Fragment key={date.toISOString()}>
                                                <td style={{ border: `1px solid ${theme.border}`, padding: '12px', textAlign: 'center', color: theme.text }}>{slip ? slip.points : '-'}</td>
                                                <td style={{ border: `1px solid ${theme.border}`, padding: '12px', textAlign: 'center', color: theme.text }}>{slip ? slip.hours : '-'}</td>
                                            </Fragment>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: theme.surface, padding: '30px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label htmlFor="staff-select" style={{ color: theme.textDim }}>Select Staff Member:</label>
                        <select
                            id="staff-select"
                            value={selectedStaff}
                            onChange={(e) => setSelectedStaff(e.target.value)}
                            style={{ 
                                padding: '10px', 
                                borderRadius: '4px', 
                                maxWidth: '300px', 
                                backgroundColor: theme.surfaceLight, 
                                color: theme.text,
                                border: `1px solid ${theme.border}`
                            }}
                        >
                            <option value="">--Select a name--</option>
                            {staffNames.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedStaff && filteredSlips.length > 0 ? (
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h2 style={{ color: theme.primary }}>Points Graph for {selectedStaff}:</h2>
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                gap: '15px',
                                height: '350px',
                                borderLeft: `2px solid ${theme.border}`,
                                borderBottom: `2px solid ${theme.border}`,
                                padding: '20px',
                                position: 'relative',
                                overflowX: 'auto',
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                borderRadius: '4px'
                            }}>
                                {filteredSlips.map((point, index) => {
                                    const height = (point.points / maxPoints) * 280; 
                                    return (
                                        <div key={index} style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            minWidth: '70px'
                                        }}>
                                            <div style={{
                                                width: '100%',
                                                height: `${height}px`,
                                                backgroundColor: theme.primary,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'flex-start',
                                                color: 'white',
                                                paddingTop: '5px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                borderRadius: '4px 4px 0 0',
                                                boxShadow: '0 -2px 4px rgba(0,0,0,0.2)'
                                            }}>
                                                {point.points}
                                            </div>
                                            <span style={{ fontSize: '11px', transform: 'rotate(-45deg)', marginTop: '25px', whiteSpace: 'nowrap', color: theme.textDim }}>
                                                {point.date.toLocaleDateString()}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: theme.textDim, textAlign: 'center', padding: '40px' }}>
                            {selectedStaff ? 'No data available for this staff member.' : 'Please select a staff member to see their performance graph.'}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

const navButtonStyle = (isActive, theme) => ({
    padding: '8px 16px',
    backgroundColor: isActive ? theme.primary : 'transparent',
    color: isActive ? 'white' : theme.text,
    border: `1px solid ${isActive ? theme.primary : theme.border}`,
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.2s'
});

export default App;

/*
<dl>
                {pointsSlips.map((point) => {
                    const pointsPerHour = (point.points / point.hours).toFixed(2);

                    return (
                        <Fragment key={point.name}>
                            <dt>
                                {point.name}
                            </dt>
                            <dd>
                                <ol>
                                    <li>Date: {point.date.toDateString()}</li>
                                    <li>Points: {point.points}</li>
                                    <li>Hours: {point.hours}</li>
                                    <li>Points per Hour: {pointsPerHour}</li>
                                </ol>
                            </dd>
                        </Fragment>
                    );
                })}
            </dl>
 */