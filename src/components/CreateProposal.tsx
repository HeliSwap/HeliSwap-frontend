import { useState, useContext } from 'react';
import toast from 'react-hot-toast';

import { GlobalContext } from '../providers/Global';

import { IProposal, ProposalStatus } from '../interfaces/dao';

import Button from './Button';
import Icon from './Icon';
import ToasterWrapper from './ToasterWrapper';

import getErrorMessage from '../content/errors';

interface ICreateProposalProps {
  setShowCreateProposal: (show: boolean) => void;
  setProposalCreated: (newProposal: IProposal) => void;
  proposals: IProposal[];
}

const contentFields = [
  {
    name: 'introductory',
    label: 'Introductory Paragraph',
    placeholder: 'Introductory Paragraph',
  },
  {
    name: 'projectSummary',
    label: 'Project Summary',
    placeholder:
      'The “Example Proposal” focuses on the development and implementation of a new decentralized voting system within the HeliSwap platform. We propose the creation of a Decentralized Autonomous Organization (DAO) for HeliSwap, which will empower token holders to have a direct say in the platform’s decision-making processes. This DAO will be governed by $HELI token holders, allowing them to propose and vote on key platform changes, such as protocol upgrades, fee adjustments, and ecosystem expansion. The motivation behind this proposal is to foster greater community involvement, transparency, and decentralization within HeliSwap.',
  },
  {
    name: 'benefits',
    label: 'Benefits to HeliSwap Ecosystem',
    placeholder:
      'Benefits to HeliSwap Ecosystem: Implementing a DAO within HeliSwap offers several significant advantages to the platform and its $HELI token holders: Enhanced Governance: The DAO will enable $HELI holders to actively participate in shaping the platform’s future, leading to more inclusive and community-driven decisions. Transparency: All proposals, discussions, and voting outcomes will be transparently recorded on the blockchain, ensuring complete openness in decision-making processes. Community Engagement: By allowing token holders to voice their opinions and propose changes, we anticipate increased community engagement and a stronger sense of ownership among HeliSwap users. Alignment with Decentralization: This initiative aligns with HeliSwap’s commitment to decentralization, making it a more resilient and censorship-resistant platform.',
  },
  {
    name: 'summarySpecifics',
    label: 'Summary Specifics',
    placeholder:
      'In brief, the “Example Proposal” seeks a portion of the HeliSwap treasury to support the development and implementation of the DAO infrastructure. This allocation will enable the creation of smart contracts and user interfaces necessary for the DAO’s functionality and governance operations, including voting and proposal submissions.',
  },
  {
    name: 'conculsion',
    label: 'Conclusion',
    placeholder:
      'In conclusion, the “Example Proposal” represents an exciting opportunity for the HeliSwap community to take a significant step towards greater decentralization and community-driven governance. We encourage all $HELI holders to participate in the forthcoming vote to decide on the allocation of treasury funds for this project. Together, we can shape the future of HeliSwap and create a more robust and inclusive ecosystem for all stakeholders. Thank you for your attention, and we look forward to your support in making HeliSwap even better. Let’s build a stronger, more decentralized future together!',
  },
];

interface IContent {
  [key: string]: string;
}

const CreateProposal = ({
  setShowCreateProposal,
  setProposalCreated,
  proposals,
}: ICreateProposalProps) => {
  const globalContext = useContext(GlobalContext);
  const { sdk, connection } = globalContext;
  const { connectorInstance, userId } = connection;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<IContent>({
    introductory: '',
    projectSummary: '',
    benefits: '',
    summarySpecifics: '',
    conculsion: '',
  });
  const [loadingCreateProposal, setLoadingCreateProposal] = useState(false);

  const handleContentUpdate = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const name = e.target.name;

    setContent(prev => ({ ...prev, [name]: value }));
  };

  const handleBackButtonClick = () => {
    setShowCreateProposal(false);
  };

  const handleCreateProposalButtonClick = async () => {
    const description = Object.values(content)
      .map((item, index) => `${contentFields[index].label}\n${item}`)
      .join('\n\n');

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
        toast.success('Success! Proposal is created.');

        const id =
          proposals.length > 0 ? Number(proposals[proposals.length - 1].id.toString()) + 1 : 1;

        setProposalCreated({
          id,
          proposer: userId,
          description,
          title,
          createTime: 0,
          eta: 0,
          status: ProposalStatus.WARMUP,
          votesFor: 0,
          votesAgainst: 0,
        });
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

  const formValid = title.length > 0 && Object.values(content).every(value => value.length > 0);

  return (
    <div>
      <div>
        <span onClick={handleBackButtonClick} className="link d-inline-flex align-items-center">
          <Icon size="small" name="arrow-left" />
          <span className="text-small text-bold ms-2">Proposals</span>
        </span>
      </div>
      <h1 className="text-title text-bold mt-5">Create proposal</h1>

      <div className="mt-5">
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

            {contentFields.map((field, index) => (
              <div key={index} className="mt-5">
                <p className="text-small text-bold mb-3">{field.label}</p>
                <textarea
                  rows={7}
                  name={field.name}
                  placeholder={field.placeholder}
                  className="form-control"
                  value={content[field.name]}
                  onChange={handleContentUpdate}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <Button
          loading={loadingCreateProposal}
          disabled={loadingCreateProposal || !formValid}
          onClick={handleCreateProposalButtonClick}
        >
          Create proposal
        </Button>
      </div>
      <ToasterWrapper />
    </div>
  );
};

export default CreateProposal;
