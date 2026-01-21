import { Fragment, useState, useEffect } from 'react';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost/api/slips'
    : '/api/slips';

function App() {
    const [pointsSlips, setPointsSlips] = useState([]);
    const [screen, setScreen] = useState('home');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSlips = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();
            // Convert date strings back to Date objects
            const formattedData = data.map(slip => ({
                ...slip,
                date: new Date(slip.date)
            }));
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
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1>Loading points slips...</h1>
                <p>Connecting to the server on port 80...</p>
            </div>
        );
    }

    if (error && pointsSlips.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
                <h1>Error</h1>
                <p>{error}</p>
                <button onClick={() => fetchSlips()}>Retry</button>
            </div>
        );
    }

    if (screen === 'enter') {
        return <EnterPointsScreen setScreen={setScreen} addSlip={addSlip} />;
    }

    if (screen === 'view') {
        return <ViewPointsScreen setScreen={setScreen} pointsSlips={pointsSlips} />;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                <p>Staff Points</p>
                <button onClick={() => setScreen('home')}>Home</button>
                <button onClick={() => setScreen('view')}>View Points</button>
                <button onClick={() => setScreen('enter')}>Enter Points</button>
            </div>

            <hr style={{ border: '2px solid #2d4c7a', width: '100%' }} />

            <h1 style={{ margin: '0', alignSelf: 'center' }}>Welcome to the Staff Points console.</h1>
            <p>Use this console to enter and view staff points.</p>
        </div>
    );
}

function EnterPointsScreen({ setScreen, addSlip }) {
    const [name, setName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
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
            date, // String YYYY-MM-DD
            points: parseFloat(points),
            hours: parseFloat(hours)
        };

        addSlip(newSlip);
        
        // Reset form
        setName('');
        setPoints('');
        setHours('');
        alert('Points entered successfully!');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                <p>Staff Points</p>
                <button onClick={() => setScreen('home')}>Home</button>
                <button onClick={() => setScreen('view')}>View Points</button>
                <button onClick={() => setScreen('enter')}>Enter Points</button>
            </div>

            <hr style={{ border: '2px solid #2d4c7a', width: '100%' }} />

            <h1 style={{ margin: '0', alignSelf: 'center' }}>Enter Points</h1>

            <form onSubmit={handleSubmit} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '15px', 
                width: '100%', 
                maxWidth: '400px',
                alignSelf: 'center',
                padding: '20px',
                border: '1px solid #ccc',
                borderRadius: '8px'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label htmlFor="name">Staff Name:</label>
                    <input 
                        id="name"
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Enter name"
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label htmlFor="date">Date:</label>
                    <input 
                        id="date"
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label htmlFor="points">Points:</label>
                    <input 
                        id="points"
                        type="number" 
                        value={points} 
                        onChange={(e) => setPoints(e.target.value)} 
                        placeholder="Enter points"
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label htmlFor="hours">Hours:</label>
                    <input 
                        id="hours"
                        type="number" 
                        step="0.1"
                        value={hours} 
                        onChange={(e) => setHours(e.target.value)} 
                        placeholder="Enter hours"
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <button type="submit" style={{ 
                    padding: '10px', 
                    backgroundColor: '#2d4c7a', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginTop: '10px'
                }}>
                    Submit Slip
                </button>
            </form>
        </div>
    )
}

function ViewPointsScreen({ setScreen, pointsSlips }) {
    const [selectedStaff, setSelectedStaff] = useState('');

    const staffNames = [...new Set(pointsSlips.map(p => p.name))];
    const filteredSlips = pointsSlips
        .filter(p => p.name === selectedStaff)
        .sort((a, b) => a.date - b.date);

    const maxPoints = Math.max(...filteredSlips.map(p => p.points), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                <p>Staff Points</p>
                <button onClick={() => setScreen('home')}>Home</button>
                <button onClick={() => setScreen('view')}>View Points</button>
                <button onClick={() => setScreen('enter')}>Enter Points</button>
            </div>

            <hr style={{ border: '2px solid #2d4c7a', width: '100%' }} />

            <h1 style={{ margin: '0', alignSelf: 'center' }}>View Points</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label htmlFor="staff-select">Select Staff Member:</label>
                <select
                    id="staff-select"
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    style={{ padding: '5px', borderRadius: '4px' }}
                >
                    <option value="">--Select a name--</option>
                    {staffNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', gap: '40px', alignItems: 'start', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                    <h2>List of Slips:</h2>
                    <dl>
                        {(selectedStaff ? filteredSlips : pointsSlips).map((point, index) => {
                            const pointsPerHour = (point.points / point.hours).toFixed(2);

                            return (
                                <Fragment key={`${point.name}-${index}`}>
                                    <dt style={{ fontWeight: 'bold', backgroundColor: '#2d4c7a', color: 'white', borderRadius: '5px', paddingLeft: '10px' }}>
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
                </div>

                {selectedStaff && filteredSlips.length > 0 && (
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <h2>Points Graph:</h2>
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: '10px',
                            height: '200px',
                            borderLeft: '2px solid black',
                            borderBottom: '2px solid black',
                            padding: '10px',
                            position: 'relative'
                        }}>
                            {filteredSlips.map((point, index) => {
                                const height = (point.points / maxPoints) * 150; // Max height 150px
                                return (
                                    <div key={index} style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        flex: 1
                                    }}>
                                        <div style={{
                                            width: '100%',
                                            height: `${height}px`,
                                            backgroundColor: '#2d4c7a',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'flex-start',
                                            color: 'white',
                                            fontSize: '10px'
                                        }}>
                                            {point.points}
                                        </div>
                                        <span style={{ fontSize: '10px', transform: 'rotate(-45deg)', marginTop: '10px', whiteSpace: 'nowrap' }}>
                                            {point.date.toLocaleDateString()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

        </div>
    )
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