import { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';

import { GlobalContext } from '../providers/Global';

import { IProposal, ProposalStatus } from '../interfaces/dao';

import Button from '../components/Button';
import CreateProposal from '../components/CreateProposal';

import useGovernanceContract from '../hooks/useGovernanceContract';

enum PageTab {
  'All',
  'Active',
  'Executed',
  'Failed',
}

const Governance = () => {
  const globalContext = useContext(GlobalContext);
  const { connection } = globalContext;
  const { connected } = connection;

  const governanceContract = useGovernanceContract();

  const [proposals, setProposals] = useState<IProposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);

  const [showCreateProposal, setShowCreateProposal] = useState(false);

  const [pageTab, setPageTab] = useState(PageTab.All);

  const handleCreateProposalButtonClick = () => {
    setShowCreateProposal(true);
  };

  const handleTabClick = (target: PageTab) => {
    setPageTab(target);
  };

  const updateProposal = (newProposal: IProposal) => {
    setProposals([...proposals, newProposal]);
  };

  const getGovernanceData = useCallback(async () => {
    setLoadingProposals(true);

    try {
      const lastIdBN = await governanceContract.lastProposalId();
      const lastId = Number(lastIdBN.toString());
      const proposalIds = [];

      if (lastId > 0) {
        for (let i = 1; i <= lastId; i++) {
          proposalIds.push(i);
        }

        const proposalPromises = proposalIds.map(id => governanceContract.proposals(id));
        const proposalsResolved = await Promise.all(proposalPromises);

        const proposalStatusesPromises = proposalIds.map(id => governanceContract.state(id));
        const proposalStatusesResolved = await Promise.all(proposalStatusesPromises);

        const proposalsFormatted = proposalsResolved.map((item, index) => {
          const {
            title,
            proposer,
            id,
            forVotes,
            eta: etaBN,
            description,
            createTime: createTimeBN,
            againstVotes,
          } = item;

          const votesFor = Number(forVotes.toString());
          const votesAgainst = Number(againstVotes.toString());
          const eta = Number(etaBN.toString());
          const createTime = Number(createTimeBN.toString());

          return {
            id,
            proposer,
            description,
            title,
            votesFor,
            votesAgainst,
            status: proposalStatusesResolved[index],
            eta,
            createTime,
          };
        });

        setProposals(proposalsFormatted);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingProposals(false);
    }
  }, [governanceContract]);

  useEffect(() => {
    Object.keys(governanceContract).length > 0 && getGovernanceData();
  }, [governanceContract, getGovernanceData]);

  const haveProposals = proposals.length > 0;

  const statusClassesMapping: any = {
    0: {
      label: 'Warm Up',
      className: 'is-warmup',
    },
    1: {
      label: 'Active',
      className: 'is-active',
    },
    2: {
      label: 'Canceled',
      className: 'is-canceled',
    },
    3: {
      label: 'Failed',
      className: 'is-failed',
    },
    4: {
      label: 'Accepted',
      className: 'is-accepted',
    },
    5: {
      label: 'Queued',
      className: 'is-queued',
    },
    6: {
      label: 'Grace',
      className: 'is-grace',
    },
    7: {
      label: 'Expired',
      className: 'is-expired',
    },
    8: {
      label: 'Executed',
      className: 'is-executed',
    },
  };

  return (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        <h1 className="text-headline text-light mb-4">Governance</h1>

        {showCreateProposal ? (
          <CreateProposal
            setProposalCreated={updateProposal}
            setShowCreateProposal={setShowCreateProposal}
            proposals={proposals}
          />
        ) : (
          <div className="row">
            <div className="col-md-10 offset-md-1">
              <div className="d-flex justify-content-between align-items-center">
                <h1 className="text-title text-bold">Proposals</h1>
                {connected ? (
                  <Button onClick={handleCreateProposalButtonClick}>Create proposal</Button>
                ) : null}
              </div>

              <div className="container-blue-neutral-800 rounded mt-5">
                <div className="container-border-bottom p-5">
                  <div className="d-flex">
                    <span
                      onClick={() => handleTabClick(PageTab.All)}
                      className={`text-main text-bold cursor-pointer m-4 ${
                        pageTab === PageTab.All ? '' : 'text-secondary'
                      }`}
                    >
                      All proposals
                    </span>
                    <span
                      onClick={() => handleTabClick(PageTab.Active)}
                      className={`text-main text-bold cursor-pointer m-4 ${
                        pageTab === PageTab.Active ? '' : 'text-secondary'
                      }`}
                    >
                      Active
                    </span>
                    <span
                      onClick={() => handleTabClick(PageTab.Executed)}
                      className={`text-main text-bold cursor-pointer m-4 ${
                        pageTab === PageTab.Executed ? '' : 'text-secondary'
                      }`}
                    >
                      Executed
                    </span>
                    <span
                      onClick={() => handleTabClick(PageTab.Failed)}
                      className={`text-main text-bold cursor-pointer m-4 ${
                        pageTab === PageTab.Failed ? '' : 'text-secondary'
                      }`}
                    >
                      Failed
                    </span>
                  </div>
                </div>
                {loadingProposals ? (
                  <div className="container-border-bottom p-5">
                    <p className="text-small text-secondary text-center">Loading...</p>{' '}
                  </div>
                ) : haveProposals ? (
                  <>
                    {proposals
                      .filter(proposal => {
                        switch (pageTab) {
                          case PageTab.Active:
                            return proposal.status === ProposalStatus.ACTIVE;
                          case PageTab.Executed:
                            return proposal.status === ProposalStatus.EXECUTED;
                          case PageTab.Failed:
                            return proposal.status === ProposalStatus.FAILED;
                          default:
                            return true;
                        }
                      })
                      .map((proposal, index) => (
                        <div
                          key={index}
                          className="container-border-bottom d-flex justify-content-between align-items-center p-5"
                        >
                          <div>
                            <Link
                              to={`/proposals/${proposal.id}`}
                              className="link text-small text-bold"
                            >
                              {proposal.title}
                            </Link>
                          </div>
                          <p
                            className={`container-status ${
                              statusClassesMapping[proposal.status].className
                            } text-uppercase text-small text-bold mt-3`}
                          >
                            {statusClassesMapping[proposal.status].label}
                          </p>
                        </div>
                      ))}
                  </>
                ) : (
                  <div className="container-border-bottom p-5">
                    <p className="text-small text-secondary text-center">No proposals</p>{' '}
                  </div>
                )}
                <div className="p-5">
                  <p className="text-micro text-secondary">
                    Showing {proposals.length} to {proposals.length} out of {proposals.length}{' '}
                    proposals
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Governance;
