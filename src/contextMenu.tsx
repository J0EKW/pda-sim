import React, { useEffect, useState } from 'react';
import { isPropertySignature } from 'typescript';
import './App.css';

type Option = {
    label: string,
    func: any
}

type contextMenuProps = {
    left: number,
    top: number,
    options: Option[]
}

export const ContextMenu = (props: contextMenuProps) => {
    return (
        <div id='contextMenu' style={{ left: props.left, top: props.top }}>
            {props.options.map((x, i) => {
                return(
                    <input className='contextMenuOption' key={i} type='submit' value={x.label} onClick={x.func} />
                );
            })}
        </div>
    )
}