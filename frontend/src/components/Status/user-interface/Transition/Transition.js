
import React, { useState, useEffect } from 'react';
import { PickList } from 'primereact/picklist';
import { useSelector } from 'react-redux';
import { fetchTransitions, getStatus } from '../../slice/status.slice';
import { useDispatch } from 'react-redux';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { OlangItem } from '../../../shared/Olang/user-interface/OlangItem/OlangItem';

export default function StatusTransition({filter , onChanged}) {
    const [source, setSource] = useState([]);
    const [target, setTarget] = useState([]);
    const status = useSelector(getStatus)
    const [transitions, setTransitions] = useState([]);

    const dispatch = useDispatch();

    const onChange = (event) => {
        setSource(event.source);
        setTarget(event.target);
        if(typeof onChanged === 'function') {
            onChanged({
                source: event.source,
                target: event.target
            });
        }
    };

    const itemTemplate = (item) => {
        return (
            <div className="flex flex-wrap p-2 align-items-center gap-3">
                <span className={`${item.icon}`}></span>
                <strong>{item.label}</strong>
            </div>
        );
    };

    const save = () => {
       
    }

    useEffect(() => {
        let selectedIds = transitions.map(t => +t.destId);
        let statusId = +transitions?.[0]?.srcId
        selectedIds.push(statusId);
        setSource(status.filter(s => !selectedIds.includes(+s.id)));
        setTarget(status.filter(s => selectedIds.includes(+s.id) && +s.id !== statusId));
    }, [status , transitions])

    useEffect(() => {
        if (filter) {
            dispatch(fetchTransitions(filter)).then(({payload}) => {
                setTransitions(payload?.result || []);
            })
        }
    }, [filter])

    return (
        <div className="car">
            <PickList dataKey="id" source={source} target={target} onChange={onChange} itemTemplate={itemTemplate} filter filterBy="label" breakpoint="1280px"
                sourceHeader="Available" targetHeader="Selected" sourceStyle={{ height: '24rem' }} targetStyle={{ height: '24rem' }}
                sourceFilterPlaceholder="Search by name" targetFilterPlaceholder="Search by name" />
            <Divider/>
            <div className='text-right'>
                <Button  className="p-button-sm"  >
                    <OlangItem onClick={save} olang="save"/>
                </Button>
            </div>
        </div>
    );
}
        