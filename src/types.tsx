
export type StateType = {
    readonly id: number,
    name: string,
    accept: boolean,
    start: boolean,
    x: number,
    y: number
  }
  
export type TransitionType = {
    readonly id: number,
    cStateId: number,
    cInput: string,
    cStack: string,
    nStateId: number,
    nStack: string
  }

export type TraversalType = {
    targets: TraversalType[],
    cStateId: number,
    cStack: string,
    cIHead: number,
    cSHead: number
  }

export type ConnectionType = {
    id: number,
    cStateId: number,
    nStateId: number,
    transitionIds: number[];
  }

export type ContextMenuPosType = {
    x: number,
    y: number
  }

export type OptionType = {
    label: string,
    func: any
  }