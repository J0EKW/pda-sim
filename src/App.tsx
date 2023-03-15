import { waitFor } from '@testing-library/react';
import React, { useState } from 'react';
import './App.css';
//import { PushdownAutomata } from './pushdownAutomata';

const App:any = () => {

  type State = {
    readonly id: number,
    name: string,
    accept: boolean,
    start: boolean
  }
  
  type Transition = {
    readonly id: number,
    cState: State,
    cInput: string,
    cStack: string,
    nState: State,
    nStack: string
  }

    const [stateId, setStateId] = useState(0);
    const [transitionId, setTransitionId] = useState(0);
    const [states, setStates] = useState<State[]>([]);
    const [transitions, setTransitions] = useState<Transition[]>([]);
    const [accept, setAccept] = useState<string[]>([]);
    const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 })
    const [input, setInput] = useState<string>('');
    const [stack, setStack] = useState<string>('Z');
    
    const onMouseMove = (e:any) =>
      setCursorPosition({ top: e.screenY, left: e.screenX });

    const addState = (nameParam: string = '') => {
      if (states.filter(state => state.name == nameParam).length > 0) {
          console.log("That state already exists");
          return;
      }
      let newState:State = {
        id:stateId,
        name: nameParam,
        accept: false,
        start: false
      };
      states.push(newState);
      setStateId(stateId+1);
    }

    const removeState = (stateParam:State) => {
      let newStates = states.filter(state => state !== stateParam);
      let newAccept = accept.filter(state => state !== stateParam.name);
      setAccept(newAccept);
      setStates(newStates);
    }

    const SetStartState = (nameParam:string) => {
      let prevStart = states.filter(state => state.start == true)[0];
      if (prevStart != undefined) {
        let prevIndex = states.indexOf(prevStart);
        states[prevIndex].start = false;
      }
      let newStart = states.filter(state => state.name == nameParam)[0];
      let newIndex = states.indexOf(newStart);
      let sCopy = [...states];
      sCopy[newIndex].start = true;
      setStates(sCopy);
    }

    const SetAcceptState = (nameParam:string, indexParam:number) => {
      let aCopy = [...accept];
      let sCopy = [...states];
      aCopy[indexParam] = nameParam;
      for (let i= 0; i < sCopy.length; i++) {
        sCopy[i].accept = false;
        for (let j = 0; j < aCopy.length; j++) {
          if (sCopy[i].name == aCopy[j]) {
            sCopy[i].accept = true;
            break;
          }
        }
      }
      setAccept(aCopy);
      setStates(sCopy);
    }

    const addAccept = () => {
      let aCopy = [...accept];
      let sCopy = [...states];
      if (accept.length < states.length) {
        aCopy.push(states[0].name);
      }
      for (let i= 0; i < sCopy.length; i++) {
        sCopy[i].accept = false;
        for (let j = 0; j < aCopy.length; j++) {
          if (sCopy[i].name == aCopy[j]) {
            sCopy[i].accept = true;
            break;
          }
        }
      }
      setAccept(aCopy);
      setStates(sCopy);
    }

    const removeAccept = (nameParam:string) => {
      let aCopy = accept.filter(name => name != nameParam);
      let sCopy = [...states];
      for (let i= 0; i < sCopy.length; i++) {
        sCopy[i].accept = false;
        for (let j = 0; j < aCopy.length; j++) {
          if (sCopy[i].name == aCopy[j]) {
            sCopy[i].accept = true;
            break;
          }
        }
      }
      setAccept(aCopy);
      setStates(sCopy);
    }

    const updateStateName = (idParam:number, nameParam:string) => {
      let updateState:State = states.filter(state => state.id == idParam)[0];
      let index:number = states.indexOf(updateState)
      states[index].name = nameParam;
    }

    const addTransition = () => {
      if (states.length < 1) {
         addState('q0');
         SetStartState('q0');
      }
      let defaultState:State = states[0];
      let newTransition:Transition = {
        id:transitionId,
        cState: defaultState,
        cInput: '',
        cStack: '',
        nState: defaultState,
        nStack: ''
      };
      transitions.push(newTransition);
      setTransitionId(transitionId+1);
    }

    const removeTransition = (transitionParam:Transition) => {
      let newTransitions = transitions.filter(transition => transition !== transitionParam);
      setTransitions(newTransitions);
      let currentStates = newTransitions.filter(transition => transition.cState == transitionParam.cState);
      let newStates = newTransitions.filter(transition => transition.nState == transitionParam.nState);
      if (currentStates.length < 1) {
        removeState(transitionParam.cState);
      }
      if (newStates.length < 1) {
        removeState(transitionParam.nState);
      }
    }

    const updateTransitionCState = (transitionParam:Transition, cStateName:string) => {
      let index:number = transitions.indexOf(transitionParam);
      let tCopy = [...transitions];
      if (states.filter(state => state.name == cStateName).length < 1) {
        addState(cStateName);
      }
      let newState = states.filter(state => state.name == cStateName)[0];
      tCopy[index].cState = newState;
      setTransitions(tCopy);
    }

    const updateTransitionCInput = (transitionParam:Transition, cInputParam:string) => {
      let index:number = transitions.indexOf(transitionParam);
      let tCopy = [...transitions];
      tCopy[index].cInput = cInputParam;
      setTransitions(tCopy);
    }

    const updateTransitionCStack = (transitionParam:Transition, cStackParam:string) => {
      let index:number = transitions.indexOf(transitionParam);
      let tCopy = [...transitions];
      tCopy[index].cStack = cStackParam;
      setTransitions(tCopy);
    }

    const updateTransitionNStack = (transitionParam:Transition, nStackParam:string) => {
      let index:number = transitions.indexOf(transitionParam);
      let tCopy = [...transitions];
      tCopy[index].nStack = nStackParam;
      setTransitions(tCopy);
    }

    const updateTransitionNState = (transitionParam:Transition, nStateName:string) => {
      let index:number = transitions.indexOf(transitionParam);
      let tCopy = [...transitions];
      if (states.filter(state => state.name == nStateName).length < 1) {
        addState(nStateName);
      }
      let newState = states.filter(state => state.name == nStateName)[0];
      tCopy[index].nState = newState;
      setTransitions(tCopy);
    }

    const step = (transitions:Transition[], currentState:State, stack:string, input:string, stackHead:number, inputHead:number): undefined | { newState:State, newStack:string, stackHead:number, inputHead:number } => {
      let options:Transition[] = [];
      options = transitions.filter(transition => transition.cState == currentState);
      options = options.filter(transition => transition.cStack == stack[stackHead]);
      options = options.filter(transition => transition.cInput == input[inputHead]);
      if (options.length < 1) {
        return undefined;
      }
      currentState = options[0].nState;
      stack = stack.slice(stackHead, -1) + options[0].nStack;
      stackHead++;
      inputHead++;
      setStack(stack);
      return {newState:currentState, newStack:stack, stackHead:stackHead, inputHead:inputHead}
    }

    const run = async () => {
      let startState:State = states.filter(state => state.start == true)[0];
      let currentState:State = startState;
      let stackCopy:string = stack;
      let stackHead:number = 0;
      let inputHead:number = 0;
      
      while (inputHead < input.length) {
        let result = step(transitions, currentState, stackCopy, input, stackHead, inputHead);
        if (result == undefined) {
          break;
        }
        currentState = result.newState;
        stackCopy = result.newStack;
        stackHead = result.stackHead;
        inputHead = result.inputHead;
      }
      console.log(currentState.accept);
    }

    return (
      <div className="app">
        <link rel="stylesheet" href="./App.css"></link>
        <header>
          <h1>Pushdown Automata</h1>
          <p>Subtitle</p>
        </header>
        <div className='simWrapper'>
          <div className='simWrapperLeft'>
            <div id='txtTransitionsWrapper' className='txtTransitionsWrapper'>
              {transitions.map((x, i) => {
                return (
                  <div id={'transition' + i} className='transition' key={i}>
                    <div>{x.id}</div>
                    <input id='removeTransition' type='submit' className='remove' value='-' onClick={() => removeTransition(x)}/>
                    <input id='currentState' type='input' className='boxInput' value={x.cState.name} onChange={(e) => updateTransitionCState(x, e.currentTarget.value)}/>
                    <input id='currentInput' type='input' className='boxInput' value={x.cInput} onChange={(e) => updateTransitionCInput(x, e.currentTarget.value)} maxLength={1} />
                    <input id='currentStack' type='input' className='boxInput' value={x.cStack} onChange={(e) => updateTransitionCStack(x, e.currentTarget.value)} maxLength={1} />
                    <input id='newState' type='input' className='boxInput' value={x.nState.name} onChange={(e) => updateTransitionNState(x, e.currentTarget.value)}/>
                    <input id='newStack' type='input' className='boxInput' value={x.nStack} onChange={(e) => updateTransitionNStack(x, e.currentTarget.value)} maxLength={2} />
                  </div>
                )
              })}
              <input id='addTransition' type='submit' className='add' value='+' onClick={() => addTransition()}/>
            </div>
            <div className='txtStartWrapper'>
              <div className='txtStartLabel'>Start State</div>
              <select className='txtStartSelect' onChange={(e) => SetStartState(e.currentTarget.value)}>
                {states.map((x, i) => {return (<option value={states[i].name} key={i}>{states[i].name}</option>)})}
              </select>
            </div>
            <div className='txtAccept'>
              <div>Accepting State(s)</div>
              <div className='txtAcceptWrapper'>
                {accept.map((x, i) => {return (
                  <div key={i}>
                    <input id='removeAccept' type='submit' className='remove' value='-' onClick={() => removeAccept(x)}/>
                    <select className='txtAcceptSelect' value={x} onChange={(e) => SetAcceptState(e.currentTarget.value, i)}>
                      {states.map((x, i) => {return (
                        <option value={states[i].name} key={i}>{states[i].name}</option>
                      )})}
                    </select>
                  </div>
                )})}
                <input type='submit' className='add' value='+' onClick={() => addAccept()}/>
              </div>
            </div>
            <input type='submit' className='simStart' value='start' onClick={() => run()}/>
          </div>
          <div className='simWrapperRight'>
            <div className='guiSim'>Gui go here</div>
            <div className='stackWrapper'>
              <div className='stackLabel'>Stack</div>
              <div className='stackState'>{stack}</div>
            </div>
            <div className='inputWrapper'>
              <div className='inputLabel'>Input</div>
              <input type='text' className='inputInput' value={input} onChange={e => setInput(e.currentTarget.value)}/>
            </div>
          </div>
        </div>
        <div>
          {input}
        </div>
      </div>
  );
}

export default App;
//document.getElementById('txtTransitionWrapper').addEventListener('click', addTransition);
