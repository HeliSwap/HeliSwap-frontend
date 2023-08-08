import { useState, useContext } from 'react';

import { GlobalContext } from '../providers/Global';

import AddNewActionModal from './AddNewActionModal';
import Button from './Button';
import Icon from './Icon';

interface ICreateProposalProps {
  setShowCreateProposal: (show: boolean) => void;
  setProposalCreated: () => void;
}

interface IAction {
  functionName: string;
  functionParams: {
    type: string;
    value: string;
  }[];
  targetAddress: string;
  value: number;
}

const CreateProposal = ({ setShowCreateProposal, setProposalCreated }: ICreateProposalProps) => {
  const globalContext = useContext(GlobalContext);
  const { sdk, connection } = globalContext;
  const { connectorInstance, userId } = connection;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [actions, setActions] = useState<IAction[]>([]);
  const [loadingCreateProposal, setLoadingCreateProposal] = useState(false);

  const [showActionModal, setShowActionModal] = useState(false);

  const handleBackButtonClick = () => {
    setShowCreateProposal(false);
  };

  const handleActionsModalButtonClick = () => {
    setShowActionModal(true);
  };

  const handleAddAction = (action: IAction) => {
    setActions([...actions, action]);
  };

  const handleCreateProposalButtonClick = async () => {
    try {
      setLoadingCreateProposal(true);
      await sdk.createProposal(
        connectorInstance,
        process.env.REACT_APP_GOVERNANCE_ADDRESS as string,
        userId,
        title,
        description,
        actions,
      );
    } catch (e) {
      console.log('e', e);
    } finally {
      setLoadingCreateProposal(false);
      setShowCreateProposal(false);
      setProposalCreated();
    }
  };

  return (
    <div className="row">
      <div className="col-md-10 offset-md-1">
        <div>
          <span onClick={handleBackButtonClick} className="link d-inline-flex align-items-center">
            <Icon size="small" name="arrow-left" />
            <span className="text-small text-bold ms-2">Proposals</span>
          </span>
        </div>
        <h1 className="text-title text-bold mt-5">Create proposal</h1>

        <div className="row mt-5">
          <div className="col-md-6">
            <div className="container-rounded-dark">
              <div className="container-border-bottom p-5">
                <h3 className="text-main text-bold">Proposal description</h3>
              </div>

              <div className="p-5">
                <div>
                  <p className="text-small text-bold mb-3">Title</p>
                  <input
                    placeholder="Proposal title"
                    className="form-control"
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                <div className="mt-5">
                  <p className="text-small text-bold mb-3">Description</p>
                  <textarea
                    placeholder="Please enter the goal of the proposal here"
                    className="form-control"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 mt-5 mt-md-0">
            <div className="container-rounded-dark">
              <div className="container-border-bottom p-5">
                <h3 className="text-main text-bold">Actions</h3>
              </div>
              {actions!.length > 0 ? (
                <>
                  {actions?.map((action: IAction, index) => {
                    const { targetAddress, functionName, functionParams } = action;
                    let paramTypesStr = '';
                    let paramValuessStr = '';

                    functionParams.forEach(
                      (param: { value: string; type: string }, index: number) => {
                        paramTypesStr +=
                          index !== functionParams.length - 1 ? `${param.type},` : `${param.type}`;
                        paramValuessStr +=
                          index !== functionParams.length - 1
                            ? `${param.value},`
                            : `${param.value}`;
                      },
                    );

                    return (
                      <div className="p-4" key={index}>
                        <h2 className="text-bold text-main">Action {index + 1}</h2>
                        <div>{`${targetAddress}.${functionName}(${paramTypesStr})`}</div>
                        <div>{`${targetAddress}.${functionName}(${paramValuessStr})`}</div>
                      </div>
                    );
                  })}
                </>
              ) : null}

              <div className="p-5">
                <div className="text-center">
                  <Button
                    loading={loadingCreateProposal}
                    disabled={loadingCreateProposal}
                    onClick={handleActionsModalButtonClick}
                    outline
                  >
                    Add new action
                  </Button>
                </div>
                {showActionModal ? (
                  <AddNewActionModal
                    show={showActionModal}
                    setShowActionModal={setShowActionModal}
                    addAction={handleAddAction}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <Button
            loading={loadingCreateProposal}
            disabled={loadingCreateProposal}
            onClick={handleCreateProposalButtonClick}
          >
            Create proposal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateProposal;
