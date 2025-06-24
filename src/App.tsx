import { useRoutes } from 'react-router-dom';
import router from '@src/routers';
import { Link } from 'react-router-dom';
export default function App() {
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
      </div>
      {useRoutes(router)}
    </>
  );
}
