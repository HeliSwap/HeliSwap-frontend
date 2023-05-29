const GlobalMessage = () => {
  return (
    <div className="container-global-message">
      <p className="text-main text-center">
        +++ ATTENTION: POOL MIGRATION in PROGRESS: PLEASE READ{' '}
        <a
          href="https://docs.heliswap.io/hbar-pool-migration-on-may-29th/step-by-step-guide-to-migrate-liquidity"
          className="link-white"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="text-bold">THESE INSTRUCTIONS</span>
        </a>{' '}
        (Started on May 29th) +++
      </p>
    </div>
  );
};

export default GlobalMessage;
