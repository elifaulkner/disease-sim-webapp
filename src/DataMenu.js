import React, { useState, useEffect } from 'react';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DetailsList, DetailsListLayoutMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Selection } from 'office-ui-fabric-react/lib/Selection';

const DataMenu = (props) => {

  const [hideSaveDialog, setHideSaveDialog] = useState(true)
  const [hideLoadDialog, setHideLoadDialog] = useState(true)

  useEffect(() => {
  }, [hideSaveDialog])
  const items: ICommandBarItemProps[] = [
    {
      key: 'save',
      text: 'Save Model',
      onClick: () => setHideSaveDialog(false)
    },
    {
      key: 'manage',
      text: 'Manage Models',
      onClick: () => setHideLoadDialog(false)
    }
  ];

  return (<div>
    <CommandBar
      align="left"
      items={items}
      ariaLabel="Use left and right arrow keys to navigate between commands"
    />
    <SaveDialog modelName={props.modelName} saveModel={props.saveModel} setHideSaveDialog={setHideSaveDialog} hideSaveDialog={hideSaveDialog} />
    <LoadDialog modelName={props.modelName} setHideLoadDialog={setHideLoadDialog} hideLoadDialog={hideLoadDialog} loadModel={props.loadModel} deleteModel={props.deleteModel}/>
  </div>);
}

const LoadDialog = (props) => {
  const [modelNames, setModelNames] = useState([])
  
  const loadModelCallback = () => { 
    const selectedItems = selection.getSelection();
    props.loadModel(selectedItems[0].name)
    props.setHideLoadDialog(true)
  }

  const deleteModelCallback = () => { 
    const selectedItems = selection.getSelection();
    props.deleteModel(selectedItems[0].name)
    props.setHideLoadDialog(true)
  }

  const columns = [
    { key: 'column1', name: 'Name', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'column2', name: 'Last Modified', fieldName: 'modified', minWidth: 100, maxWidth: 200, isResizable: true }
  ];

  const dismissCallback = () => {
    props.setHideLoadDialog(true)
  }

  const selection = React.useMemo(() => new Selection({ getKey: i => i.name }), []);

  useEffect(() => {
    fetch('/api/models/list')
      .then(l => l.json())
      .then(l => setModelNames(l))
  }, [props.hideLoadDialog])

  return (<Dialog
    minWidth={400}
    hidden={props.hideLoadDialog}
    dialogContentProps={{
      type: DialogType.normal,
      title: 'Load Model',
      closeButtonAriaLabel: 'Close',
    }}
    onDismiss={dismissCallback}
    modalProps={{
      isBlocking: false,
      styles: { main: { maxWidth: 450 } }
    }}>
    <DetailsList
      className="panel-list"
      items={modelNames}
      columns={columns}
      label="Models"
      layoutMode={DetailsListLayoutMode.justified}
      selectionPreservedOnEmptyClick={true}
      ariaLabelForSelectionColumn="Toggle selection"
      ariaLabelForSelectAllCheckbox="Toggle selection for all items"
      checkButtonAriaLabel="Row checkbox"
      selection={selection}
      setKey="name"
    />
    <DialogFooter>
      <DefaultButton text="Delete" onClick={deleteModelCallback} />
      <PrimaryButton text="Load" onClick={loadModelCallback} />
    </DialogFooter>
  </Dialog>)
}

const SaveDialog = (props) => {
  const [modelName, setModelName] = useState(props.modelName)

  const saveModelCallback = () => {
    props.saveModel(modelName).then(props.setHideSaveDialog(true))
  }

  const dismissCallback = () => {
    props.setHideSaveDialog(true)
  }

  return (<Dialog
    hidden={props.hideSaveDialog}
    dialogContentProps={{
      type: DialogType.normal,
      title: 'Save Model',
      closeButtonAriaLabel: 'Close',
    }}
    onDismiss={dismissCallback}
    modalProps={{
      isBlocking: false,
      styles: { main: { maxWidth: 450 } }
    }}>
    <TextField label="Model Name" onChange={v => setModelName(v.target.value)} />
    <DialogFooter>
      <PrimaryButton text="Save" onClick={saveModelCallback} />
    </DialogFooter>
  </Dialog>)
}

export default DataMenu