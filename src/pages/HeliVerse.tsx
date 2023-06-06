import { useEffect } from 'react';

const HeliVerse = () => {
  useEffect(() => {
    document.body.classList.add('heliverse');

    return () => {
      document.body.classList.remove('heliverse');
    };
  }, []);

  return (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        <img className="img-fluid" src="/heliverse.png" alt="" />
        <h2 className="text-subheader text-bold mt-8">Meet the HeliVerse:</h2>
        <p className="text-main mt-4">
          One of our missions is to expand and increase the utility of the HELI token and to drive
          use cases to the HeliSwap Platform. As such, we are bringing a new product to Hedera that
          will be closely intertwined with the main HeliSwap DEX, while standing on its own in terms
          of branding, value proposition and usage.{' '}
          <span className="text-bold">Meet the HeliVerse.</span>
          <br />
          <br />
          The goal of the HeliVerse is to create and combine many different use cases for HELI. At
          first, we are launching our flagship product: The HeliVerse Predictions.
        </p>
        <h2 className="text-subheader text-bold mt-8">HeliVerse Predictions:</h2>
        <p className="text-main mt-4">
          The goal of the HeliVerse is to create and combine many different use cases for HELI. At
          first, we are launching our flagship product: The HeliVerse Predictions. HeliVerse
          Predictions: Join the HeliSwap and Hedera communities as they predict the outcome of the
          future. Any event with a definite outcome can serve as an underlying prediction. How much
          will HBAR be worth in 2 months at a given date and time? Will HEDERA reach 25B
          transactions by the end of the year? Will Manchester City win the Champions League? Will
          Donald Trump be allowed to run as a presidential candidate? How many people will be living
          on earth by the end of this year according to the PRB?
          <br />
          <br />
          Only the future knows…
          <br />
          <br />
          Users can use their HELI or HBAR tokens to choose one of the definitive outcomes. The
          overall odds then depend on the volume participation in each outcome. If you predicted
          correctly, you win the pool of wrong predictions (whether that is a Yes / No,
          Win/Draw/Lose scenario or similar).
        </p>
        <h2 className="text-subheader text-bold mt-8">Leaderboards:</h2>
        <p className="text-main mt-4">
          The HeliVerse will show leaderboards and a fun level-up system with cool HeliVerse avatar
          NFTs to unlock at each stage. First users to reach the last level will win extra prices -
          so make sure to join early!
        </p>
        <h2 className="text-subheader text-bold mt-8">Are you ready to predict the universe?</h2>
        <p className="text-main mt-4">
          Join HeliVerse’s{' '}
          <a
            target="_blank"
            className="link-primary"
            rel="noreferrer noopener"
            href="https://twitter.com/Heli_Verse"
          >
            Twitter
          </a>{' '}
          and{' '}
          <a
            target="_blank"
            className="link-primary"
            rel="noreferrer noopener"
            href="https://t.me/Heli_Verse"
          >
            Telegram
          </a>{' '}
          as we reveal more details about its functionalities, implementation, dispute resolution,
          prediction creation and more.
        </p>
        <h2 className="text-subheader text-bold mt-8">The Future of the HeliVerse:</h2>
        <p className="text-main mt-4">
          While our team continuously works on bringing new use cases to the HeliVerse, we are also
          working with partner projects on Hedera that want to include HELI on their platform in
          some form. Those projects can become “HeliVerse Partners” and we will also be able to
          feature their products within the HeliVerse.
          <br />
          <br />
          Are you a project interested in integrating with HELI and the HeliVerse? Please get in
          touch through the{' '}
          <a
            target="_blank"
            className="link-primary"
            rel="noreferrer noopener"
            href="https://discord.com/invite/wVrkMwBKsm"
          >
            HeliSwap Discord
          </a>
          .
          <br />
          <br />
          That’s all for now. We do not want to spoil too much information. Be one of the first
          users and get ahead of the curve!!! We will share more information with you very soon!
        </p>
      </div>
    </div>
  );
};

export default HeliVerse;
