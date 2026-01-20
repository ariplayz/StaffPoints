import { Fragment } from 'react';

let pointsSlips = [
    {name: 'John', date: new Date(), points: 761, hours: 1.2},
    {name: 'Bob', date: new Date(), points: 458, hours: 1.6},
    {name: 'Joe', date: new Date(), points: 6952, hours: 16},
    {name: 'Billy', date: new Date(), points: 10550, hours: 151},
    {name: 'Fred', date: new Date(), points: 215, hours: 0.7}
];

function showEnterPointsScreen(){
    
}

function EnterPointsScreen(){
    return(
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'start'}}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center'}}>
                <p>Staff Points</p>
                <button>View Points</button>
                <button onClick={showEnterPointsScreen}>Enter Points</button>
            </div>

            <hr style={{border: '2px solid #2d4c7a', width: '100%'}}/>

            <h1 style={{margin: '0', alignSelf: 'center'}}>Welcome to</h1>

        </div>
    )
}

function App() {
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'start'}}>
            <div style={{display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center'}}>
                <p>Staff Points</p>
                <button>View Points</button>
                <button onClick={showEnterPointsScreen}>Enter Points</button>
            </div>

            <hr style={{border: '2px solid #2d4c7a', width: '100%'}}/>

            <h1 style={{margin: '0', alignSelf: 'center'}}>Welcome to the Staff Points console.</h1>
            <p>Use this console to enter and view staff points.</p>

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
