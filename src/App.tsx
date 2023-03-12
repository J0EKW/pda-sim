import React from 'react';
import { useState } from "react";
import logo from './logo.svg';
import './App.css';
import ReactDOM from 'react-dom/client';
import { idText } from 'typescript';

interface Transition {
  id: string;
  currentState: string;
  currentStack: string;
  currentInput: string;
  newState: string;
  newStack: string;
}

interface AppState {
  rowList: Transition[];
}

class App extends React.Component<{}, AppState> {
  
  constructor(props:any) {
    super(props);
    this.state = {
      rowList: []
    };
  }
  
  add() {
    const uuid = require("uuid");
    let newTransition:Transition = {
      id: uuid.v4(),
      currentState:"",
      currentStack: "",
      currentInput: "",
      newState: "",
      newStack: "",
    };
    let rowList = [...this.state.rowList, newTransition];
    this.setState({ rowList });
  }

  remove(id:string) {
    let rowList = [...this.state.rowList];
    console.log(rowList);
    rowList = rowList.filter((item) => item.id !== id)
    console.log(rowList);
    this.setState({ rowList });
  }

  change(item:string, index:number) {
    let rowList = [...this.state.rowList];
    rowList[index].currentState = item;
    this.setState({ rowList });
  }

  render() {
    let {rowList} = this.state;
    return (
      <div className="app">
        <link rel="stylesheet" href="./App.css"></link>
        <header>
          <h1>Pushdown Automata</h1>
          <p>Skooble da drungus btw Pigsy is hella gay for Tang and thats fax squadalaaaaaaaaaaaaaaaaaaaa</p>
        </header>
        <div className='simWrapper'>
          <div className='simWrapperLeft'>
            <div id='txtTransitionsWrapper' className='txtTransitionsWrapper'>
              {rowList.map((x, i) => {
                return (
                  <div id={'transition' + i} className='transition' key={i}>
                    <div>{i}</div>
                    <input id='removeTransition' type='submit' className='remove' value='-' onClick={() => this.remove(x.id)}/>
                    <input id='currentState' type='input' className='boxInput' value={x.currentState} onChange={(e) => this.change(e.target.value, i)}/>
                    <input id='currentInput' type='input' className='boxInput' onChange={(e) => x.currentInput = e.currentTarget.value}/>
                    <input id='currentStack' type='input' className='boxInput' onChange={(e) => this.state.rowList[i].currentStack = e.currentTarget.value}/>
                    <input id='newState' type='input' className='boxInput' onChange={(e) => this.state.rowList[i].newState = e.currentTarget.value}/>
                <input id='newStack' type='input' className='boxInput' onChange={(e) => this.state.rowList[i].newStack = e.currentTarget.value}/>
                  </div>
                )
              })}
              <input id='addTransition' type='submit' className='add' value='+' onClick={() => this.add()}/>
            </div>
            <div className='txtStartWrapper'>
              <div className='txtStartLabel'>Start State</div>
              <select className='txtStartSelect'>
                {rowList.map((x, i) => {
                  return (
                      <option value={this.state.rowList[i].currentState}>{this.state.rowList[i].currentState}</option>
                  )
                })}
              </select>
            </div>
            <div className='txtAccept'>
              <div>Accepting State(s)</div>
              <div className='txtAcceptWrapper'>
                <input type='submit' className='add' value='+'/>
              </div>
            </div>
            <input type='submit' className='simStart' value='start'/>
          </div>
          <div className='simWrapperRight'>
            <div className='guiSim'>Gui go here</div>
            <div className='stackWrapper'>
              <div className='stackLabel'>Stack</div>
              <div className='stackState'></div>
            </div>
            <div className='inputWrapper'>
              <div className='inputLabel'>Input</div>
              <input type='text' className='inputInput'/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
//document.getElementById('txtTransitionWrapper').addEventListener('click', addTransition);
