import ExpandContent from './ExpandContent';

const SSSFAQ = () => {
  return (
    <>
      <h2 className="text-subheader text-bold text-center mt-7 mt-lg-20">
        Frequently Asked Questions
      </h2>
      <div className="row mt-6">
        <div className="col-lg-10 offset-lg-1">
          <ExpandContent title="Why use Single Sided Staking?">
            <p className="text-small">
              Single Sided Staking allows users to earn staking rewards without having to provide a
              second token for liquidity, simplifying the staking process and reducing the cost of
              participation. Additionally, it provides a higher degree of flexibility since users
              can enter and exit the staking program at any time without needing to worry about
              maintaining a certain ratio of tokens. This makes it easier for users to adjust their
              investment strategy and react to changes in the market.
            </p>
          </ExpandContent>

          <ExpandContent title="How many tokens can I deposit?">
            <p className="text-small">
              Similar to the yield farms, there is no limit to the amount of tokens you can deposit.
            </p>
          </ExpandContent>

          <ExpandContent title="When can I withdraw my tokens?">
            <p className="text-small">
              During Phase 1 of HELI Single Sided Staking, you may withdraw your tokens anytime. If
              you have not harvested the earned rewards beforehand, they are automatically added to
              your position when exiting the pool.
              <br />
              <br />
              Phase 2 will involve Lockup Periods, on which we will provide more information in the
              future.
            </p>
          </ExpandContent>

          <ExpandContent title="Is Single Sided Staking HELI only?">
            <p className="text-small">
              The first pool and strategy will only involve our project own HELI token, but the
              feature is built to support and host any other projects token for Single Sided
              Staking. If you are a project that would like to benefit from this feature, please
              contact the team through discord.
            </p>
          </ExpandContent>

          <ExpandContent title="What token are the rewards paid in?">
            <p className="text-small">
              There is a section listing all the tokens that are included as rewards for Single
              Sided Staking.
            </p>
          </ExpandContent>

          <ExpandContent title="Is there any other benefit of SSS apart from earning rewards?">
            <p className="text-small">
              Phase 1 is only based on rewards, as it is the preparation for Phase 2. Phase 2 will
              not just earn rewards, but also provide more advances mechanisms such as lockup
              periods. It will also grant voting rights to stakers that can be used in the HeliSwap
              DAO to actively participate.
            </p>
          </ExpandContent>

          <ExpandContent title="How long will Phase 1 go?">
            <p className="text-small">
              Phase 1 is intended to last a few weeks from today (April 25th) until Phase 2 has been
              rolled out. Once we have more clarity on the launch date for Phase 2, we will update
              the entire community in advance.
            </p>
          </ExpandContent>

          <ExpandContent title="Do I need to move liquidity from Phase 1 to Phase 2?">
            <p className="text-small">
              Yes, once Phase 1 ends, and Phase 2 starts, you need to actively move your funds into
              Phase 2. But don’t worry, we will announce the date earlier, and remind the community
              several times before.
            </p>
          </ExpandContent>

          <ExpandContent title="I am a project interested in this mechanism?">
            <p className="text-small">
              Reach out to us in our discord server, and we can set up a single sided staking pool
              for your project. Open a{' '}
              <a
                className="link"
                href="https://discord.gg/heliswap"
                target="_blank"
                rel="noreferrer"
              >
                ticket
              </a>{' '}
              and our team will be right with you.
            </p>
          </ExpandContent>
        </div>
      </div>
    </>
  );
};

export default SSSFAQ;
