import { createContext, useState } from 'react'
import jsTPS from '../common/jsTPS'
import api from '../api'
import ChangeItem_Transaction from '../transactions/ChangeItem_Transaction'
import MoveItem_Transaction from '../transactions/MoveItem_Transaction'
export const GlobalStoreContext = createContext({});
/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
    CREATE_NEW_LIST: "CREATE_NEW_LIST",
    CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    SET_ITEM_NAME_EDIT_ACTIVE: "SET_ITEM_NAME_EDIT_ACTIVE",
    SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
    MARK_LIST_FOR_DELETION: "MARK_LIST_FOR_DELETION",
    DELETE_LIST: "DELETE_LIST"
}

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS();

let counter = 0;

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
export const useGlobalStore = () => {
    // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
    const [store, setStore] = useState({
        idNamePairs: [],
        currentList: null,
        newListCounter: 0,
        listNameActive: false,
        itemActive: false,
        listMarkedForDeletion: null
    });

    // HERE'S THE DATA STORE'S REDUCER, IT MUST
    // HANDLE EVERY TYPE OF STATE CHANGE
    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            // CREATE A NEW LIST
            case GlobalStoreActionType.CREATE_NEW_LIST: {
                counter++;
                return setStore({
                    idNamePairs: payload,
                    currentList: null,
                    newListCounter: store.newListCounter + 1,
                    isListNameEditActive: false,
                    isItemeditActive: false,
                    listMarkedForDeletion: null
                })
            }
            // LIST UPDATE OF ITS NAME
            case GlobalStoreActionType.CHANGE_LIST_NAME: {
                return setStore({
                    idNamePairs: payload.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            // STOP EDITING THE CURRENT LIST
            case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                })
            }
            // GET ALL THE LISTS SO WE CAN PRESENT THEM
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore({
                    idNamePairs: payload,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            // UPDATE A LIST
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            // MARK LIST FOR DELETION
            case GlobalStoreActionType.MARK_LIST_FOR_DELETION: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: payload
                })
            }
            // DELETE A LIST
            case GlobalStoreActionType.DELETE_LIST: {
                return setStore({
                    idNamePairs: payload,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                })
            }
            // START EDITING A LIST NAME
            case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: true,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            // START EDITING AN ITEM NAME
            case GlobalStoreActionType.SET_ITEM_NAME_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: true,
                    listMarkedForDeletion: null
                })
            }
            default:
                return store;
        }
    }
    // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
    // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN 
    // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.

    // THIS FUNCTION PROCESSES CREATING A NEW LIST
    store.createNewList = function() {
        async function asyncCreateNewList() {
            let payload = {
                "name": "Untitled" + counter,
                "items": ["?", "?", "?", "?", "?"]
            }
            let response = await api.createTop5List(payload);
            if (response.data.success) {
                // NEED TO UPDATE idNamePairs AND SET currentList
                let newId = response.data.top5List._id;
                async function asyncLoadIdNamePairs() {
                    const response = await api.getTop5ListPairs();
                    if (response.data.success) {
                        // ALSO NEED 
                        let pairsArray = response.data.idNamePairs;
                        storeReducer({
                            type: GlobalStoreActionType.CREATE_NEW_LIST,
                            payload: pairsArray
                        });
                    }
                }
                asyncLoadIdNamePairs();

                // SET currentList
                store.setCurrentList(newId);
            }
        }
        asyncCreateNewList();
    }

    // THIS FUNCTION PROCESSES CHANGING A LIST NAME
    store.changeListName = function (id, newName) {
        // GET THE LIST
        async function asyncChangeListName(id) {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;
                if (newName === "") {
                    top5List.name = "?";
                } else {
                    top5List.name = newName;
                }
                async function updateList(top5List) {
                    response = await api.updateTop5ListById(top5List._id, top5List);
                    if (response.data.success) {
                        async function getListPairs(top5List) {
                            response = await api.getTop5ListPairs();
                            if (response.data.success) {
                                let pairsArray = response.data.idNamePairs;
                                storeReducer({
                                    type: GlobalStoreActionType.CHANGE_LIST_NAME,
                                    payload: {
                                        idNamePairs: pairsArray,
                                        top5List: top5List
                                    }
                                });
                            }
                        }
                        getListPairs(top5List);
                    }
                }
                updateList(top5List);
            }
        }
        asyncChangeListName(id);
    }

    // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
    store.closeCurrentList = function () {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
            payload: {}
        });

        // CLEAR TPS
        tps.clearAllTransactions();
    }

    // THESE FUNCTIONS RETURN WHETHER OR NOT THE TPS HAS TRANSACTIONS TO UNDO OR REDO
    store.canUndo = function () {
        return tps.hasTransactionToUndo();
    }

    store.canRedo = function () {
        return tps.hasTransactionToRedo();
    }

    // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
    store.loadIdNamePairs = function () {
        async function asyncLoadIdNamePairs() {
            try {
                const response = await api.getTop5ListPairs();
                if (response.data.success) {
                    let pairsArray = response.data.idNamePairs;
                    storeReducer({
                        type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                        payload: pairsArray
                    });
                }
            } catch  {
                let pairsArray = [];
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: pairsArray
                });
            }
        }
        asyncLoadIdNamePairs();
    }

    // THIS FUNCTION PROCESSES MARKING A LIST FOR DELETION
    store.markListForDeletion = function (id) {
        async function asyncMarkListForDeletion(id) {
            // GET THE LIST BY ITS ID
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;

                storeReducer({
                    type: GlobalStoreActionType.MARK_LIST_FOR_DELETION,
                    payload: top5List
                });

                // SHOW THE DELETE LIST MODAL
                store.showDeleteListModal();
            }
        }
        asyncMarkListForDeletion(id);
    }

    // THIS FUNCTION SHOWS THE DELETE LIST MODAL
    store.showDeleteListModal = function () {
        let modal = document.getElementById("delete-modal");
        modal.classList.add("is-visible");
    }

    // THIS FUNCTION HIDES THE DELETE LIST MODAL
    store.hideDeleteListModal = function () {
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
    }

    // THIS FUNCTION PROCESSES DELETING A LIST
    store.deleteMarkedList = function () {
        // DELETE THE LIST
        async function asyncDeleteList() {
            let id = store.listMarkedForDeletion._id;
            await api.deleteTop5ListById(id).then(() => {
                // HIDE DELETE LIST MODAL
                store.hideDeleteListModal();

                // LOAD NEW ID NAME PAIRS
                store.loadIdNamePairs();
            })
            .catch(error => {
                console.log(error.message);

                // HIDE DELETE LIST MODAL
                store.hideDeleteListModal();

                // LOAD NEW ID NAME PAIRS
                store.loadIdNamePairs();
            });
        }
        asyncDeleteList();
    }

    // THE FOLLOWING 8 FUNCTIONS ARE FOR COORDINATING THE UPDATING
    // OF A LIST, WHICH INCLUDES DEALING WITH THE TRANSACTION STACK. THE
    // FUNCTIONS ARE setCurrentList, addMoveItemTransaction, addUpdateItemTransaction,
    // moveItem, updateItem, updateCurrentList, undo, and redo
    store.setCurrentList = function (id) {
        async function asyncSetCurrentList(id) {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;

                response = await api.updateTop5ListById(top5List._id, top5List);
                if (response.data.success) {
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_LIST,
                        payload: top5List
                    });
                    store.history.push("/top5list/" + top5List._id);
                }
            }
        }
        asyncSetCurrentList(id);
    }
    store.addMoveItemTransaction = function (start, end) {
        if (start !== end) {
            let transaction = new MoveItem_Transaction(store, start, end);
            tps.addTransaction(transaction);
        }
    }
    store.moveItem = function (start, end) {
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = store.currentList.items[start];
            for (let i = start; i < end; i++) {
                store.currentList.items[i] = store.currentList.items[i + 1];
            }
            store.currentList.items[end] = temp;
        }
        else if (start > end) {
            let temp = store.currentList.items[start];
            for (let i = start; i > end; i--) {
                store.currentList.items[i] = store.currentList.items[i - 1];
            }
            store.currentList.items[end] = temp;
        }

        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }
    store.addChangeItemTransaction = function(index, newText) {
        let oldText = store.currentList.items[index];
        if (oldText !== newText) {
            let transaction = new ChangeItem_Transaction(store, index, oldText, newText);
            tps.addTransaction(transaction);
        } else {
            store.updateCurrentList();
        }
    }
    store.changeItem = function (index, newText) {
        store.currentList.items[index] = newText;

        // NOW UPDATE THE LIST
        store.updateCurrentList();
    }
    store.updateCurrentList = function() {
        async function asyncUpdateCurrentList() {
            const response = await api.updateTop5ListById(store.currentList._id, store.currentList);
            if (response.data.success) {
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: store.currentList
                });
            }
        }
        asyncUpdateCurrentList();
    }
    store.undo = function () {
        tps.undoTransaction();
    }
    store.redo = function () {
        tps.doTransaction();
    }

    // THIS FUNCTION ENABLES THE PROCESS OF EDITING A LIST NAME
    store.setIsListNameEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
            payload: null
        });
    }

    // THIS FUNCTION ENABLES THE PROCESS OF EDITING AN ITEM NAME
    store.setIsItemNameEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_ITEM_NAME_EDIT_ACTIVE,
            payload: null
        });
    }
    // THIS GIVES OUR STORE AND ITS REDUCER TO ANY COMPONENT THAT NEEDS IT
    return { store, storeReducer };
}