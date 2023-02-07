interface IWidgetrops {
  width: number;
  height: number;
  resource: string;
  title: string;
}

const Widget = ({ width, height, resource, title }: IWidgetrops) => {
  return (
    <div>
      <iframe title={title} src={resource} width={width} height={height}></iframe>
    </div>
  );
};

export default Widget;
