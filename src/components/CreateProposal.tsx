import { useState, useContext } from 'react';
import toast from 'react-hot-toast';

import { GlobalContext } from '../providers/Global';

import Button from './Button';
import Icon from './Icon';
import ToasterWrapper from './ToasterWrapper';

import getErrorMessage from '../content/errors';

interface ICreateProposalProps {
  setShowCreateProposal: (show: boolean) => void;
  setProposalCreated: () => void;
}

const CreateProposal = ({ setShowCreateProposal, setProposalCreated }: ICreateProposalProps) => {
  const globalContext = useContext(GlobalContext);
  const { sdk, connection } = globalContext;
  const { connectorInstance, userId } = connection;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loadingCreateProposal, setLoadingCreateProposal] = useState(false);

  const handleBackButtonClick = () => {
    setShowCreateProposal(false);
  };

  const handleCreateProposalButtonClick = async () => {
    try {
      setLoadingCreateProposal(true);
      const receipt = await sdk.createProposal(
        connectorInstance,
        process.env.REACT_APP_GOVERNANCE_ADDRESS as string,
        userId,
        title,
        description,
        [
          {
            targetAddress: '0x00000000000000000000000000000000001d90c9',
            value: 0,
            functionName: '0',
            functionParams: [],
          },
        ],
      );

      const {
        response: { success, error },
      } = receipt;

      if (success) {
        toast.success('Success! Tokens were locked.');

        setProposalCreated();
        setShowCreateProposal(false);
      } else {
        toast.error(getErrorMessage(error.status ? error.status : error));
      }
    } catch (e) {
      console.log('e', e);
    } finally {
      setLoadingCreateProposal(false);
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
          <div className="col-md-10">
            <div className="container-blue-neutral-800 rounded">
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
      <ToasterWrapper />
    </div>
  );
};

export default CreateProposal;
