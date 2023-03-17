import { waitFor } from '@testing-library/react';
import { connect } from 'http2';
import React, { useState } from 'react';
import './App.css';
//import { PushdownAutomata } from './pushdownAutomata';

const App:any = () => {

  type State = {
    readonly id: number,
    name: string,
    accept: boolean,
    start: boolean,
    x: number,
    y: number
  }
  
  type Transition = {
    readonly id: number,
    cState: State,
    cInput: string,
    cStack: string,
    nState: State,
    nStack: string
  }

  type Traversal = {
    targets: Traversal[],
    cStateId: number,
    cStack: string,
    cIHead: number,
    cSHead: number
  }

  type Connection = {
    cState: State,
    nState: State,
    transitionIds: number[];
  }

    const [stateId, setStateId] = useState(0);
    const [transitionId, setTransitionId] = useState(0);
    const [states, setStates] = useState<State[]>([]);
    const [transitions, setTransitions] = useState<Transition[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [accept, setAccept] = useState<string[]>([]);
    const [final, setFinal] = useState<number[]>([]);
    const [start, setStart] = useState<number>(0);
    const [input, setInput] = useState<string>('');
    const [stack, setStack] = useState<string>('Z');
    const [iHead, setIHead] = useState<number>(0);
    const [sHead, setSHead] = useState<number>(0);
    const [runTree, setRunTree] = useState<Traversal>({targets:[], cStateId:start, cStack:stack, cIHead:iHead, cSHead:sHead});

    const addState = (nameParam: string = '') => {
      if (states.filter(state => state.name == nameParam).length > 0) {
          console.log("That state already exists");
          return;
      }
      let newState:State = {
        id:stateId,
        name: nameParam,
        accept: false,
        start: false,
        x: 50,
        y: 50
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

    const SetStartState = (idParam:number) => {
      let prevStart = states.filter(state => state.start == true)[0];
      let sCopy = [...states];
      if (prevStart != undefined) {
        let prevIndex = sCopy.indexOf(prevStart);
        sCopy[prevIndex].start = false;
      }
      let newStart = states.filter(state => state.id == idParam)[0];
      let newIndex = states.indexOf(newStart);
      sCopy[newIndex].start = true;
      setStart(idParam);
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
         SetStartState(states[0].id);
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
      addConnection(newTransition.cState, newTransition.nState, newTransition.id);
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
      removeConnection(transitionParam.cState, transitionParam.nState, transitionParam.id)
    }

    const addConnection = (cState:State, nState:State, transitionId:number) => {
      let connectionIndex:number = connections.findIndex(c => ((c.cState.id == cState.id) && (c.nState.id == nState.id)));
      let tempConnect = [...connections];
      if (connectionIndex == -1) {
        connections.push({cState:cState, nState:nState, transitionIds:[transitionId]})
      } else {
        connections[connectionIndex].transitionIds.push(transitionId);
      }
    }

    const removeConnection = (cState:State, nState:State, transitionId:number) => {
      let connection:Connection = connections.filter(c => ((c.cState.id == cState.id) && (c.nState.id == nState.id)))[0];
      if (connection !== undefined) {
        let cIndex = connections.indexOf(connection);
        let tIndex = connection.transitionIds.indexOf(transitionId);

        connections[cIndex].transitionIds.splice(tIndex, 1);
        console.log(connections[cIndex]);
        if (connections[cIndex].transitionIds = []) {
          connections.splice(cIndex, 1);
        }
      }
      console.log("Connections at end of remove");
      console.log(connections);
      
    }

    const updateTransitionCState = (transitionParam:Transition, cStateName:string) => {
      let index:number = transitions.indexOf(transitionParam);
      let tCopy = [...transitions];
      removeConnection(tCopy[index].cState, tCopy[index].nState, tCopy[index].id);
      if (states.filter(state => state.name == cStateName).length < 1) {
        addState(cStateName);
      }
      let newState = states.filter(state => state.name == cStateName)[0];
      tCopy[index].cState = newState;
      setTransitions(tCopy);
      addConnection(tCopy[index].cState, tCopy[index].nState, tCopy[index].id);
      console.log("Connections at end of start");
      console.log(connections);
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
      removeConnection(tCopy[index].cState, tCopy[index].nState, tCopy[index].id);
      if (states.filter(state => state.name == nStateName).length < 1) {
        addState(nStateName);
      }
      let newState = states.filter(state => state.name == nStateName)[0];
      tCopy[index].nState = newState;
      setTransitions(tCopy);
      addConnection(tCopy[index].cState, tCopy[index].nState, tCopy[index].id)
    }

    const step = () => {
      let runParent:Traversal = runTree;
      let runChild:Traversal[] = [];
      let options:Transition[] = [];
      options = transitions.filter(transition => transition.cState.id == runParent.cStateId);
      options = options.filter(transition => transition.cStack == runParent.cStack[runParent.cSHead]);
      options = options.filter(transition => transition.cInput == input[runParent.cIHead]);
      if (options.length < 1) {
        return undefined;
      }
      options.forEach(option => {
        runChild.push({
          targets:[],
          cStateId:option.nState.id,
          cStack:stack,
          cIHead:iHead,
          cSHead:sHead
        });
      });
    }

    const populateTraversal = (pNode:Traversal):Traversal[] => {
      console.log(pNode.cIHead);
      let parent:Traversal = pNode;
      let options:Transition[] = [];
      let childTargets:Traversal[] = [];
      let child:Traversal;
      options = transitions.filter(transition => transition.cState.id == parent.cStateId);
      options = options.filter(transition => transition.cStack == parent.cStack[parent.cSHead]);
      options = options.filter(transition => transition.cInput == input[parent.cIHead]);
      if (options.length < 1) {
        if (parent.cIHead === input.length) {
          let finalTemp = final;
          finalTemp.push(parent.cStateId);
          setFinal(finalTemp);
        }
        return [];
      }
      options.forEach(option => {
        child = {
          targets:[],
          cStateId: option.nState.id,
          cStack: parent.cStack.slice(0, -1) + option.nStack,
          cIHead: parent.cIHead + 1,
          cSHead: parent.cSHead + option.nStack.length - 1
        };
        child.targets = populateTraversal(child);
        childTargets.push(child);
      });
      return childTargets;
    }

    const evaluate = ():boolean => {
      let result = false;
      final.forEach(stateId => {
        if (states.find(state => state.id === stateId)?.accept === true) {
          result = true;
        }
      });
      return result;
    }

    const run = () => {
      reset();
      let tempTree = runTree;
      console.log(tempTree.cIHead);
      let subTree:Traversal[] = populateTraversal(tempTree);
      tempTree.targets = subTree;
      console.log(tempTree);
      console.log(evaluate());
    }

    const reset = () => {
      setStack('Z');
      setSHead(0);
      setIHead(0);
      let empty:number[] = [];
      final.forEach(element => {
        final.pop();
      });
      let startTraversal:Traversal = {targets:[], cStateId:start, cStack:stack, cIHead:iHead, cSHead:sHead};
      setRunTree(startTraversal);
    }
    const [selected, setSelected] = useState<number>(-1);
    const [offset, setOffset] = useState({x:0, y:0});
    
    const getMousePosition = (evt:React.MouseEvent<SVGCircleElement|SVGSVGElement|SVGTextElement, MouseEvent>) => {
      var CTM = evt.currentTarget.getScreenCTM();
      if (CTM !== null) {
        return {
          x: (evt.clientX - CTM.e) / CTM.a,
          y: (evt.clientY - CTM.f) / CTM.d
        };
      }
      return {
        x: 0,
        y: 0
      };
    }

    const startDrag = (evt:React.MouseEvent<SVGCircleElement|SVGTextElement, MouseEvent>, id:number) => {
      let offsetTemp = getMousePosition(evt);
      let state = states.filter(state => state.id == id)[0];
      offsetTemp.x -= state.x;
      offsetTemp.y -= state.y;
      setOffset(offsetTemp);
      setSelected(id);
    }

    const drag = (evt:React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (selected !== -1) {
        let coord = getMousePosition(evt);
        let state = states.filter(state => state.id == selected)[0];
        let otherStates = states.filter(state => state.id !== selected);
        state.x = coord.x - offset.x;
        state.y = coord.y - offset.y;
        setStates([...otherStates, state]);
      }
    }

    const findMirrorConnections = (cState:State, nState:State):boolean => {
      let mConnections = connections.filter(c => ((c.cState == nState) && (c.nState == cState)));
      return mConnections.length > 0;
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
                    <input id='removeTransition' type= 'submit' className='remove' value='-' onClick={() => removeTransition(x)}/>
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
              <select className='txtStartSelect' onChange={(e) => SetStartState(Number(e.currentTarget.value))}>
                {states.map((x, i) => {return (<option value={states[i].id} key={i}>{states[i].name}</option>)})}
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
          <svg xmlns="http://www.w3.org/2000/svg" id="myCanvas" viewBox='0 0 100% 100%' className='guiSim' onMouseMove={(e) => drag(e)} onMouseUp={() => setSelected(-1)}>
            <defs>
              <marker 
                id='head' 
                orient="auto" 
                markerWidth='100' 
                markerHeight='100' 
                refX='15' 
                refY='3'
              >
                <path d='M0,0 V6 L5,3 Z' fill="white" />
              </marker>
              <filter x="0" y="0" width="1" height="1" id="solid">
                <feFlood floodColor="rgb(44, 44, 44)" result="bg" />
                <feMerge>
                  <feMergeNode in="bg"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <svg>
            {connections.map((x, i) => {
              if (x.cState == x.nState) {
                return (
                  <svg key={i}>
                    <path d={"M " + (x.cState.x - 2) + " " + x.cState.y + " a 30,30 45 1 1 1 0"} stroke="white" strokeWidth="0.5%" fill="transparent" />
                    <text filter="url(#solid)" x={x.cState.x + ((x.nState.x - x.cState.x) / 2)} y={x.cState.y - 50 + ((x.nState.y - x.cState.y) / 2)} fill='white' fontSize='20' textAnchor='middle'>
                      {x.transitionIds.map((y, i) => {
                        let transition = transitions.find(t => t.id == y);
                        if (transition !== undefined) {
                          return(
                            <tspan x={x.cState.x + ((x.nState.x - x.cState.x) / 2)} y={(x.cState.y - 50 + ((x.nState.y - x.cState.y) / 2)) - (i * 20)} key={i}>{transition.cInput + " " + transition.cStack + "/" + transition.nStack}</tspan>
                          );
                        }
                      })}
                    </text> 
                  </svg>
                );
              }
              if (findMirrorConnections(x.cState, x.nState)) {
                return (
                  <svg key={i}>
                    <path  markerEnd='url(#head)' d={"M " + x.cState.x + " " + x.cState.y + " Q " + (x.cState.x +((x.nState.x - x.cState.x) / 2)) + " " + ((x.cState.y +((x.nState.y - x.cState.y) / 2)) * ((x.nState.y - x.cState.y) > 0 ? 1.3 : 0.7)) + " " + x.nState.x + " " + x.nState.y} stroke="white" strokeWidth="0.5%" fill="none" />
                    <text  filter="url(#solid)" x={x.cState.x + ((x.nState.x - x.cState.x) / 2)} y={x.cState.y + ((x.nState.y - x.cState.y) / 2)} fill='white' fontSize='20' textAnchor='middle'>
                    {x.transitionIds.map((y, i) => {
                        let transition = transitions.find(t => t.id == y);
                        if (transition !== undefined) {
                          return(
                            <tspan x={x.cState.x + ((x.nState.x - x.cState.x) / 2)} y={(x.cState.y + ((x.nState.y - x.cState.y) / 2)) + ((x.nState.y - x.cState.y) > 0 ? 1 : -1) * (20 + (i * 20))} key={i}>{transition.cInput + " " + transition.cStack + "/" + transition.nStack}</tspan>
                          );
                        }
                      })}
                    </text> 
                  </svg>
                );
              }
                return (
                  <svg key={i}>
                    <path  markerEnd='url(#head)' d={"M " + x.cState.x + " " + x.cState.y + " L " + x.nState.x + " " + x.nState.y} stroke="white" strokeWidth="0.5%" fill="none" />
                    <text  filter="url(#solid)" x={x.cState.x + ((x.nState.x - x.cState.x) / 2)} y={x.cState.y + ((x.nState.y - x.cState.y) / 2)} fill='white' fontSize='20' textAnchor='middle'>
                    {x.transitionIds.map((y, i) => {
                        let transition = transitions.find(t => t.id == y);
                        if (transition !== undefined) {
                          return(
                            <tspan x={x.cState.x + ((x.nState.x - x.cState.x) / 2)} y={(x.cState.y + ((x.nState.y - x.cState.y) / 2)) - (i * 20)} key={i}>{transition.cInput + " " + transition.cStack + "/" + transition.nStack}</tspan>
                          );
                        }
                      })}
                    </text> 
                  </svg>
                );
            })}
            </svg>
            {states.map((x, i) => {return (
              <svg>
                <circle className='draggable' cx={x.x} cy={x.y} r="5%" stroke="white" strokeWidth="0.5%" fill="rgb(44, 44, 44)" onMouseDown={(e) => startDrag(e, x.id)} />
                <text x={x.x} y={x.y + 8} fill='white' fontSize='25' textAnchor='middle' onMouseDown={(e) => startDrag(e, x.id)}>{x.name}</text>
              </svg>
            )})}
          </svg>
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
