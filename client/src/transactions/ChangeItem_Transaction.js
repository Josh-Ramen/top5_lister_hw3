import jsTPS_Transaction from "../common/jsTPS.js"
/**
 * MoveItem_Transaction
 * 
 * This class represents a transaction that works with drag
 * and drop. It will be managed by the transaction stack.
    
    @author McKilla Gorilla
 */
export default class ChangeItem_Transaction extends jsTPS_Transaction {
    constructor(initStore, initListIndex, initOldText, initNewText) {
        super();
        this.store = initStore;
        this.listIndex = initListIndex
        this.oldItemText = initOldText;
        this.newItemText = initNewText;
    }

    doTransaction() {
        this.store.changeItem(this.listIndex, this.newItemText);
    }
    
    undoTransaction() {
        this.store.changeItem(this.listIndex, this.oldItemText);
    }
}