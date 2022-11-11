import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { Badge, Button } from 'react-bootstrap';

export default function Timer( { callback } ) {

    const [max, setMax] = useState(5);

    const [counter, setCounter] = useState(max);

    useEffect(() => {
        if (counter>0) {
            setTimeout(()=>setCounter((counter-0.01).toFixed(2)),10);
        }
        else {
            callback();
            setCounter(max);
        }
    },[counter])

    const incrementaMax = () => {
        if (max < 60) {
            setMax(max+1);
        }
    };

    const decrementaMax = () => {
        if (max > 5) {
            setMax(max-1);
        }
    };

    return (
        <div className='mt-3'>

            <p className='d-inline m-2'>Intervalo de aquisição:</p>
            <Button size="sm" onClick={decrementaMax}>-</Button>
            <p className='d-inline m-3'>{max}</p>
            <Button size="sm" onClick={incrementaMax}>+</Button>

            <Badge className='d-inline m-3 bg-info'>{ counter }</Badge>
        </div>
    )
}
