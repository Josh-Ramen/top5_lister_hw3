import { React, useContext, useState } from "react";
import { GlobalStoreContext } from '../store'
/*
    This React component represents a single item in our
    Top 5 List, which can be edited or moved around.
    
    @author McKilla Gorilla
*/
function Top5Item(props) {
    let defaultText = props.text;
    let { index } = props;
    const { store } = useContext(GlobalStoreContext);
    const [draggedTo, setDraggedTo] = useState(0);
    const [editActive, setEditActive] = useState(false);
    const [text, setText] = useState(defaultText);

    let editStatus = false;
    if (store.isListNameEditActive || store.isItemEditActive) {
        editStatus = true;
    }

    function handleDragStart(event) {
        if (!editStatus) {
            event.dataTransfer.setData("item", event.target.id);
        }
    }

    function handleDragOver(event) {
        if (!editStatus) {
            event.preventDefault();
        }
    }

    function handleDragEnter(event) {
        if (!editStatus) {
            event.preventDefault();
            setDraggedTo(true);
        }
    }

    function handleDragLeave(event) {
        if (!editStatus) {
            event.preventDefault();
            setDraggedTo(false);
        }
    }

    function handleToggleEdit(event) {
        if (!editStatus) {
            event.stopPropagation();
            let realText = store.currentList.items[index];
            setText(realText);
            toggleEdit();
        }
    }

    function toggleEdit() {
        let newActive = !editActive;
        if (newActive) {
            store.setIsItemNameEditActive();
        }
        setEditActive(newActive);
    }

    function handleKeyPress(event) {
        if (event.code === "Enter") {
            handleBlur();
        }
    }

    function handleBlur() {
        let {index} = props;
        store.addChangeItemTransaction(index, text);
        toggleEdit();
    }

    function handleUpdateText(event) {
        setText(event.target.value);
    }

    function handleDrop(event) {
        if (!editStatus) {
            event.preventDefault();
            let target = event.target;
            let targetId = target.id;
            targetId = targetId.substring(target.id.indexOf("-") + 1);
            let sourceId = event.dataTransfer.getData("item");
            sourceId = sourceId.substring(sourceId.indexOf("-") + 1);
            setDraggedTo(false);

            // UPDATE THE LIST
            store.addMoveItemTransaction(sourceId, targetId);
        }
    }

    let itemClass = "top5-item";
    if (draggedTo) {
        itemClass = "top5-item-dragged-to";
    }

    let buttonClass = "list-card-button";
    if (editStatus) {
        buttonClass += "-disabled";
    }

    let canDrag = !(store.isListNameEditActive || store.isItemEditActive);
    let itemElement =
        <div
            id={'item-' + (index + 1)}
            className={itemClass}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            draggable={canDrag}
        >
            <input
                type="button"
                id={"edit-item-" + index + 1}
                className={buttonClass}
                onClick={handleToggleEdit}
                value={"\u270E"}
            />
            {props.text}
        </div>
    if (editActive) {
        itemElement =
            <input
                id={"editing-item-" + index}
                className={itemClass}
                type='text'
                autoFocus={true}
                onKeyPress={handleKeyPress}
                onChange={handleUpdateText}
                defaultValue={props.text}
            />;
    }
    return (
        itemElement
    );
}

export default Top5Item;