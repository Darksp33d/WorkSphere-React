import React, { useEffect, useState } from 'react';

const HelloWorld = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/hello/`)
            .then(response => response.json())
            .then(data => setMessage(data.message))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    return (
        <div>
            <h1>{message}</h1>
        </div>
    );
};

export default HelloWorld;
