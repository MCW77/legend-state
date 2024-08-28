import type { symbolOpaque } from './globals';
import type { Observable, ObservableParam } from './observableTypes';

export type TrackingType = undefined | true | symbol; // true === shallow

export interface GetOptions {
    shallow: boolean;
}

export type OpaqueObject<T> = T & { [symbolOpaque]: true };

export interface ListenerParams<T = any> {
    value: T;
    getPrevious: () => T;
    changes: Change[];
    isFromSync: boolean;
    isFromPersist: boolean;
}

export type ListenerFn<T = any> = (params: ListenerParams<T>) => void;

export interface ObservableEvent {
    fire(): void;
    on(cb?: () => void): ObservableListenerDispose;
    get(): void;
}

export type TypeAtPath = 'object' | 'array' | 'map' | 'set';

export interface Change {
    path: string[];
    pathTypes: TypeAtPath[];
    valueAtPath: any;
    prevAtPath: any;
}

export type RecordValue<T> = T extends Record<string, infer t> ? t : never;
export type ArrayValue<T> = T extends Array<infer t> ? t : never;
export type ObservableValue<T> = T extends Observable<infer t> ? t : never;

export type Selector<T> = ObservableParam<T> | ObservableEvent | (() => T) | T;

export type ClassConstructor<I, Args extends any[] = any[]> = new (...args: Args) => I;
export type ObservableListenerDispose = () => void;

export interface ObservableRoot {
    // Observable root value is set on a child of the object so the reference to the root never changes
    _: any;
    set?: (value: any) => void;
}

export type Primitive = boolean | string | number | Date;
export type NotPrimitive<T> = T extends Primitive ? never : T;

export interface NodeListener {
    track: TrackingType;
    noArgs?: boolean;
    listener: ListenerFn;
}
export interface TrackingState {
    nodes?: Map<NodeInfo, TrackingNode>;
    traceListeners?: (nodes: Map<NodeInfo, TrackingNode>) => void;
    traceUpdates?: (fn: Function) => Function;
}

interface BaseNodeInfo {
    children?: Map<string, ChildNodeInfo>;
    proxy?: object;
    root: ObservableRoot;
    listeners?: Set<NodeListener>;
    listenersImmediate?: Set<NodeListener>;
    isEvent?: boolean;
    linkedToNode?: NodeInfo;
    linkedToNodeDispose?: () => void;
    activatedObserveDispose?: () => void;
    linkedFromNodes?: Set<NodeInfo>;
    isSetting?: number;
    isAssigning?: number;
    isComputing?: boolean;
    parentOther?: NodeInfo;
    functions?: Map<string, Function | Observable<any>>;
    lazy?: boolean;
    lazyFn?: Function;
    needsExtract?: boolean;
    numListenersRecursive: number;
    state?: Observable<ObservableSyncState>;
    activated?: boolean;
    recursivelyAutoActivated?: boolean;
    activationState?: LinkedOptions & {
        onError?: () => void;
        onChange: (params: UpdateFnParams) => void | Promise<void>;
    };
    dirtyFn?: () => void;
    dirtyChildren?: Set<NodeInfo>;
    numGets?: number;
    getNumResolved?: number;
}

export interface RootNodeInfo extends BaseNodeInfo {
    parent?: undefined;
    key?: undefined;
}

export interface ChildNodeInfo extends BaseNodeInfo {
    parent: NodeInfo;
    key: string;
}

export type NodeInfo = RootNodeInfo | ChildNodeInfo;

export interface TrackingNode {
    node: NodeInfo;
    track: TrackingType;
    num: number;
}
export interface ObserveEvent<T> {
    num: number;
    previous?: T | undefined;
    cancel?: boolean;
    onCleanup?: () => void;
}
export interface ObserveEventCallback<T> {
    num: number;
    previous?: T | undefined;
    value?: T;
    cancel: boolean;
    nodes: Map<NodeInfo, TrackingNode> | undefined;
    refresh: () => void;
    onCleanup?: () => void;
    onCleanupReaction?: () => void;
}

export type SetParams<T> = ListenerParams<T extends Promise<infer t> ? t : T>;

export interface LinkedOptions<T = any> {
    get?: () => Promise<T> | T;
    set?: (params: SetParams<T>) => void | Promise<any>;
    waitFor?: Selector<any>;
    waitForSet?: ((params: WaitForSetFnParams<T>) => any) | Promise<any> | ObservableParam<any> | ObservableEvent;
    initial?: (() => T) | T;
    activate?: 'auto' | 'lazy';
}

export interface WaitForSetFnParams<T = any> {
    value: T;
    changes: Change[];
}

export type GetMode = 'set' | 'assign' | 'merge' | 'append' | 'prepend';
export interface UpdateFnParams<T = any> {
    value: T;
    mode?: GetMode;
    lastSync?: number | undefined;
}
export type UpdateFn<T = any> = (params: UpdateFnParams<T>) => void;
export type Linked<T> = T;

export interface ObserveOptions {
    immediate?: boolean; // Ignore batching and run immediately
    /* @internal */
    fromComputed?: boolean;
}
export interface ObservableSyncStateBase {
    isPersistLoaded: boolean;
    isPersistEnabled: boolean;
    isSyncEnabled: boolean;
    lastSync?: number;
    syncCount?: number;
    isGetting?: boolean;
    isSetting?: boolean;
    numPendingGets?: number;
    numPendingSets?: number;
    clearPersist: () => Promise<void>;
    sync: () => Promise<void>;
    getPendingChanges: () =>
        | Record<
              string,
              {
                  p: any;
                  v?: any;
              }
          >
        | undefined;
    reset: () => Promise<void>;
    /* @internal */
    numPendingLocalLoads?: number;
    numPendingRemoteLoads?: number;
}
export interface ObservableState {
    isLoaded: boolean;
    error?: Error;
}
export type ObservableSyncState = ObservableState & ObservableSyncStateBase;
export interface RetryOptions {
    infinite?: boolean;
    times?: number;
    delay?: number;
    backoff?: 'constant' | 'exponential';
    maxDelay?: number;
}
