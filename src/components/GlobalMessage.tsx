const GlobalMessage = () => {
  return (
    <div className="container-global-message">
      <p className="text-main text-center">
        +++ ATTENTION: POOL MIGRATION in PROCESS: PLEASE READ{' '}
        <a
          href="https://docs.google.com/document/d/1sAw-aEf2JiBxzE0WoOnfKrbgWPZbjNGw4YTCp-f99DE"
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
