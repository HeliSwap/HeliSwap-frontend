import { useState } from 'react';
import Button from './Button';
import Modal from './Modal';

interface IAddActionProps {
  targetAddress: string;
  value: number;
  functionName: string;
  functionParams: any;
}

interface IAddNewActionModalProps {
  show: boolean;
  setShowActionModal: (show: boolean) => void;
  addAction: (actionObj: IAddActionProps) => void;
}

interface IActionParam {
  type: string;
  value: string;
}

const AddNewActionModal = ({ show, setShowActionModal, addAction }: IAddNewActionModalProps) => {
  const [targetAddress, setTargetAddress] = useState('');
  const [value, setValue] = useState(0);
  const [functionName, setFunctionName] = useState('');
  const [functionParams, setFunctionParams] = useState<IActionParam[]>([]);

  const handleCloseClick = () => {
    setShowActionModal(false);
  };

  const handleInputChange = (index: number, event: any) => {
    const values = [...functionParams];
    const updatedValue = event.target.name as 'type' | 'value';
    values[index][updatedValue] = event.target.value;

    setFunctionParams(values);
  };

  const handleAddParam = () => {
    const values = [...functionParams];
    values.push({
      type: '',
      value: '',
    });
    setFunctionParams(values);
  };

  const handleRemoveParam = (index: number) => {
    const values = [...functionParams];
    values.splice(index, 1);
    setFunctionParams(values);
  };

  const handleAddAction = () => {
    addAction({
      targetAddress: targetAddress,
      value: value,
      functionName: functionName,
      functionParams: functionParams,
    });
    setShowActionModal(false);
  };

  const renderParam = (param: { type: string; value: string }, index: number) => {
    return (
      <div key={index}>
        <label className="text-small text-bold m-4">Params</label>
        <div className="d-flex">
          <div>
            <label className="text-small text-bold">Type</label>
            <input
              name="type"
              onChange={e => handleInputChange(index, e)}
              value={param.type}
              type="text"
              className="form-control mt-2"
            />
          </div>

          <div>
            <label className="text-small text-bold ">Value</label>
            <input
              name="value"
              onChange={e => handleInputChange(index, e)}
              value={param.value}
              type="text"
              className="form-control mt-2"
            />
          </div>
          <Button className="m-4" onClick={() => handleRemoveParam(index)}>
            Remove param
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Modal show={show} closeModal={() => setShowActionModal(false)}>
      <>
        <div className="modal-header">
          <h5 className="modal-title text-main text-bold" id="exampleModalLabel">
            Add new action
          </h5>
          <button
            onClick={handleCloseClick}
            type="button"
            className="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div className="modal-body">
          <div>
            <p className="text-small text-bold mb-3">Target address</p>
            <input
              type="text"
              className="form-control"
              name="targetAddress"
              value={targetAddress}
              onChange={e => setTargetAddress(e.target.value)}
            />
          </div>

          <div>
            <p className="text-small text-bold mb-3">HBAR value</p>
            <input
              type="text"
              className="form-control"
              name="value"
              value={value}
              onChange={e => setValue(parseInt(e.target.value))}
            />
          </div>
          <div>
            <p className="text-small text-bold mb-3">Function name</p>
            <input
              type="text"
              className="form-control"
              name="functionName"
              value={functionName}
              onChange={e => setFunctionName(e.target.value)}
            />
          </div>

          {functionParams.length !== 0
            ? functionParams.map((param, index) => renderParam(param, index))
            : null}

          <div className="m-4 d-flex justify-content-between">
            <Button className="m-4" onClick={handleAddParam}>
              Add param
            </Button>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-5">
            <Button onClick={() => setShowActionModal(false)} type="secondary" outline>
              Cancel
            </Button>
            <Button onClick={handleAddAction}>Add action</Button>
          </div>
        </div>
      </>
    </Modal>
  );
};

export default AddNewActionModal;
