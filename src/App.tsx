import { useRoutes } from 'react-router-dom';
import router from '@src/routers';
import { Link } from 'react-router-dom';
export default function () {
  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          margin: 'auto',
          padding: '0 30vw',
        }}
      >
        <Link to="/">To Home</Link>
        <Link to="demo">To Demo</Link>
      </div>
      {useRoutes(router)}
    </>
  );
}
