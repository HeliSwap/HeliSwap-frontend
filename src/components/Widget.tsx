interface IWidgetrops {
  resource: string;
  title: string;
}

const Widget = ({ resource, title }: IWidgetrops) => {
  return (
    <div className="d-flex justify-content-center">
      <div className="container-max-with-1042">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex">
            <h2 className="text-subheader">{title}</h2>
          </div>
        </div>

        <hr className="my-5" />

        <div className="ratio ratio-4x3">
          <iframe title={title} src={resource}></iframe>
        </div>
      </div>
    </div>
  );
};

export default Widget;
