import React, { useState, useEffect } from 'react';
import { ContextMenu } from './contextMenu';
import './App.css';
import { StateType, TransitionType, ConnectionType, TraversalType, ContextMenuPosType, OptionType, ExampleType } from './types';
import gsap from 'gsap';
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { automataExamples } from './examples';

gsap.registerPlugin(MotionPathPlugin);
const App:any = () => {

    const [stateId, setStateId] = useState(0);
    const [transitionId, setTransitionId] = useState(0);
    const [connectionId, setConnectionId] = useState(0);
    const [traversalId, setTraversalId] = useState<number>(0);
    const [states, setStates] = useState<StateType[]>([]);
    const [transitions, setTransitions] = useState<TransitionType[]>([]);
    const [connections, setConnections] = useState<ConnectionType[]>([]);
    const [accept, setAccept] = useState<number[]>([]);
    const [start, setStart] = useState<number>(0);
    const [input, setInput] = useState<string>('');
    const [stack, setStack] = useState<string>('Z');
    const [iHead, setIHead] = useState<number>(0);
    const [sHead, setSHead] = useState<number>(0);
    const [runTree, setRunTree] = useState<TraversalType[]>([{id:traversalId, parentId:-1, cStateId:start, cStack:stack, cIHead:iHead, cSHead:sHead}]);
    const [runPath, setRunPath] = useState<TraversalType[]>(runTree);
    const [contextMenuVisible, setContextMenuVisible] = useState<Boolean>(false);
    const [contextMenuPos, setContextMenuPos] = useState<ContextMenuPosType>({x: 0, y: 0});
    const [contextMenuOptions, setContextMenuOptions] = useState<OptionType[]>([]);
    const [stateRenameVisible, setStateRenameVisible] = useState<Boolean>(false);
    const [selectedState, setSelectedState] = useState<number>(0);
    const [stateRenameVal, setStateRenameVal] = useState<string>('');
    const [currentTraversalId, setCurrentTraversalId] = useState<number>(0);
    const [acceptTraversalId, setacceptTraversalId] = useState<number>(-1);
    const [removeAnimElem, setRemoveAnimElem] = useState<boolean>(false);
    const [runTreeSet, setRunTreeSet] = useState<boolean>(false);
    const [examples, setExamples] = useState<ExampleType[]>(automataExamples);

    const addState = (nameParam: string = '', statesParam:StateType[]):[newState:StateType, newStateId:number, states:StateType[]] => {
      if (states.filter(state => state.name == nameParam).length > 0) {
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
          return [newAccepts.filter(accept => accept === newId)[0], newAccepts];
        }
        newAccepts.push(newId);
        return [newId, newAccepts];
      }
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

    const clientReset = ():void => {
      let startTraversal:TraversalType = {id:0, parentId:-1, cStateId:start, cStack:'Z', cIHead:0, cSHead:0};
      gsap.killTweensOf("*");
      runPath.forEach((x, i) => {
        let animBall = document.getElementById('animBall' + i);
        let animPulse = document.getElementById('animPulse' + i);
        let animPulseSuccess = document.getElementById('animSuccessPulse' + i);

        animBall?.remove();
        animPulse?.remove();
        animPulseSuccess?.remove();
      });
      let animPulseSuccess = document.getElementById('animSuccessPulse' + runPath.length + 1);
      animPulseSuccess?.remove();
      setStack('Z');
      setSHead(0);
      setIHead(0);
      setRunTree([startTraversal]);
      setRunPath([startTraversal]);
      setTraversalId(0);
      setRemoveAnimElem(true);
      setRunTreeSet(false);
      setacceptTraversalId(-1);
      let stackTxt = document.getElementById('stack')
          if (stackTxt) {
            stackTxt.innerHTML = 'Z';
          }
    }
    useEffect(() => {
      
      setRemoveAnimElem(false);
    }, [removeAnimElem]);
    
    const clientStep = (): void => {
      let newRunTree:TraversalType[] = [];
      let path:TraversalType[] = runPath;
      let traversalId:number = currentTraversalId;
      let acceptId:number = acceptTraversalId;

      if (!runTreeSet) {
        newRunTree = [{id:0, parentId:-1, cStateId:start, cStack:'Z', cIHead:0, cSHead:0}];
        traversalId = 0;
        let transitionOptions:TransitionType[] = [];
        let tempId:number = 1;
        for (let index = 0; index < newRunTree.length; index++) {
          transitionOptions = transitions.filter(transition => transition.cStateId === newRunTree[index].cStateId);
          transitionOptions = transitionOptions.filter(transition => transition.cInput === input[newRunTree[index].cIHead]);
          transitionOptions = transitionOptions.filter(transition => transition.cStack === newRunTree[index].cStack[newRunTree[index].cSHead]);
          if (transitionOptions.length > 0) {
            transitionOptions.forEach(transition => {
              let newStack:string = newRunTree[index].cStack.slice(0, -1);
              for (let index = transition.nStack.length - 1; index > -1; index--) {
                newStack += transition.nStack[index];
              }
              newRunTree.push({
                id:tempId,
                parentId:newRunTree[index].id,
                cStateId:transition.nStateId,
                cStack:newStack,
                cIHead:newRunTree[index].cIHead + 1,
                cSHead:newStack.length - 1
              })
              tempId++;
            });
          } else {
            if (states.find(s => s.id == newRunTree[index].cStateId)?.accept) {
              acceptId = newRunTree[index].id;
            }
          }
        }
        setRunTreeSet(true);
        setacceptTraversalId(acceptId);
        setRunTree(newRunTree);
      } else {
        newRunTree = [...runTree];
      }
      if (acceptId != -1) {
        path = [newRunTree.filter(t => t.id === acceptId)[0]];
        for (let index = 0; index < path.length; index++) {
          let parent = newRunTree.filter(t => t.id === path[0].parentId)[0];
          if (parent === undefined) {
            break;
          }
          path.unshift(parent);
        }
      } else {
        path = [newRunTree[0]];
        for (let index = 0; index < path.length; index++) {
          let child = newRunTree.filter(t => t.parentId === path[path.length - 1].id)[0];
          if (child === undefined) {
            break;
          }
          path.push(child);
        }
      }
      setRunPath(path);
      gsap.killTweensOf("*");

      let current = path.filter(t => t.id === traversalId)[0];
      let target  = path.filter(t => t.parentId === traversalId)[0];
      let pulse   = document.getElementById("animPulse0");
      let ball    = document.getElementById("animBall0");

      if (target !== undefined) {
        let animConnection = connections.filter(c => (c.cStateId == current.cStateId) && (c.nStateId == target.cStateId))[0];
        let state = states.filter(s => s.id == target.cStateId)[0];
        let tween;
        if (pulse) {
          pulse.setAttribute("cx", String(state.x));
          pulse.setAttribute("cy", String(state.y));
          pulse.getAnimations().forEach(anim => {anim.cancel(); anim.play();});
        } else {
          let newPulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          let parent = document.getElementById('myCanvas');
          newPulse.setAttribute('id', 'animPulse0');
          newPulse.setAttribute('cx', String(state.x));
          newPulse.setAttribute('cy', String(state.y));
          newPulse.setAttribute('r', '5%');
          newPulse.setAttribute('stroke', 'white');
          newPulse.setAttribute('strokeWidth', '5%');
          newPulse.setAttribute('fill', 'transparent');
          newPulse.style.setProperty('animation-iteration-count', 'infinite');
          newPulse.style.setProperty('animation-delay', '1.5s');
          parent?.appendChild(newPulse);
          newPulse.classList.add('pulse');
        }

        if (!ball) {
          let newBall = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          let parent = document.getElementById('myCanvas');
          newBall.setAttribute('cx', '-50');
          newBall.setAttribute('cy', '-50');
          newBall.setAttribute('id', 'animBall0');
          newBall.setAttribute('className', 'pathBall');
          newBall.setAttribute('r', '2%');
          newBall.setAttribute('stroke', 'white');
          newBall.setAttribute('fill', 'white');
          parent?.insertBefore(newBall, parent?.children[0]);
        }
        tween = gsap.to("#animBall0", {
          motionPath: {
              path: "#connection" + animConnection.id,
              align: "#connection" + animConnection.id,
              alignOrigin: [0.5, 0.5]
          },
          ease: "none",
          duration: 1.5,
          repeat: -1,
        });
        tween.play();
        setCurrentTraversalId(target.id);
      } else if (current.id === acceptId && current.cIHead === input.length) {
        if (ball) {
          ball.remove();
        }
        if (pulse) {
          pulse.remove();
        }
        let pathStates = states.filter(s => path.find(p => p.cStateId === s.id) !== undefined);
        pathStates.forEach((x, i) => {
          if (x !== undefined) {
            let newPulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            let parent = document.getElementById('myCanvas');
            newPulse.setAttribute('id', 'animSuccessPulse' + i);
            newPulse.setAttribute('cx', String(x.x));
            newPulse.setAttribute('cy', String(x.y));
            newPulse.setAttribute('r', '5%');
            newPulse.setAttribute('stroke', 'white');
            newPulse.setAttribute('strokeWidth', '5%');
            newPulse.setAttribute('fill', 'transparent');
            newPulse.style.setProperty('animation-iteration-count', 'infinite');
            parent?.appendChild(newPulse);
            newPulse.classList.add('pulseSuccess');
          }
        }); 
      } else {
        if (ball) {
          ball.remove();
        }
        if (pulse) {
          pulse.remove();
        }
      }
      let stackTxt = document.getElementById('stack')
      if (stackTxt) {stackTxt.innerHTML = current.cStack}
      setStack(current.cStack);
    }

    const clientRun = (): void => {
      let newRunTree:TraversalType[] = [];
      let path:TraversalType[] = runPath;
      let traversalId:number = currentTraversalId;
      let acceptId:number = acceptTraversalId;
      if (!runTreeSet) {
        newRunTree = [{id:0, parentId:-1, cStateId:start, cStack:'Z', cIHead:0, cSHead:0}];
        traversalId = 0;
        let transitionOptions:TransitionType[] = [];
        let tempId:number = 1;
        for (let index = 0; index < newRunTree.length; index++) {
          transitionOptions = transitions.filter(transition => transition.cStateId === newRunTree[index].cStateId);
          transitionOptions = transitionOptions.filter(transition => transition.cInput === input[newRunTree[index].cIHead]);
          transitionOptions = transitionOptions.filter(transition => transition.cStack === newRunTree[index].cStack[newRunTree[index].cSHead]);
          if (transitionOptions.length > 0) {
            transitionOptions.forEach(transition => {
              let newStack = newRunTree[index].cStack.slice(0, -1);
              for (let index = transition.nStack.length - 1; index > -1; index--) {
                newStack += transition.nStack[index];
              }
              newRunTree.push({
                id:tempId,
                parentId:newRunTree[index].id,
                cStateId:transition.nStateId,
                cStack:newStack,
                cIHead:newRunTree[index].cIHead + 1,
                cSHead:newStack.length - 1
              })
              tempId++;
            });
          } else {
            if (states.find(s => s.id == newRunTree[index].cStateId)?.accept) {
              acceptId = newRunTree[index].id;
            }
          }
        }
        setRunTreeSet(true);
        setacceptTraversalId(acceptId);
        setRunTree(newRunTree);
      } else {
        newRunTree = [...runTree];
      }
      if (acceptId != -1) {
        path = [newRunTree.filter(t => t.id === acceptId)[0]];
        for (let index = 0; index < path.length; index++) {
          let parent = newRunTree.filter(t => t.id === path[0].parentId)[0];
          if (parent === undefined) {
            break;
          }
          path.unshift(parent);
        }
      } else {
        path = [newRunTree[0]];
        for (let index = 0; index < path.length; index++) {
          let child = newRunTree.filter(t => t.parentId === path[path.length - 1].id)[0];
          if (child === undefined) {
            break;
          }
          path.push(child);
        }
      }
      gsap.killTweensOf("*");

      for (let index = 0; index < path.length; index++)
      {
        let current = path.filter(t => t.id === traversalId)[0];
        let target  = path.filter(t => t.parentId === traversalId)[0];
        let pulse   = document.getElementById("animPulse" + index);
        let ball    = document.getElementById("animBall" + index);

        if (target !== undefined) {
          let animConnection = connections.filter(c => (c.cStateId == current.cStateId) && (c.nStateId == target.cStateId))[0];
          let state = states.filter(s => s.id == target.cStateId)[0];
          let tween;
          if (pulse) {
            pulse.setAttribute("cx", String(state.x));
            pulse.setAttribute("cy", String(state.y));
            pulse.getAnimations().forEach(anim => {anim.cancel(); anim.play();});
          } else {
            //<circle id={'animPulse' + state.id} className='pulse' cx={String(state.x)} cy={String(state.y)} r="5%" stroke='white' strokeWidth='0.5%' fill='transparent'/>;
            let newPulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            let parent = document.getElementById('myCanvas');
            newPulse.setAttribute('id', 'animPulse' + index);
            newPulse.setAttribute('cx', String(state.x));
            newPulse.setAttribute('cy', String(state.y));
            newPulse.setAttribute('r', '5%');
            newPulse.setAttribute('stroke', 'white');
            newPulse.setAttribute('strokeWidth', '5%');
            newPulse.setAttribute('fill', 'transparent');
            newPulse.style.setProperty('animation-delay', String(1.5 + (index * 2)) + 's');
            newPulse.style.setProperty('animation-iteration-count', '1');
            parent?.appendChild(newPulse);
            newPulse.classList.add('pulse');
          }

          if (!ball) {
            let newBall = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            let parent = document.getElementById('myCanvas');
            newBall.setAttribute('cx', '-50');
            newBall.setAttribute('cy', '-50');
            newBall.setAttribute('id', 'animBall' + index);
            newBall.setAttribute('className', 'pathBall');
            newBall.setAttribute('r', '2%');
            newBall.setAttribute('stroke', 'white');
            newBall.setAttribute('fill', 'white');
            parent?.insertBefore(newBall, parent?.children[0]);
            //parent?.appendChild(newBall);
          }
          tween = gsap.to("#animBall" + index, {
            motionPath: {
                path: "#connection" + animConnection.id,
                align: "#connection" + animConnection.id,
                alignOrigin: [0.5, 0.5]
            },
            ease: "none",
            duration: 1.5,
            repeat: 0,
            delay: index * 2,
          });
          tween.play();
          traversalId = target.id;
        } else if (current.id === acceptId && current.cIHead === input.length) {
          if (ball) {
            ball.remove();
          }
          if (pulse) {
            pulse.remove();
          }
          let pathStates = states.filter(s => path.find(p => p.cStateId === s.id) !== undefined);
          pathStates.forEach((x, i) => {
            if (x !== undefined) {
              let newPulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
              let parent = document.getElementById('myCanvas');
              newPulse.setAttribute('id', 'animSuccessPulse' + i);
              newPulse.setAttribute('cx', String(x.x));
              newPulse.setAttribute('cy', String(x.y));
              newPulse.setAttribute('r', '5%');
              newPulse.setAttribute('stroke', 'white');
              newPulse.setAttribute('strokeWidth', '5%');
              newPulse.setAttribute('fill', 'transparent');
              newPulse.style.setProperty('animation-delay', String(index * 2) + 's');
              newPulse.style.setProperty('animation-iteration-count', '1');
              parent?.appendChild(newPulse);
              newPulse.classList.add('pulseSuccess');
            }
          });
            
        } else {
          if (ball) {
            ball.remove();
          }
          if (pulse) {
            pulse.remove();
          }
        }
        setTimeout(() => {
          let stackTxt = document.getElementById('stack')
          if (stackTxt) {
            stackTxt.innerHTML = current.cStack;
          }
        }, index * 2000);
      }

      setTimeout(() => {
        path.forEach((x, i) => {
          let animBall = document.getElementById('animBall' + i);
          let animPulse = document.getElementById('animPulse' + i);
          let animPulseSuccess = document.getElementById('animSuccessPulse' + i);
  
          animBall?.remove();
          animPulse?.remove();
          animPulseSuccess?.remove();
        });
        let animPulseSuccess = document.getElementById('animSuccessPulse' + runPath.length + 1);
        animPulseSuccess?.remove();
      }, path.length * 2000);
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
      setRunTreeSet(false);
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
      setConnectionId(newConnectionId);
      setRunTreeSet(false);
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
      setConnectionId(newConnectionId);
      setRunTreeSet(false);
    }

    const clientUpdateTransitionCInput = (transitionParam:TransitionType, value:string):void => {
      let newTransitions:TransitionType[] = [...transitions];
      let index:number = newTransitions.indexOf(transitionParam);
      
      newTransitions[index].cInput = value;
      
      setTransitions(newTransitions);
      setRunTreeSet(false);
    }

    const clientUpdateTransitionCStack = (transitionParam:TransitionType, value:string):void => {
      let newTransitions:TransitionType[] = [...transitions];
      let index:number = newTransitions.indexOf(transitionParam);
      
      newTransitions[index].cStack = value;
      
      setTransitions(newTransitions);
      setRunTreeSet(false);
    }

    const clientUpdateTransitionNStack = (transitionParam:TransitionType, value:string):void => {
      let newTransitions:TransitionType[] = [...transitions];
      let index:number = newTransitions.indexOf(transitionParam);
      
      newTransitions[index].nStack = value;
      
      setTransitions(newTransitions);
      setRunTreeSet(false);
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
      setConnectionId(newConnectionId);
      setRunTreeSet(false);
    }

    const clientSetStartState = (value:string):void => {
      let newStates:StateType[] = [...states];

      newStates = setStartState(start, false, newStates); //removes old start state
      newStates = setStartState(Number(value), true, newStates); //adds new start state
      
      setStart(Number(value));
      setStates(newStates);
      setRunTreeSet(false);
    }

    const clientSetAcceptState = (value:string, index:number):void => {
      let newStates:StateType[] = [...states];
      let newAccepts:number[]   = [...accept];

      newStates = setAcceptState(newAccepts[index], false, newStates); //removes old accept state
      newStates = setAcceptState(Number(value), true, newStates); //adds new accept state
      newAccepts[index] = Number(value);

      setAccept(newAccepts);
      setStates(newStates);
      setRunTreeSet(false);
    }

    const clientRemoveAcceptSelector = (value:number):void => {
      let newStates:StateType[] = [...states];
      let newAccepts:number[]   = [...accept];

      newAccepts = removeAccept(value, newAccepts);
      newStates = setAcceptState(value, false, newStates);

      setAccept(newAccepts);
      setStates(newStates);
      setRunTreeSet(false);
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
      setRunTreeSet(false);
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
      setRunTreeSet(false);
    }

    const clientGetExample = (exampleId:string):void => {
      if (exampleId !== '0') {
        let newExample = examples.find(e => e.id === Number(exampleId));

        if (newExample) {
          setStates(newExample.states);
          setTransitions(newExample.transitions);
          setConnections(newExample.connections);
          setStateId(newExample.states.length);
          setTransitionId(newExample.transitions.length);
          setConnectionId(newExample.connections.length);
          setAccept(newExample.acceptingStateIds);
          if (newExample.startStateId !== null) {
            setStart(newExample.startStateId);
          }
          let definition = document.getElementById('exampleDef');
          if (definition) {
            definition.innerText = newExample.definition;
          }
        }
      }
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

    return (
      <div className="app">
        <link rel="stylesheet" href="./App.css"></link>
        <header>
          <h1>Pushdown Automata</h1>
          <p>Subtitle</p>
        </header>
        <div id='exampleWrapper'>
          <div>Example Automata:</div>
          <select className='exampleSelect' onChange={(e) => clientGetExample(e.currentTarget.value)}>
            {examples.map((x, i) => {return (<option value={x.id} key={i}>{x.name}</option>)})}
          </select>
        </div>
        <div className='simWrapper'>
          <div className='simWrapperLeft'>
            <div id='txtTransitionsWrapper' className='txtTransitionsWrapper'>
              <div>Transitions</div>
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
            <input type='submit' className='simReset' value='Reset' onClick={() => clientReset()}/>
            <input type='submit' className='simStep' value='Step' onClick={() => clientStep()}/>
            <input type='submit' className='simRun' value='Run' onClick={() => clientRun()}/>
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
              <marker 
                id='start' 
                orient="auto" 
                markerWidth='200' 
                markerHeight='200' 
                refX='19' 
                refY='5'
              >
                <path d='M1,1 V10 L8,5 Z' stroke='white' strokeWidth='0.15%' fill='transparent'/>
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
              let txtId:string = "connection" + x.id;
              if (cState !== undefined) {
                if (x.cStateId == x.nStateId) {
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
                      <path id={txtId} markerEnd='url(#head)' d={"M " + cState.x + " " + cState.y + " Q " + (cState.x +((nState.x - cState.x) / 2)) + " " + ((cState.y +((nState.y - cState.y) / 2)) * ((nState.y - cState.y) > 0 ? 1.3 : 0.7)) + " " + nState.x + " " + nState.y} stroke="white" strokeWidth="0.5%" fill="none" />
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
                    <path id={txtId} markerEnd='url(#head)' d={"M " + cState.x + " " + cState.y + " L " + nState.x + " " + nState.y} stroke="white" strokeWidth="0.5%" fill="none"/>
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
            {states.map((x, i) => {
              return (
              <svg>
                {x.accept && <circle id={'accept' + x.id} className='draggable svg' cx={x.x} cy={x.y} r="6%" stroke="white" strokeWidth="0.5%" fill="transparent"/>}
                {x.start && <path id={'start' + x.id} markerEnd='url(#start)' d={"M " + x.x + " " + x.y + " L " + x.x + " " + x.y} stroke="white" strokeWidth="0.5%" fill="none"/>}
                <circle id={'state' + x.id} className='draggable svg' cx={x.x} cy={x.y} r="5%" stroke="white" strokeWidth="0.5%" fill="rgb(44, 44, 44)" onMouseDown={(e) => startDrag(e, x.id)} onContextMenu={e => stateContextMenu(e, x)}/>
                <text className='svg' x={x.x} y={x.y + 8} fill='white' fontSize='25' textAnchor='middle' onMouseDown={(e) => startDrag(e, x.id)} onContextMenu={e => stateContextMenu(e, x)}>{x.name}</text>
              </svg>
            )})}
          </svg>
            <div className='stackWrapper'>
              <div className='stackLabel'>Stack</div>
              <div id='stack' className='stackState'>Z</div>
            </div>
            <div className='inputWrapper'>
              <div className='inputLabel'>Input</div>
              <input type='text' className='inputInput' value={input} onChange={e => {setInput(e.currentTarget.value); setRunTreeSet(false);}}/>
            </div>
          </div>
        </div>
        <div id='exampleDef'></div>
        {contextMenuVisible && <ContextMenu left={contextMenuPos.x} top={contextMenuPos.y} options={contextMenuOptions}/>}
      </div>
  );
}

export default App;
