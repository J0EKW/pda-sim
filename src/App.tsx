import { waitFor } from '@testing-library/react';
import { connect } from 'http2';
import React, { useState, useEffect } from 'react';
import { ContextMenu } from './contextMenu';
import './App.css';
import { truncateSync } from 'fs';
import { StateType, TransitionType, ConnectionType, TraversalType, ContextMenuPosType, OptionType } from './types';
import { transform } from 'typescript';
import gsap from 'gsap';
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

const App:any = () => {

    const [stateId, setStateId] = useState(0);
    const [transitionId, setTransitionId] = useState(0);
    const [connectionId, setconnectionId] = useState(0);
    const [states, setStates] = useState<StateType[]>([]);
    const [transitions, setTransitions] = useState<TransitionType[]>([]);
    const [connections, setConnections] = useState<ConnectionType[]>([]);
    const [accept, setAccept] = useState<number[]>([]);
    const [final, setFinal] = useState<number[]>([]);
    const [start, setStart] = useState<number>(0);
    const [input, setInput] = useState<string>('');
    const [stack, setStack] = useState<string>('Z');
    const [iHead, setIHead] = useState<number>(0);
    const [sHead, setSHead] = useState<number>(0);
    const [runTree, setRunTree] = useState<TraversalType>({targets:[], cStateId:start, cStack:stack, cIHead:iHead, cSHead:sHead});
    const [contextMenuVisible, setContextMenuVisible] = useState<Boolean>(false);
    const [contextMenuPos, setContextMenuPos] = useState<ContextMenuPosType>({x: 0, y: 0});
    const [contextMenuOptions, setContextMenuOptions] = useState<OptionType[]>([]);
    const [stateRenameVisible, setStateRenameVisible] = useState<Boolean>(false);
    const [selectedState, setSelectedState] = useState<number>(0);
    const [stateRenameVal, setStateRenameVal] = useState<string>('');

    const addState = (nameParam: string = '', statesParam:StateType[]):[newState:StateType, newStateId:number, states:StateType[]] => {
      if (states.filter(state => state.name == nameParam).length > 0) {
          console.log("That state already exists");
          return [states.filter(state => state.name == nameParam)[0], stateId, statesParam];
      }
      let newStates:StateType[] = [...statesParam];
      let newState:StateType = {
        id:stateId,
        name: nameParam,
        accept: false,
        start: false,
        x: 50,
        y: 50
      };
      newStates.push(newState);
      return [newState, stateId+1, newStates];
    }

    const removeState = (stateParamId:number, statesParam:StateType[]):StateType[] => {
      let newStates:StateType[] = states.filter(state => state.id !== stateParamId);
      return newStates;
    }

    const setStartState = (idParam:number, valueParam:boolean, statesParam:StateType[]):StateType[] => {
      let newStates = statesParam;
      let newState  = newStates.filter(state => state.id == idParam)[0];
      let newIndex  = newStates.indexOf(newState);
      
      newStates[newIndex].start = valueParam;
      return newStates;
    }

    const setAcceptState = (idParam:number, valueParam:boolean, statesParam:StateType[]):StateType[] => {
      console.log(idParam);
      let newStates = statesParam;
      let newState  = newStates.filter(state => state.id == idParam)[0];
      let newIndex  = newStates.indexOf(newState);
      
      newStates[newIndex].accept = valueParam;
      return newStates;
    }

    const addAccept = (idParam:number, acceptParam:number[], statesParam:StateType[]):[newAccept:number, newAccepts:number[]] => {
      let newAccepts = [...acceptParam];
      let newId = idParam;
      if (newAccepts.length < states.length) {
        if (idParam === -1) {
          newId = states.filter(state => state.accept !== true)[0].id;
        }
        if (newAccepts.filter(accept => accept === newId).length > 0) {
          console.log("That state is already an accepting state");
          return [newAccepts.filter(accept => accept === newId)[0], newAccepts];
        }
        newAccepts.push(newId);
        return [newId, newAccepts];
      }
      console.log("You can't add more accepting states than there are states");
      return [newId, newAccepts];
    }

    const removeAccept = (idParam:number, acceptParam:number[]):number[] => {
      let newAccept = [...acceptParam];
      newAccept = newAccept.filter(id => id != idParam);
      return newAccept;
    }

    const updateStateName = (idParam:number, nameParam:string) => {
      let updateState:StateType = states.filter(state => state.id == idParam)[0];
      let index:number = states.indexOf(updateState)
      states[index].name = nameParam;
    }

    const addTransition = (stateIdParam:number, transitionsParam:TransitionType[]):[newTransition:TransitionType, newTransitionId:number, transitions:TransitionType[]] => {
      let newTransitions:TransitionType[] = [...transitionsParam];
      let newTransition:TransitionType = {
        id:transitionId,
        cStateId: stateIdParam,
        cInput: '',
        cStack: '',
        nStateId: stateIdParam,
        nStack: ''
      };
      newTransitions.push(newTransition);
      return [newTransition, transitionId+1, newTransitions];
    }

    const removeTransition = (transitionIdParam:number, transitionsParam:TransitionType[]):TransitionType[] => {
      let newTransitions = transitionsParam.filter(transition => transition.id !== transitionIdParam);
      return newTransitions;
    }

    const addConnection = (cStateIdParam:number, nStateIdParam:number, transitionIdParam:number, connectionsParam:ConnectionType[]):[newConnection:ConnectionType, newConnectionId:number, connections:ConnectionType[]] => {
      let cIndex:number = connections.findIndex(c => ((c.cStateId == cStateIdParam) && (c.nStateId == nStateIdParam)));
      let newConnections:ConnectionType[] = [...connectionsParam];
      
      if (cIndex == -1) {
        let newConnection:ConnectionType = {
          id: connectionId,
          cStateId:cStateIdParam,
          nStateId:nStateIdParam,
          transitionIds:[transitionIdParam]
        }
        newConnections.push(newConnection);
        return [newConnection, connectionId+1, newConnections];
      } else {
        newConnections[cIndex].transitionIds.push(transitionIdParam);
        return [newConnections[cIndex], connectionId, newConnections];
      }
    }

    const removeConnectionTransition = (cStateIdParam:number, nStateIdParam:number, transitionIdParam:number, connectionsParam:ConnectionType[]):ConnectionType[] => {
      let newConnections:ConnectionType[] = [...connectionsParam];
      let connection:ConnectionType = newConnections.filter(c => ((c.cStateId == cStateIdParam) && (c.nStateId == nStateIdParam)))[0];
      
      if (connection !== undefined) {
        let connectionIndex = newConnections.indexOf(connection);
        newConnections[connectionIndex].transitionIds = newConnections[connectionIndex].transitionIds.filter(id => id !== transitionIdParam);
        if (newConnections[connectionIndex].transitionIds.length < 1) {
          newConnections.splice(connectionIndex, 1);
        }
      }

      return newConnections;
    }

    const removeConnection = (connectionIdParam:number, connectionsParam:ConnectionType[]):ConnectionType[] => {
      let newConnections:ConnectionType[] = [...connectionsParam];
      let connection:ConnectionType = newConnections.filter(c => c.id === connectionIdParam)[0];
      
      if (connection !== undefined) {
        let connectionIndex = newConnections.indexOf(connection);
        newConnections.splice(connectionIndex, 1);
      }

      return newConnections;
    }

    const step = () => {
      let runParent:TraversalType = runTree;
      let runChild:TraversalType[] = [];
      let options:TransitionType[] = [];
      options = transitions.filter(transition => transition.cStateId == runParent.cStateId);
      options = options.filter(transition => transition.cStack == runParent.cStack[runParent.cSHead]);
      options = options.filter(transition => transition.cInput == input[runParent.cIHead]);
      if (options.length < 1) {
        return undefined;
      }
      options.forEach(option => {
        runChild.push({
          targets:[],
          cStateId:option.nStateId,
          cStack:stack,
          cIHead:iHead,
          cSHead:sHead
        });
      });
    }

    const populateTraversal = (pNode:TraversalType):TraversalType[] => {
      console.log(pNode.cIHead);
      let parent:TraversalType = pNode;
      let options:TransitionType[] = [];
      let childTargets:TraversalType[] = [];
      let child:TraversalType;
      options = transitions.filter(transition => transition.cStateId == parent.cStateId);
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
          cStateId: option.nStateId,
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
      let subTree:TraversalType[] = populateTraversal(tempTree);
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
      let startTraversal:TraversalType = {targets:[], cStateId:start, cStack:stack, cIHead:iHead, cSHead:sHead};
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
        setContextMenuVisible(false);
        let coord = getMousePosition(evt);
        let state = states.filter(state => state.id == selected)[0];
        let otherStates = states.filter(state => state.id !== selected);
        state.x = (coord.x - offset.x);
        state.y = (coord.y - offset.y);
        setStates([...otherStates, state]);
      }
    }

    const findMirrorConnections = (cStateIdParam:number, nStateIdParam:number):boolean => {
      let mConnections = connections.filter(c => ((c.cStateId == nStateIdParam) && (c.nStateId == cStateIdParam)));
      return mConnections.length > 0;
    }

    const setupStateRename = (stateIdParam:number) => {
      setSelectedState(stateIdParam);
      setStateRenameVisible(true);
    }

    const stateContextMenu = (event:React.MouseEvent<SVGCircleElement|SVGTextElement, MouseEvent>, stateParam:StateType) => {
      event.preventDefault();
      setContextMenuVisible(true);
      setSelected(-1);
      let newOptions:OptionType[] = [];
      newOptions.push({
        label: 'remove',
        func: () => clientRemoveState(stateParam.id)
      });
      newOptions.push({
        label: 'rename',
        func: () => setupStateRename(stateParam.id)
      });
      setContextMenuPos({x: event.clientX, y: event.clientY});
      setContextMenuOptions(newOptions);
    }

    const transitionContextMenu = (event:React.MouseEvent<SVGCircleElement|SVGTextElement, MouseEvent>, transitionParam:TransitionType) => {
      event.preventDefault();
      setContextMenuVisible(true);
      setSelected(-1);
      let newOptions:OptionType[] = [];
      newOptions.push({
        label: 'remove',
        func: () => clientRemoveTransition(transitionParam)
      });
      setContextMenuPos({x: event.clientX, y: event.clientY});
      setContextMenuOptions(newOptions);
    }

    const clientRemoveTransition = (transitionParam:TransitionType):void => {
      let newTransitions:TransitionType[] = [...transitions];
      let newConnections:ConnectionType[] = [...connections];
      
      newTransitions = removeTransition(transitionParam.id, newTransitions);
      newConnections = removeConnectionTransition(transitionParam.cStateId, transitionParam.nStateId, transitionParam.id, newConnections);
      
      setTransitions(newTransitions);
      setConnections(newConnections);
    }

    const clientUpdateTransitionCState = (transitionParam:TransitionType, value:string):void => {
      let newTransitions:TransitionType[] = [...transitions];
      let newStates:StateType[]           = [...states];
      let newConnections:ConnectionType[] = [...connections];

      let index:number           = newTransitions.indexOf(transitionParam);
      let newStateId:number      = stateId;
      let newConnectionId:number = connectionId;
      let newConnection:ConnectionType;
      let newState:StateType;

      newConnections = removeConnectionTransition(newTransitions[index].cStateId, newTransitions[index].nStateId, newTransitions[index].id, newConnections);
      if (states.filter(state => state.name == value).length < 1) {
        [newState, newStateId, newStates] = addState(value, newStates);
      } else {
        newState = newStates.filter(state => state.name == value)[0];
      }

      newTransitions[index].cStateId = newState.id;
      [newConnection, newConnectionId, newConnections] = addConnection(newTransitions[index].cStateId, newTransitions[index].nStateId, newTransitions[index].id, newConnections);
      
      setStates(newStates);
      setStateId(newStateId);
      setTransitions(newTransitions);
      setConnections(newConnections);
      setconnectionId(newConnectionId);
    }

    const clientUpdateTransitionNState = (transitionParam:TransitionType, value:string):void => {
      let newTransitions:TransitionType[] = [...transitions];
      let newStates:StateType[]           = [...states];
      let newConnections:ConnectionType[] = [...connections];

      let index:number           = newTransitions.indexOf(transitionParam);
      let newStateId:number      = stateId;
      let newConnectionId:number = connectionId;
      let newConnection:ConnectionType;
      let newState:StateType;

      newConnections = removeConnectionTransition(newTransitions[index].cStateId, newTransitions[index].nStateId, newTransitions[index].id, newConnections);
      if (states.filter(state => state.name == value).length < 1) {
        [newState, newStateId, newStates] = addState(value, newStates);
      } else {
        newState = newStates.filter(state => state.name == value)[0];
      }

      newTransitions[index].nStateId = newState.id;
      [newConnection, newConnectionId, newConnections] = addConnection(newTransitions[index].cStateId, newTransitions[index].nStateId, newTransitions[index].id, newConnections);
      
      setStates(newStates);
      setStateId(newStateId);
      setTransitions(newTransitions);
      setConnections(newConnections);
      setconnectionId(newConnectionId);
    }

    const clientUpdateTransitionCInput = (transitionParam:TransitionType, value:string):void => {
      let newTransitions:TransitionType[] = [...transitions];
      let index:number = newTransitions.indexOf(transitionParam);
      
      newTransitions[index].cInput = value;
      
      setTransitions(newTransitions);
    }

    const clientUpdateTransitionCStack = (transitionParam:TransitionType, value:string):void => {
      let newTransitions:TransitionType[] = [...transitions];
      let index:number = newTransitions.indexOf(transitionParam);
      
      newTransitions[index].cStack = value;
      
      setTransitions(newTransitions);
    }

    const clientUpdateTransitionNStack = (transitionParam:TransitionType, value:string):void => {
      let newTransitions:TransitionType[] = [...transitions];
      let index:number = newTransitions.indexOf(transitionParam);
      
      newTransitions[index].nStack = value;
      
      setTransitions(newTransitions);
    }

    const clientAddTransition = ():void => {
      let newTransitions:TransitionType[] = [...transitions];
      let newStates:StateType[]           = [...states];
      let newConnections:ConnectionType[] = [...connections];

      let newStateId:number      = stateId;
      let newTransitionId:number = transitionId;
      let newConnectionId:number = connectionId;
      let newConnection:ConnectionType;
      let newTransition:TransitionType;
      let newState:StateType;

      
      if (newStates.length < 1) {
         [newState, newStateId, newStates] = addState('q0', newStates);
      } else {
        newState = states[0];
      }

      [newTransition, newTransitionId, newTransitions] = addTransition(newState.id, newTransitions);
      [newConnection, newConnectionId, newConnections] = addConnection(newTransition.cStateId, newTransition.nStateId, newTransition.id, newConnections);
      
      setStates(newStates);
      setStateId(newStateId);
      setTransitions(newTransitions);
      setTransitionId(newTransitionId);
      setConnections(newConnections);
      setconnectionId(newConnectionId);
    }

    const clientSetStartState = (value:string):void => {
      let newStates:StateType[] = [...states];

      newStates = setStartState(start, false, newStates); //removes old start state
      newStates = setStartState(Number(value), true, newStates); //adds new start state
      
      setStart(Number(value));
      setStates(newStates);
    }

    const clientSetAcceptState = (value:string, index:number):void => {
      let newStates:StateType[] = [...states];
      let newAccepts:number[]   = [...accept];

      newStates = setAcceptState(newAccepts[index], false, newStates); //removes old accept state
      newStates = setAcceptState(Number(value), true, newStates); //adds new accept state
      newAccepts[index] = Number(value);

      setAccept(newAccepts);
      setStates(newStates);
    }

    const clientRemoveAcceptSelector = (value:number):void => {
      let newStates:StateType[] = [...states];
      let newAccepts:number[]   = [...accept];

      newAccepts = removeAccept(value, newAccepts);
      newStates = setAcceptState(value, false, newStates);

      setAccept(newAccepts);
      setStates(newStates);
    }

    const clientRemoveState = (stateId:number): void => {
      let newStates:StateType[] = [...states];
      let newConnections:ConnectionType[] = [...connections];
      let newTransitions:TransitionType[] = [...transitions];

      newStates = removeState(stateId, newStates);

      let targetTransitions:TransitionType[] = newTransitions.filter(transition => (transition.cStateId === stateId) || (transition.nStateId === stateId));
      let targetConnections:ConnectionType[];

      targetTransitions.forEach(transition => {
        newTransitions    = removeTransition(transition.id, newTransitions);
        targetConnections = newConnections.filter(connection => connection.transitionIds.filter(id => id === transition.id).length > 0);
        targetConnections.forEach(connection => {
          newConnections = removeConnection(connection.id, newConnections);
        })
      });

      setStates(newStates);
      setTransitions(newTransitions);
      setConnections(newConnections);
    }

    const clientAddAcceptSelector = ():void => {
      let newStates:StateType[] = [...states];
      let newAccepts:number[]   = [...accept];
      let stateId:number;

      [stateId, newAccepts] = addAccept(-1, newAccepts, newStates); //-1 means it will choose the next available state
      if (stateId !== -1) {
        newStates = setAcceptState(stateId, true, newStates);
      }

      setAccept(newAccepts);
      setStates(newStates);
    }

    useEffect(() => {
      const handleClick = () => {
        setContextMenuVisible(false);
      };
      window.addEventListener('click', handleClick);
      return () => {
        window.removeEventListener("click", handleClick);
      };
    }, []);

    gsap.to("#ball", {
      duration: 5, 
      repeat: 12,
      repeatDelay: 3,
      yoyo: true,
      ease: "power1.inOut",
      motionPath:{
        path: "#path",
        align: "#path",
        autoRotate: true,
        alignOrigin: [0.5, 0.5]
      }
    });

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
                    <input id='removeTransition' type= 'submit' className='remove' value='-' onClick={() => clientRemoveTransition(x)}/>
                    <input id='currentState' type='input' className='boxInput' value={states.filter(state => state.id === x.cStateId)[0].name} onChange={(e) => clientUpdateTransitionCState(x, e.currentTarget.value)}/>
                    <input id='currentInput' type='input' className='boxInput' value={x.cInput} onChange={(e) => clientUpdateTransitionCInput(x, e.currentTarget.value)} maxLength={1} />
                    <input id='currentStack' type='input' className='boxInput' value={x.cStack} onChange={(e) => clientUpdateTransitionCStack(x, e.currentTarget.value)} maxLength={1} />
                    <input id='newState' type='input' className='boxInput' value={states.filter(state => state.id === x.nStateId)[0].name} onChange={(e) => clientUpdateTransitionNState(x, e.currentTarget.value)}/>
                    <input id='newStack' type='input' className='boxInput' value={x.nStack} onChange={(e) => clientUpdateTransitionNStack(x, e.currentTarget.value)} maxLength={2} />
                  </div>
                )
              })}
              <input id='addTransition' type='submit' className='add' value='+' onClick={() => clientAddTransition()}/>
            </div>
            <div className='txtStartWrapper'>
              <div className='txtStartLabel'>Start State</div>
              <select className='txtStartSelect' onChange={(e) => clientSetStartState(e.currentTarget.value)}>
                {states.map((x, i) => {return (<option value={states[i].id} key={i}>{states[i].name}</option>)})}
              </select>
            </div>
            <div className='txtAccept'>
              <div>Accepting State(s)</div>
              <div className='txtAcceptWrapper'>
                {accept.map((x, i) => {return (
                  <div key={i}>
                    <input id='removeAccept' type='submit' className='remove' value='-' onClick={() => clientRemoveAcceptSelector(x)}/>
                    <select className='txtAcceptSelect' value={states.filter(state => state.id === x)[0].id} onChange={(e) => clientSetAcceptState(e.currentTarget.value, i)}>
                      {states.map((x, i) => {return (
                        <option value={states[i].id} key={i}>{states[i].name}</option>
                      )})}
                    </select>
                  </div>
                )})}
                <input type='submit' className='add' value='+' onClick={() => clientAddAcceptSelector()}/>
              </div>
            </div>
            <input type='submit' className='simStart' value='start' onClick={() => run()}/>
          </div>
          <div className='simWrapperRight'>
            {stateRenameVisible && 
            <div className='renameStateWrapper'>
              <div className='renameStateLabel'>Please Enter the new State name</div>
              <input className='remove' type='submit' value='x' onClick={() => setStateRenameVisible(false)}/>
              <input className='renameStateInput' type='text' maxLength={2} onChange={(e) => setStateRenameVal(e.currentTarget.value)}></input>
              <input className='add' type='submit' value='🗸' onClick={() => {updateStateName(selectedState, stateRenameVal); setStateRenameVisible(false);}} />
            </div>}
          <svg xmlns="http://www.w3.org/2000/svg" id="myCanvas" viewBox='0 0 100% 100%' width='100%' height='100%' className='guiSim' onMouseMove={(e) => drag(e)} onMouseUp={() => setSelected(-1)}>
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
              let cState = states.filter(state => state.id === x.cStateId)[0];
              let nState = states.filter(state => state.id === x.nStateId)[0];
              if (cState !== undefined) {
                if (x.cStateId == x.nStateId) {
                  let txtId:string = "transition" + x.id;
                  return (
                    <svg key={i}>
                      <path id={txtId} d={"M " + (cState.x - 2) + " " + cState.y + " a 30,30 45 1 1 1 0"} stroke='white' strokeWidth="0.5%" fill="transparent" />
                      <text filter="url(#solid)" x={cState.x} y={cState.y - 50} fill='white' fontSize='20' textAnchor='middle'>
                        {x.transitionIds.map((y, i) => {
                          let transition = transitions.find(t => t.id == y);
                          if (transition !== undefined) {
                            let t:TransitionType = transition;
                            return(
                              <tspan x={cState.x} y={cState.y - 50 - (i * 20)} key={i} onContextMenu={e => transitionContextMenu(e, t)}>{transition.cInput + " " + transition.cStack + "/" + transition.nStack}</tspan>
                            );
                          }
                        })}
                      </text> 
                    </svg>
                  );
                }
                if (findMirrorConnections(x.cStateId, x.nStateId)) {
                  return (
                    <svg key={i}>
                      <path markerEnd='url(#head)' d={"M " + cState.x + " " + cState.y + " Q " + (cState.x +((nState.x - cState.x) / 2)) + " " + ((cState.y +((nState.y - cState.y) / 2)) * ((nState.y - cState.y) > 0 ? 1.3 : 0.7)) + " " + nState.x + " " + nState.y} stroke="white" strokeWidth="0.5%" fill="none" />
                      <text filter="url(#solid)" x={cState.x + ((nState.x - cState.x) / 2)} y={cState.y + ((nState.y - cState.y) / 2)} fill='white' fontSize='20' textAnchor='middle'>
                      {x.transitionIds.map((y, i) => {
                          let transition = transitions.find(t => t.id == y);
                          if (transition !== undefined) {
                            let t:TransitionType = transition;
                            return(
                              <tspan x={cState.x + ((nState.x - cState.x) / 2)} y={(cState.y + ((nState.y - cState.y) / 2)) + ((nState.y - cState.y) > 0 ? 1 : -1) * (20 + (i * 20))} key={i} onContextMenu={e => transitionContextMenu(e, t)}>{transition.cInput + " " + transition.cStack + "/" + transition.nStack}</tspan>
                            );
                          }
                        })}
                      </text> 
                    </svg>
                  );
                }
                return (
                  <svg key={i}>
                    <path markerEnd='url(#head)' d={"M " + cState.x + " " + cState.y + " L " + nState.x + " " + nState.y} stroke="white" strokeWidth="0.5%" fill="none" />
                    <text filter="url(#solid)" x={cState.x + ((nState.x - cState.x) / 2)} y={cState.y + ((nState.y - cState.y) / 2)} fill='white' fontSize='20' textAnchor='middle'>
                    {x.transitionIds.map((y, i) => {
                        let transition = transitions.find(t => t.id == y);
                        if (transition !== undefined) {
                          let t:TransitionType = transition;
                          return(
                            <tspan x={cState.x + ((nState.x - cState.x) / 2)} y={(cState.y + ((nState.y - cState.y) / 2)) - (i * 20)} key={i} onContextMenu={e => transitionContextMenu(e, t)}>{transition.cInput + " " + transition.cStack + "/" + transition.nStack}</tspan>
                          );
                        }
                      })}
                    </text> 
                  </svg>
                );
              }
            })}
            </svg>
            {states.map((x, i) => {return (
              <svg>
                <circle className='draggable svg' cx={x.x} cy={x.y} r="5%" stroke="white" strokeWidth="0.5%" fill="rgb(44, 44, 44)" onMouseDown={(e) => startDrag(e, x.id)} onContextMenu={e => stateContextMenu(e, x)}/>
                <text className='svg' x={x.x} y={x.y + 8} fill='white' fontSize='25' textAnchor='middle' onMouseDown={(e) => startDrag(e, x.id)} onContextMenu={e => stateContextMenu(e, x)}>{x.name}</text>
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
        {contextMenuVisible && <ContextMenu left={contextMenuPos.x} top={contextMenuPos.y} options={contextMenuOptions}/>}
      </div>
  );
}

export default App;
//document.getElementById('txtTransitionWrapper').addEventListener('click', addTransition);
