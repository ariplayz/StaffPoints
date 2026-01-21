import React, { Fragment, useState, useEffect } from 'react';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost/api/slips'
    : '/api/slips';

function App() {
    const [pointsSlips, setPointsSlips] = useState([]);
    const [screen, setScreen] = useState('home');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();
            // Convert date strings back to Date objects
            const formattedData = data.map(slip => {
                // Parse date string (YYYY-MM-DD) as local time to avoid timezone shifts
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
            if (!isSilent) setError('Could not connect to the server. Please ensure the backend is running.');
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    useEffect(() => {
        // Apply global background color to body
        document.body.style.backgroundColor = theme.background;
        document.body.style.color = theme.text;
        document.body.style.margin = '0';
        document.body.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';

        fetchSlips();

        // Refresh every 20 seconds
        const interval = setInterval(() => {
            fetchSlips(true);
        }, 20000);

        return () => clearInterval(interval);
    }, []);

    const addSlip = async (newSlip) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newSlip),
            });

            if (!response.ok) throw new Error('Failed to save data');
            
            // Refresh the list immediately after adding
            await fetchSlips(true);
        } catch (err) {
            console.error('Add slip error:', err);
            alert('Error saving points to the server.');
        }
    };

    if (loading && pointsSlips.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', backgroundColor: theme.background, minHeight: '100vh', color: theme.text }}>
                <h1>Loading points slips...</h1>
                <p>Connecting to the server on port 80...</p>
            </div>
        );
    }

    if (error && pointsSlips.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#ff5252', backgroundColor: theme.background, minHeight: '100vh' }}>
                <h1>Error</h1>
                <p>{error}</p>
                <button 
                    onClick={() => fetchSlips()}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: theme.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (screen === 'enter') {
        return <EnterPointsScreen setScreen={setScreen} addSlip={addSlip} theme={theme} />;
    }

    if (screen === 'view') {
        return <ViewPointsScreen setScreen={setScreen} pointsSlips={pointsSlips} theme={theme} />;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'start', padding: '20px', minHeight: '100vh', backgroundColor: theme.background, color: theme.text }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                <p style={{ fontWeight: 'bold', color: theme.primary, fontSize: '1.2em', margin: 0 }}>Staff Points</p>
                <button style={navButtonStyle(screen === 'home', theme)} onClick={() => setScreen('home')}>Home</button>
                <button style={navButtonStyle(screen === 'view', theme)} onClick={() => setScreen('view')}>View Points</button>
                <button style={navButtonStyle(screen === 'enter', theme)} onClick={() => setScreen('enter')}>Enter Points</button>
            </div>

            <hr style={{ border: `1px solid ${theme.border}`, width: '100%', margin: '0' }} />

            <div style={{ alignSelf: 'center', marginTop: '40px', textAlign: 'center' }}>
                <h1 style={{ margin: '0 0 10px 0', color: theme.primary }}>Welcome to the Staff Points console.</h1>
                <p style={{ color: theme.textDim }}>Use this console to enter and view staff points.</p>
            </div>
        </div>
    );
}

const navButtonStyle = (isActive, theme) => ({
    padding: '8px 16px',
    backgroundColor: isActive ? theme.primary : 'transparent',
    color: isActive ? 'white' : theme.textDim,
    border: `1px solid ${isActive ? theme.primary : theme.border}`,
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s'
});

function EnterPointsScreen({ setScreen, addSlip, theme }) {
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !date || !points || !hours) {
            alert('Please fill in all fields');
            return;
        }

        const newSlip = {
            name,
            date,
            points: parseFloat(points),
            hours: parseFloat(hours)
        };

        addSlip(newSlip);
        
        // Reset form
        setName('');
        setPoints('');
        setHours('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'start', padding: '20px', minHeight: '100vh', backgroundColor: theme.background, color: theme.text }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                <p style={{ fontWeight: 'bold', color: theme.primary, fontSize: '1.2em', margin: 0 }}>Staff Points</p>
                <button style={navButtonStyle(false, theme)} onClick={() => setScreen('home')}>Home</button>
                <button style={navButtonStyle(false, theme)} onClick={() => setScreen('view')}>View Points</button>
                <button style={navButtonStyle(true, theme)} onClick={() => setScreen('enter')}>Enter Points</button>
            </div>

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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label htmlFor="name" style={{ color: theme.textDim, fontSize: '0.9em' }}>Staff Name:</label>
                    <input 
                        id="name"
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Enter name"
                        style={{ padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceLight, color: theme.text }}
                    />
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

function ViewPointsScreen({ setScreen, pointsSlips, theme }) {
    const [selectedStaff, setSelectedStaff] = useState('');
    const [activeTab, setActiveTab] = useState('table');
    const tableContainerRef = React.useRef(null);

    // Calculate weekly stats (last 7 days)
    const todayLocal = new Date();
    todayLocal.setHours(0, 0, 0, 0);
    const oneWeekAgo = new Date(todayLocal.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklySlips = pointsSlips.filter(p => p.date >= oneWeekAgo);
    
    const totalPointsWeek = weeklySlips.reduce((sum, p) => sum + p.points, 0);
    const totalHoursWeek = weeklySlips.reduce((sum, p) => sum + p.hours, 0);
    const avgPointsWeek = weeklySlips.length > 0 ? (totalPointsWeek / weeklySlips.length).toFixed(2) : 0;
    const avgHoursWeek = weeklySlips.length > 0 ? (totalHoursWeek / weeklySlips.length).toFixed(2) : 0;

    const staffNames = [...new Set(pointsSlips.map(p => p.name))].sort();
    
    // For the table, we need a range of dates. Let's do 30 days around today.
    const dates = [];
    for (let i = -14; i <= 14; i++) {
        const d = new Date(todayLocal);
        d.setDate(d.getDate() + i);
        dates.push(d);
    }

    useEffect(() => {
        if (activeTab === 'table' && tableContainerRef.current) {
            const todayIndex = 14; // We started from -14 to 14, so index 14 is today
            const container = tableContainerRef.current;
            const scrollAmount = (todayIndex * 160); // approximate width of columns
            container.scrollLeft = scrollAmount - (container.clientWidth / 2) + 80;
        }
    }, [activeTab]);

    const filteredSlips = pointsSlips
        .filter(p => p.name === selectedStaff)
        .sort((a, b) => a.date - b.date);

    const maxPoints = Math.max(...filteredSlips.map(p => p.points), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'stretch', width: '100%', padding: '20px', boxSizing: 'border-box', minHeight: '100vh', backgroundColor: theme.background, color: theme.text }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                <p style={{ fontWeight: 'bold', color: theme.primary, fontSize: '1.2em', margin: 0 }}>Staff Points</p>
                <button style={navButtonStyle(false, theme)} onClick={() => setScreen('home')}>Home</button>
                <button style={navButtonStyle(true, theme)} onClick={() => setScreen('view')}>View Points</button>
                <button style={navButtonStyle(false, theme)} onClick={() => setScreen('enter')}>Enter Points</button>
            </div>

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
                                    const height = (point.points / maxPoints) * 280; // Max height 280px
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